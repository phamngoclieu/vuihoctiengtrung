import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, Search, Trophy } from 'lucide-react'
import AppShell, { EmptyState } from '../components/AppShell.jsx'
import { useLanguage } from '../lib/i18n.jsx'
import { loadStaffVocabularyPracticeHistory } from '../lib/vocabularyPractice.js'

const previewHistory = [
  {
    id: 'preview-complete', hskLevel: 1, status: 'completed', currentIndex: 15, totalQuestions: 15,
    firstTryCorrect: 11, everWrong: 3, revealedAnswers: 1, startedAt: '2026-09-28T07:15:00Z', completedAt: '2026-09-28T07:28:00Z',
    profile: { display_name: 'Nguyễn Minh Anh', email: 'hocvien@example.com' },
  },
  {
    id: 'preview-progress', hskLevel: 1, status: 'in_progress', currentIndex: 7, totalQuestions: 15,
    firstTryCorrect: 5, everWrong: 2, revealedAnswers: 0, startedAt: '2026-09-28T08:40:00Z', completedAt: null,
    profile: { display_name: 'Trần Khánh Linh', email: 'linh@example.com' },
  },
]

export default function AdminVocabularyPracticePage({ preview = false }) {
  const { language, l } = useLanguage()
  const [history, setHistory] = useState(preview ? previewHistory : [])
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('all')
  const [loading, setLoading] = useState(!preview)
  const [error, setError] = useState(null)
  const locale = language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-GB' : 'vi-VN'

  useEffect(() => {
    if (preview) return undefined
    let active = true
    loadStaffVocabularyPracticeHistory()
      .then((rows) => active && setHistory(rows))
      .catch((loadError) => active && setError(loadError.message || l('Không thể tải lịch sử luyện tập.', 'Unable to load practice history.', '无法加载练习记录。')))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [preview])

  const levels = useMemo(() => [...new Set(history.map((item) => item.hskLevel))].sort((a, b) => a - b), [history])
  const visibleHistory = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return history.filter((item) => (
      (level === 'all' || String(item.hskLevel) === level)
      && (!normalized || `${item.profile?.display_name || ''} ${item.profile?.email || ''}`.toLocaleLowerCase().includes(normalized))
    ))
  }, [history, level, query])
  const completedCount = history.filter((item) => item.status === 'completed').length
  const activeCount = history.length - completedCount

  function formatDate(value) {
    if (!value) return '—'
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  }

  return (
    <AppShell active="vocabularyPracticeResults" mode="admin" preview={preview}>
      <div className="page-heading admin-heading">
        <div><span className="eyebrow">{l('Theo dõi học tập', 'Learning insights', '学习跟踪')}</span><h1>{l('Lịch sử luyện từ vựng', 'Vocabulary practice history', '生词练习记录')}</h1><p>{l('Giáo viên và quản trị viên xem từng lượt luyện, thời gian và kết quả của học viên.', 'Teachers and administrators can view every run, timestamp, and student result.', '教师和管理员可查看每次练习的时间与结果。')}</p></div>
        <div className="admin-kpis"><span><strong>{completedCount}</strong> {l('Đã hoàn thành', 'Completed', '已完成')}</span><span><strong>{activeCount}</strong> {l('Đang làm', 'In progress', '进行中')}</span></div>
      </div>

      <section className="practice-history panel">
        <div className="practice-history__filters">
          <label><Search size={18} /><input aria-label={l('Tìm học viên', 'Search students', '搜索学生')} onChange={(event) => setQuery(event.target.value)} placeholder={l('Tìm theo tên hoặc email', 'Search by name or email', '按姓名或邮箱搜索')} type="search" value={query} /></label>
          <select aria-label={l('Lọc theo cấp độ', 'Filter by level', '按级别筛选')} onChange={(event) => setLevel(event.target.value)} value={level}><option value="all">{l('Tất cả cấp độ', 'All levels', '全部级别')}</option>{levels.map((item) => <option key={item} value={item}>HSK {item}</option>)}</select>
        </div>
        {error ? <p className="form-message form-message--error">{error}</p> : null}
        {loading ? <EmptyState title={l('Đang tải lịch sử…', 'Loading history…', '正在加载记录…')} description={l('Dữ liệu đang được đồng bộ từ hệ thống.', 'Data is syncing from the system.', '正在从系统同步数据。')} /> : visibleHistory.length ? (
          <div className="practice-history__list">
            {visibleHistory.map((item) => {
              const progress = item.totalQuestions ? Math.round((item.currentIndex / item.totalQuestions) * 100) : 0
              return (
                <article key={item.id}>
                  <div className="practice-history__student"><span className="avatar">{item.profile?.display_name?.trim()?.[0] || 'H'}</span><div><strong>{item.profile?.display_name || l('Học viên', 'Student', '学生')}</strong><small>{item.profile?.email || '—'}</small></div></div>
                  <div><span>HSK {item.hskLevel}</span><small>{formatDate(item.startedAt)}</small></div>
                  <div className="practice-history__score"><span><b>{item.firstTryCorrect}</b> / {item.totalQuestions}</span><small>{l('Đúng lần đầu', 'First-try correct', '首次答对')}</small></div>
                  <div className="practice-history__metrics"><span>{l('Sai', 'Wrong', '答错')}: <b>{item.everWrong}</b></span><span>{l('Hiện đáp án', 'Revealed', '查看答案')}: <b>{item.revealedAnswers}</b></span></div>
                  <div className={`practice-history__status practice-history__status--${item.status}`}>{item.status === 'completed' ? <CheckCircle2 size={17} /> : <Clock3 size={17} />}<span>{item.status === 'completed' ? l('Đã hoàn thành', 'Completed', '已完成') : l(`Đang làm · ${progress}%`, `In progress · ${progress}%`, `进行中 · ${progress}%`)}</span></div>
                </article>
              )
            })}
          </div>
        ) : <EmptyState title={l('Chưa có lượt luyện tập', 'No practice runs yet', '暂无练习记录')} description={l('Lịch sử sẽ xuất hiện sau khi học viên bắt đầu luyện từ vựng.', 'History will appear after a student starts vocabulary practice.', '学生开始生词练习后，记录会显示在这里。')} />}
      </section>
      {visibleHistory.length ? <p className="practice-history__note"><Trophy size={16} />{l('Mỗi lần học viên luyện lại được lưu thành một lượt lịch sử riêng.', 'Every replay is saved as a separate history entry.', '每次重新练习都会保存为独立记录。')}</p> : null}
    </AppShell>
  )
}
