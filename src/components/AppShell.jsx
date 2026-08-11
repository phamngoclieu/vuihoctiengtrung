import {
  BarChart3,
  BookOpen,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Gauge,
  Headphones,
  Home,
  Languages,
  LibraryBig,
  LogOut,
  MessageSquareWarning,
  PenLine,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import Brand from './Brand.jsx'
import LanguageSwitch from './LanguageSwitch.jsx'
import { navigate, preloadRoute } from '../lib/hashRoute.js'
import { useLanguage } from '../lib/i18n.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import NotificationsMenu from './NotificationsMenu.jsx'

const studentItems = [
  { key: 'overview', icon: Home, path: '/app' },
  { key: 'lessons', icon: BookOpen, path: '/app/lesson/1' },
  { key: 'vocabulary', icon: Languages, path: '/app/lesson/1?v=vocabulary' },
  { key: 'flashcards', icon: Sparkles, path: '/app/lesson/1?v=flashcards' },
  { key: 'listening', icon: Headphones, path: '/app/lesson/1?v=listening' },
  { key: 'shadowing', icon: Gauge, path: '/app/lesson/1?v=shadowing' },
  { key: 'writing', icon: PenLine, path: '/app/lesson/1?v=writing' },
  { key: 'progress', icon: BarChart3, path: '/app/progress' },
]

const adminItems = [
  { key: 'overview', icon: Home, path: '/admin' },
  { key: 'content', icon: LibraryBig, path: '/admin/content' },
  { key: 'students', icon: Users, path: '/admin/students' },
  { key: 'grading', icon: ClipboardCheck, path: '/admin/grading' },
  { key: 'reports', icon: MessageSquareWarning, path: '/admin/reports' },
  { key: 'analytics', icon: BarChart3, path: '/admin/analytics' },
]

export default function AppShell({ children, mode = 'student', active = 'overview', preview = false }) {
  const { t, l } = useLanguage()
  const { profile, signOut } = useAuth()
  const items = mode === 'admin' ? adminItems : studentItems
  const displayName = profile?.display_name || (mode === 'admin' ? l('Giáo viên Liu', 'Teacher Liu', '刘老师') : l('Trần Linh', 'Linh Tran', '陈玲'))

  const go = (path) => {
    if (preview) {
      if (path === '/app') return navigate('/preview/student')
      if (path === '/app/lesson/1') return navigate('/preview/lesson/1')
      if (path.startsWith('/app/lesson/1?')) return navigate(`/preview/lesson/1?${path.split('?')[1]}`)
      if (path === '/app/settings') return navigate('/preview/settings')
      if (path === '/app/progress') return navigate('/preview/student?section=progress')
      if (path === '/app/review') return navigate('/preview/student?section=review')
      if (path === '/admin/settings') return navigate('/preview/settings?mode=admin')
      if (path === '/admin/students') return navigate('/preview/admin/users')
      if (path.startsWith('/admin')) return navigate('/preview/admin')
    }
    navigate(path)
  }

  return (
    <div className={`app-shell app-shell--${mode}`}>
      <aside className="sidebar">
        <Brand inverse={mode === 'admin'} />
        <nav className="sidebar__nav" aria-label={l('Điều hướng chính', 'Main navigation', '主导航')}>
          {items.map(({ key, icon: Icon, path }) => (
            <button className={active === key ? 'is-active' : ''} key={key} onClick={() => go(path)} onFocus={() => preloadRoute(path)} onPointerEnter={() => preloadRoute(path)} type="button">
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              <span>{t(key)}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <button type="button" onClick={() => go(mode === 'admin' ? '/admin/settings' : '/app/settings')} onFocus={() => preloadRoute(mode === 'admin' ? '/admin/settings' : '/app/settings')} onPointerEnter={() => preloadRoute(mode === 'admin' ? '/admin/settings' : '/app/settings')}>
            <Settings aria-hidden="true" size={20} />
            <span>{t('settings')}</span>
          </button>
          {preview ? null : (
            <button type="button" onClick={signOut}>
              <LogOut aria-hidden="true" size={20} />
              <span>{t('signOut')}</span>
            </button>
          )}
        </div>
      </aside>

      <div className="app-shell__body">
        <header className="topbar">
          <Brand compact />
          <div className="topbar__brand-name">{t('brandTitle')}</div>
          <div className="topbar__actions">
            {preview ? <span className="preview-badge">{t('previewLabel')}</span> : null}
            <LanguageSwitch />
            <NotificationsMenu onNavigate={go} preview={preview} />
            <button className="profile-button" onClick={() => go(mode === 'admin' ? '/admin/settings' : '/app/settings')} type="button">
              <span className="avatar">{displayName.split(' ').slice(-1)[0]?.[0] || 'L'}</span>
              <span>{displayName}</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>
        <main className="app-main">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label={l('Điều hướng trên điện thoại', 'Mobile navigation', '移动端导航')}>
        {(mode === 'admin' ? adminItems.slice(0, 5) : [studentItems[0], studentItems[1], { key: 'review', icon: FileText, path: '/app/review' }, studentItems[7], { key: 'settings', icon: Settings, path: '/app/settings' }]).map(({ key, icon: Icon, path }) => (
          <button className={active === key ? 'is-active' : ''} key={key} onClick={() => go(path)} onFocus={() => preloadRoute(path)} onPointerEnter={() => preloadRoute(path)} type="button">
            <Icon size={21} />
            <span>{t(key)}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <CircleHelp size={34} />
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  )
}
