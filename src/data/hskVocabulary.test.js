import { describe, expect, it } from 'vitest'
import { vocabularyByLevel } from './hskVocabulary.js'

describe('HSK vocabulary data', () => {
  it('keeps HSK 1, 2, and 3 as separate deduplicated level lists', () => {
    expect(vocabularyByLevel[1]).toHaveLength(299)
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

  it('applies the teacher corrections to the catalog and practice data', () => {
    const hsk1 = vocabularyByLevel[1]
    expect(hsk1.find((word) => word.hanzi === '哪')?.meaningVi).toBe('nào')
    expect(hsk1.find((word) => word.hanzi === '米饭')?.meaningVi).toBe('cơm trắng')
    expect(hsk1.find((word) => word.hanzi === '在')?.meaningVi).toBe('ở')
    expect(hsk1.find((word) => word.hanzi === '热')?.meaningVi).toBe('nóng')
    expect(hsk1.find((word) => word.hanzi === '超市')?.meaningVi).toBe('siêu thị')
    expect(hsk1.some((word) => word.hanzi === '面条儿')).toBe(false)
    expect(hsk1.some((word) => word.id === 'hsk1-outline-0033')).toBe(false)
  })

  it('removes raw dictionary references from every Vietnamese meaning', () => {
    for (const level of [1, 2, 3]) {
      for (const word of vocabularyByLevel[level]) {
        expect(word.meaningVi).not.toMatch(/\|/u)
        expect(word.meaningVi).not.toMatch(/\[[a-züv0-9: ]*[1-5][^\]]*\]/iu)
        expect(word.meaningVi).not.toMatch(/biến thể er hoá|viết tắt của/iu)
      }
    }
  })
})
