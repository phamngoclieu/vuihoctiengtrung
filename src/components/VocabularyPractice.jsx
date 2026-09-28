import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Eye, LoaderCircle, RefreshCcw, Trophy, XCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLanguage } from '../lib/i18n.jsx'
import {
  advanceVocabularyPractice,
  answerVocabularyPracticeQuestion,
  createVocabularyPracticeState,
  getVocabularyPracticeSummary,
  isVocabularyPracticeStateValid,
  revealVocabularyPracticeAnswer,
} from '../lib/vocabularyPracticeEngine.js'
import {
  createVocabularyPracticeSession,
  loadActiveVocabularyPracticeSession,
  saveVocabularyPracticeSession,
} from '../lib/vocabularyPractice.js'

const answerLetters = ['A', 'B', 'C', 'D']

export default function VocabularyPractice({ hskLevel, preview = false, vocabulary }) {
  const { user } = useAuth()
  const { l } = useLanguage()
  const [session, setSession] = useState(null)
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const previewStorageKey = `liuliuliu-preview-vocabulary-practice-hsk${hskLevel}`

  useEffect(() => {
    let active = true
    setLoading(true)
    setSession(null)
    setState(null)
    setMessage(null)
    setError(null)

    async function load() {
      if (vocabulary.length < 4) return
      if (preview) {
        try {
          const savedState = JSON.parse(localStorage.getItem(previewStorageKey))
          if (isVocabularyPracticeStateValid(savedState, vocabulary) && !getVocabularyPracticeSummary(savedState).completed) {
            setSession({ id: 'preview', state: savedState })
            setState(savedState)
          }
        } catch {
          localStorage.removeItem(previewStorageKey)
        }
        return
      }
      if (!user) return
      const activeSession = await loadActiveVocabularyPracticeSession({ userId: user.id, hskLevel })
      if (!active || !activeSession) return
      if (!isVocabularyPracticeStateValid(activeSession.state, vocabulary)) {
        const refreshedState = createVocabularyPracticeState(vocabulary)
        if (!refreshedState) return
        const refreshedSession = await saveVocabularyPracticeSession({
          sessionId: activeSession.id,
          userId: user.id,
          state: refreshedState,
        })
        if (!active) return
        setSession(refreshedSession)
        setState(refreshedSession.state)
        setMessage(l('Danh sách từ đã được cập nhật. Lượt luyện mới đã sẵn sàng.', 'The vocabulary list was updated. A fresh practice run is ready.', '词表已更新，新的练习已准备好。'))
        return
      }
      setSession(activeSession)
      setState(activeSession.state)
      setMessage(l('Đã tiếp tục đúng câu bạn đang làm trên thiết bị trước.', 'Resumed from the exact question saved on your other device.', '已从其他设备上次做到的题目继续。'))
    }

    load()
      .catch((loadError) => active && setError(loadError.message || l('Không thể tải phiên luyện tập.', 'Unable to load the practice session.', '无法加载练习。')))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [hskLevel, preview, previewStorageKey, user, vocabulary])

  const wordsById = useMemo(() => Object.fromEntries(vocabulary.map((word) => [word.id, word])), [vocabulary])
  const summary = useMemo(() => getVocabularyPracticeSummary(state), [state])
  const question = state?.questions?.[state.currentIndex] || null
  const questionWord = question ? wordsById[question.wordId] : null

  async function startNewSession() {
    const nextState = createVocabularyPracticeState(vocabulary)
    if (!nextState) return
    setSyncing(true)
    setMessage(null)
    setError(null)
    try {
      if (preview) {
        localStorage.setItem(previewStorageKey, JSON.stringify(nextState))
        setSession({ id: 'preview', state: nextState })
        setState(nextState)
      } else {
        const created = await createVocabularyPracticeSession({ userId: user.id, hskLevel, state: nextState })
        setSession(created)
        setState(created.state)
      }
    } catch (startError) {
      setError(startError.message || l('Không thể bắt đầu lượt luyện tập.', 'Unable to start the practice run.', '无法开始练习。'))
    } finally {
      setSyncing(false)
    }
  }

  async function persist(nextState) {
    setSyncing(true)
    setError(null)
    try {
      if (preview) {
        if (getVocabularyPracticeSummary(nextState).completed) localStorage.removeItem(previewStorageKey)
        else localStorage.setItem(previewStorageKey, JSON.stringify(nextState))
      } else {
        const saved = await saveVocabularyPracticeSession({ sessionId: session.id, userId: user.id, state: nextState })
        setSession(saved)
      }
    } catch (saveError) {
      setError(saveError.message || l('Không thể đồng bộ. Kết quả vẫn được giữ trên màn hình; hãy thử lại khi mạng ổn định.', 'Unable to sync. Your result remains on screen; try again when the connection is stable.', '无法同步。结果仍保留在屏幕上，请在网络稳定后重试。'))
    } finally {
      setSyncing(false)
    }
  }

  async function chooseAnswer(optionId) {
    const nextState = answerVocabularyPracticeQuestion(state, optionId)
    if (nextState === state) return
    setState(nextState)
    setMessage(null)
    await persist(nextState)
  }

  async function showAnswer() {
    const nextState = revealVocabularyPracticeAnswer(state)
    if (nextState === state) return
    setState(nextState)
    setMessage(null)
    await persist(nextState)
  }

  async function goNext() {
    const nextState = advanceVocabularyPractice(state)
    if (nextState === state) return
    setState(nextState)
    setMessage(null)
    await persist(nextState)
  }

  if (vocabulary.length < 4) {
    return (
      <section className="vocabulary-practice panel">
        <span className="eyebrow">HSK {hskLevel} · {l('Luyện tập từ vựng', 'Vocabulary practice', '生词练习')}</span>
        <h2>{l('Nội dung đang được cập nhật', 'Content is being updated', '内容正在更新')}</h2>
        <p>{l('Phần luyện tập sẽ tự động mở khi cấp độ này có đủ từ vựng.', 'Practice will open automatically when this level has enough vocabulary.', '本级词汇充足后，练习将自动开放。')}</p>
      </section>
    )
  }

  if (loading) {
    return <section className="vocabulary-practice vocabulary-practice--loading panel"><LoaderCircle className="spin" size={28} /><p>{l('Đang tải tiến độ luyện tập…', 'Loading practice progress…', '正在加载练习进度…')}</p></section>
  }

  if (!state) {
    return (
      <section className="vocabulary-practice vocabulary-practice--intro panel">
        <div><span className="eyebrow">HSK {hskLevel} · {l('Luyện tập từ vựng', 'Vocabulary practice', '生词练习')}</span><h2>{l('Luyện toàn bộ từ của cấp độ', 'Practise every word in this level', '练习本级全部词汇')}</h2><p>{l(`Mỗi từ xuất hiện một lần trong ${vocabulary.length} câu. Chiều hỏi Trung → Việt hoặc Việt → Trung được trộn ngẫu nhiên.`, `Each word appears once across ${vocabulary.length} questions. Chinese → Vietnamese and Vietnamese → Chinese are mixed randomly.`, `共${vocabulary.length}题，每个词只出现一次，中译越与越译中随机混合。`)}</p></div>
        {error ? <p className="form-message form-message--error">{error}</p> : null}
        <button className="button button--primary" disabled={syncing || (!preview && !user)} onClick={startNewSession} type="button">{syncing ? <LoaderCircle className="spin" size={17} /> : <ArrowRight size={17} />}{l('Bắt đầu luyện tập', 'Start practice', '开始练习')}</button>
      </section>
    )
  }

  if (summary.completed) {
    return (
      <section className="vocabulary-practice vocabulary-practice--summary panel">
        <Trophy aria-hidden="true" size={42} />
        <div><span className="eyebrow">HSK {hskLevel} · {l('Hoàn thành', 'Completed', '已完成')}</span><h2>{l('Kết quả lượt luyện tập', 'Practice run results', '本次练习结果')}</h2><p>{l('Lượt này đã được lưu vào tài khoản và lịch sử của giáo viên.', 'This run is saved to your account and teacher history.', '本次练习已保存到账户和教师记录中。')}</p></div>
        <div className="practice-summary-grid">
          <div><strong>{summary.firstTryCorrect}</strong><span>{l('Đúng ngay lần đầu', 'Correct first try', '首次答对')}</span></div>
          <div><strong>{summary.everWrong}</strong><span>{l('Từng chọn sai', 'Had a wrong choice', '曾答错')}</span></div>
          <div><strong>{summary.revealedAnswers}</strong><span>{l('Đã hiện đáp án', 'Answers revealed', '查看答案')}</span></div>
          <div><strong>{summary.total}</strong><span>{l('Tổng số từ', 'Total words', '词汇总数')}</span></div>
        </div>
        {error ? <p className="form-message form-message--error">{error}</p> : null}
        <button className="button button--primary" disabled={syncing} onClick={() => { setSession(null); setState(null); setMessage(null); setError(null) }} type="button"><RefreshCcw size={17} />{l('Tạo lượt luyện mới', 'Start a new run', '开始新一轮')}</button>
      </section>
    )
  }

  const resolved = question.status !== 'pending'
  return (
    <section className="vocabulary-practice panel">
      <div className="practice-heading">
        <div><span className="eyebrow">HSK {hskLevel} · {l('Luyện tập từ vựng', 'Vocabulary practice', '生词练习')}</span><h2>{l(`Câu ${state.currentIndex + 1} / ${summary.total}`, `Question ${state.currentIndex + 1} / ${summary.total}`, `第 ${state.currentIndex + 1} / ${summary.total} 题`)}</h2></div>
        <span className="practice-sync-status">{syncing ? l('Đang đồng bộ…', 'Syncing…', '正在同步…') : l('Đã đồng bộ', 'Synced', '已同步')}</span>
      </div>
      <div className="practice-progress" aria-label={l('Tiến độ', 'Progress', '进度')}><span style={{ width: `${(state.currentIndex / summary.total) * 100}%` }} /></div>
      {message ? <p className="practice-resume-message">{message}</p> : null}
      <div className="practice-question">
        <small>{question.direction === 'zh-to-vi' ? l('Chọn nghĩa tiếng Việt đúng', 'Choose the correct Vietnamese meaning', '选择正确的越南语释义') : l('Chọn chữ Hán đúng', 'Choose the correct Chinese word', '选择正确的汉字')}</small>
        <strong lang={question.direction === 'zh-to-vi' ? 'zh-CN' : 'vi'}>{question.direction === 'zh-to-vi' ? questionWord.hanzi : questionWord.meaningVi}</strong>
      </div>
      <div className="practice-options">
        {question.optionIds.map((optionId, index) => {
          const optionWord = wordsById[optionId]
          const isWrong = question.wrongOptionIds.includes(optionId)
          const isCorrect = resolved && optionId === question.wordId
          return (
            <button className={`${isWrong ? 'is-wrong' : ''} ${isCorrect ? 'is-correct' : ''}`} disabled={syncing || resolved || isWrong} key={optionId} onClick={() => chooseAnswer(optionId)} type="button">
              <span>{answerLetters[index]}</span>
              <strong lang={question.direction === 'vi-to-zh' ? 'zh-CN' : 'vi'}>{question.direction === 'zh-to-vi' ? optionWord.meaningVi : optionWord.hanzi}</strong>
              {isWrong ? <XCircle aria-hidden="true" size={20} /> : isCorrect ? <CheckCircle2 aria-hidden="true" size={20} /> : null}
            </button>
          )
        })}
      </div>
      <div className="practice-feedback" aria-live="polite">
        {question.status === 'pending' && question.wrongOptionIds.length ? <p className="answer-wrong"><XCircle size={18} />{l('Chưa đúng. Hãy chọn lại hoặc bấm “Hiện đáp án”.', 'Not correct yet. Try again or select “Show answer”.', '回答不正确，请重试或点击“查看答案”。')}</p> : null}
        {question.status === 'first_try_correct' ? <p className="answer-correct"><CheckCircle2 size={18} />{l('Chính xác ngay lần đầu!', 'Correct on the first try!', '首次作答正确！')}</p> : null}
        {question.status === 'correct_after_error' ? <p className="answer-correct"><CheckCircle2 size={18} />{l('Chính xác!', 'Correct!', '回答正确！')}</p> : null}
        {question.status === 'revealed' ? <p><Eye size={18} />{l('Đáp án đúng đã được đánh dấu.', 'The correct answer is highlighted.', '正确答案已标出。')}</p> : null}
        {error ? <p className="form-message form-message--error">{error}</p> : null}
      </div>
      <div className="practice-actions">
        <button className="button button--ghost" disabled={syncing || resolved} onClick={showAnswer} type="button"><Eye size={17} />{l('Hiện đáp án', 'Show answer', '查看答案')}</button>
        <button className="button button--primary" disabled={syncing || !resolved} onClick={goNext} type="button">{state.currentIndex === summary.total - 1 ? l('Xem kết quả', 'View results', '查看结果') : l('Câu tiếp theo', 'Next question', '下一题')}<ArrowRight size={17} /></button>
      </div>
    </section>
  )
}
