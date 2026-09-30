import { requireSupabase } from './supabase.js'

const defaultLessonId = 'hsk1-lesson-01'

function vocabularyPrefix(lessonId = defaultLessonId) {
  return `${lessonId}-v-`
}

function exercisePrefix(lessonId = defaultLessonId) {
  return `${lessonId}-e-`
}

export function vocabularyDatabaseId(wordId, lessonId = defaultLessonId) {
  return `${vocabularyPrefix(lessonId)}${wordId}`
}

export function exerciseDatabaseId(exerciseId, lessonId = defaultLessonId) {
  return `${exercisePrefix(lessonId)}${exerciseId}`
}

function nextReviewDate(memoryStatus) {
  const intervalDays = { forgot: 1, hard: 3, remembered: 14 }[memoryStatus]
  if (!intervalDays) return null
  const date = new Date()
  date.setDate(date.getDate() + intervalDays)
  return date.toISOString()
}

export async function loadVocabularyProgress({ userId, lessonId = defaultLessonId }) {
  const client = requireSupabase()
  const prefix = vocabularyPrefix(lessonId)
  const { data, error } = await client
    .from('user_vocabulary_progress')
    .select('vocabulary_id, memory_status, personal_note, review_count')
    .eq('user_id', userId)
    .like('vocabulary_id', `${prefix}%`)

  if (error) throw error
  return (data || []).map((row) => ({
    ...row,
    wordId: row.vocabulary_id.slice(prefix.length),
  }))
}

export async function saveVocabularyProgress({ userId, lessonId = defaultLessonId, wordId, memoryStatus = 'unseen', personalNote = '', reviewCount = 0 }) {
  const client = requireSupabase()
  const { error } = await client.from('user_vocabulary_progress').upsert({
    user_id: userId,
    vocabulary_id: vocabularyDatabaseId(wordId, lessonId),
    memory_status: memoryStatus,
    personal_note: personalNote,
    next_review_at: nextReviewDate(memoryStatus),
    review_count: reviewCount,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,vocabulary_id' })

  if (error) throw error
}

export async function saveAssessmentAttempt({ userId, lessonId = defaultLessonId, exerciseId, answers, score, maxScore }) {
  const client = requireSupabase()
  const { error } = await client.from('assessment_attempts').insert({
    user_id: userId,
    exercise_id: exerciseDatabaseId(exerciseId, lessonId),
    answers,
    score,
    max_score: maxScore,
  })

  if (error) throw error
}

export async function markLessonSection({ lessonId = defaultLessonId, section }) {
  const client = requireSupabase()
  const { data, error } = await client.rpc('mark_lesson_section', {
    p_lesson_id: lessonId,
    p_section: section,
  })

  if (error) throw error
  return data
}

export async function loadWritingDraft({ userId, lessonId = defaultLessonId }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('writing_drafts')
    .select('content')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  if (error) throw error
  return data?.content || ''
}
