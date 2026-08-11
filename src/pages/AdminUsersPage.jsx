import { useEffect, useMemo, useState } from 'react'
import { LockKeyhole, Search, ShieldCheck, UnlockKeyhole } from 'lucide-react'
import AppShell, { EmptyState } from '../components/AppShell.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLanguage } from '../lib/i18n.jsx'
import { loadAccounts, updateAccountAccess } from '../lib/accountManagement.js'

const previewAccounts = [
  { id: 'owner-preview', email: 'phamngoclieu1501@gmail.com', display_name: 'Phạm Ngọc Liễu', role: 'owner', locked_at: null, created_at: '2026-08-11T08:00:00Z' },
  { id: 'teacher-preview', email: 'giaovien@example.com', display_name: 'Giáo viên Vương', role: 'teacher', locked_at: null, created_at: '2026-08-11T08:30:00Z' },
  { id: 'student-preview', email: 'hocvien@example.com', display_name: 'Nguyễn Minh Anh', role: 'student', locked_at: null, created_at: '2026-08-11T09:00:00Z' },
]

const roleKeys = { student: 'roleStudent', teacher: 'roleTeacher', admin: 'roleAdmin', owner: 'roleOwner' }

export default function AdminUsersPage({ preview = false }) {
  const { profile, user } = useAuth()
  const { language, t } = useLanguage()
  const [accounts, setAccounts] = useState(preview ? previewAccounts : [])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const canManage = preview || ['owner', 'admin'].includes(profile?.role)
  const locale = language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-GB' : 'vi-VN'

  useEffect(() => {
    if (preview) return undefined
    let active = true
    loadAccounts()
      .then((rows) => active && setAccounts(rows))
      .catch(() => active && setError(t('accountsLoadFailed')))
    return () => { active = false }
  }, [preview, t])

  const visibleAccounts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    return accounts.filter((account) => (
      (roleFilter === 'all' || account.role === roleFilter)
      && (!normalizedQuery || `${account.display_name} ${account.email}`.toLocaleLowerCase().includes(normalizedQuery))
    ))
  }, [accounts, query, roleFilter])

  async function saveAccess(account, nextValues) {
    setMessage(null)
    setError(null)
    setBusyId(account.id)
    try {
      const nextAccount = preview ? { ...account, ...nextValues } : await updateAccountAccess({
        accountId: account.id,
        role: nextValues.role ?? account.role,
        lockedAt: Object.hasOwn(nextValues, 'locked_at') ? nextValues.locked_at : account.locked_at,
      })
      setAccounts((current) => current.map((item) => item.id === account.id ? nextAccount : item))
      setMessage(t('accessUpdated'))
    } catch {
      setError(t('accessUpdateFailed'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AppShell active="students" mode="admin" preview={preview}>
      <div className="page-heading"><div><span className="eyebrow">{t('admin')}</span><h1>{t('accountManagement')}</h1><p>{t('accountManagementDescription')}</p></div></div>

      <section className="access-policy panel">
        <ShieldCheck size={26} />
        <div><h2>{t('accessPolicyTitle')}</h2><p>{t('accessPolicyText')}</p></div>
        <div className="access-policy__steps"><span><strong>1</strong>{t('selfRegister')}</span><span><strong>2</strong>{t('ownerGrantsAccess')}</span><span><strong>3</strong>{t('staffLoginNote')}</span></div>
      </section>

      {message ? <p className="form-message form-message--success">{message}</p> : null}
      {error ? <p className="form-message form-message--error">{error}</p> : null}

      <section className="accounts-panel panel">
        <div className="account-filters">
          <label><Search size={18} /><input aria-label={t('searchAccount')} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchAccount')} type="search" value={query} /></label>
          <select aria-label={t('allRoles')} onChange={(event) => setRoleFilter(event.target.value)} value={roleFilter}><option value="all">{t('allRoles')}</option><option value="student">{t('roleStudent')}</option><option value="teacher">{t('roleTeacher')}</option><option value="admin">{t('roleAdmin')}</option><option value="owner">{t('roleOwner')}</option></select>
        </div>

        {visibleAccounts.length ? <div className="account-list">
          {visibleAccounts.map((account) => {
            const protectedAccount = account.role === 'owner' || account.id === user?.id
            const editable = canManage && !protectedAccount
            return (
              <article key={account.id}>
                <span className="avatar">{account.display_name?.trim()?.[0] || 'U'}</span>
                <div className="account-identity"><strong>{account.display_name}</strong><small>{account.email}</small><span>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(account.created_at))}</span></div>
                <label><span>{t('role')}</span><select aria-label={`${t('role')}: ${account.display_name}`} disabled={!editable || busyId === account.id} onChange={(event) => saveAccess(account, { role: event.target.value })} value={account.role}><option value="student">{t('roleStudent')}</option><option value="teacher">{t('roleTeacher')}</option><option value="admin">{t('roleAdmin')}</option><option value="owner" disabled>{t('roleOwner')}</option></select></label>
                <div className="account-status"><span className={account.locked_at ? 'is-locked' : 'is-active'}>{account.locked_at ? t('locked') : t('active')}</span>{protectedAccount ? <small>{t('ownerProtected')}</small> : null}</div>
                <button className="button button--ghost button--small" disabled={!editable || busyId === account.id} onClick={() => saveAccess(account, { locked_at: account.locked_at ? null : new Date().toISOString() })} type="button">{account.locked_at ? <UnlockKeyhole size={16} /> : <LockKeyhole size={16} />}{account.locked_at ? t('unlockAccount') : t('lockAccount')}</button>
              </article>
            )
          })}
        </div> : <EmptyState title={t('noAccounts')} description={t('accessPolicyText')} />}
      </section>
    </AppShell>
  )
}
