import type { Difficulty, Exam, QuestionType } from "@/data/questions";

export interface ImportedQuestionPayload {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
  explanation: string;
  exam: Exam;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  type: QuestionType;
  year: number | null;
  tags: string[];
  is_active: boolean;
}

const EXAMS = new Set<Exam>(["UPSC", "SSC", "TSPSC", "APPSC", "RRB", "IBPS"]);
const DIFFICULTIES = new Set<Difficulty>(["Easy", "Medium", "Hard"]);
const TYPES = new Set<QuestionType>(["PYQ", "Conceptual", "CurrentAffairs", "Mock"]);

type RawRecord = Record<string, unknown>;

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function mapRecordKeys(record: RawRecord) {
  const normalized: RawRecord = {};

  Object.entries(record).forEach(([key, value]) => {
    normalized[normalizeKey(key)] = value;
  });

  return normalized;
}

function parseDelimitedRow(row: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    const nextChar = row[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function parseDelimitedInput(input: string, delimiter: string) {
  const rows = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    throw new Error("Add a header row and at least one question row.");
  }

  const headers = parseDelimitedRow(rows[0], delimiter).map(normalizeKey);

  return rows.slice(1).map((row) => {
    const values = parseDelimitedRow(row, delimiter);
    const record: RawRecord = {};

    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });

    return record;
  });
}

function parseInput(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Paste questions first.");
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed);
    const records = Array.isArray(parsed) ? parsed : Array.isArray(parsed.questions) ? parsed.questions : null;

    if (!records) {
      throw new Error("JSON must be an array or an object with a questions array.");
    }

    return records.map((record: RawRecord) => mapRecordKeys(record));
  }

  if (trimmed.includes("\t")) {
    return parseDelimitedInput(trimmed, "\t").map(mapRecordKeys);
  }

  return parseDelimitedInput(trimmed, ",").map(mapRecordKeys);
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseTags(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  const raw = asText(value);
  if (!raw) return [];

  return raw
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptions(record: RawRecord) {
  if (Array.isArray(record.options)) {
    const options = record.options.map((option) => String(option).trim()).filter(Boolean);
    if (options.length === 4) return options;
  }

  const optionFields = ["option_a", "option_b", "option_c", "option_d"].map((key) => asText(record[key]));
  if (optionFields.every(Boolean)) return optionFields;

  const optionsText = asText(record.options);
  if (optionsText) {
    const separator = optionsText.includes("||") ? "||" : "|";
    const options = optionsText
      .split(separator)
      .map((option) => option.trim())
      .filter(Boolean);

    if (options.length === 4) return options;
  }

  throw new Error("Each question needs exactly four options.");
}

function parseCorrectOption(record: RawRecord, options: string[]) {
  const raw = record.correct_option ?? record.correct ?? record.answer;

  if (typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw <= 3) {
    return raw;
  }

  const text = String(raw ?? "").trim();
  if (!text) {
    throw new Error("Missing correct answer.");
  }

  if (/^[0-3]$/.test(text)) {
    return Number(text);
  }

  if (/^[1-4]$/.test(text)) {
    return Number(text) - 1;
  }

  const letterIndex = ["a", "b", "c", "d"].indexOf(text.toLowerCase());
  if (letterIndex >= 0) {
    return letterIndex;
  }

  const optionIndex = options.findIndex((option) => option.toLowerCase() === text.toLowerCase());
  if (optionIndex >= 0) {
    return optionIndex;
  }

  throw new Error("Correct answer must be 0-3, 1-4, A-D, or exact option text.");
}

function parseYear(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(String(value).trim());
  if (!Number.isFinite(parsed)) {
    throw new Error("Year must be a number.");
  }

  return parsed;
}

function parseExam(value: unknown) {
  const exam = asText(value) as Exam;
  if (!EXAMS.has(exam)) {
    throw new Error(`Exam must be one of: ${Array.from(EXAMS).join(", ")}.`);
  }

  return exam;
}

function parseDifficulty(value: unknown) {
  const difficulty = asText(value) as Difficulty;
  if (!DIFFICULTIES.has(difficulty)) {
    throw new Error(`Difficulty must be one of: ${Array.from(DIFFICULTIES).join(", ")}.`);
  }

  return difficulty;
}

function parseType(value: unknown) {
  const type = asText(value) as QuestionType;
  if (!TYPES.has(type)) {
    throw new Error(`Type must be one of: ${Array.from(TYPES).join(", ")}.`);
  }

  return type;
}

function normalizeRecord(record: RawRecord, index: number): ImportedQuestionPayload {
  const question = asText(record.question);
  const explanation = asText(record.explanation);
  const topic = asText(record.topic);
  const subtopic = asText(record.subtopic);

  if (!question) {
    throw new Error(`Row ${index + 1}: question is required.`);
  }

  if (!explanation) {
    throw new Error(`Row ${index + 1}: explanation is required.`);
  }

  if (!topic) {
    throw new Error(`Row ${index + 1}: topic is required.`);
  }

  const options = parseOptions(record);
  const correctOption = parseCorrectOption(record, options);

  try {
    return {
      question,
      option_a: options[0],
      option_b: options[1],
      option_c: options[2],
      option_d: options[3],
      correct_option: correctOption,
      explanation,
      exam: parseExam(record.exam),
      topic,
      subtopic,
      difficulty: parseDifficulty(record.difficulty),
      type: parseType(record.type),
      year: parseYear(record.year),
      tags: parseTags(record.tags),
      is_active: record.is_active === false ? false : String(record.is_active ?? "true").toLowerCase() !== "false",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid question data.";
    throw new Error(`Row ${index + 1}: ${message}`);
  }
}

export function parseBulkQuestionInput(input: string) {
  const records = parseInput(input);

  if (records.length === 0) {
    throw new Error("No questions found.");
  }

  return records.map((record: RawRecord, index: number) => normalizeRecord(record, index));
}

export function chunkQuestions<T>(questions: T[], size = 200) {
  const chunks: T[][] = [];

  for (let index = 0; index < questions.length; index += size) {
    chunks.push(questions.slice(index, index + size));
  }

  return chunks;
}
