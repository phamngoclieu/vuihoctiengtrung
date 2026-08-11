import { ArrowRight, BookOpenCheck, Headphones, PenLine, Repeat2, ShieldCheck } from 'lucide-react'
import Brand from '../components/Brand.jsx'
import LanguageSwitch from '../components/LanguageSwitch.jsx'
import { navigate } from '../lib/hashRoute.js'
import { useLanguage } from '../lib/i18n.jsx'

const features = [
  { icon: BookOpenCheck, titleKey: 'featureLessonsTitle', textKey: 'featureLessonsText' },
  { icon: Headphones, titleKey: 'featureAudioTitle', textKey: 'featureAudioText' },
  { icon: Repeat2, titleKey: 'featureReviewTitle', textKey: 'featureReviewText' },
  { icon: PenLine, titleKey: 'featureSubmitTitle', textKey: 'featureSubmitText' },
]

export default function LandingPage({ configured }) {
  const { t } = useLanguage()
  return (
    <div className="public-page">
      <header className="public-header">
        <Brand />
        <div className="public-header__actions">
          <LanguageSwitch />
          <button className="button button--ghost" onClick={() => navigate('/auth')} type="button">{t('login')}</button>
          <button className="button button--primary" onClick={() => navigate('/auth?mode=register')} type="button">{t('register')}</button>
        </div>
      </header>

      <main>
        <section className="intro-section">
          <div className="intro-section__copy">
            <span className="eyebrow">HSK 3.0 · HSK 1</span>
            <h1>{t('landingHeroTitle')}</h1>
            <p>{t('landingHeroDescription')}</p>
            <div className="intro-section__actions">
              <button className="button button--primary button--large" onClick={() => navigate('/auth?mode=register')} type="button">
                {t('startLearning')} <ArrowRight size={18} />
              </button>
              <button className="button button--ghost button--large" onClick={() => navigate('/auth')} type="button">{t('haveAccount')}</button>
            </div>
            <div className="trust-line">
              <ShieldCheck size={18} />
              <span>{t('trustLine')}</span>
            </div>
          </div>

          <div className="intro-lesson" aria-label={t('lessonOne')}>
            <div className="intro-lesson__top">
              <span>{t('lessonOne')}</span>
              <strong>你好</strong>
            </div>
            <p className="intro-lesson__pinyin">nǐ hǎo</p>
            <p className="intro-lesson__meaning">{t('helloMeaning')}</p>
            <div className="intro-lesson__roadmap" aria-label={t('roadmapLabel')}>
              {Array.from({ length: 15 }, (_, index) => <span className={index === 0 ? 'is-active' : ''} key={index}>{index + 1}</span>)}
            </div>
            <div className="intro-lesson__footer">
              <span>{t('lessonsReady')}</span>
              <span>HSK 1</span>
            </div>
          </div>
        </section>

        <section className="feature-section" aria-label={t('learningFeatures')}>
          {features.map(({ icon: Icon, titleKey, textKey }) => (
            <article key={titleKey}>
              <Icon size={24} />
              <h2>{t(titleKey)}</h2>
              <p>{t(textKey)}</p>
            </article>
          ))}
        </section>

        {!configured ? (
          <p className="setup-note">{t('setupNote')}</p>
        ) : null}
      </main>
    </div>
  )
}
