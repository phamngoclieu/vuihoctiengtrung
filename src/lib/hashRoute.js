import { useEffect, useState } from 'react'

const routeModuleLoaders = {
  '/': () => import('../pages/LandingPage.jsx'),
  '/auth': () => import('../pages/AuthPage.jsx'),
  '/app': () => import('../pages/StudentDashboard.jsx'),
  '/app/review': () => import('../pages/StudentDashboard.jsx'),
  '/app/progress': () => import('../pages/StudentDashboard.jsx'),
  '/app/lesson/1': () => import('../pages/LessonPage.jsx'),
  '/app/settings': () => import('../pages/AccountSettingsPage.jsx'),
  '/admin': () => import('../pages/AdminGradingPage.jsx'),
  '/admin/students': () => import('../pages/AdminUsersPage.jsx'),
  '/admin/settings': () => import('../pages/AccountSettingsPage.jsx'),
}

const preloadedRoutes = new Set()

function normalizeHash(hash) {
  const value = hash.replace(/^#/, '') || '/'
  return value.startsWith('/') ? value : `/${value}`
}

export function navigate(path) {
  window.location.hash = path
}

export function preloadRoute(path) {
  const pathname = path.split('?')[0]
  const loader = routeModuleLoaders[pathname] || (pathname.startsWith('/admin') ? routeModuleLoaders['/admin'] : null)
  if (!loader || preloadedRoutes.has(pathname)) return
  preloadedRoutes.add(pathname)
  loader().catch(() => preloadedRoutes.delete(pathname))
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => normalizeHash(window.location.hash))

  useEffect(() => {
    const onChange = () => setRoute(normalizeHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
