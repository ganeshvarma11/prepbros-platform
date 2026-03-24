import { questions as fallbackQuestions, type Question } from "@/data/questions";

export type QuestionId = string;
export type RawQuestionId = string | number | null | undefined;

export const toQuestionId = (value: RawQuestionId): QuestionId =>
  value === null || value === undefined ? "" : String(value).trim();

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
    question.options.map((option) => normalizeQuestionText(option)).join("|"),
  ].join("::");

export function mergeQuestionBanks(
  liveQuestions: Question[],
  legacyQuestions: Question[] = fallbackQuestions,
): Question[] {
  if (liveQuestions.length === 0) return legacyQuestions;

  const liveFingerprints = new Set(liveQuestions.map(buildQuestionFingerprint));
  const legacyOnlyQuestions = legacyQuestions.filter(
    (question) => !liveFingerprints.has(buildQuestionFingerprint(question)),
  );

  return [...liveQuestions, ...legacyOnlyQuestions];
}

export function createQuestionIdentityIndex(
  questions: Question[],
  legacyQuestions: Question[] = fallbackQuestions,
) {
  const questionLookup = new Map<QuestionId, Question>();
  const fingerprintBuckets = new Map<string, QuestionId[]>();
  const aliasLookup = new Map<QuestionId, QuestionId>();

  for (const question of questions) {
    const questionId = toQuestionId(question.id);
    if (!questionId) continue;

    questionLookup.set(questionId, question);
    aliasLookup.set(questionId, questionId);

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
