import { describe, expect, it } from 'vitest'
import { vocabularyByLevel } from './hskVocabulary.js'

describe('HSK vocabulary data', () => {
  it('keeps HSK 1, 2, and 3 as separate deduplicated level lists', () => {
    expect(vocabularyByLevel[1]).toHaveLength(301)
    expect(vocabularyByLevel[2]).toHaveLength(198)
    expect(vocabularyByLevel[3]).toHaveLength(499)

    for (const level of [1, 2, 3]) {
      const words = vocabularyByLevel[level]
      expect(new Set(words.map((word) => word.hanzi)).size).toBe(words.length)
      expect(words.every((word) => word.id && word.hanzi && word.pinyin && word.meaningVi)).toBe(true)
    }

    expect(vocabularyByLevel[1].some((word) => word.hanzi === '王老师')).toBe(true)
    expect(vocabularyByLevel[2].some((word) => word.hanzi === '爸爸')).toBe(false)
    expect(vocabularyByLevel[3].some((word) => word.hanzi === '爱好')).toBe(false)
    expect(vocabularyByLevel[2].find((word) => word.hanzi === '比')?.meaningVi).toBe('so sánh')
    expect(vocabularyByLevel[2].find((word) => word.hanzi === '别')?.meaningVi).toBe('đừng ...!')
  })
})
