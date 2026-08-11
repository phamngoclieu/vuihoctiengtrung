import { requireSupabase } from './supabase.js'

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function studentName(profile) {
  return profile?.display_name || profile?.email || 'Học viên'
}

export async function loadGradingQueue() {
  const client = requireSupabase()
  const [shadowingResult, writingResult] = await Promise.all([
    client
      .from('shadowing_submissions')
      .select('id, user_id, lesson_id, submission_type, storage_path, submitted_at, score, teacher_comment, graded_at, profiles!shadowing_submissions_user_id_fkey(display_name, email)')
      .order('submitted_at', { ascending: false }),
    client
      .from('writing_submissions')
      .select('id, user_id, lesson_id, content, submitted_at, score, teacher_comment, graded_at, profiles!writing_submissions_user_id_fkey(display_name, email)')
      .order('submitted_at', { ascending: false }),
  ])

  if (shadowingResult.error) throw shadowingResult.error
  if (writingResult.error) throw writingResult.error

  const shadowing = (shadowingResult.data || []).map((row) => ({
    ...row,
    key: `shadowing-${row.id}`,
    kind: 'shadowing',
    name: studentName(row.profiles),
    lesson: row.lesson_id === 'hsk1-lesson-01' ? 'Bài 1' : row.lesson_id,
    type: row.submission_type === 'official' ? 'Đoạn chính thức' : 'Đoạn tự biên soạn',
    submitted: formatDate(row.submitted_at),
    status: row.graded_at ? 'graded' : 'pending',
  }))
  const writing = (writingResult.data || []).map((row) => ({
    ...row,
    key: `writing-${row.id}`,
    kind: 'writing',
    name: studentName(row.profiles),
    lesson: row.lesson_id === 'hsk1-lesson-01' ? 'Bài 1' : row.lesson_id,
    type: 'Luyện viết',
    submitted: formatDate(row.submitted_at),
    status: row.graded_at ? 'graded' : 'pending',
  }))

  return [...shadowing, ...writing].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
}

export async function getShadowingPlaybackUrl(storagePath) {
  const client = requireSupabase()
  const { data, error } = await client.storage.from('shadowing-submissions').createSignedUrl(storagePath, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function gradeSubmission({ kind, submissionId, score, comment }) {
  const client = requireSupabase()
  const functionName = kind === 'writing' ? 'grade_writing_submission' : 'grade_shadowing_submission'
  const { error } = await client.rpc(functionName, {
    p_submission_id: submissionId,
    p_score: score,
    p_comment: comment,
  })
  if (error) throw error
}
