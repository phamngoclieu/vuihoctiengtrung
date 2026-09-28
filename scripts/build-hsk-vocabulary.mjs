import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const [, , outlineTextPath, dictionaryPath, outputDirectory] = process.argv

if (!outlineTextPath || !dictionaryPath || !outputDirectory) {
  console.error('Usage: node scripts/build-hsk-vocabulary.mjs <outline.txt> <CVDICT.u8> <output-directory>')
  process.exit(1)
}

const levelRanges = {
  1: [1, 300],
  2: [301, 500],
  3: [501, 1000],
}

const partOfSpeechLabels = new Map([
  ['名', 'danh từ'],
  ['动', 'động từ'],
  ['形', 'tính từ'],
  ['副', 'phó từ'],
  ['代', 'đại từ'],
  ['数', 'số từ'],
  ['量', 'lượng từ'],
  ['助', 'trợ từ'],
  ['介', 'giới từ'],
  ['连', 'liên từ'],
  ['叹', 'thán từ'],
  ['拟声', 'từ tượng thanh'],
  ['前缀', 'tiền tố'],
  ['后缀', 'hậu tố'],
  ['区别', 'từ phân biệt'],
])

const toneMarks = {
  ā: ['a', '1'], á: ['a', '2'], ǎ: ['a', '3'], à: ['a', '4'],
  ē: ['e', '1'], é: ['e', '2'], ě: ['e', '3'], è: ['e', '4'],
  ī: ['i', '1'], í: ['i', '2'], ǐ: ['i', '3'], ì: ['i', '4'],
  ō: ['o', '1'], ó: ['o', '2'], ǒ: ['o', '3'], ò: ['o', '4'],
  ū: ['u', '1'], ú: ['u', '2'], ǔ: ['u', '3'], ù: ['u', '4'],
  ǖ: ['v', '1'], ǘ: ['v', '2'], ǚ: ['v', '3'], ǜ: ['v', '4'],
  ń: ['n', '2'], ň: ['n', '3'], ǹ: ['n', '4'], ḿ: ['m', '2'],
}

function normalizePinyin(value) {
  let letters = ''
  const tones = []
  for (const character of value.toLowerCase().replace(/u:/g, 'v')) {
    if (toneMarks[character]) {
      letters += toneMarks[character][0]
      tones.push(toneMarks[character][1])
    } else if (/[1-4]/.test(character)) {
      tones.push(character)
    } else if (character === 'ü') {
      letters += 'v'
    } else if (/[a-z]/.test(character)) {
      letters += character
    }
  }
  return `${letters}|${tones.join('')}`
}

function stripSenseMarker(value) {
  return value.replace(/([^0-9])\d+$/u, '$1')
}

function translatePartOfSpeech(source) {
  if (!source) return 'từ / cụm từ'
  const labels = []
  for (const [key, label] of partOfSpeechLabels) {
    if (source.includes(key) && !labels.includes(label)) labels.push(label)
  }
  return labels.length ? labels.join(' / ') : 'từ / cụm từ'
}

function parseOutline(text) {
  const rows = []
  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(/^(\d+)\s+([1-3])(?:（[^）]+）)*\s+(\S+)\s+(.+)$/u)
    if (!match) continue

    const sequence = Number(match[1])
    const level = Number(match[2])
    const [rangeStart, rangeEnd] = levelRanges[level]
    if (sequence < rangeStart || sequence > rangeEnd) continue

    const tailTokens = match[4].trim().split(/\s+/)
    const partIndex = tailTokens.findIndex((token) => /[\u3400-\u9fff]/u.test(token))
    const pinyin = (partIndex === -1 ? tailTokens : tailTokens.slice(0, partIndex)).join(' ')
    const partOfSpeechSource = partIndex === -1 ? '' : tailTokens.slice(partIndex).join(' ')

    rows.push({
      sequence,
      level,
      hanzi: stripSenseMarker(match[3]),
      sourceHanzi: match[3],
      pinyin,
      partOfSpeechSource,
    })
  }

  return rows
}

function parseDictionary(text) {
  const dictionary = new Map()
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^(\S+)\s+(\S+)\s+\[([^\x5D]+)\x5D\s+\/(.*)\/$/u)
    if (!match) continue
    const [, traditional, simplified, pinyin, definitionsText] = match
    const definitions = definitionsText
      .split('/')
      .map((definition) => definition.trim())
      .filter(Boolean)
    const entry = { traditional, simplified, pinyin, definitions }
    dictionary.set(simplified, [...(dictionary.get(simplified) || []), entry])
  }
  return dictionary
}

function cleanDefinition(definition) {
  return definition
    .replace(/^(LT|CL):\s*/iu, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*;\s*/g, '; ')
    .trim()
}

function getVietnameseMeaning(row, dictionary) {
  const candidates = dictionary.get(row.hanzi) || []
  if (!candidates.length) return null
  const targetPinyin = normalizePinyin(row.pinyin)
  const exactCandidates = candidates.filter((candidate) => normalizePinyin(candidate.pinyin) === targetPinyin)
  const ordinaryExactCandidates = exactCandidates.filter((candidate) => /^[a-züv]/u.test(candidate.pinyin))
  const ordinaryCandidates = candidates.filter((candidate) => /^[a-züv]/u.test(candidate.pinyin))
  const selectedCandidates = ordinaryExactCandidates.length
    ? ordinaryExactCandidates
    : exactCandidates.length
      ? exactCandidates
      : ordinaryCandidates.length
        ? ordinaryCandidates
        : candidates
  const definitions = selectedCandidates
    .flatMap((candidate) => candidate.definitions)
    .filter((definition) => !/^(LT|CL):/iu.test(definition.trim()))
    .map(cleanDefinition)
    .filter(Boolean)
    .filter((definition, index, all) => all.indexOf(definition) === index)

  if (!definitions.length) return null
  const preferred = definitions.filter((definition) => (
    !/^(biến thể|xem |viết tắt|họ \[|nghĩa bóng|lượng từ:)/iu.test(definition)
    && !/^\((tiếng lóng|văn học|cũ|phương ngữ)/iu.test(definition)
  ))
  const partOfSpeechRules = [
    ['量', /lượng từ/iu],
    ['助', /trợ từ/iu],
    ['介', /^(giới từ|với|từ|đến|hướng về|đối với|so với|bằng)/iu],
    ['代', /đại từ/iu],
    ['连', /^(liên từ|và|nhưng|hoặc|nếu|vì|cho nên|tuy)/iu],
    ['叹', /thán từ/iu],
    ['副', /^(đừng|không|rất|cũng|đều|đã|sẽ|vẫn|thường|càng|chỉ|lại|hơn|nhất|đang|sắp|mới|vừa)/iu],
    ['前缀', /tiền tố/iu],
    ['后缀', /hậu tố/iu],
  ]
  const candidatesToRank = preferred.length ? preferred : definitions
  const primaryPartOfSpeech = row.partOfSpeechSource.split(/[、，]/u)[0].replace(/[（）()]/gu, '')
  const ranked = candidatesToRank
    .map((definition, index) => ({
      definition,
      index,
      score: partOfSpeechRules.reduce((score, [part, pattern]) => (
        score + (primaryPartOfSpeech === part && pattern.test(definition) ? 1 : 0)
      ), 0),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
  return ranked[0]?.definition || null
}

function mergeDuplicateRows(rows) {
  const byHanzi = new Map()
  for (const row of rows) {
    const existing = byHanzi.get(row.hanzi)
    if (!existing) {
      byHanzi.set(row.hanzi, row)
      continue
    }
    existing.pinyin = [...new Set([existing.pinyin, row.pinyin])].join(' / ')
    existing.partOfSpeechSource = [...new Set([existing.partOfSpeechSource, row.partOfSpeechSource].filter(Boolean))].join('、')
  }
  return [...byHanzi.values()]
}

const outline = parseOutline(fs.readFileSync(outlineTextPath, 'utf8'))
const dictionary = parseDictionary(fs.readFileSync(dictionaryPath, 'utf8'))
fs.mkdirSync(outputDirectory, { recursive: true })

const report = {}
for (const level of [1, 2, 3]) {
  const sourceRows = outline.filter((row) => row.level === level)
  const rows = mergeDuplicateRows(sourceRows)
  const missing = []
  const records = rows.map((row) => {
    const meaningVi = getVietnameseMeaning(row, dictionary)
    if (!meaningVi) missing.push(`${row.sequence}:${row.hanzi}:${row.pinyin}`)
    return {
      id: `hsk${level}-outline-${String(row.sequence).padStart(4, '0')}`,
      hanzi: row.hanzi,
      pinyin: row.pinyin,
      partOfSpeech: translatePartOfSpeech(row.partOfSpeechSource),
      partOfSpeechSource: row.partOfSpeechSource,
      meaningVi: meaningVi || 'Nghĩa tiếng Việt đang được cập nhật',
      source: `Đề cương HSK 3.0, mục ${row.sequence}; nghĩa tham khảo CVDICT`,
    }
  })

  fs.writeFileSync(
    path.join(outputDirectory, `outline-hsk${level}.json`),
    `${JSON.stringify(records, null, 2)}\n`,
  )
  report[level] = {
    sourceRows: sourceRows.length,
    afterDeduplication: records.length,
    missingMeanings: missing.length,
    missing,
  }
}

console.log(JSON.stringify(report, null, 2))
