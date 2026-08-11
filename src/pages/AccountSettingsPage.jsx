import { useEffect, useState } from 'react'
import { CheckCircle2, KeyRound, LoaderCircle, UserRound } from 'lucide-react'
import AppShell from '../components/AppShell.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useLanguage } from '../lib/i18n.jsx'
import { supabase } from '../lib/supabase.js'

export default function AccountSettingsPage({ preview = false, mode = 'student' }) {
  const { profile, refreshProfile, user } = useAuth()
  const { language, setLanguage, t, l } = useLanguage()
  const [displayName, setDisplayName] = useState(profile?.display_name || (mode === 'admin' ? 'Giáo viên Liu' : 'Trần Linh'))
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name)
  }, [profile?.display_name])

  async function saveProfile(event) {
    event.preventDefault()
    setBusy('profile')
    setError(null)
    setMessage(null)
    try {
      if (!preview) {
        const { error: updateError } = await supabase.from('profiles').update({ display_name: displayName.trim(), ui_language: language }).eq('id', user.id)
        if (updateError) throw updateError
        await refreshProfile()
      }
      setMessage(preview ? l('Bản xem trước: thông tin chưa được gửi lên máy chủ.', 'Preview: information was not sent to the server.', '预览：信息尚未发送到服务器。') : l('Đã lưu thông tin tài khoản.', 'Account information saved.', '账户信息已保存。'))
    } catch (saveError) {
      setError(saveError.message || l('Không thể lưu thông tin tài khoản.', 'Unable to save account information.', '无法保存账户信息。'))
    } finally {
      setBusy(null)
    }
  }

  async function changePassword(event) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (password !== confirmation) {
      setError(t('passwordMismatch'))
      return
    }
    setBusy('password')
    try {
      if (!preview) {
        const { error: updateError } = await supabase.auth.updateUser({ password })
        if (updateError) throw updateError
      }
      setPassword('')
      setConfirmation('')
      setMessage(preview ? l('Bản xem trước: mật khẩu chưa được thay đổi.', 'Preview: password was not changed.', '预览：密码尚未修改。') : l('Mật khẩu đã được thay đổi.', 'Password changed.', '密码已修改。'))
    } catch (passwordError) {
      setError(passwordError.message || l('Không thể thay đổi mật khẩu.', 'Unable to change the password.', '无法修改密码。'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <AppShell active="settings" mode={mode} preview={preview}>
      <div className="page-heading settings-heading">
        <div><span className="eyebrow">{t('profile')}</span><h1>{t('settings')}</h1><p>{l('Thông tin được đồng bộ với tài khoản trực tuyến của bạn.', 'Your information is synced with your online account.', '您的信息会与在线账户同步。')}</p></div>
      </div>
      <div className="settings-grid">
        <form className="panel settings-card" onSubmit={saveProfile}>
          <div className="settings-card__title"><UserRound size={22} /><div><h2>{l('Thông tin cá nhân', 'Personal information', '个人信息')}</h2><p>{l('Bạn có thể đổi tên hiển thị và ngôn ngữ giao diện.', 'You can change your display name and interface language.', '您可以修改显示名称和界面语言。')}</p></div></div>
          <label><span>{t('email')}</span><input disabled type="email" value={user?.email || 'hocvien@example.com'} /></label>
          <label><span>{t('displayName')}</span><input maxLength={80} minLength={1} onChange={(event) => setDisplayName(event.target.value)} required type="text" value={displayName} /></label>
          <label><span>{t('interfaceLanguage')}</span><select onChange={(event) => setLanguage(event.target.value)} value={language}><option value="vi">Tiếng Việt</option><option value="en">English</option><option value="zh">简体中文</option></select></label>
          <button className="button button--primary" disabled={busy === 'profile'} type="submit">{busy === 'profile' ? <LoaderCircle className="spin" size={18} /> : null}{l('Lưu thông tin', 'Save information', '保存信息')}</button>
        </form>

        <form className="panel settings-card" onSubmit={changePassword}>
          <div className="settings-card__title"><KeyRound size={22} /><div><h2>{l('Đổi mật khẩu', 'Change password', '修改密码')}</h2><p>{t('resetDescription')}</p></div></div>
          <label><span>{t('newPassword')}</span><input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
          <label><span>{t('confirmNewPassword')}</span><input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} /></label>
          <button className="button button--primary" disabled={busy === 'password'} type="submit">{busy === 'password' ? <LoaderCircle className="spin" size={18} /> : null}{l('Đổi mật khẩu', 'Change password', '修改密码')}</button>
        </form>
      </div>
      {error ? <p className="form-message form-message--error settings-message">{error}</p> : null}
      {message ? <p className="form-message form-message--success settings-message"><CheckCircle2 size={18} />{message}</p> : null}
    </AppShell>
  )
}
