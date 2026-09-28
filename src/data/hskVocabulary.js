import { lessonOne } from './lesson1.js'
import outlineHsk1 from './hsk-vocabulary/outline-hsk1.json'
import outlineHsk2 from './hsk-vocabulary/outline-hsk2.json'
import outlineHsk3 from './hsk-vocabulary/outline-hsk3.json'

function normalizeHanzi(value) {
  return value.normalize('NFKC').trim()
}

function mergeVocabulary(outlineWords, existingWords = []) {
  const byHanzi = new Map(outlineWords.map((word) => [normalizeHanzi(word.hanzi), word]))

  for (const existingWord of existingWords) {
    const key = normalizeHanzi(existingWord.hanzi)
    const outlineWord = byHanzi.get(key)
    if (outlineWord) {
      byHanzi.set(key, {
        ...outlineWord,
        ...existingWord,
        id: outlineWord.id,
        source: `${existingWord.source}; ${outlineWord.source}`,
      })
    } else {
      byHanzi.set(key, {
        ...existingWord,
        id: `hsk1-existing-${existingWord.id}`,
        source: `${existingWord.source}; nội dung đã có trước trên web`,
      })
    }
  }

  return [...byHanzi.values()]
}

export const vocabularyByLevel = Object.freeze({
  1: Object.freeze(mergeVocabulary(outlineHsk1, lessonOne.vocabulary)),
  2: Object.freeze(mergeVocabulary(outlineHsk2)),
  3: Object.freeze(mergeVocabulary(outlineHsk3)),
})

export function getVocabularyForLevel(level) {
  return vocabularyByLevel[level] || []
}
