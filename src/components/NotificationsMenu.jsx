import { useEffect, useState } from 'react'
import { Bell, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { loadNotifications, markNotificationRead } from '../lib/notifications.js'
import { useLanguage } from '../lib/i18n.jsx'

const previewNotifications = [
  { id: 'preview-1', title: 'Bài luyện viết đã được chấm', body: 'Bạn nhận được 2/10. Mở bài học để xem nhận xét.', link: '/app/lesson/1?v=writing', read_at: null, created_at: new Date().toISOString() },
  { id: 'preview-2', title: 'Chào mừng đến LiuLiuLiu', body: 'Bắt đầu học HSK 1 từ Bài 1.', read_at: null, created_at: new Date().toISOString() },
]

export default function NotificationsMenu({ preview, onNavigate }) {
  const { user } = useAuth()
  const { t, l } = useLanguage()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(preview ? previewNotifications : [])
  const [error, setError] = useState(null)
  const unreadCount = items.filter((item) => !item.read_at).length

  function localizedTitle(item) {
    if (item.id === 'preview-1' || item.type === 'grade') return l('Bài đã được chấm', 'Submission graded', '作业已批改')
    if (item.id === 'preview-2') return l('Chào mừng đến LiuLiuLiu', 'Welcome to LiuLiuLiu', '欢迎来到LiuLiuLiu')
    return item.title
  }

  function localizedBody(item) {
    if (item.id === 'preview-1' || item.type === 'grade') {
      const score = item.body?.match(/(\d+(?:\.\d+)?)\/10/)?.[1]
      return score
        ? l(`Bạn nhận được ${score}/10. Mở bài học để xem nhận xét.`, `You received ${score}/10. Open the lesson to view feedback.`, `您获得${score}/10分，请打开课程查看评语。`)
        : l('Mở bài học để xem điểm và nhận xét.', 'Open the lesson to view your score and feedback.', '请打开课程查看分数和评语。')
    }
    if (item.id === 'preview-2') return l('Bắt đầu học HSK 1 từ Bài 1.', 'Start HSK 1 with Lesson 1.', '从第一课开始学习HSK一级。')
    return item.body
  }

  async function refresh() {
    if (preview || !user) return
    try {
      setItems(await loadNotifications({ userId: user.id }))
      setError(null)
    } catch {
      setError(l('Chưa thể tải thông báo.', 'Unable to load notifications.', '无法加载通知。'))
    }
  }

  useEffect(() => {
    refresh()
  }, [preview, user])

  async function openNotification(item) {
    if (!preview && !item.read_at) {
      try {
        await markNotificationRead({ notificationId: item.id })
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry))
      } catch {
        setError(l('Chưa thể đánh dấu đã đọc.', 'Unable to mark the notification as read.', '无法将通知标记为已读。'))
      }
    }
    setOpen(false)
    if (item.link) {
      window.dispatchEvent(new CustomEvent('liuliuliu:refresh-submissions'))
      onNavigate(item.link)
    }
  }

  return (
    <div className="notifications-menu">
      <button className="icon-button" aria-expanded={open} aria-label={t('notifications')} onClick={() => { setOpen((value) => !value); if (!open) refresh() }} type="button">
        <Bell size={20} />
        {unreadCount ? <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
      </button>
      {open ? (
        <section className="notifications-popover" aria-label={t('notifications')}>
          <div><strong>{t('notifications')}</strong><span>{unreadCount} {l('chưa đọc', 'unread', '条未读')}</span></div>
          {error ? <p className="form-message form-message--error">{error}</p> : null}
          {items.length ? items.map((item) => (
            <button className={item.read_at ? '' : 'is-unread'} key={item.id} onClick={() => openNotification(item)} type="button">
              <CheckCircle2 size={18} />
              <span><strong>{localizedTitle(item)}</strong><small>{localizedBody(item)}</small></span>
            </button>
          )) : <p>{l('Chưa có thông báo mới.', 'No new notifications.', '暂无新通知。')}</p>}
        </section>
      ) : null}
    </div>
  )
}
