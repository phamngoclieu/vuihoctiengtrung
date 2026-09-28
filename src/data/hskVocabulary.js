import { lessonOne } from './lesson1.js'
import outlineHsk1 from './hsk-vocabulary/outline-hsk1.json'
import outlineHsk2 from './hsk-vocabulary/outline-hsk2.json'
import outlineHsk3 from './hsk-vocabulary/outline-hsk3.json'

const removedWordIds = new Set([
  'hsk1-outline-0033', // 点: mục HSK 1 có nghĩa được nhập sai
  'hsk1-outline-0127', // 面条儿: bỏ theo yêu cầu của giáo viên
])

const curatedMeanings = Object.freeze({
  'hsk1-outline-0031': 'thứ; số thứ tự',
  'hsk1-outline-0075': 'vui; thú vị',
  'hsk1-outline-0086': 'nhà; gia đình',
  'hsk1-outline-0125': 'cơm trắng',
  'hsk1-outline-0131': 'nào',
  'hsk1-outline-0169': 'nóng',
  'hsk1-outline-0261': 'một chút',
  'hsk1-outline-0271': 'ở',
  'hsk2-outline-0410': 'bé trai; con trai',
  'hsk2-outline-0412': 'bé gái; con gái',
  'hsk2-outline-0461': 'trẻ con; trẻ nhỏ',
  'hsk3-outline-0756': 'trò chuyện; tán gẫu',
  'hsk3-outline-0848': 'bốn mùa',
  'hsk3-outline-0924': 'cùng nhau',
  'hsk3-outline-0990': 'từ điển chữ Hán',
})

function normalizeHanzi(value) {
  return value.normalize('NFKC').trim()
}

function simplifyMeaningVi(value) {
  const simplified = value
    .replace(/\s*\([^)]*(?:viết tắt của|\b(?:LT|CL):|\[[a-züv0-9: ]*[1-5][^\]]*\])[^)]*\)\s*/giu, ' ')
    .replace(/^\((?:đại từ|thông tục|văn học|cũ|phương ngữ|nối hai danh từ)\)\s*/iu, '')
    .replace(/\s+/g, ' ')
    .trim()
  return simplified || value
}

function curateVocabulary(words) {
  return words
    .filter((word) => !removedWordIds.has(word.id))
    .map((word) => {
      const meaningVi = curatedMeanings[word.id] || simplifyMeaningVi(word.meaningVi)
      if (meaningVi === word.meaningVi) return word
      return {
        ...word,
        meaningVi,
        source: `${word.source}; giáo viên hiệu đính`,
      }
    })
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
  1: Object.freeze(curateVocabulary(mergeVocabulary(outlineHsk1, lessonOne.vocabulary))),
  2: Object.freeze(curateVocabulary(mergeVocabulary(outlineHsk2))),
  3: Object.freeze(curateVocabulary(mergeVocabulary(outlineHsk3))),
})

export function getVocabularyForLevel(level) {
  return vocabularyByLevel[level] || []
}
