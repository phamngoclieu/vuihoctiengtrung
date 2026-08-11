import { useLanguage } from '../lib/i18n.jsx'

const choices = [
  { id: 'vi', label: 'VI' },
  { id: 'en', label: 'EN' },
  { id: 'zh', label: '中文' },
]

export default function LanguageSwitch({ compact = false }) {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className={`language-switch ${compact ? 'language-switch--compact' : ''}`} aria-label={t('interfaceLanguage')}>
      {choices.map((choice) => (
        <button
          className={language === choice.id ? 'is-active' : ''}
          key={choice.id}
          onClick={() => setLanguage(choice.id)}
          type="button"
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
}
