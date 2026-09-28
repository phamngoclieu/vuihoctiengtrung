import { describe, expect, it } from 'vitest'
import {
  advanceVocabularyPractice,
  answerVocabularyPracticeQuestion,
  createVocabularyPracticeState,
  getVocabularyPracticeSummary,
  isVocabularyPracticeStateValid,
  revealVocabularyPracticeAnswer,
} from './vocabularyPracticeEngine.js'

const vocabulary = [
  { id: 'a', hanzi: '爱', meaningVi: 'yêu' },
  { id: 'b', hanzi: '八', meaningVi: 'tám' },
  { id: 'c', hanzi: '茶', meaningVi: 'trà' },
  { id: 'd', hanzi: '大', meaningVi: 'lớn' },
  { id: 'e', hanzi: '二', meaningVi: 'hai' },
]

function deterministicRandom() {
  const values = [0.82, 0.13, 0.67, 0.24, 0.91, 0.36, 0.58, 0.04]
  let index = 0
  return () => values[index++ % values.length]
}

describe('vocabulary practice engine', () => {
  it('creates one mixed-direction question for every word with four unique choices', () => {
    const state = createVocabularyPracticeState(vocabulary, deterministicRandom())
    expect(state.questions).toHaveLength(vocabulary.length)
    expect(new Set(state.questions.map((question) => question.wordId)).size).toBe(vocabulary.length)
    expect(new Set(state.questions.map((question) => question.direction)).size).toBe(2)
    for (const question of state.questions) {
      expect(question.optionIds).toHaveLength(4)
      expect(new Set(question.optionIds).size).toBe(4)
      expect(question.optionIds).toContain(question.wordId)
      const labels = question.optionIds.map((id) => {
        const word = vocabulary.find((item) => item.id === id)
        return question.direction === 'zh-to-vi' ? word.meaningVi : word.hanzi
      })
      expect(new Set(labels).size).toBe(4)
    }
    expect(isVocabularyPracticeStateValid(state, vocabulary)).toBe(true)
  })

  it('keeps a wrong answer visible until the correct answer is chosen', () => {
    let state = createVocabularyPracticeState(vocabulary, deterministicRandom())
    const question = state.questions[0]
    const wrongId = question.optionIds.find((id) => id !== question.wordId)
    state = answerVocabularyPracticeQuestion(state, wrongId)
    expect(state.questions[0].status).toBe('pending')
    expect(state.questions[0].wrongOptionIds).toEqual([wrongId])
    state = answerVocabularyPracticeQuestion(state, question.wordId)
    expect(state.questions[0].status).toBe('correct_after_error')
    expect(getVocabularyPracticeSummary(state).everWrong).toBe(1)
  })

  it('records revealed answers separately and advances only after resolution', () => {
    let state = createVocabularyPracticeState(vocabulary, deterministicRandom())
    expect(advanceVocabularyPractice(state).currentIndex).toBe(0)
    state = revealVocabularyPracticeAnswer(state)
    expect(getVocabularyPracticeSummary(state).revealedAnswers).toBe(1)
    state = advanceVocabularyPractice(state)
    expect(state.currentIndex).toBe(1)
  })
})
