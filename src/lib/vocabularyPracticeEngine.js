export const PRACTICE_STATE_VERSION = 1

function shuffle(items, random = Math.random) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export function createVocabularyPracticeState(vocabulary, random = Math.random) {
  if (!Array.isArray(vocabulary) || vocabulary.length < 4) return null

  const questions = shuffle(vocabulary, random).map((word) => {
    const direction = random() < 0.5 ? 'zh-to-vi' : 'vi-to-zh'
    const answerLabel = direction === 'zh-to-vi' ? word.meaningVi : word.hanzi
    const seenLabels = new Set([answerLabel])
    const distractors = []
    for (const candidate of shuffle(vocabulary.filter((item) => item.id !== word.id), random)) {
      const candidateLabel = direction === 'zh-to-vi' ? candidate.meaningVi : candidate.hanzi
      if (!candidateLabel || seenLabels.has(candidateLabel)) continue
      seenLabels.add(candidateLabel)
      distractors.push(candidate.id)
      if (distractors.length === 3) break
    }
    if (distractors.length < 3) return null
    return {
      wordId: word.id,
      direction,
      optionIds: shuffle([word.id, ...distractors], random),
      wrongOptionIds: [],
      status: 'pending',
    }
  })

  if (questions.some((question) => question === null)) return null

  return {
    version: PRACTICE_STATE_VERSION,
    currentIndex: 0,
    questions,
  }
}

export function answerVocabularyPracticeQuestion(state, optionId) {
  const question = state?.questions?.[state.currentIndex]
  if (!question || question.status !== 'pending') return state

  if (optionId === question.wordId) {
    const status = question.wrongOptionIds.length === 0 ? 'first_try_correct' : 'correct_after_error'
    return replaceCurrentQuestion(state, { ...question, status })
  }

  if (question.wrongOptionIds.includes(optionId)) return state
  return replaceCurrentQuestion(state, {
    ...question,
    wrongOptionIds: [...question.wrongOptionIds, optionId],
  })
}

export function revealVocabularyPracticeAnswer(state) {
  const question = state?.questions?.[state.currentIndex]
  if (!question || question.status !== 'pending') return state
  return replaceCurrentQuestion(state, { ...question, status: 'revealed' })
}

export function advanceVocabularyPractice(state) {
  const question = state?.questions?.[state.currentIndex]
  if (!question || question.status === 'pending') return state
  return { ...state, currentIndex: Math.min(state.currentIndex + 1, state.questions.length) }
}

function replaceCurrentQuestion(state, nextQuestion) {
  return {
    ...state,
    questions: state.questions.map((question, index) => index === state.currentIndex ? nextQuestion : question),
  }
}

export function getVocabularyPracticeSummary(state) {
  const questions = state?.questions || []
  return {
    total: questions.length,
    firstTryCorrect: questions.filter((question) => question.status === 'first_try_correct').length,
    everWrong: questions.filter((question) => question.wrongOptionIds.length > 0).length,
    revealedAnswers: questions.filter((question) => question.status === 'revealed').length,
    completed: questions.length > 0 && state.currentIndex >= questions.length,
  }
}

export function isVocabularyPracticeStateValid(state, vocabulary) {
  if (state?.version !== PRACTICE_STATE_VERSION || !Array.isArray(state.questions)) return false
  if (!Number.isInteger(state.currentIndex) || state.currentIndex < 0 || state.currentIndex > state.questions.length) return false
  if (state.questions.length !== vocabulary.length) return false

  const validIds = new Set(vocabulary.map((word) => word.id))
  const questionIds = new Set(state.questions.map((question) => question.wordId))
  if (questionIds.size !== vocabulary.length || [...validIds].some((id) => !questionIds.has(id))) return false

  const wordsById = Object.fromEntries(vocabulary.map((word) => [word.id, word]))
  return state.questions.every((question) => {
    const optionLabels = Array.isArray(question.optionIds)
      ? question.optionIds.map((id) => question.direction === 'zh-to-vi' ? wordsById[id]?.meaningVi : wordsById[id]?.hanzi)
      : []
    return (
      validIds.has(question.wordId)
      && ['zh-to-vi', 'vi-to-zh'].includes(question.direction)
      && Array.isArray(question.optionIds)
      && question.optionIds.length === 4
      && new Set(question.optionIds).size === 4
      && new Set(optionLabels).size === 4
      && optionLabels.every(Boolean)
      && question.optionIds.includes(question.wordId)
      && question.optionIds.every((id) => validIds.has(id))
      && Array.isArray(question.wrongOptionIds)
      && question.wrongOptionIds.every((id) => question.optionIds.includes(id) && id !== question.wordId)
      && ['pending', 'first_try_correct', 'correct_after_error', 'revealed'].includes(question.status)
    )
  })
}
