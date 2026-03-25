import {
  questions as fallbackQuestions,
  type Question,
} from "@/data/questions";

export type QuestionId = string;
export type RawQuestionId = string | number | null | undefined;

export const toQuestionId = (value: RawQuestionId): QuestionId =>
  value === null || value === undefined ? "" : String(value).trim();

const isNumericQuestionId = (value: QuestionId) => /^\d+$/.test(value);

export const normalizeQuestionText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const buildQuestionFingerprint = (question: Question) =>
  [
    normalizeQuestionText(question.question),
    question.exam,
    question.topic,
    question.subtopic,
    question.difficulty,
    question.type,
    question.year ?? "",
    question.options.map(option => normalizeQuestionText(option)).join("|"),
  ].join("::");

const hashQuestionFingerprint = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

export function getStoredQuestionId(question: Question): QuestionId {
  const questionId = toQuestionId(question.id);
  if (!questionId) return "";
  if (isNumericQuestionId(questionId)) return questionId;

  // Some persisted progress tables still behave like numeric-only storage.
  // Use a stable fingerprint-backed alias for non-numeric live ids.
  const fingerprint = buildQuestionFingerprint(question);
  const numericAlias =
    1_000_000_000 + (hashQuestionFingerprint(fingerprint) % 1_000_000_000);
  return String(numericAlias);
}

export function mergeQuestionBanks(
  liveQuestions: Question[],
  legacyQuestions: Question[] = fallbackQuestions
): Question[] {
  if (liveQuestions.length === 0) return legacyQuestions;

  const liveFingerprints = new Set(liveQuestions.map(buildQuestionFingerprint));
  const legacyOnlyQuestions = legacyQuestions.filter(
    question => !liveFingerprints.has(buildQuestionFingerprint(question))
  );

  return [...liveQuestions, ...legacyOnlyQuestions];
}

export function createQuestionIdentityIndex(
  questions: Question[],
  legacyQuestions: Question[] = fallbackQuestions
) {
  const questionLookup = new Map<QuestionId, Question>();
  const fingerprintBuckets = new Map<string, QuestionId[]>();
  const aliasLookup = new Map<QuestionId, QuestionId>();
  const collisionAliases = new Set<QuestionId>();

  for (const question of questions) {
    const questionId = toQuestionId(question.id);
    if (!questionId) continue;

    questionLookup.set(questionId, question);
    aliasLookup.set(questionId, questionId);

    const storedQuestionId = getStoredQuestionId(question);
    if (storedQuestionId && storedQuestionId !== questionId) {
      const existingAlias = aliasLookup.get(storedQuestionId);
      if (existingAlias && existingAlias !== questionId) {
        aliasLookup.delete(storedQuestionId);
        collisionAliases.add(storedQuestionId);
      } else if (!collisionAliases.has(storedQuestionId)) {
        aliasLookup.set(storedQuestionId, questionId);
      }
    }

    const fingerprint = buildQuestionFingerprint(question);
    const bucket = fingerprintBuckets.get(fingerprint) || [];
    bucket.push(questionId);
    fingerprintBuckets.set(fingerprint, bucket);
  }

  for (const legacyQuestion of legacyQuestions) {
    const legacyId = toQuestionId(legacyQuestion.id);
    if (!legacyId || aliasLookup.has(legacyId)) continue;

    const fingerprint = buildQuestionFingerprint(legacyQuestion);
    const matches = fingerprintBuckets.get(fingerprint) || [];

    if (matches.length === 1) {
      aliasLookup.set(legacyId, matches[0]);
    }
  }

  const resolveQuestionId = (rawId: RawQuestionId): QuestionId | null => {
    const questionId = toQuestionId(rawId);
    if (!questionId) return null;
    return aliasLookup.get(questionId) ?? null;
  };

  return {
    questionLookup,
    resolveQuestionId,
    getQuestion(rawId: RawQuestionId): Question | null {
      const questionId = resolveQuestionId(rawId);
      if (!questionId) return null;
      return questionLookup.get(questionId) ?? null;
    },
  };
}
