import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  FileAudio,
  Headphones,
  Lightbulb,
  MessageSquareText,
  Mic2,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react'
import AppShell from '../components/AppShell.jsx'
import { lessonOne } from '../data/lesson1.js'
import { navigate } from '../lib/hashRoute.js'
import { useLanguage } from '../lib/i18n.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useRecorder } from '../hooks/useRecorder.js'
import { saveWritingDraft, submitShadowing, submitWriting } from '../lib/submissions.js'
import {
  loadVocabularyProgress,
  loadWritingDraft,
  markLessonSection,
  saveAssessmentAttempt,
  saveVocabularyProgress,
} from '../lib/learningSync.js'

const tabs = [
  { id: 'vocabulary', key: 'vocabulary' },
  { id: 'flashcards', key: 'flashcards' },
  { id: 'grammar', key: 'grammar' },
  { id: 'dialogues', key: 'dialogues' },
  { id: 'pronunciation', key: 'pronunciation' },
  { id: 'exercises', key: 'exercises' },
  { id: 'listening', key: 'listening' },
  { id: 'shadowing', key: 'shadowing' },
  { id: 'writing', key: 'writing' },
]

const partOfSpeechLabels = {
  'công thức giao tiếp': ['communication formula', '交际用语'],
  'cụm chào hỏi': ['greeting phrase', '问候语'],
  'danh từ riêng': ['proper noun', '专有名词'],
  'danh từ': ['noun', '名词'],
  'hậu tố': ['suffix', '后缀'],
  'tính từ': ['adjective', '形容词'],
  'đại từ kính ngữ': ['honorific pronoun', '敬称代词'],
  'đại từ': ['pronoun', '代词'],
  'động từ / công thức giao tiếp': ['verb / communication formula', '动词／交际用语'],
  'động từ / công thức lịch sự': ['verb / polite formula', '动词／礼貌用语'],
}

function speakChinese(text, rate = 0.82) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = rate
  const voices = window.speechSynthesis.getVoices()
  utterance.voice = voices.find((voice) => voice.lang.toLowerCase() === 'zh-cn') || voices.find((voice) => voice.lang.toLowerCase().startsWith('zh')) || null
  window.speechSynthesis.speak(utterance)
}

function VocabularyView({ preview }) {
  const { language, l } = useLanguage()
  const { user } = useAuth()
  const [selected, setSelected] = useState(lessonOne.vocabulary[0].id)
  const [statuses, setStatuses] = useState({})
  const [notes, setNotes] = useState({})
  const [reviewCounts, setReviewCounts] = useState({})
  const [syncMessage, setSyncMessage] = useState(null)
  const word = lessonOne.vocabulary.find((item) => item.id === selected)

  useEffect(() => {
    if (preview || !user) return undefined
    let active = true
    loadVocabularyProgress({ userId: user.id })
      .then((rows) => {
        if (!active) return
        setStatuses(Object.fromEntries(rows.filter((row) => row.memory_status !== 'unseen').map((row) => [row.wordId, row.memory_status])))
        setNotes(Object.fromEntries(rows.map((row) => [row.wordId, row.personal_note || ''])))
        setReviewCounts(Object.fromEntries(rows.map((row) => [row.wordId, row.review_count || 0])))
      })
      .catch(() => active && setSyncMessage(l('Chưa thể tải tiến độ đã lưu.', 'Unable to load saved progress.', '无法加载已保存的进度。')))
    return () => { active = false }
  }, [preview, user])

  async function updateStatus(status) {
    const previousStatus = statuses[word.id]
    const nextCount = (reviewCounts[word.id] || 0) + 1
    setStatuses((current) => ({ ...current, [word.id]: status }))
    setReviewCounts((current) => ({ ...current, [word.id]: nextCount }))
    if (preview || !user) return
    setSyncMessage(l('Đang đồng bộ…', 'Syncing…', '正在同步…'))
    try {
      await saveVocabularyProgress({ userId: user.id, wordId: word.id, memoryStatus: status, personalNote: notes[word.id] || '', reviewCount: nextCount })
      setSyncMessage(l('Đã đồng bộ tiến độ.', 'Progress synced.', '学习进度已同步。'))
    } catch {
      setStatuses((current) => ({ ...current, [word.id]: previousStatus }))
      setReviewCounts((current) => ({ ...current, [word.id]: nextCount - 1 }))
      setSyncMessage(l('Không thể đồng bộ. Vui lòng kiểm tra kết nối mạng.', 'Unable to sync. Check your connection.', '无法同步，请检查网络连接。'))
    }
  }

  async function syncNote() {
    if (preview || !user) return
    setSyncMessage(l('Đang đồng bộ…', 'Syncing…', '正在同步…'))
    try {
      await saveVocabularyProgress({ userId: user.id, wordId: word.id, memoryStatus: statuses[word.id] || 'unseen', personalNote: notes[word.id] || '', reviewCount: reviewCounts[word.id] || 0 })
      setSyncMessage(l('Đã lưu ghi chú.', 'Note saved.', '笔记已保存。'))
    } catch {
      setSyncMessage(l('Không thể lưu ghi chú. Vui lòng kiểm tra kết nối mạng.', 'Unable to save the note. Check your connection.', '无法保存笔记，请检查网络连接。'))
    }
  }

  const meaning = language === 'en' ? word.meaningEn : language === 'zh' ? word.meaningEn : word.meaningVi
  const localizedPartOfSpeech = language === 'vi' ? word.partOfSpeech : partOfSpeechLabels[word.partOfSpeech]?.[language === 'zh' ? 1 : 0] || word.partOfSpeech
  const localizedSource = language === 'vi' ? word.source : word.source
    .replaceAll('Giáo trình', language === 'zh' ? '教材' : 'Textbook')
    .replaceAll('Từ mới', language === 'zh' ? '生词' : 'Vocabulary')
    .replaceAll('trang', language === 'zh' ? '第' : 'page')
    .replaceAll('thành tố của', language === 'zh' ? '的组成部分' : 'component of')
    .replaceAll('lớp nội dung ẩn', language === 'zh' ? '隐藏内容层' : 'hidden content layer')
  return (
    <div className="vocabulary-layout">
      <div className="word-list panel">
        <div className="panel-heading"><div><h2>{lessonOne.vocabulary.length} {l('mục từ', 'words', '个生词')}</h2><p>{l('Đã gộp trùng lặp giữa giáo trình và PPT.', 'Duplicates from the textbook and slides have been merged.', '已合并教材与课件中的重复词条。')}</p></div><button className="button button--ghost button--small" type="button">{l('Lọc từ khó', 'Hard words', '筛选难词')}</button></div>
        <div className="word-list__items">
          {lessonOne.vocabulary.map((item) => (
            <button className={selected === item.id ? 'is-active' : ''} key={item.id} onClick={() => setSelected(item.id)} type="button">
              <span lang="zh-CN">{item.hanzi}</span>
              <span><strong>{item.pinyin}</strong><small>{language === 'vi' ? item.meaningVi : item.meaningEn}</small></span>
              {statuses[item.id] ? <i className={`status-dot status-dot--${statuses[item.id]}`} /> : null}
            </button>
          ))}
        </div>
      </div>

      <article className="word-detail panel">
        {word.reviewFlag ? <div className="review-flag"><CircleAlert size={18} /><span>{language === 'vi' ? word.reviewFlag : l('', 'Teacher confirmation is required before keeping this in the main list.', '保留在主词表前需要教师确认。')}</span></div> : null}
        <div className="word-detail__hero">
          <div className="hanzi-grid" lang="zh-CN">{word.hanzi}</div>
          <div>
            <button className="speaker-button" onClick={() => speakChinese(word.hanzi)} type="button"><Volume2 size={23} /><span>{l('Nghe giọng phổ thông', 'Listen in Standard Mandarin', '听普通话发音')}</span></button>
            <h2>{word.pinyin}</h2>
            <span className="han-viet">{l('Hán-Việt', 'Sino-Vietnamese', '汉越音')}: {word.hanViet}</span>
          </div>
        </div>
        <div className="word-detail__meanings"><div><span>{language === 'zh' ? '释义' : language === 'en' ? 'MEANING' : 'VI'}</span><strong>{meaning}</strong></div>{language === 'vi' ? <div><span>EN</span><strong>{word.meaningEn}</strong></div> : null}</div>
        <p className="word-detail__pos">{localizedPartOfSpeech}</p>
        {word.examples.length ? (
          <div className="example-list">
            <h3>{l('Ví dụ trong nguồn', 'Examples from the source', '来源中的例句')}</h3>
            {word.examples.map((example) => (
              <button key={example.zh} onClick={() => speakChinese(example.zh)} type="button">
                <Volume2 size={17} /><span><strong lang="zh-CN">{example.zh}</strong><small>{example.py}</small><em>{language === 'vi' ? example.vi : example.en}</em></span>
              </button>
            ))}
          </div>
        ) : null}
        <label className="word-note"><span>{l('Ghi chú cá nhân', 'Personal note', '个人笔记')}</span><textarea onBlur={syncNote} onChange={(event) => setNotes((current) => ({ ...current, [word.id]: event.target.value }))} placeholder={l('Ghi lại mẹo nhớ của bạn…', 'Write down a memory tip…', '写下你的记忆方法…')} value={notes[word.id] || ''} /></label>
        <div className="memory-actions">
          <button className={statuses[word.id] === 'forgot' ? 'is-active' : ''} onClick={() => updateStatus('forgot')} type="button">{l('Chưa nhớ', 'Forgotten', '没记住')}</button>
          <button className={statuses[word.id] === 'hard' ? 'is-active' : ''} onClick={() => updateStatus('hard')} type="button">{l('Khó', 'Hard', '较难')}</button>
          <button className={statuses[word.id] === 'remembered' ? 'is-active' : ''} onClick={() => updateStatus('remembered')} type="button"><Check size={17} />{l('Đã nhớ', 'Remembered', '已记住')}</button>
        </div>
        {syncMessage ? <p className="form-message">{syncMessage}</p> : null}
        <p className="source-line">{l('Nguồn', 'Source', '来源')}: {localizedSource}</p>
      </article>
    </div>
  )
}

function FlashcardView() {
  const { language, l } = useLanguage()
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const word = lessonOne.vocabulary[index]
  const next = (offset) => {
    setIndex((current) => (current + offset + lessonOne.vocabulary.length) % lessonOne.vocabulary.length)
    setRevealed(false)
  }
  return (
    <section className="study-section study-section--narrow">
      <div className="section-heading"><div><span className="eyebrow">{l('Flashcard', 'Flashcards', '抽认卡')}</span><h2>{index + 1} / {lessonOne.vocabulary.length}</h2></div><button className="button button--ghost button--small" onClick={() => setIndex(0)} type="button"><RotateCcw size={16} /> {l('Học lại', 'Restart', '重新学习')}</button></div>
      <button className={`flashcard ${revealed ? 'is-revealed' : ''}`} onClick={() => setRevealed((value) => !value)} type="button">
        <span className="flashcard__hint">{revealed ? l('Chạm để ẩn', 'Tap to hide', '点击隐藏') : l('Chạm để xem nghĩa', 'Tap to reveal', '点击查看意思')}</span>
        <strong lang="zh-CN">{word.hanzi}</strong>
        <span>{word.pinyin}</span>
        {revealed ? <div><b>{language === 'vi' ? word.meaningVi : word.meaningEn}</b>{language === 'vi' ? <small>{word.meaningEn}</small> : null}<em>{l('Hán-Việt', 'Sino-Vietnamese', '汉越音')}: {word.hanViet}</em></div> : null}
      </button>
      <div className="card-navigation"><button className="button button--ghost" onClick={() => next(-1)} type="button"><ArrowLeft size={18} /> {l('Trước', 'Previous', '上一个')}</button><button className="button button--primary" onClick={() => next(1)} type="button">{l('Tiếp', 'Next', '下一个')} <ArrowRight size={18} /></button></div>
    </section>
  )
}

function GrammarView() {
  const { language } = useLanguage()
  return (
    <div className="content-stack">
      {lessonOne.grammar.map((point, index) => (
        <article className="grammar-card panel" key={point.id}>
          <span className="grammar-card__number">0{index + 1}</span>
          <div><h2>{language === 'vi' ? point.titleVi : point.titleEn}</h2><p>{language === 'vi' ? point.explanationVi : point.explanationEn}</p><div className="pattern-list">{point.patterns.map((pattern) => <button key={pattern} onClick={() => speakChinese(pattern.replace(/[A-Z：→+]/g, ''))} type="button" lang="zh-CN">{pattern}<Volume2 size={16} /></button>)}</div></div>
        </article>
      ))}
    </div>
  )
}

function DialoguesView() {
  const { language, l } = useLanguage()
  const [revealed, setRevealed] = useState({})
  return (
    <div className="content-stack">
      {lessonOne.dialogues.map((dialogue) => (
        <article className="dialogue-card panel" key={dialogue.id}>
          <div className="panel-heading"><div><span className="eyebrow">{language === 'vi' ? dialogue.titleVi : dialogue.titleEn}</span><h2>{dialogue.lines[0].zh}</h2></div><audio controls preload="metadata" src={dialogue.audio} /></div>
          {dialogue.tipVi && language === 'vi' ? <p className="tip"><Lightbulb size={18} />{dialogue.tipVi}</p> : null}
          <div className="dialogue-lines">
            {dialogue.lines.map((line, index) => (
              <button key={`${line.speaker}-${line.zh}`} onClick={() => speakChinese(line.zh)} type="button">
                <span className="speaker">{line.speaker}</span>
                <span><strong lang="zh-CN">{line.zh}</strong><small>{line.py}</small>{revealed[dialogue.id] ? <em>{language === 'vi' ? `${line.vi} · ${line.en}` : line.en}</em> : null}</span>
                <Volume2 size={17} />
              </button>
            ))}
          </div>
          <button className="text-link" onClick={() => setRevealed((current) => ({ ...current, [dialogue.id]: !current[dialogue.id] }))} type="button"><Eye size={17} />{revealed[dialogue.id] ? l('Ẩn bản dịch', 'Hide translation', '隐藏翻译') : l('Xem bản dịch', 'Show translation', '查看翻译')}</button>
        </article>
      ))}
    </div>
  )
}

function PronunciationView() {
  const { language, l } = useLanguage()
  return (
    <div className="content-stack">
      <section className="panel audio-source-panel"><div><span className="eyebrow">{l('Sách bài tập', 'Workbook', '练习册')} · 1-1 & 1-2</span><h2>{l('Ngữ âm và thanh điệu', 'Pronunciation and tones', '语音与声调')}</h2><p>{l('Nghe tệp của Bài 1, sau đó đọc lại từng nhóm âm.', 'Listen to the Lesson 1 audio, then repeat each sound group.', '先听第一课音频，然后跟读每组语音。')}</p></div><audio controls preload="metadata" src={lessonOne.pronunciation.audio} /></section>
      {lessonOne.pronunciation.sections.map((section, index) => (
        <article className="pronunciation-card panel" key={section.titleVi}>
          <span>{index + 1}</span><div><h2>{language === 'vi' ? section.titleVi : l('Pronunciation practice', 'Pronunciation practice', '语音练习')}</h2>{language === 'vi' ? <p>{section.summaryVi}</p> : null}<div>{section.examples.map((example) => <button key={example} onClick={() => speakChinese(example.replace(/[a-zāáǎàēéěèǐīíìǒōóòǔūúùüǚǜ]/gi, ''))} type="button">{example}</button>)}</div></div>
        </article>
      ))}
      <article className="panel tongue-twister"><div className="panel-heading"><div><span className="eyebrow">1-7 · Shadow the Tongue Twister</span><h2>{l('Luyện đọc líu lưỡi', 'Tongue-twister practice', '绕口令练习')}</h2></div><audio controls src={lessonOne.tongueTwister.audio} /></div>{lessonOne.tongueTwister.lines.map((line) => <div key={line.zh}><strong lang="zh-CN">{line.zh}</strong><span>{line.py}</span>{language === 'vi' ? <small>{line.vi}</small> : null}</div>)}</article>
    </div>
  )
}

const quizQuestions = [
  { id: 1, prompt: ['“您好” phù hợp nhất khi nào?', 'When is “您好” most appropriate?', '什么时候最适合说“您好”？'], choices: [['Chào người mình kính trọng', 'Chào một nhóm bạn', 'Nói cảm ơn'], ['Greeting someone respectfully', 'Greeting a group of friends', 'Saying thank you'], ['向尊敬的人问好', '向一群朋友问好', '表示感谢']], answer: 0 },
  { id: 2, prompt: ['Chọn nghĩa đúng của “不客气”.', 'Choose the correct meaning of “不客气”.', '请选择“不客气”的正确意思。'], choices: [['Tạm biệt', 'Không có gì', 'Xin chào'], ['Goodbye', "You're welcome", 'Hello'], ['再见', '不用谢', '你好']], answer: 1 },
  { id: 3, prompt: ['Cách chào một nhóm học viên là:', 'To greet a group of students, say:', '向一群学生问好时应该说：'], choices: [['你们好！', '谢谢！', '再见！'], ['你们好！', '谢谢！', '再见！'], ['你们好！', '谢谢！', '再见！']], answer: 0 },
  { id: 4, prompt: ['“们” trong “同学们” biểu thị điều gì?', 'What does “们” indicate in “同学们”?', '“同学们”中的“们”表示什么？'], choices: [['Sự kính trọng', 'Số nhiều', 'Câu hỏi'], ['Respect', 'Plurality', 'A question'], ['尊敬', '复数', '疑问']], answer: 1 },
]

function ExercisesView({ preview }) {
  const { language, l } = useLanguage()
  const { user } = useAuth()
  const matching = lessonOne.workbookExercises.find((item) => item.type === 'matching')
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [syncMessage, setSyncMessage] = useState(null)
  const correctMatching = matching.situations.filter((situation) => answers[situation.id] === situation.answer).length

  async function submitMatching() {
    setSubmitted(true)
    if (preview || !user) return
    try {
      await saveAssessmentAttempt({ userId: user.id, exerciseId: matching.id, answers, score: correctMatching, maxScore: matching.situations.length })
      setSyncMessage(l('Đã lưu kết quả bài nối.', 'Matching result saved.', '配对练习结果已保存。'))
    } catch {
      setSyncMessage(l('Đã chấm trên thiết bị nhưng chưa thể đồng bộ kết quả.', 'Graded on this device, but the result could not be synced.', '已在本设备评分，但暂时无法同步结果。'))
    }
  }

  async function submitQuiz() {
    const score = quizQuestions.filter((question) => quizAnswers[question.id] === question.answer).length
    setQuizResult(score)
    if (preview || !user) return
    try {
      await Promise.all(quizQuestions.map((question) => saveAssessmentAttempt({
        userId: user.id,
        exerciseId: `quiz-0${question.id}`,
        answers: { selected: quizAnswers[question.id] },
        score: quizAnswers[question.id] === question.answer ? 1 : 0,
        maxScore: 1,
      })))
      setSyncMessage(l('Đã lưu kết quả trắc nghiệm.', 'Quiz result saved.', '测验结果已保存。'))
    } catch {
      setSyncMessage(l('Đã chấm trên thiết bị nhưng chưa thể đồng bộ kết quả.', 'Graded on this device, but the result could not be synced.', '已在本设备评分，但暂时无法同步结果。'))
    }
  }

  return (
    <div className="content-stack">
      <section className="panel exercise-card">
        <div className="panel-heading"><div><span className="eyebrow">{l('Sách bài tập · Câu 5', 'Workbook · Question 5', '练习册 · 第5题')}</span><h2>{language === 'vi' ? matching.promptVi : l('', 'Match each situation with the appropriate dialogue.', '观察情境，选择合适的对话。')}</h2></div>{submitted ? <span className="score-badge">{correctMatching}/3</span> : null}</div>
        <div className="situation-list">
          {matching.situations.map((situation, index) => (
            <div key={situation.id}>
              <img
                alt={language === 'vi' ? situation.imageAltVi : language === 'en' ? situation.imageAltEn : situation.imageAltZh}
                className="situation-visual"
                decoding="async"
                loading="eager"
                src={situation.image}
              />
              <div><strong>{l('Hình', 'Picture', '图片')} {index + 1}</strong><select aria-label={`${l('Chọn đoạn hội thoại cho hình', 'Choose a dialogue for picture', '为图片选择对话')} ${index + 1}`} onChange={(event) => { setAnswers((current) => ({ ...current, [situation.id]: event.target.value })); setSubmitted(false) }} value={answers[situation.id] || ''}><option value="">{l('Chọn đoạn hội thoại', 'Choose a dialogue', '选择对话')}</option>{matching.options.map((option) => <option key={option.id} value={option.id}>{option.id}. {option.zh}</option>)}</select>{submitted ? <small className={answers[situation.id] === situation.answer ? 'answer-correct' : 'answer-wrong'}>{answers[situation.id] === situation.answer ? l('Chính xác', 'Correct', '正确') : `${l('Đáp án', 'Answer', '答案')}: ${situation.answer}`}</small> : null}</div>
            </div>
          ))}
        </div>
        <button className="button button--primary" disabled={Object.keys(answers).length < 3} onClick={submitMatching} type="button">{l('Nộp câu trả lời', 'Submit answers', '提交答案')}</button>
      </section>

      <section className="panel exercise-card">
        <div className="panel-heading"><div><span className="eyebrow">{l('Trắc nghiệm Bài 1', 'Lesson 1 quiz', '第一课测验')}</span><h2>{l('Kiểm tra từ vựng và cách dùng', 'Vocabulary and usage check', '检查词汇与用法')}</h2></div>{quizResult ? <span className="score-badge">{quizResult}/4</span> : null}</div>
        <div className="quiz-list">
          {quizQuestions.map((question, questionIndex) => { const languageIndex = language === 'vi' ? 0 : language === 'en' ? 1 : 2; return <fieldset key={question.id}><legend>{questionIndex + 1}. {question.prompt[languageIndex]}</legend>{question.choices[languageIndex].map((choice, choiceIndex) => <label key={choice}><input checked={quizAnswers[question.id] === choiceIndex} name={`q-${question.id}`} onChange={() => { setQuizAnswers((current) => ({ ...current, [question.id]: choiceIndex })); setQuizResult(null) }} type="radio" /><span>{choice}</span>{quizResult !== null && choiceIndex === question.answer ? <CheckCircle2 size={17} /> : null}</label>)}</fieldset> })}
        </div>
        <button className="button button--primary" disabled={Object.keys(quizAnswers).length < quizQuestions.length} onClick={submitQuiz} type="button">{l('Chấm điểm', 'Grade', '评分')}</button>
        {quizResult !== null ? <button className="button button--ghost" onClick={() => { setQuizAnswers({}); setQuizResult(null) }} type="button"><RotateCcw size={17} /> {l('Làm lại', 'Try again', '重做')}</button> : null}
        {syncMessage ? <p className="form-message">{syncMessage}</p> : null}
      </section>

      <section className="panel workbook-index"><h2>{l('Toàn bộ bài luyện nghe–đọc', 'All listening and reading exercises', '全部听读练习')}</h2>{lessonOne.workbookExercises.slice(0, 4).map((exercise, index) => <div key={exercise.id}><span>{index + 1}</span><div>{language === 'vi' ? <strong>{exercise.promptVi}</strong> : null}{exercise.items ? <p>{exercise.items.join(' · ')}</p> : <p>{exercise.itemCount} {l('mục nghe–điền; đáp án hiện sau khi nộp.', 'listen-and-fill items; answers appear after submission.', '道听写题；提交后显示答案。')}</p>}</div></div>)}</section>
    </div>
  )
}

function ListeningView() {
  const { language, l } = useLanguage()
  const [revealed, setRevealed] = useState({})
  return (
    <div className="content-stack">
      <section className="panel audio-source-panel"><div><span className="eyebrow">{l('Nguồn nghe chính thức', 'Official audio', '官方音频')}</span><h2>{l('Nghe Bài 1', 'Listen to Lesson 1', '第一课听力')}</h2><p>{l('Nghe không giới hạn. Tốc độ phát có thể điều chỉnh ngay trên từng trình duyệt.', 'Listen without limits. Playback speed can be adjusted in your browser.', '可不限次数收听，并可在浏览器中调整播放速度。')}</p></div><Headphones size={36} /></section>
      {lessonOne.dialogues.map((dialogue) => <article className="panel listening-track" key={dialogue.id}><div><span className="track-icon"><FileAudio size={22} /></span><div><strong>{language === 'vi' ? dialogue.titleVi : dialogue.titleEn}</strong><small>{dialogue.lines.length} {l('lượt thoại', 'lines', '句对话')}</small></div></div><audio controls preload="metadata" src={dialogue.audio} /><button className="button button--ghost button--small" onClick={() => setRevealed((current) => ({ ...current, [dialogue.id]: !current[dialogue.id] }))} type="button">{revealed[dialogue.id] ? l('Ẩn lời thoại', 'Hide transcript', '隐藏原文') : l('Xem lời thoại', 'Show transcript', '查看原文')}</button>{revealed[dialogue.id] ? <div className="track-transcript">{dialogue.lines.map((line) => <p key={line.zh}><strong lang="zh-CN">{line.zh}</strong><span>{line.py}</span><small>{language === 'vi' ? line.vi : line.en}</small></p>)}</div> : null}</article>)}
      <article className="panel listening-track"><div><span className="track-icon"><Sparkles size={22} /></span><div><strong>{l('Vè líu lưỡi', 'Tongue twister', '绕口令')}</strong><small>1-7</small></div></div><audio controls preload="metadata" src={lessonOne.tongueTwister.audio} /></article>
      <article className="panel listening-track"><div><span className="track-icon"><BookOpenText size={22} /></span><div><strong>{l('Sách bài tập Bài 1', 'Lesson 1 workbook', '第一课练习册')}</strong><small>{l('Ngữ âm và bài nghe–điền', 'Pronunciation and listening dictation', '语音与听写练习')}</small></div></div><audio controls preload="metadata" src={lessonOne.pronunciation.audio} /></article>
    </div>
  )
}

function RecordingPanel({ item, preview }) {
  const recorder = useRecorder()
  const { user } = useAuth()
  const { l } = useLanguage()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  async function submit() {
    if (!recorder.recording) return
    if (preview || !user) {
      setMessage(l('Bản xem trước không gửi tệp lên máy chủ. Khi đăng nhập thật, mỗi loại bài chỉ được nộp một lần.', 'Preview mode does not upload files. After sign-in, each task type can be submitted once.', '预览模式不会上传文件。登录后，每种作业只能提交一次。'))
      return
    }
    setSubmitting(true)
    try {
      await submitShadowing({ userId: user.id, lessonId: lessonOne.id, submissionType: item.type, recording: recorder.recording })
      setMessage(l('Đã nộp bài. Bạn không thể thay thế bản ghi chính thức này.', 'Submitted. This official recording cannot be replaced.', '已提交，正式录音无法替换。'))
    } catch (error) {
      setMessage(error.message || l('Không thể nộp bản ghi.', 'Unable to submit the recording.', '无法提交录音。'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <article className="panel recording-panel">
      <div className="panel-heading"><div><span className="eyebrow">{item.type === 'official' ? l('Bài chính thức', 'Official task', '正式作业') : l('Bài tự biên soạn', 'Composed task', '自编作业')}</span><h2>{item.type === 'official' ? l('Đoạn chính thức', 'Official passage', '正式段落') : l('Đoạn tự biên soạn', 'Composed passage', '自编段落')}</h2></div><span className="once-badge">{l('Nộp 1 lần', 'Submit once', '仅提交一次')}</span></div>
      <p>{item.type === 'official' ? l(item.instructionVi, 'Practise and record the three Lesson 1 dialogues in order.', '依次练习并录制第一课的三段对话。') : l(item.instructionVi, 'This extra passage only uses words and sentence patterns from Lesson 1.', '这段补充练习只使用第一课出现的词语和句型。')}</p>
      {item.audio ? <audio controls preload="metadata" src={item.audio} /> : <button className="speaker-button" onClick={() => speakChinese(item.text, 0.72)} type="button"><Volume2 size={20} />{l('Nghe giọng phổ thông', 'Listen in Standard Mandarin', '听普通话发音')}</button>}
      <div className="reading-script"><strong lang="zh-CN">{item.text}</strong><span>{item.pinyin}</span></div>
      <div className="practice-zone"><div><Mic2 size={23} /><span><strong>{l('Tự luyện', 'Self-practice', '自主练习')}</strong><small>{l('Bản ghi chỉ nằm tạm trên thiết bị, không tải lên.', 'The practice recording stays temporarily on this device and is not uploaded.', '练习录音仅临时保存在本设备，不会上传。')}</small></span></div><div className="record-actions">{recorder.status === 'recording' ? <button className="button button--danger" onClick={recorder.stop} type="button"><Pause size={17} /> {l('Dừng thu', 'Stop', '停止录音')}</button> : <button className="button button--ghost" onClick={recorder.start} type="button"><Mic2 size={17} /> {recorder.recording ? l('Thu lại', 'Record again', '重新录音') : l('Bắt đầu thu', 'Start recording', '开始录音')}</button>}{recorder.recording ? <button className="button button--ghost" onClick={recorder.reset} type="button"><RotateCcw size={17} /> {l('Xóa bản luyện', 'Delete practice recording', '删除练习录音')}</button> : null}</div>{recorder.recording ? <audio controls src={recorder.recording.url} /> : null}{recorder.error ? <p className="form-message form-message--error">{recorder.error}</p> : null}</div>
      <div className="submission-zone"><div><Send size={22} /><span><strong>{l('Nộp để giáo viên chấm', 'Submit for teacher grading', '提交给教师批改')}</strong><small>{l('Điểm 0–10 và nhận xét riêng cho loại bài này.', 'A 0–10 score and separate feedback for this task type.', '本作业将获得0–10分及单独评语。')}</small></span></div><button className="button button--primary" disabled={!recorder.recording || submitting} onClick={submit} type="button">{submitting ? l('Đang nộp…', 'Submitting…', '正在提交…') : l('Nộp bản ghi này', 'Submit this recording', '提交此录音')}</button></div>
      {message ? <p className="form-message">{message}</p> : null}
    </article>
  )
}

function ShadowingView({ preview }) {
  return <div className="content-stack"><RecordingPanel item={lessonOne.shadowing.official} preview={preview} /><RecordingPanel item={lessonOne.shadowing.composed} preview={preview} /></div>
}

function WritingView({ preview }) {
  const { user } = useAuth()
  const { language, l } = useLanguage()
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (preview) {
      setDraft(localStorage.getItem('liuliuliu-preview-writing-draft') || '')
      return undefined
    }
    if (!user) return undefined
    let active = true
    loadWritingDraft({ userId: user.id })
      .then((content) => active && setDraft(content))
      .catch(() => active && setMessage(l('Chưa thể tải bản nháp đã lưu.', 'Unable to load the saved draft.', '无法加载已保存的草稿。')))
    return () => { active = false }
  }, [preview, user])

  async function save() {
    if (preview || !user) {
      localStorage.setItem('liuliuliu-preview-writing-draft', draft)
      setMessage(l('Đã lưu bản nháp trên thiết bị cho bản xem trước.', 'Preview draft saved on this device.', '预览草稿已保存在本设备。'))
      return
    }
    setBusy(true)
    try { await saveWritingDraft({ userId: user.id, lessonId: lessonOne.id, content: draft }); setMessage(l('Đã lưu bản nháp và đồng bộ nhiều thiết bị.', 'Draft saved and synced across devices.', '草稿已保存并同步到多台设备。')) } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }

  async function submit() {
    if (preview || !user) { setMessage(l('Bản xem trước không gửi bài. Khi đăng nhập thật, bài chính thức chỉ được nộp một lần.', 'Preview mode does not submit work. After sign-in, the official task can be submitted once.', '预览模式不会提交作业。登录后，正式作业只能提交一次。')); return }
    setBusy(true)
    try { await submitWriting({ userId: user.id, lessonId: lessonOne.id, content: draft }); setMessage(l('Đã nộp bài viết. Bài chính thức không thể sửa hoặc xóa.', 'Writing submitted. The official submission cannot be edited or deleted.', '写作已提交，正式作业无法修改或删除。')) } catch (error) { setMessage(error.message) } finally { setBusy(false) }
  }

  return (
    <div className="writing-layout">
      <section className="panel writing-prompt"><span className="eyebrow">{l('Chủ đề Bài 1', 'Lesson 1 topic', '第一课主题')}</span><h2>{l('Ngày đầu tiên đến lớp', 'The first day of class', '上课第一天')}</h2><p>{language === 'vi' ? lessonOne.writing.promptVi : language === 'en' ? lessonOne.writing.promptEn : '以第一天上课为背景，写一段5至8句的简短问候对话。请使用合适的问候语、“您”或“们”、感谢语和告别语。'}</p><ul>{language === 'vi' ? lessonOne.writing.requirements.map((item) => <li key={item}><Check size={17} />{item}</li>) : [l('', '5–8 sentences', '5至8句'), l('', 'Simplified Chinese characters', '使用简体汉字'), l('', 'Use at least 5 words or phrases from Lesson 1', '至少使用5个第一课的词语')].map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul><div className="no-sample"><MessageSquareText size={20} /><span>{l('Không có bài mẫu. Giáo viên sẽ chấm theo thang 10 và để lại nhận xét.', 'No sample answer is provided. The teacher will grade it on a 10-point scale and leave feedback.', '不提供范文。教师将按10分制评分并留下评语。')}</span></div></section>
      <section className="panel writing-editor"><div className="panel-heading"><div><span className="eyebrow">{l('Tự luyện', 'Self-practice', '自主练习')}</span><h2>{l('Bản nháp của tôi', 'My draft', '我的草稿')}</h2></div><span>{draft.length} {l('ký tự', 'characters', '字')}</span></div><textarea onChange={(event) => setDraft(event.target.value)} placeholder="在这里写……" value={draft} /><div className="writing-editor__actions"><button className="button button--ghost" disabled={!draft.trim() || busy} onClick={save} type="button"><Save size={17} /> {l('Lưu bản nháp', 'Save draft', '保存草稿')}</button><button className="button button--primary" disabled={!draft.trim() || busy} onClick={submit} type="button"><Send size={17} /> {l('Nộp để chấm', 'Submit for grading', '提交批改')}</button></div>{message ? <p className="form-message">{message}</p> : null}</section>
    </div>
  )
}

export default function LessonPage({ preview = false, initialTab = 'vocabulary' }) {
  const { user } = useAuth()
  const { t, l } = useLanguage()
  const [activeTab, setActiveTab] = useState(tabs.some((tab) => tab.id === initialTab) ? initialTab : 'vocabulary')
  const [completionPercent, setCompletionPercent] = useState(preview ? 20 : 0)
  const [completedSections, setCompletedSections] = useState(preview ? ['vocabulary', 'flashcards'] : [])
  useEffect(() => {
    if (tabs.some((tab) => tab.id === initialTab)) setActiveTab(initialTab)
  }, [initialTab])
  useEffect(() => {
    if (!preview && user) {
      markLessonSection({ section: activeTab })
        .then((progress) => {
          setCompletionPercent(progress.completion_percent)
          setCompletedSections(progress.completed_sections || [])
        })
        .catch(() => {})
    }
  }, [activeTab, preview, user])
  const activeContent = useMemo(() => {
    if (activeTab === 'flashcards') return <FlashcardView />
    if (activeTab === 'grammar') return <GrammarView />
    if (activeTab === 'dialogues') return <DialoguesView />
    if (activeTab === 'pronunciation') return <PronunciationView />
    if (activeTab === 'exercises') return <ExercisesView preview={preview} />
    if (activeTab === 'listening') return <ListeningView />
    if (activeTab === 'shadowing') return <ShadowingView preview={preview} />
    if (activeTab === 'writing') return <WritingView preview={preview} />
    return <VocabularyView preview={preview} />
  }, [activeTab, preview])

  return (
    <AppShell active={activeTab === 'grammar' || activeTab === 'dialogues' || activeTab === 'pronunciation' || activeTab === 'exercises' ? 'lessons' : activeTab} preview={preview}>
      <div className="lesson-heading">
        <button className="back-button" onClick={() => navigate(preview ? '/preview/student' : '/app')} type="button"><ArrowLeft size={19} /><span>{t('overview')}</span></button>
        <div><span className="eyebrow">HSK 1 · {t('lessonOne')}</span><h1><span lang="zh-CN">AI小语，你好！</span></h1><p>AI Xiǎoyǔ, nǐ hǎo! · {l('Xin chào, AI Tiểu Ngữ!', 'Hello, AI Xiaoyu!', 'AI小语，你好！')}</p></div>
        <div className="lesson-progress"><div><span>{completionPercent}% {l('hoàn thành', 'complete', '已完成')}</span><span>{completedSections.length} / 9 {l('phần', 'sections', '个部分')}</span></div><div><span style={{ width: `${completionPercent}%` }} /></div></div>
      </div>
      <div className="lesson-tabs" role="tablist">
        {tabs.map((tab) => <button aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'is-active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)} role="tab" type="button">{t(tab.key)}</button>)}
      </div>
      <div className="lesson-content" key={activeTab}>{activeContent}</div>
    </AppShell>
  )
}
