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

  const { error: insertError } = await client.from('shadowing_submissions').insert({
    user_id: userId,
    lesson_id: lessonId,
    submission_type: submissionType,
    storage_path: path,
    mime_type: recording.mimeType,
    size_bytes: recording.blob.size,
  })
  if (insertError) throw insertError
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
  const { error } = await client.from('writing_submissions').insert({
    user_id: userId,
    lesson_id: lessonId,
    content,
  })
  if (error) throw error
}
