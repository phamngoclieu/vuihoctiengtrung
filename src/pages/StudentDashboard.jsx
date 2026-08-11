import { useEffect, useState } from 'react'
import { ArrowRight, BookOpen, CheckSquare2, ClipboardClock, Flame, MessageCircleMore, Mic2, PenLine } from 'lucide-react'
import AppShell from '../components/AppShell.jsx'
import { lessonOne, lessonRoadmap } from '../data/lesson1.js'
import { navigate } from '../lib/hashRoute.js'
import { useLanguage } from '../lib/i18n.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { loadStudentDashboard } from '../lib/dashboard.js'

const emptyDashboard = {
  hasStarted: false,
  completionPercent: 0,
  reviewWordIds: [],
  rememberedCount: 0,
  attemptCount: 0,
  latestFeedback: null,
  pendingGrades: 0,
  hasWritingDraft: false,
}

const previewDashboard = {
  hasStarted: true,
  completionPercent: 20,
  reviewWordIds: ['ni', 'hao'],
  rememberedCount: 12,
  attemptCount: 4,
  latestFeedback: { title: 'Bài shadowing đã được chấm', body: 'Phát âm 很好! Tiếp tục giữ nhịp và tự tin hơn nhé.' },
  pendingGrades: 1,
  hasWritingDraft: true,
}

export default function StudentDashboard({ preview = false, focusSection = null }) {
  const { t, l, language } = useLanguage()
  const { user, profile } = useAuth()
  const [data, setData] = useState(preview ? previewDashboard : emptyDashboard)
  const [error, setError] = useState(null)
  const goToLesson = () => navigate(preview ? '/preview/lesson/1' : '/app/lesson/1')
  const reviewWords = data.reviewWordIds.map((id) => lessonOne.vocabulary.find((word) => word.id === id)).filter(Boolean).slice(0, 3)
  const coursePercent = Math.round(data.completionPercent / lessonRoadmap.length)
  const feedbackScore = data.latestFeedback?.body?.match(/(\d+(?:\.\d+)?)\/10/)?.[1]
  const feedbackTitle = data.latestFeedback ? (language === 'vi' ? data.latestFeedback.title : l('', 'Submission graded', '作业已批改')) : ''
  const feedbackBody = data.latestFeedback ? (language === 'vi' ? data.latestFeedback.body : feedbackScore ? l('', `You received ${feedbackScore}/10. Open the lesson to view feedback.`, `您获得${feedbackScore}/10分，请打开课程查看评语。`) : l('', 'Open the lesson to view your score and feedback.', '请打开课程查看分数和评语。')) : ''

  useEffect(() => {
    if (preview || !user) return undefined
    let active = true
    loadStudentDashboard({ userId: user.id })
      .then((nextData) => active && setData(nextData))
      .catch(() => active && setError('Chưa thể tải tiến độ mới nhất.'))
    return () => { active = false }
  }, [preview, user])

  useEffect(() => {
    if (!focusSection) return undefined
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(`dashboard-${focusSection}`)
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [focusSection])

  return (
    <AppShell active={focusSection || 'overview'} preview={preview}>
      <div className="page-heading dashboard-heading">
        <div><span className="eyebrow">HSK 1</span><h1>{l('Chào mừng trở lại', 'Welcome back', '欢迎回来')}{profile?.display_name ? `, ${profile.display_name}` : ''} <span aria-hidden="true">👋</span></h1><p>{l('Học mỗi ngày, tiến bộ mỗi ngày.', 'Learn every day, improve every day.', '每天学习，每天进步。')}</p></div>
      </div>
      {error ? <p className="form-message form-message--error">{l(error, 'Unable to load the latest progress.', '无法加载最新学习进度。')}</p> : null}

      <div className="dashboard-grid">
        <section className="continue-panel panel">
          <div><span className="panel-label">{t('continueLesson')}</span><div className="continue-panel__title"><strong lang="zh-CN">你好</strong><span>nǐ hǎo</span></div><p>{language === 'en' ? lessonOne.titleEn : language === 'zh' ? lessonOne.title : lessonOne.titleVi}</p><div className="mini-progress"><span style={{ width: `${data.completionPercent}%` }} /></div><small>{data.completionPercent}% {l('hoàn thành', 'complete', '已完成')}</small></div>
          <button className="button button--primary button--large" onClick={goToLesson} type="button">{t('continueLesson')} <ArrowRight size={18} /></button>
        </section>

        <section className="review-panel panel" id="dashboard-review">
          <div className="panel-heading"><h2>{t('reviewToday')}</h2><span className="count-badge">{data.reviewWordIds.length} {t('itemUnit')}</span></div>
          {reviewWords.length ? reviewWords.map((word) => <button key={word.id} onClick={() => navigate(`${preview ? '/preview/lesson/1' : '/app/lesson/1'}?v=vocabulary`)} type="button"><span className="hanzi-badge" lang="zh-CN">{word.hanzi}</span><span><strong>{word.hanzi} {word.pinyin}</strong><small>{language === 'vi' ? word.meaningVi : word.meaningEn}</small></span><ArrowRight size={17} /></button>) : <p className="panel-empty">{l('Chưa có từ đến hạn ôn. Hãy đánh dấu từ trong Bài 1 để tạo lịch ôn.', 'No words are due. Mark words in Lesson 1 to create a review schedule.', '目前没有到期复习的生词。请在第一课中标记生词以生成复习计划。')}</p>}
          {data.pendingGrades ? <button onClick={() => navigate(`${preview ? '/preview/lesson/1' : '/app/lesson/1'}?v=shadowing`)} type="button"><ClipboardClock size={19} /><span><strong>{data.pendingGrades} {l('bài đang chờ chấm', 'submission(s) awaiting grading', '份作业等待批改')}</strong><small>{l('Giáo viên sẽ phản hồi trong hệ thống', 'Your teacher will respond in the system', '教师将在系统中反馈')}</small></span><ArrowRight size={17} /></button> : null}
          {data.hasWritingDraft ? <button onClick={() => navigate(`${preview ? '/preview/lesson/1' : '/app/lesson/1'}?v=writing`)} type="button"><PenLine size={19} /><span><strong>{l('Bài 1 · Luyện viết', 'Lesson 1 · Writing', '第一课 · 写作')}</strong><small>{l('Bản nháp đã đồng bộ', 'Draft synced', '草稿已同步')}</small></span><ArrowRight size={17} /></button> : null}
        </section>

        <section className="roadmap-panel panel">
          <div className="panel-heading"><div><h2>{l('Lộ trình 15 bài học', '15-lesson roadmap', '十五课学习路线')}</h2><p>{l('Nội dung được mở sau khi hoàn tất đối chiếu nguồn.', 'Content opens after source verification is complete.', '内容完成资料核对后开放。')}</p></div><button className="button button--ghost button--small" onClick={goToLesson} type="button">{l('Xem Bài 1', 'View Lesson 1', '查看第一课')}</button></div>
          <div className="roadmap">{lessonRoadmap.map((lesson) => <button aria-disabled={lesson.number !== 1} className={lesson.number === 1 ? 'is-current' : ''} key={lesson.id} onClick={lesson.number === 1 ? goToLesson : undefined} type="button"><span>{lesson.number}</span><small>{l(`Bài ${lesson.number}`, `Lesson ${lesson.number}`, `第${lesson.number}课`)}</small></button>)}</div>
        </section>

        <section className="feedback-panel panel">
          <div className="panel-heading"><h2>{t('newFeedback')}</h2>{data.latestFeedback && !data.latestFeedback.read_at ? <span className="count-badge">{t('newLabel')}</span> : null}</div>
          {data.latestFeedback ? <><div className="feedback-panel__teacher"><span className="avatar">{t('teacherInitial')}</span><div><strong>{l('Giáo viên Liu', 'Teacher Liu', '刘老师')}</strong><small>{l('Trong hệ thống', 'In the system', '系统内')}</small></div></div><p><strong>{feedbackTitle}</strong><br />{feedbackBody}</p></> : <p className="panel-empty">{l('Chưa có phản hồi mới từ giáo viên.', 'No new teacher feedback.', '暂无教师的新反馈。')}</p>}
        </section>

        <section className="progress-panel panel" id="dashboard-progress">
          <h2>{t('recentProgress')}</h2>
          <div className="progress-stats"><div><BookOpen /><strong>{data.hasStarted ? 1 : 0}</strong><span>{l('Bài học đã bắt đầu', 'Lessons started', '已开始课程')}</span><small>/ 15</small></div><div><CheckSquare2 /><strong>{data.rememberedCount}</strong><span>{l('Từ đã nhớ', 'Words remembered', '已记住生词')}</span><small>/ {lessonOne.vocabulary.length}</small></div><div><Flame /><strong>{data.attemptCount}</strong><span>{l('Lượt làm bài', 'Exercise attempts', '练习次数')}</span><small>{l('đã lưu', 'saved', '已保存')}</small></div><div><Mic2 /><strong>{data.pendingGrades}</strong><span>{l('Bài đang chờ chấm', 'Awaiting grading', '等待批改')}</span><small>{l('bài', 'items', '份')}</small></div></div>
          <div className="progress-bar"><span style={{ width: `${coursePercent}%` }} /></div><div className="progress-panel__footer"><span>{l('Tổng tiến độ HSK 1', 'Overall HSK 1 progress', 'HSK一级总进度')}</span><span>{coursePercent}%</span></div>
        </section>

        <section className="help-panel panel"><MessageCircleMore size={26} /><div><h2>{l('Phát hiện nội dung cần sửa?', 'Found content that needs correction?', '发现需要更正的内容？')}</h2><p>{l('Gửi báo lỗi kèm bài học, loại lỗi và ảnh minh họa ngay trong hệ thống.', 'Report the lesson, error type, and an optional screenshot in the system.', '请在系统中提交课程、错误类型和截图。')}</p></div><button className="button button--ghost button--small" type="button">{t('reports')}</button></section>
      </div>
    </AppShell>
  )
}
