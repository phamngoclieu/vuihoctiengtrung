import { requireSupabase } from './supabase.js'

function extensionFor(mimeType) {
  if (mimeType?.includes('ogg')) return 'ogg'
  if (mimeType?.includes('mp4')) return 'm4a'
  return 'webm'
}

export async function submitShadowing({ userId, lessonId, submissionType, recording }) {
  const client = requireSupabase()
  const extension = extensionFor(recording.mimeType)
  const path = `${userId}/${lessonId}/${submissionType}.${extension}`
  const { error: uploadError } = await client.storage
    .from('shadowing-submissions')
    .upload(path, recording.blob, { contentType: recording.mimeType, upsert: false })
  if (uploadError) throw uploadError

  const { data, error: insertError } = await client
    .from('shadowing_submissions')
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      submission_type: submissionType,
      storage_path: path,
      mime_type: recording.mimeType,
      size_bytes: recording.blob.size,
    })
    .select('id, submission_type, submitted_at, score, teacher_comment, graded_at')
    .single()
  if (insertError) throw insertError
  return data
}

export async function loadShadowingSubmissions({ userId, lessonId }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('shadowing_submissions')
    .select('id, submission_type, submitted_at, score, teacher_comment, graded_at')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('submitted_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function saveWritingDraft({ userId, lessonId, content }) {
  const client = requireSupabase()
  const { error } = await client.from('writing_drafts').upsert({
    user_id: userId,
    lesson_id: lessonId,
    content,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lesson_id' })
  if (error) throw error
}

export async function submitWriting({ userId, lessonId, content }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('writing_submissions')
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      content,
    })
    .select('id, content, submitted_at, score, teacher_comment, graded_at')
    .single()
  if (error) throw error
  return data
}

export async function loadWritingSubmission({ userId, lessonId }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('writing_submissions')
    .select('id, content, submitted_at, score, teacher_comment, graded_at')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  if (error) throw error
  return data || null
}
