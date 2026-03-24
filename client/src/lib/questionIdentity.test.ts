import { describe, expect, it } from "vitest";

import type { Question } from "@/data/questions";
import { createQuestionIdentityIndex, mergeQuestionBanks } from "@/lib/questionIdentity";

const buildQuestion = (overrides: Partial<Question> = {}): Question => ({
  id: 1,
  question: "Which Article of the Indian Constitution deals with the Right to Education?",
  options: ["Article 19", "Article 21A", "Article 24", "Article 32"],
  correct: 1,
  explanation: "Article 21A makes education a right.",
  exam: "UPSC",
  topic: "Polity",
  subtopic: "Fundamental Rights",
  difficulty: "Easy",
  type: "PYQ",
  year: 2019,
  tags: [],
  ...overrides,
});

describe("question identity", () => {
  it("maps legacy numeric ids to the live UUID when the question fingerprint matches", () => {
    const legacyQuestion = buildQuestion({ id: 1 });
    const liveQuestion = buildQuestion({ id: "uuid-rte-1" });

    const index = createQuestionIdentityIndex([liveQuestion], [legacyQuestion]);

    expect(index.resolveQuestionId(1)).toBe("uuid-rte-1");
    expect(index.resolveQuestionId("uuid-rte-1")).toBe("uuid-rte-1");
  });

  it("keeps fallback-only questions in the merged bank so old progress can still resolve", () => {
    const sharedLegacy = buildQuestion({ id: 1 });
    const sharedLive = buildQuestion({ id: "uuid-rte-1" });
    const fallbackOnly = buildQuestion({
      id: 42,
      question: "A fallback-only question",
      options: ["A", "B", "C", "D"],
      exam: "SSC",
      topic: "Quantitative Aptitude",
      subtopic: "",
      year: 2022,
    });

    const merged = mergeQuestionBanks([sharedLive], [sharedLegacy, fallbackOnly]);
    const index = createQuestionIdentityIndex(merged, [sharedLegacy, fallbackOnly]);

    expect(merged.map((question) => question.id)).toEqual(["uuid-rte-1", 42]);
    expect(index.resolveQuestionId(42)).toBe("42");
  });

  it("refuses to guess when multiple live questions have the same exact fingerprint", () => {
    const legacyQuestion = buildQuestion({ id: 1 });
    const liveQuestions = [
      buildQuestion({ id: "uuid-rte-1" }),
      buildQuestion({ id: "uuid-rte-2" }),
    ];

    const index = createQuestionIdentityIndex(liveQuestions, [legacyQuestion]);

    expect(index.resolveQuestionId(1)).toBeNull();
  });
});
