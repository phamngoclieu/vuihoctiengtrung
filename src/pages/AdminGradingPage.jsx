import { useEffect, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Save } from 'lucide-react'
import AppShell, { EmptyState } from '../components/AppShell.jsx'
import { lessonOne } from '../data/lesson1.js'
import { getShadowingPlaybackUrl, gradeSubmission, loadGradingQueue } from '../lib/grading.js'
import { useLanguage } from '../lib/i18n.jsx'

const previewQueue = [
  { id: 1, key: 'shadowing-1', kind: 'shadowing', name: 'Nguyễn Minh Anh', lesson: 'Bài 1', type: 'Đoạn chính thức', submitted: '20/05/2026 10:32', status: 'pending', score: null, teacher_comment: null },
  { id: 2, key: 'shadowing-2', kind: 'shadowing', name: 'Trần Khánh Linh', lesson: 'Bài 1', type: 'Đoạn tự biên soạn', submitted: '20/05/2026 09:15', status: 'pending', score: null, teacher_comment: null },
  { id: 3, key: 'writing-3', kind: 'writing', name: 'Lê Gia Bảo', lesson: 'Bài 1', type: 'Luyện viết', submitted: '20/05/2026 08:47', status: 'pending', content: '老师，您好！大家好！我是学生。谢谢老师！同学们，再见！', score: null, teacher_comment: null },
  { id: 4, key: 'shadowing-4', kind: 'shadowing', name: 'Phạm Minh Đức', lesson: 'Bài 1', type: 'Đoạn chính thức', submitted: '19/05/2026 21:10', status: 'graded', score: 8.5, teacher_comment: 'Nhịp đọc tốt, cần rõ thanh điệu hơn.' },
  { id: 5, key: 'writing-5', kind: 'writing', name: 'Hoàng Thu Hà', lesson: 'Bài 1', type: 'Luyện viết', submitted: '19/05/2026 19:05', status: 'graded', content: '老师，您好！同学们，你们好！谢谢大家！再见！', score: 9, teacher_comment: 'Bài viết đúng yêu cầu và dùng từ tự nhiên.' },
]

export default function AdminGradingPage({ preview = false }) {
  const { t, l } = useLanguage()
  const [activeType, setActiveType] = useState('shadowing')
  const [queue, setQueue] = useState(preview ? previewQueue : [])
  const [selectedKey, setSelectedKey] = useState('shadowing-1')
  const [score, setScore] = useState('')
  const [comment, setComment] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(!preview)
  const [error, setError] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)

  const visibleQueue = queue.filter((item) => item.kind === activeType)
  const selected = visibleQueue.find((item) => item.key === selectedKey) || visibleQueue[0] || null
  const pendingCount = queue.filter((item) => item.status === 'pending').length
  const gradedCount = queue.filter((item) => item.status === 'graded').length
  const typeLabel = (item) => item.kind === 'writing' ? t('writing') : item.submission_type === 'composed' || item.type === 'Đoạn tự biên soạn' ? l('Đoạn tự biên soạn', 'Composed passage', '自编段落') : l('Đoạn chính thức', 'Official passage', '正式段落')

  useEffect(() => {
    if (preview) return undefined
    let active = true
    loadGradingQueue()
      .then((rows) => {
        if (!active) return
        setQueue(rows)
        setSelectedKey(rows.find((item) => item.kind === 'shadowing')?.key || rows[0]?.key || '')
      })
      .catch((loadError) => active && setError(loadError.message || l('Không thể tải danh sách bài nộp.', 'Unable to load submissions.', '无法加载作业列表。')))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [preview])

  useEffect(() => {
    if (!selected) return
    setSelectedKey(selected.key)
    setScore(selected.score ?? '')
    setComment(selected.teacher_comment || '')
    setSaved(false)
  }, [selected?.key])

  useEffect(() => {
    if (preview || selected?.kind !== 'shadowing' || !selected.storage_path) {
      setAudioUrl(null)
      return undefined
    }
    let active = true
    getShadowingPlaybackUrl(selected.storage_path)
      .then((url) => active && setAudioUrl(url))
      .catch(() => active && setError(l('Không thể mở bản ghi âm này.', 'Unable to open this recording.', '无法打开此录音。')))
    return () => { active = false }
  }, [preview, selected?.key, selected?.kind, selected?.storage_path])

  function chooseType(kind) {
    setActiveType(kind)
    setSelectedKey(queue.find((item) => item.kind === kind)?.key || '')
    setError(null)
  }

  async function saveGrade() {
    if (!selected) return
    if (preview) {
      setSaved(true)
      return
    }
    setError(null)
    try {
      await gradeSubmission({ kind: selected.kind, submissionId: selected.id, score: Number(score), comment })
      setQueue((current) => current.map((item) => item.key === selected.key ? { ...item, score: Number(score), teacher_comment: comment.trim(), status: 'graded' } : item))
      setSaved(true)
    } catch (gradeError) {
      setError(gradeError.message || l('Không thể lưu điểm.', 'Unable to save the grade.', '无法保存成绩。'))
    }
  }

  return (
    <AppShell active="grading" mode="admin" preview={preview}>
      <div className="page-heading admin-heading"><div><span className="eyebrow">{l('Không gian giáo viên', 'Teacher workspace', '教师工作区')}</span><h1>{t('grading')}</h1><p>{l('Toàn bộ giáo viên được xem và chấm bài của tất cả học viên.', 'Teachers can view and grade submissions from all students.', '所有教师均可查看并批改全部学生的作业。')}</p></div><div className="admin-kpis"><span><strong>{pendingCount}</strong> {l('Chờ chấm', 'Pending', '待批改')}</span><span><strong>{gradedCount}</strong> {l('Đã chấm', 'Graded', '已批改')}</span></div></div>
      <div className="grading-tabs"><button className={activeType === 'shadowing' ? 'is-active' : ''} onClick={() => chooseType('shadowing')} type="button">{t('shadowing')}</button><button className={activeType === 'writing' ? 'is-active' : ''} onClick={() => chooseType('writing')} type="button">{t('writing')}</button></div>

      {error ? <p className="form-message form-message--error">{error}</p> : null}
      <div className="grading-workspace">
        <section className="grading-list panel">
          <div className="grading-filters"><select aria-label={l('Lọc theo bài', 'Filter by lesson', '按课程筛选')}><option>{l('Tất cả bài', 'All lessons', '全部课程')}</option><option>{l('Bài 1', 'Lesson 1', '第一课')}</option></select><select aria-label={l('Lọc theo trạng thái', 'Filter by status', '按状态筛选')}><option>{l('Tất cả trạng thái', 'All statuses', '全部状态')}</option><option>{l('Chờ chấm', 'Pending', '待批改')}</option><option>{l('Đã chấm', 'Graded', '已批改')}</option></select><select aria-label={l('Lọc theo học viên', 'Filter by student', '按学生筛选')}><option>{l('Tất cả học viên', 'All students', '全部学生')}</option></select></div>
          {loading ? <EmptyState title={l('Đang tải bài nộp…', 'Loading submissions…', '正在加载作业…')} description={l('Dữ liệu đang được đồng bộ từ hệ thống.', 'Data is syncing from the system.', '正在从系统同步数据。')} /> : visibleQueue.length ? (
            <>
              <div className="grading-table" role="table">
                <div className="grading-table__head" role="row"><span>{t('roleStudent')}</span><span>{t('lessons')}</span><span>{l('Loại bài', 'Type', '作业类型')}</span><span>{l('Đã nộp', 'Submitted', '提交时间')}</span><span>{t('status')}</span><span /></div>
                {visibleQueue.map((row) => <button className={selected?.key === row.key ? 'is-active' : ''} key={row.key} onClick={() => setSelectedKey(row.key)} role="row" type="button"><strong>{row.name}</strong><span>{l('Bài 1', 'Lesson 1', '第一课')}</span><span>{typeLabel(row)}</span><span>{row.submitted}</span><span className={`submission-status submission-status--${row.status}`}>{row.status === 'pending' ? <Clock3 size={15} /> : <CheckCircle2 size={15} />}{row.status === 'pending' ? l('Chờ chấm', 'Pending', '待批改') : l('Đã chấm', 'Graded', '已批改')}</span><ChevronRight size={17} /></button>)}
              </div>
              <div className="table-pagination"><span>{l(`Hiển thị ${visibleQueue.length} kết quả`, `Showing ${visibleQueue.length} results`, `显示 ${visibleQueue.length} 条结果`)}</span><div><button disabled type="button"><ChevronLeft size={17} /></button><button className="is-active" type="button">1</button><button disabled type="button"><ChevronRight size={17} /></button></div></div>
            </>
          ) : <EmptyState title={l('Chưa có bài nộp', 'No submissions yet', '暂无作业')} description={l('Bài của học viên sẽ tự động xuất hiện tại đây.', 'Student submissions will appear here automatically.', '学生提交的作业会自动显示在这里。')} />}
        </section>

        <aside className="grading-panel panel">
          {selected ? (
            <>
              <div className="grading-panel__student"><span className="avatar">{selected.name.split(' ').slice(-1)[0][0]}</span><div><strong>{selected.name}</strong><small>{l('Bài 1', 'Lesson 1', '第一课')} · {typeLabel(selected)}</small></div></div>
              {activeType === 'shadowing' ? (
                <>
                  <div className="grading-audio"><span className="eyebrow">{l('Nghe bài nộp', 'Listen to submission', '听取作业录音')}</span><h2>{typeLabel(selected)}</h2>{audioUrl ? <audio controls preload="metadata" src={audioUrl} /> : <p>{preview ? l('Bản xem trước không chứa bản ghi thật.', 'The preview contains no real recording.', '预览中不包含真实录音。') : l('Đang tạo liên kết nghe an toàn…', 'Creating a secure playback link…', '正在生成安全播放链接…')}</p>}</div>
                  <div className="submission-script"><span>{l('Nội dung đoạn', 'Passage text', '段落内容')}</span><p lang="zh-CN">{selected.type === 'Đoạn tự biên soạn' ? lessonOne.shadowing.composed.text : lessonOne.shadowing.official.text}</p><small>{selected.type === 'Đoạn tự biên soạn' ? lessonOne.shadowing.composed.pinyin : lessonOne.shadowing.official.pinyin}</small></div>
                </>
              ) : <div className="writing-submission"><span>{l('Bài viết đã nộp', 'Submitted writing', '已提交的作文')}</span><p lang="zh-CN">{selected.content}</p></div>}

              <label className="score-input"><span>{l('Điểm / 10', 'Score / 10', '分数 / 10')}</span><div><input max="10" min="0" onChange={(event) => setScore(event.target.value)} step="0.5" type="number" value={score} /><span>/ 10</span></div></label>
              <label><span>{l('Nhận xét của giáo viên', 'Teacher feedback', '教师评语')}</span><textarea maxLength={2000} onChange={(event) => setComment(event.target.value)} placeholder={l('Nhập nhận xét rõ ràng, cụ thể cho học viên…', 'Enter clear, specific feedback for the student…', '请输入清楚、具体的评语…')} value={comment} /><small className="char-count">{comment.length}/2000</small></label>
              {saved ? <p className="form-message form-message--success"><CheckCircle2 size={18} />{l('Đã lưu điểm và tạo thông báo trong hệ thống.', 'Grade saved and notification created.', '成绩已保存，并已创建系统通知。')}</p> : null}
              <button className="button button--primary button--block" disabled={score === '' || Number(score) < 0 || Number(score) > 10 || !comment.trim()} onClick={saveGrade} type="button"><Save size={18} />{l('Lưu điểm & gửi phản hồi', 'Save grade & send feedback', '保存成绩并发送反馈')}</button>
            </>
          ) : <EmptyState title={l('Chọn một bài nộp', 'Select a submission', '选择一份作业')} description={l('Bài được chọn sẽ hiển thị tại đây để chấm.', 'The selected submission will appear here for grading.', '所选作业将在此处显示以供批改。')} />}
        </aside>
      </div>
    </AppShell>
  )
}
