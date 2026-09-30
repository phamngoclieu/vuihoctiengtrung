import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getHsk1Lesson, hsk1Lessons, lessonRoadmap } from './hsk1Lessons.js'

describe('nội dung HSK 1 · 15 bài', () => {
  it('biên soạn và mở đủ 15 bài', () => {
    expect(hsk1Lessons).toHaveLength(15)
    expect(lessonRoadmap).toHaveLength(15)
    expect(lessonRoadmap.every((lesson) => lesson.status === 'ready')).toBe(true)
    expect(getHsk1Lesson(15)?.title).toBe('大兴机场见！')
  })

  it('mỗi bài có từ mới, ngữ pháp, ba hội thoại, nghe, shadowing và luyện viết', () => {
    for (const lesson of hsk1Lessons) {
      expect(lesson.vocabulary.length).toBeGreaterThan(10)
      expect(lesson.grammar.length).toBeGreaterThanOrEqual(2)
      expect(lesson.dialogues).toHaveLength(3)
      expect(lesson.shadowing.official.text).toBeTruthy()
      expect(lesson.shadowing.composed.text).toBeTruthy()
      expect(lesson.writing.sampleAnswer).toBeNull()
    }
  })

  it('không lặp chữ Hán và pinyin trong cùng một bài', () => {
    for (const lesson of hsk1Lessons) {
      const keys = lesson.vocabulary.map((entry) => `${entry.hanzi}|${entry.pinyin}`)
      expect(new Set(keys).size, `Bài ${lesson.number}`).toBe(keys.length)
    }
  })

  it('giữ đúng các nghĩa giáo viên đã sửa', () => {
    expect(getHsk1Lesson(3).vocabulary.find((entry) => entry.hanzi === '哪')?.meaningVi).toBe('nào')
    expect(getHsk1Lesson(6).vocabulary.find((entry) => entry.hanzi === '米饭')?.meaningVi).toBe('cơm trắng')
    expect(getHsk1Lesson(8).vocabulary.find((entry) => entry.hanzi === '在')?.meaningVi).toBe('ở; tại')
    expect(getHsk1Lesson(12).vocabulary.find((entry) => entry.hanzi === '热')?.meaningVi).toBe('nóng')
  })

  it('có đủ các tệp nghe đã sao chép cho Bài 2–15', () => {
    for (const lesson of hsk1Lessons.slice(1)) {
      const directory = resolve('public/audio/hsk1', `lesson-${String(lesson.number).padStart(2, '0')}`)
      for (const filename of ['text-01.mp3', 'text-02.mp3', 'text-03.mp3', 'practice.mp3', 'workbook.mp3']) {
        expect(existsSync(resolve(directory, filename)), `Bài ${lesson.number}: ${filename}`).toBe(true)
      }
    }
  })

  it('điều hướng nhận Bài 1–15 và không khóa các nút lộ trình', () => {
    const app = readFileSync(resolve('src/App.jsx'), 'utf8')
    const dashboard = readFileSync(resolve('src/pages/StudentDashboard.jsx'), 'utf8')
    expect(app).toContain('lessonNumber >= 1 && lessonNumber <= 15')
    expect(dashboard).not.toContain('aria-disabled={lesson.number !== 1}')
    expect(dashboard).toContain('goToLesson(lesson.number)')
  })
})
