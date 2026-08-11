import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './auth/AuthProvider.jsx'
import { LanguageProvider } from './lib/i18n.jsx'
import { useHashRoute } from './lib/hashRoute.js'
import { EmptyState } from './components/AppShell.jsx'
import { useLanguage } from './lib/i18n.jsx'

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx'))
const StudentDashboard = lazy(() => import('./pages/StudentDashboard.jsx'))
const LessonPage = lazy(() => import('./pages/LessonPage.jsx'))
const AdminGradingPage = lazy(() => import('./pages/AdminGradingPage.jsx'))
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage.jsx'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage.jsx'))

function LoadingScreen() {
  const { l } = useLanguage()
  return <div className="loading-screen"><span className="brand__mark" lang="zh-CN">汉</span><p>{l('Đang đồng bộ tài khoản…', 'Syncing your account…', '正在同步账户…')}</p></div>
}

function AppRouter() {
  const route = useHashRoute()
  const { l } = useLanguage()
  const { configured, loading, user, profile } = useAuth()
  const authAction = new URLSearchParams(window.location.search).get('auth')
  const isPasswordRecovery = authAction === 'recovery'
  const isEmailConfirmation = authAction === 'confirmed'
  const [path, queryString = ''] = route.split('?')
  const query = new URLSearchParams(queryString)
  const initialTab = query.get('v') || 'vocabulary'

  if (import.meta.env.DEV && path === '/preview/student') return <StudentDashboard focusSection={query.get('section')} preview />
  if (import.meta.env.DEV && path === '/preview/lesson/1') return <LessonPage initialTab={initialTab} preview />
  if (import.meta.env.DEV && path === '/preview/admin') return <AdminGradingPage preview />
  if (import.meta.env.DEV && path === '/preview/admin/users') return <AdminUsersPage preview />
  if (import.meta.env.DEV && path === '/preview/settings') return <AccountSettingsPage mode={query.get('mode') === 'admin' ? 'admin' : 'student'} preview />
  if (path === '/auth' || isPasswordRecovery || isEmailConfirmation) return <AuthPage />
  if (path === '/') return <LandingPage configured={configured} />
  if (loading) return <LoadingScreen />
  if (!user) return <LandingPage configured={configured} />
  if (profile?.locked_at) return <div className="account-blocked"><h1>{l('Tài khoản đang bị khóa', 'Account locked', '账户已锁定')}</h1><p>{l('Vui lòng liên hệ quản trị viên trong hệ thống để được hỗ trợ.', 'Contact an administrator in the system for support.', '请联系系统管理员获取帮助。')}</p></div>
  if (path === '/admin/settings' && ['owner', 'admin', 'teacher'].includes(profile?.role)) return <AccountSettingsPage mode="admin" />
  if (path === '/admin/students' && ['owner', 'admin', 'teacher'].includes(profile?.role)) return <AdminUsersPage />
  if (path.startsWith('/admin') && ['owner', 'admin', 'teacher'].includes(profile?.role)) return <AdminGradingPage />
  if (path === '/app/settings') return <AccountSettingsPage />
  if (path === '/app/lesson/1') return <LessonPage initialTab={initialTab} />
  if (path === '/app/progress') return <StudentDashboard focusSection="progress" />
  if (path === '/app/review') return <StudentDashboard focusSection="review" />
  if (path === '/app') return <StudentDashboard />
  return <div className="not-found"><EmptyState title={l('Trang chưa có nội dung', 'This page has no content yet', '此页面暂无内容')} description={l('Mục này sẽ được hoàn thiện sau khi Bài 1 được duyệt.', 'This section will be completed after Lesson 1 is approved.', '第一课审核后将完善此部分。')} /></div>
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Suspense fallback={<LoadingScreen />}>
          <AppRouter />
        </Suspense>
      </AuthProvider>
    </LanguageProvider>
  )
}
