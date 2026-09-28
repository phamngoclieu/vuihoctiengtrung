import { requireSupabase } from './supabase.js'
import { getVocabularyPracticeSummary } from './vocabularyPracticeEngine.js'

function normalizeSession(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    hskLevel: row.hsk_level,
    status: row.status,
    state: row.session_state,
    currentIndex: row.current_index,
    totalQuestions: row.total_questions,
    firstTryCorrect: row.first_try_correct,
    everWrong: row.ever_wrong,
    revealedAnswers: row.revealed_answers,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  }
}

export async function loadActiveVocabularyPracticeSession({ userId, hskLevel }) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('vocabulary_practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('hsk_level', hskLevel)
    .eq('status', 'in_progress')
    .maybeSingle()

  if (error) throw error
  return normalizeSession(data)
}

export async function createVocabularyPracticeSession({ userId, hskLevel, state }) {
  const client = requireSupabase()
  const summary = getVocabularyPracticeSummary(state)
  const { data, error } = await client
    .from('vocabulary_practice_sessions')
    .insert({
      user_id: userId,
      hsk_level: hskLevel,
      status: 'in_progress',
      session_state: state,
      current_index: state.currentIndex,
      total_questions: summary.total,
    })
    .select('*')
    .single()

  if (error?.code === '23505') return loadActiveVocabularyPracticeSession({ userId, hskLevel })
  if (error) throw error
  return normalizeSession(data)
}

export async function saveVocabularyPracticeSession({ sessionId, userId, state }) {
  const client = requireSupabase()
  const summary = getVocabularyPracticeSummary(state)
  const completedAt = summary.completed ? new Date().toISOString() : null
  const { data, error } = await client
    .from('vocabulary_practice_sessions')
    .update({
      status: summary.completed ? 'completed' : 'in_progress',
      session_state: state,
      current_index: state.currentIndex,
      total_questions: summary.total,
      first_try_correct: summary.firstTryCorrect,
      ever_wrong: summary.everWrong,
      revealed_answers: summary.revealedAnswers,
      completed_at: completedAt,
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return normalizeSession(data)
}

export async function loadStaffVocabularyPracticeHistory({ limit = 250 } = {}) {
  const client = requireSupabase()
  const [{ data: sessions, error: sessionsError }, { data: profiles, error: profilesError }] = await Promise.all([
    client.from('vocabulary_practice_sessions').select('*').order('started_at', { ascending: false }).limit(limit),
    client.from('profiles').select('id, display_name, email, role'),
  ])

  if (sessionsError) throw sessionsError
  if (profilesError) throw profilesError
  const profilesById = Object.fromEntries((profiles || []).map((profile) => [profile.id, profile]))
  return (sessions || []).map((row) => ({ ...normalizeSession(row), profile: profilesById[row.user_id] || null }))
}
