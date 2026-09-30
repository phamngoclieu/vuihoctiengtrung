import { createServer } from 'vite'

const server = await createServer({ appType: 'custom', server: { middlewareMode: true } })
const { hsk1Lessons } = await server.ssrLoadModule('/src/data/hsk1Lessons.js')
await server.close()

const lessons = hsk1Lessons.filter((lesson) => lesson.number > 1)
const sqlText = (value) => value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`
const sqlJson = (value) => `${sqlText(JSON.stringify(value))}::jsonb`

const statements = ['begin;']

statements.push(`
insert into public.lessons (id, course_id, lesson_number, title_zh, pinyin, title_vi, title_en, objectives, source_coverage, status, published_at)
values
${lessons.map((lesson) => `(${sqlText(lesson.id)}, 'hsk1', ${lesson.number}, ${sqlText(lesson.title)}, ${sqlText(lesson.pinyin)}, ${sqlText(lesson.titleVi)}, ${sqlText(lesson.titleEn)}, ${sqlJson(lesson.objectives)}, ${sqlJson(lesson.sourceCoverage)}, 'published', now())`).join(',\n')}
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

const vocabularyRows = lessons.flatMap((lesson) => lesson.vocabulary.map((entry, index) => `(${sqlText(`${lesson.id}-v-${entry.id}`)}, ${sqlText(lesson.id)}, ${sqlText(entry.hanzi)}, ${sqlText(entry.pinyin)}, ${sqlText(entry.hanViet)}, ${sqlText(entry.partOfSpeech)}, null, ${sqlText(entry.meaningVi)}, ${sqlText(entry.meaningEn)}, ${sqlText(entry.source)}, ${index + 1}, 'published')`))
statements.push(`
insert into public.vocabulary (id, lesson_id, hanzi, pinyin, han_viet, part_of_speech_vi, part_of_speech_en, meaning_vi, meaning_en, source_note, sort_order, status)
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
  sort_order = excluded.sort_order,
  status = excluded.status;
`)

const exerciseRows = lessons.flatMap((lesson) => lesson.quizQuestions.map((question, index) => `(${sqlText(`${lesson.id}-e-${question.id}`)}, ${sqlText(lesson.id)}, 'quiz', 'multiple-choice', ${sqlText(question.prompt[0])}, ${sqlText(question.prompt[1])}, ${sqlText(question.prompt[2])}, ${sqlJson({ choices: question.choices })}, ${sqlJson({ answer: question.answer })}, ${index + 1}, 'published')`))
statements.push(`
insert into public.exercises (id, lesson_id, section, exercise_type, prompt_vi, prompt_en, prompt_zh, configuration, answer_key, sort_order, status)
values
${exerciseRows.join(',\n')}
on conflict (id) do update set
  prompt_vi = excluded.prompt_vi,
  prompt_en = excluded.prompt_en,
  prompt_zh = excluded.prompt_zh,
  configuration = excluded.configuration,
  answer_key = excluded.answer_key,
  sort_order = excluded.sort_order,
  status = excluded.status;
`)

statements.push('commit;')
process.stdout.write(statements.join('\n'))
