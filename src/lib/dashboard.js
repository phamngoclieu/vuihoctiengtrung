import { requireSupabase } from './supabase.js'

const lessonId = 'hsk1-lesson-01'
const vocabularyPrefix = `${lessonId}-v-`

export async function loadStudentDashboard({ userId }) {
  const client = requireSupabase()
  const [lesson, vocabulary, attempts, notifications, shadowing, writing, draft] = await Promise.all([
    client.from('user_lesson_progress').select('completion_percent, last_opened_at').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle(),
    client.from('user_vocabulary_progress').select('vocabulary_id, memory_status, next_review_at').eq('user_id', userId).like('vocabulary_id', `${vocabularyPrefix}%`),
    client.from('assessment_attempts').select('id, score, max_score').eq('user_id', userId),
    client.from('notifications').select('id, title, body, link, read_at, created_at').eq('user_id', userId).eq('type', 'grade').order('created_at', { ascending: false }).limit(1),
    client.from('shadowing_submissions').select('id, graded_at').eq('user_id', userId).eq('lesson_id', lessonId),
    client.from('writing_submissions').select('id, graded_at').eq('user_id', userId).eq('lesson_id', lessonId),
    client.from('writing_drafts').select('content').eq('user_id', userId).eq('lesson_id', lessonId).maybeSingle(),
  ])

  const failed = [lesson, vocabulary, attempts, notifications, shadowing, writing, draft].find((result) => result.error)
  if (failed) throw failed.error

  const now = new Date()
  const vocabularyRows = vocabulary.data || []
  const dueVocabulary = vocabularyRows.filter((row) => (
    row.memory_status === 'forgot'
    || row.memory_status === 'hard'
    || (row.next_review_at && new Date(row.next_review_at) <= now)
  ))

  return {
    hasStarted: Boolean(lesson.data),
    completionPercent: lesson.data?.completion_percent || 0,
    reviewWordIds: dueVocabulary.map((row) => row.vocabulary_id.slice(vocabularyPrefix.length)),
    rememberedCount: vocabularyRows.filter((row) => row.memory_status === 'remembered').length,
    attemptCount: attempts.data?.length || 0,
    latestFeedback: notifications.data?.[0] || null,
    pendingGrades: [...(shadowing.data || []), ...(writing.data || [])].filter((row) => !row.graded_at).length,
    hasWritingDraft: Boolean(draft.data?.content?.trim()),
  }
}
