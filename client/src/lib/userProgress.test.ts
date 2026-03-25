import { describe, expect, it } from "vitest";

import {
  buildAnswerStatuses,
  buildQuestionProgress,
  countCurrentStreak,
  getSolvedQuestionIdsFromAttempts,
  type AnswerAttempt,
} from "@/lib/userProgress";

const buildAttempt = (
  overrides: Partial<AnswerAttempt> = {}
): AnswerAttempt => ({
  question_id: "q-1",
  is_correct: false,
  answered_at: "2026-03-25T10:00:00.000Z",
  ...overrides,
});

describe("user progress", () => {
  it("uses the latest attempt per question for dashboard and practice status", () => {
    const attempts: AnswerAttempt[] = [
      buildAttempt({
        question_id: "q-2",
        is_correct: true,
        answered_at: "2026-03-25T10:05:00.000Z",
      }),
      buildAttempt({
        question_id: "q-1",
        is_correct: false,
        answered_at: "2026-03-24T10:00:00.000Z",
      }),
      buildAttempt({
        question_id: "q-1",
        is_correct: true,
        answered_at: "2026-03-25T11:00:00.000Z",
      }),
    ];

    expect(buildAnswerStatuses(attempts)).toEqual({
      "q-1": "correct",
      "q-2": "correct",
    });
    expect(getSolvedQuestionIdsFromAttempts(attempts).sort()).toEqual([
      "q-1",
      "q-2",
    ]);
    expect(buildQuestionProgress(attempts)["q-1"]).toMatchObject({
      status: "correct",
      attempts: 2,
      correct_attempts: 1,
      wrong_attempts: 1,
    });
  });

  it("counts streak from consecutive active days and resets after a gap", () => {
    const consecutiveAttempts: AnswerAttempt[] = [
      buildAttempt({ answered_at: "2026-03-25T08:00:00.000Z" }),
      buildAttempt({
        question_id: "q-2",
        answered_at: "2026-03-24T08:00:00.000Z",
      }),
      buildAttempt({
        question_id: "q-3",
        answered_at: "2026-03-23T08:00:00.000Z",
      }),
    ];

    const gappedAttempts: AnswerAttempt[] = [
      buildAttempt({ answered_at: "2026-03-23T08:00:00.000Z" }),
      buildAttempt({
        question_id: "q-2",
        answered_at: "2026-03-21T08:00:00.000Z",
      }),
    ];

    expect(
      countCurrentStreak(
        consecutiveAttempts,
        new Date("2026-03-25T12:00:00.000Z")
      )
    ).toBe(3);
    expect(
      countCurrentStreak(gappedAttempts, new Date("2026-03-25T12:00:00.000Z"))
    ).toBe(0);
  });
});
