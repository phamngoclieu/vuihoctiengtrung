import { useLanguage } from '../lib/i18n.jsx'

export default function Brand({ compact = false, inverse = false }) {
  const { language, t } = useLanguage()
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''} ${inverse ? 'brand--inverse' : ''}`}>
      <span className="brand__mark" lang="zh-CN" aria-hidden="true">汉</span>
      {compact ? null : (
        <span className="brand__name">
          <strong lang={language === 'zh' ? 'zh-CN' : language}>{t('brandShort')}</strong>
          <span>LiuLiuLiu</span>
        </span>
      )}
    </div>
  )
}
