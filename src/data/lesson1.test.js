import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { lessonOne, lessonRoadmap } from './lesson1.js'

describe('nội dung HSK 1 · Bài 1', () => {
  it('mở đủ lộ trình 15 bài', () => {
    expect(lessonRoadmap).toHaveLength(15)
    expect(lessonRoadmap.every((lesson) => ['ready', 'unlocked'].includes(lesson.status))).toBe(true)
  })

  it('không có mục từ bị trùng theo chữ Hán và pinyin', () => {
    const keys = lessonOne.vocabulary.map((word) => `${word.hanzi}|${word.pinyin}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('chỉ dùng pinyin có dấu, không dùng số thanh điệu', () => {
    const pinyinValues = lessonOne.vocabulary.map((word) => word.pinyin)
    expect(pinyinValues.some((value) => /[1-5]/.test(value))).toBe(false)
  })

  it('có đủ ba hội thoại chính thức và tệp nghe tương ứng', () => {
    expect(lessonOne.dialogues).toHaveLength(3)
    for (const dialogue of lessonOne.dialogues) {
      const filename = dialogue.audio.split('/').at(-1)
      expect(existsSync(resolve('public/audio/hsk1/lesson-01', filename))).toBe(true)
    }
  })

  it('có hai bài shadowing độc lập và không có bài viết mẫu', () => {
    expect(lessonOne.shadowing.official.type).toBe('official')
    expect(lessonOne.shadowing.composed.type).toBe('composed')
    expect(lessonOne.writing.sampleAnswer).toBeNull()
  })

  it('khóa mỗi loại bài nộp chính thức ở mức cơ sở dữ liệu', () => {
    const schema = readFileSync(resolve('supabase/migrations/20260810190000_initial_schema.sql'), 'utf8')
    expect(schema).toContain('unique (user_id, lesson_id, submission_type)')
    expect(schema).toContain('unique (user_id, lesson_id)')
    expect(schema).toContain('alter table public.shadowing_submissions enable row level security')
    expect(schema).toContain('alter table public.writing_submissions enable row level security')
  })
})
