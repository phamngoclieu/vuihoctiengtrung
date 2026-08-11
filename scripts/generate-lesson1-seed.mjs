import { readFile, stat } from 'node:fs/promises'
import vm from 'node:vm'

const projectRoot = new URL('../', import.meta.url)
const sourcePath = new URL('src/data/lesson1.js', projectRoot)
let source = await readFile(sourcePath, 'utf8')
source = source
  .replace(/^const audioRoot = .*$/m, "const audioRoot = '/vuihoctiengtrung/audio/hsk1/lesson-01'")
  .replace('export const lessonOne =', 'globalThis.lessonOne =')
  .replace(/export const lessonRoadmap[\s\S]*$/, '')

const context = {}
vm.runInNewContext(source, context)
const lesson = context.lessonOne

const sqlText = (value) => value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`
const sqlJson = (value) => `${sqlText(JSON.stringify(value))}::jsonb`
const lessonId = lesson.id
const vocabularyId = (id) => `${lessonId}-v-${id}`
const grammarId = (id) => `${lessonId}-g-${id}`
const dialogueId = (id) => `${lessonId}-${id}`
const exerciseId = (id) => `${lessonId}-e-${id}`
const assetPath = (filename) => `hsk1/lesson-01/${filename}`

const audioFiles = [
  ['text-01.mp3', 'dialogue-01'],
  ['vocabulary-01.mp3', 'vocabulary-01'],
  ['text-02.mp3', 'dialogue-02'],
  ['vocabulary-02.mp3', 'vocabulary-02'],
  ['text-03.mp3', 'dialogue-03'],
  ['vocabulary-03.mp3', 'vocabulary-03'],
  ['tongue-twister.mp3', 'tongue-twister'],
  ['workbook.mp3', 'workbook-pronunciation'],
]

const audioMetadata = await Promise.all(audioFiles.map(async ([filename, purpose]) => {
  const filePath = new URL(`public/audio/hsk1/lesson-01/${filename}`, projectRoot)
  const fileStat = await stat(filePath)
  return { filename, purpose, size: fileStat.size, storagePath: assetPath(filename) }
}))

const quizQuestions = [
  { id: 'quiz-01', promptVi: '“您好” phù hợp nhất khi nào?', choices: ['Chào người mình kính trọng', 'Chào một nhóm bạn', 'Nói cảm ơn'], answer: 0 },
  { id: 'quiz-02', promptVi: 'Chọn nghĩa đúng của “不客气”.', choices: ['Tạm biệt', 'Không có gì', 'Xin chào'], answer: 1 },
  { id: 'quiz-03', promptVi: 'Cách chào một nhóm học viên là:', choices: ['你们好！', '谢谢！', '再见！'], answer: 0 },
  { id: 'quiz-04', promptVi: '“们” trong “同学们” biểu thị điều gì?', choices: ['Sự kính trọng', 'Số nhiều', 'Câu hỏi'], answer: 1 },
]

const statements = ['begin;']

statements.push(`
insert into public.courses (id, title, level, description_vi, description_en, description_zh, status, sort_order)
values ('hsk1', 'HSK 1', 'HSK 1 · 3.0', 'Khóa HSK 1 theo giáo trình, sách bài tập, PPT và audio do giáo viên cung cấp.', 'HSK 1 course based on the teacher-provided textbook, workbook, slides, and audio.', 'HSK 1 课程，内容来自教师提供的教程、练习册、课件和音频。', 'published', 1)
on conflict (id) do update set
  title = excluded.title,
  level = excluded.level,
  description_vi = excluded.description_vi,
  description_en = excluded.description_en,
  description_zh = excluded.description_zh,
  status = excluded.status,
  sort_order = excluded.sort_order;
`)

statements.push(`
insert into public.lessons (id, course_id, lesson_number, title_zh, pinyin, title_vi, title_en, objectives, source_coverage, status, published_at)
values (${sqlText(lessonId)}, 'hsk1', ${lesson.number}, ${sqlText(lesson.title)}, ${sqlText(lesson.pinyin)}, ${sqlText(lesson.titleVi)}, ${sqlText(lesson.titleEn)}, ${sqlJson(lesson.objectives)}, ${sqlJson(lesson.sourceCoverage)}, 'published', now())
on conflict (id) do update set
  title_zh = excluded.title_zh,
  pinyin = excluded.pinyin,
  title_vi = excluded.title_vi,
  title_en = excluded.title_en,
  objectives = excluded.objectives,
  source_coverage = excluded.source_coverage,
  status = excluded.status,
  published_at = coalesce(public.lessons.published_at, excluded.published_at);
`)

const vocabularyRows = lesson.vocabulary.map((word, index) => `(${sqlText(vocabularyId(word.id))}, ${sqlText(lessonId)}, ${sqlText(word.hanzi)}, ${sqlText(word.pinyin)}, ${sqlText(word.hanViet)}, ${sqlText(word.partOfSpeech)}, null, ${sqlText(word.meaningVi)}, ${sqlText(word.meaningEn)}, ${sqlText(word.source)}, ${sqlText(word.reviewFlag)}, ${index + 1}, ${sqlText(word.reviewFlag ? 'draft' : 'published')})`)
statements.push(`
insert into public.vocabulary (id, lesson_id, hanzi, pinyin, han_viet, part_of_speech_vi, part_of_speech_en, meaning_vi, meaning_en, source_note, review_flag, sort_order, status)
values
${vocabularyRows.join(',\n')}
on conflict (id) do update set
  hanzi = excluded.hanzi,
  pinyin = excluded.pinyin,
  han_viet = excluded.han_viet,
  part_of_speech_vi = excluded.part_of_speech_vi,
  meaning_vi = excluded.meaning_vi,
  meaning_en = excluded.meaning_en,
  source_note = excluded.source_note,
  review_flag = excluded.review_flag,
  sort_order = excluded.sort_order,
  status = excluded.status;
`)

const vocabularyIds = lesson.vocabulary.map((word) => sqlText(vocabularyId(word.id))).join(', ')
statements.push(`delete from public.vocabulary_examples where vocabulary_id in (${vocabularyIds});`)
const vocabularyExampleRows = lesson.vocabulary.flatMap((word) => word.examples.map((example, index) => `(${sqlText(vocabularyId(word.id))}, ${sqlText(example.zh)}, ${sqlText(example.py)}, ${sqlText(example.vi)}, ${sqlText(example.en)}, ${sqlText(word.source)}, ${index + 1})`))
if (vocabularyExampleRows.length) {
  statements.push(`insert into public.vocabulary_examples (vocabulary_id, text_zh, pinyin, translation_vi, translation_en, source_note, sort_order) values\n${vocabularyExampleRows.join(',\n')};`)
}

const grammarRows = lesson.grammar.map((point, index) => `(${sqlText(grammarId(point.id))}, ${sqlText(lessonId)}, ${sqlText(point.titleVi)}, ${sqlText(point.titleEn)}, ${sqlText(point.titleZh)}, ${sqlText(point.explanationVi)}, ${sqlText(point.explanationEn)}, ${sqlJson(point.patterns)}, ${sqlText('Giáo trình và PPT Bài 1')}, ${index + 1}, 'published')`)
statements.push(`
insert into public.grammar_points (id, lesson_id, title_vi, title_en, title_zh, explanation_vi, explanation_en, examples, source_note, sort_order, status)
values
${grammarRows.join(',\n')}
on conflict (id) do update set
  title_vi = excluded.title_vi,
  title_en = excluded.title_en,
  title_zh = excluded.title_zh,
  explanation_vi = excluded.explanation_vi,
  explanation_en = excluded.explanation_en,
  examples = excluded.examples,
  source_note = excluded.source_note,
  sort_order = excluded.sort_order,
  status = excluded.status;
`)

const mediaRows = audioMetadata.map((asset) => `(${sqlText(lessonId)}, 'audio', ${sqlText(asset.purpose)}, ${sqlText(asset.storagePath)}, 'audio/mpeg', ${asset.size}, ${sqlText(asset.filename)})`)
statements.push(`
insert into public.media_assets (lesson_id, kind, purpose, storage_path, mime_type, size_bytes, source_filename)
values
${mediaRows.join(',\n')}
on conflict (storage_path) do update set
  purpose = excluded.purpose,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  source_filename = excluded.source_filename;
`)

const dialogueRows = lesson.dialogues.map((dialogue, index) => {
  const filename = dialogue.audio.split('/').at(-1)
  return `(${sqlText(dialogueId(dialogue.id))}, ${sqlText(lessonId)}, ${sqlText(dialogue.titleVi)}, ${sqlText(dialogue.titleEn)}, null, null, null, ${sqlText(dialogue.tipVi)}, (select id from public.media_assets where storage_path = ${sqlText(assetPath(filename))}), ${index + 1}, 'published')`
})
statements.push(`
insert into public.dialogues (id, lesson_id, title_vi, title_en, title_zh, context_vi, context_en, tip_vi, media_asset_id, sort_order, status)
values
${dialogueRows.join(',\n')}
on conflict (id) do update set
  title_vi = excluded.title_vi,
  title_en = excluded.title_en,
  tip_vi = excluded.tip_vi,
  media_asset_id = excluded.media_asset_id,
  sort_order = excluded.sort_order,
  status = excluded.status;
`)

const dialogueIds = lesson.dialogues.map((dialogue) => sqlText(dialogueId(dialogue.id))).join(', ')
statements.push(`delete from public.dialogue_lines where dialogue_id in (${dialogueIds});`)
const dialogueLineRows = lesson.dialogues.flatMap((dialogue) => dialogue.lines.map((line, index) => `(${sqlText(dialogueId(dialogue.id))}, ${sqlText(line.speaker)}, ${sqlText(line.zh)}, ${sqlText(line.py)}, ${sqlText(line.vi)}, ${sqlText(line.en)}, ${index + 1})`))
statements.push(`insert into public.dialogue_lines (dialogue_id, speaker, text_zh, pinyin, translation_vi, translation_en, sort_order) values\n${dialogueLineRows.join(',\n')};`)

const exerciseRows = []
lesson.workbookExercises.forEach((exercise, index) => {
  const configuration = { items: exercise.items || null, itemCount: exercise.itemCount || null, options: exercise.options || null, situations: exercise.situations || null, answerState: exercise.answerState || null }
  const answerKey = exercise.situations ? Object.fromEntries(exercise.situations.map((item) => [item.id, item.answer])) : {}
  const status = exercise.answerState === 'hidden-until-submit' && !exercise.situations ? 'draft' : 'published'
  exerciseRows.push(`(${sqlText(exerciseId(exercise.id))}, ${sqlText(lessonId)}, ${sqlText(exercise.type === 'matching' ? 'dialogue' : 'pronunciation')}, ${sqlText(exercise.type)}, ${sqlText(exercise.promptVi)}, null, null, ${sqlJson(configuration)}, ${sqlJson(answerKey)}, (select id from public.media_assets where storage_path = ${sqlText(assetPath('workbook.mp3'))}), ${index + 1}, ${sqlText(status)})`)
})
quizQuestions.forEach((question, index) => {
  exerciseRows.push(`(${sqlText(exerciseId(question.id))}, ${sqlText(lessonId)}, 'quiz', 'multiple-choice', ${sqlText(question.promptVi)}, null, null, ${sqlJson({ choices: question.choices })}, ${sqlJson({ answer: question.answer })}, null, ${20 + index}, 'published')`)
})
exerciseRows.push(`(${sqlText(exerciseId('tongue-twister'))}, ${sqlText(lessonId)}, 'pronunciation', 'shadowing-practice', 'Nghe và đọc theo bài luyện líu lưỡi.', null, null, ${sqlJson({ lines: lesson.tongueTwister.lines })}, '{}'::jsonb, (select id from public.media_assets where storage_path = ${sqlText(assetPath('tongue-twister.mp3'))}), 30, 'published')`)
exerciseRows.push(`(${sqlText(exerciseId('shadowing-official'))}, ${sqlText(lessonId)}, 'dialogue', 'shadowing-submission', ${sqlText(lesson.shadowing.official.instructionVi)}, null, null, ${sqlJson({ ...lesson.shadowing.official, submissionLimit: 1 })}, '{}'::jsonb, (select id from public.media_assets where storage_path = ${sqlText(assetPath('text-02.mp3'))}), 31, 'published')`)
exerciseRows.push(`(${sqlText(exerciseId('shadowing-composed'))}, ${sqlText(lessonId)}, 'dialogue', 'shadowing-submission', ${sqlText(lesson.shadowing.composed.instructionVi)}, null, null, ${sqlJson({ ...lesson.shadowing.composed, submissionLimit: 1 })}, '{}'::jsonb, null, 32, 'published')`)
exerciseRows.push(`(${sqlText(exerciseId('writing'))}, ${sqlText(lessonId)}, 'writing', 'writing-submission', ${sqlText(lesson.writing.promptVi)}, ${sqlText(lesson.writing.promptEn)}, null, ${sqlJson({ requirements: lesson.writing.requirements, submissionLimit: 1, sampleAnswer: null })}, '{}'::jsonb, null, 40, 'published')`)
statements.push(`
insert into public.exercises (id, lesson_id, section, exercise_type, prompt_vi, prompt_en, prompt_zh, configuration, answer_key, media_asset_id, sort_order, status)
values
${exerciseRows.join(',\n')}
on conflict (id) do update set
  section = excluded.section,
  exercise_type = excluded.exercise_type,
  prompt_vi = excluded.prompt_vi,
  prompt_en = excluded.prompt_en,
  prompt_zh = excluded.prompt_zh,
  configuration = excluded.configuration,
  answer_key = excluded.answer_key,
  media_asset_id = excluded.media_asset_id,
  sort_order = excluded.sort_order,
  status = excluded.status;
`)

statements.push('commit;')
process.stdout.write(statements.join('\n'))
