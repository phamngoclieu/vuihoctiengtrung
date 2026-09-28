import { useEffect, useMemo, useState } from 'react'
import { BookOpenText, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import AppShell, { EmptyState } from '../components/AppShell.jsx'
import VocabularyPractice from '../components/VocabularyPractice.jsx'
import { vocabularyByLevel } from '../data/hskVocabulary.js'
import { useLanguage } from '../lib/i18n.jsx'

const PAGE_SIZE = 60
const levels = [1, 2, 3]

export default function VocabularyPage({ preview = false }) {
  const { language, l } = useLanguage()
  const [level, setLevel] = useState(1)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(vocabularyByLevel[1][0]?.id || null)
  const vocabulary = vocabularyByLevel[level]

  const filteredVocabulary = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return vocabulary
    return vocabulary.filter((word) => (
      `${word.hanzi} ${word.pinyin} ${word.meaningVi} ${word.partOfSpeech || ''}`
        .toLocaleLowerCase()
        .includes(normalized)
    ))
  }, [query, vocabulary])

  const totalPages = Math.max(1, Math.ceil(filteredVocabulary.length / PAGE_SIZE))
  const visibleVocabulary = filteredVocabulary.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const selectedWord = vocabulary.find((word) => word.id === selectedId) || visibleVocabulary[0] || vocabulary[0]

  useEffect(() => {
    setPage(1)
    setSelectedId(vocabulary[0]?.id || null)
  }, [level, vocabulary])

  useEffect(() => {
    setPage(1)
  }, [query])

  function selectLevel(nextLevel) {
    setQuery('')
    setLevel(nextLevel)
  }

  function changePage(nextPage) {
    setPage(nextPage)
    window.requestAnimationFrame(() => document.querySelector('.vocabulary-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function partOfSpeechLabel(word) {
    if (language === 'zh') return word.partOfSpeechSource || '词／短语'
    if (language !== 'en') return word.partOfSpeech || 'từ / cụm từ'
    const source = word.partOfSpeechSource || ''
    const labels = [
      ['名', 'noun'], ['动', 'verb'], ['形', 'adjective'], ['副', 'adverb'], ['代', 'pronoun'],
      ['数', 'numeral'], ['量', 'measure word'], ['助', 'particle'], ['介', 'preposition'],
      ['连', 'conjunction'], ['叹', 'interjection'], ['拟声', 'onomatopoeia'],
      ['前缀', 'prefix'], ['后缀', 'suffix'],
    ].filter(([key]) => source.includes(key)).map(([, label]) => label)
    return [...new Set(labels)].join(' / ') || 'word / phrase'
  }

  return (
    <AppShell active="vocabulary" preview={preview}>
      <div className="page-heading vocabulary-page-heading">
        <div>
          <span className="eyebrow">HSK 3.0 · {l('Từ vựng theo cấp', 'Vocabulary by level', '分级词汇')}</span>
          <h1>{l('Kho từ vựng HSK 1–3', 'HSK 1–3 vocabulary library', 'HSK 1–3 级词汇库')}</h1>
        </div>
        <div className="vocabulary-level-tabs" role="tablist" aria-label={l('Chọn cấp HSK', 'Choose HSK level', '选择HSK级别')}>
          {levels.map((item) => (
            <button aria-selected={level === item} className={level === item ? 'is-active' : ''} key={item} onClick={() => selectLevel(item)} role="tab" type="button">
              <span>HSK {item}</span>
              <strong>{vocabularyByLevel[item].length}</strong>
            </button>
          ))}
        </div>
      </div>

      <section className="vocabulary-catalog panel">
        <div className="vocabulary-catalog__toolbar">
          <div>
            <span className="eyebrow">HSK {level}</span>
            <h2>{vocabulary.length} {l('từ riêng của cấp này', 'words in this level only', '个本级独立词汇')}</h2>
          </div>
          <label>
            <Search aria-hidden="true" size={18} />
            <input aria-label={l('Tìm từ vựng', 'Search vocabulary', '搜索词汇')} onChange={(event) => setQuery(event.target.value)} placeholder={l('Tìm chữ Hán, pinyin hoặc nghĩa tiếng Việt', 'Search Hanzi, pinyin, or Vietnamese meaning', '搜索汉字、拼音或越南语释义')} type="search" value={query} />
          </label>
        </div>

        {visibleVocabulary.length ? (
          <div className="vocabulary-browser">
            <div className="vocabulary-browser__list" role="list">
              {visibleVocabulary.map((word) => (
                <button className={selectedWord?.id === word.id ? 'is-active' : ''} key={word.id} onClick={() => setSelectedId(word.id)} role="listitem" type="button">
                  <strong lang="zh-CN">{word.hanzi}</strong>
                  <span>{word.pinyin}</span>
                  <small lang="vi">{word.meaningVi}</small>
                </button>
              ))}
            </div>
            {selectedWord ? (
              <article className="vocabulary-browser__detail">
                <span className="vocabulary-sequence">HSK {level}</span>
                <strong lang="zh-CN">{selectedWord.hanzi}</strong>
                <span className="vocabulary-pinyin">{selectedWord.pinyin}</span>
                <dl>
                  <div><dt>{l('Từ loại', 'Part of speech', '词性')}</dt><dd>{partOfSpeechLabel(selectedWord)}</dd></div>
                  <div><dt>{l('Nghĩa tiếng Việt', 'Vietnamese meaning', '越南语释义')}</dt><dd lang="vi">{selectedWord.meaningVi}</dd></div>
                </dl>
                {selectedWord.examples?.length ? (
                  <div className="vocabulary-example">
                    <span>{l('Ví dụ trong bài học', 'Lesson example', '课文例句')}</span>
                    <p lang="zh-CN">{selectedWord.examples[0].zh}</p>
                    <small>{selectedWord.examples[0].py}</small>
                    <p lang="vi">{selectedWord.examples[0].vi}</p>
                  </div>
                ) : null}
              </article>
            ) : null}
          </div>
        ) : (
          <EmptyState title={l('Không tìm thấy từ phù hợp', 'No matching words', '未找到匹配词汇')} description={l('Hãy thử một chữ Hán, pinyin hoặc nghĩa tiếng Việt khác.', 'Try another Hanzi, pinyin, or Vietnamese meaning.', '请尝试其他汉字、拼音或越南语释义。')} />
        )}

        {filteredVocabulary.length > PAGE_SIZE ? (
          <div className="vocabulary-pagination">
            <span>{l(`Trang ${page} / ${totalPages}`, `Page ${page} / ${totalPages}`, `第 ${page} / ${totalPages} 页`)}</span>
            <div>
              <button aria-label={l('Trang trước', 'Previous page', '上一页')} disabled={page === 1} onClick={() => changePage(page - 1)} type="button"><ChevronLeft size={18} /></button>
              <button aria-label={l('Trang sau', 'Next page', '下一页')} disabled={page === totalPages} onClick={() => changePage(page + 1)} type="button"><ChevronRight size={18} /></button>
            </div>
          </div>
        ) : null}
      </section>

      <VocabularyPractice hskLevel={level} preview={preview} vocabulary={vocabulary} />

      <p className="vocabulary-attribution"><BookOpenText size={16} />{l('Danh mục theo Đề cương HSK 3.0; nghĩa tiếng Việt tham khảo CVDICT, giấy phép CC BY-SA 4.0.', 'List from the HSK 3.0 syllabus; Vietnamese meanings adapted from CVDICT under CC BY-SA 4.0.', '词表依据HSK 3.0考试大纲；越南语释义参考CVDICT（CC BY-SA 4.0）。')} <a href="https://github.com/ph0ngp/CVDICT" rel="noreferrer" target="_blank">CVDICT</a></p>
    </AppShell>
  )
}
