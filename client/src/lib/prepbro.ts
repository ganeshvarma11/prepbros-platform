import type { User } from "@supabase/supabase-js";

import type { Question } from "@/data/questions";

export type PrepLanguage = "en" | "hi";

export type PrepExam =
  | "UPSC CSE"
  | "SSC CGL"
  | "SSC CHSL"
  | "RRB NTPC"
  | "State PSC"
  | "CAPF";

export type PrepSubject =
  | "History"
  | "Polity"
  | "Geography"
  | "Economy"
  | "Science"
  | "Current Affairs"
  | "Maths"
  | "Reasoning";

export type GoalOption = 5 | 10 | 20 | 30;

export type DifficultyMode = "Easy" | "Medium" | "Hard" | "Mixed";

export type PracticeAnswerRecord = {
  questionId: string | number;
  subject: PrepSubject;
  selectedIndex: number;
  isCorrect: boolean;
  timeTakenSec: number;
};

export type PracticeSessionRecord = {
  id: string;
  exam: PrepExam;
  subject: PrepSubject;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  durationSec: number;
  completedAt: string;
  accuracy: number;
  answers: PracticeAnswerRecord[];
};

export type PrepPreferences = {
  exam: PrepExam;
  dailyGoal: GoalOption;
  weakSubjects: PrepSubject[];
  language: PrepLanguage;
  adaptiveDarkMode: boolean;
  onboardedAt: string | null;
};

export type EditableProfile = {
  displayName: string;
  exam: PrepExam;
};

export type SubjectStat = {
  subject: PrepSubject;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
};

export type TopicStat = {
  topic: string;
  accuracy: number;
  total: number;
};

export const PREP_EXAMS: PrepExam[] = [
  "UPSC CSE",
  "SSC CGL",
  "SSC CHSL",
  "RRB NTPC",
  "State PSC",
  "CAPF",
];

export const PREP_SUBJECTS: PrepSubject[] = [
  "History",
  "Polity",
  "Geography",
  "Economy",
  "Science",
  "Current Affairs",
  "Maths",
  "Reasoning",
];

export const GOAL_OPTIONS: GoalOption[] = [5, 10, 20, 30];
export const DIFFICULTY_OPTIONS: DifficultyMode[] = [
  "Easy",
  "Medium",
  "Hard",
  "Mixed",
];

export const LANDING_METRICS = [
  { value: "50,000+", label: "Questions" },
  { value: "1.2M+", label: "Attempts" },
  { value: "4.8", label: "Rating" },
  { value: "Free", label: "Forever" },
];

export const HOME_EXAMS = [
  "UPSC CSE",
  "SSC CGL",
  "SSC CHSL",
  "RRB NTPC",
  "State PSC",
  "CAPF",
];

export const TESTIMONIALS = [
  {
    name: "Aarav Mishra",
    initials: "AM",
    exam: "UPSC CSE",
    rank: "AIR 212",
    quote:
      "PrepBros gave me a repeatable daily rhythm. I never had to think about what to solve next.",
  },
  {
    name: "Nisha Kumari",
    initials: "NK",
    exam: "SSC CGL",
    rank: "CGL 2025",
    quote:
      "The 10-question format kept me coming back even after long workdays. That consistency mattered more than motivation.",
  },
  {
    name: "Sandeep Rao",
    initials: "SR",
    exam: "State PSC",
    rank: "Top 50",
    quote:
      "Clean UI, clear feedback, and weak-topic focus. It felt calmer than every other prep app I tried.",
  },
  {
    name: "Priya Verma",
    initials: "PV",
    exam: "CAPF",
    rank: "Selected",
    quote:
      "I used it at night when my brain was tired. The product still felt manageable and encouraging.",
  },
];

export const LEADERBOARD_SEED = [
  { rank: 1, name: "Meera", initials: "ME", score: 10, accuracy: 100 },
  { rank: 2, name: "Arjun", initials: "AR", score: 9, accuracy: 90 },
  { rank: 3, name: "Kavya", initials: "KA", score: 9, accuracy: 89 },
];

export const ACHIEVEMENTS = [
  { name: "7-Day Warrior", target: 7, description: "Practice 7 days in a row" },
  { name: "Century Club", target: 100, description: "Answer 100 questions" },
  { name: "Accuracy King", target: 90, description: "Reach 90% accuracy" },
  { name: "Speed Demon", target: 300, description: "Finish 5 mins average" },
];

export const DEFAULT_PREFERENCES: PrepPreferences = {
  exam: "UPSC CSE",
  dailyGoal: 10,
  weakSubjects: ["Polity", "Current Affairs"],
  language: "en",
  adaptiveDarkMode: false,
  onboardedAt: null,
};

export const DEFAULT_PROFILE: EditableProfile = {
  displayName: "Rahul",
  exam: "UPSC CSE",
};

const PREFS_STORAGE_KEY = "prepbros-preferences-v2";
const PROFILE_STORAGE_KEY = "prepbros-profile-v2";
const SESSION_STORAGE_KEY = "prepbros-practice-sessions-v2";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeRead<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function safeReadArray<T>(key: string): T[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredPreferences() {
  return safeRead(PREFS_STORAGE_KEY, DEFAULT_PREFERENCES);
}

export function setStoredPreferences(next: PrepPreferences) {
  safeWrite(PREFS_STORAGE_KEY, next);
}

export function getStoredProfile() {
  return safeRead(PROFILE_STORAGE_KEY, DEFAULT_PROFILE);
}

export function setStoredProfile(next: EditableProfile) {
  safeWrite(PROFILE_STORAGE_KEY, next);
}

export function getStoredSessions() {
  return safeReadArray<PracticeSessionRecord>(SESSION_STORAGE_KEY).sort(
    (left, right) =>
      new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime()
  );
}

export function appendStoredSession(session: PracticeSessionRecord) {
  const current = getStoredSessions();
  safeWrite(SESSION_STORAGE_KEY, [session, ...current].slice(0, 100));
}

export function getDisplayName(user: User | null | undefined) {
  const stored = getStoredProfile();
  return (
    user?.user_metadata?.full_name?.split(" ")[0] ||
    stored.displayName ||
    user?.email?.split("@")[0] ||
    "Rahul"
  );
}

export function getProfileExam(user: User | null | undefined) {
  const stored = getStoredProfile();
  return (user?.user_metadata?.target_exam as PrepExam) || stored.exam || "UPSC CSE";
}

export function getQuestionSubject(question: Question): PrepSubject {
  const haystack = [
    question.topic,
    question.subtopic,
    question.tags.join(" "),
    question.exam,
    question.type,
  ]
    .join(" ")
    .toLowerCase();

  if (/polity|constitution|rights|judiciary|parliament|governance/.test(haystack)) {
    return "Polity";
  }
  if (/history|ancient|modern|culture|freedom/.test(haystack)) {
    return "History";
  }
  if (/geography|river|climate|soil|map|monsoon/.test(haystack)) {
    return "Geography";
  }
  if (/economy|economic|banking|finance|gdp|inflation|upi|rbi/.test(haystack)) {
    return "Economy";
  }
  if (/science|technology|biology|physics|chemistry|space|dna/.test(haystack)) {
    return "Science";
  }
  if (/current affairs|currentaffairs|general awareness|state affairs/.test(haystack)) {
    return "Current Affairs";
  }
  if (/math|quantitative|aptitude|arithmetic|algebra|percentage|ratio/.test(haystack)) {
    return "Maths";
  }
  if (/reasoning|logical|puzzle|analogy|series/.test(haystack)) {
    return "Reasoning";
  }

  return "Current Affairs";
}

function examMatches(question: Question, exam: PrepExam) {
  if (exam === "UPSC CSE" || exam === "CAPF") {
    return question.exam === "UPSC";
  }
  if (exam === "SSC CGL" || exam === "SSC CHSL") {
    return question.exam === "SSC";
  }
  if (exam === "RRB NTPC") {
    return question.exam === "RRB";
  }
  if (exam === "State PSC") {
    return question.exam === "TSPSC" || question.exam === "APPSC";
  }

  return true;
}

function difficultyMatches(question: Question, difficulty: DifficultyMode) {
  if (difficulty === "Mixed") return true;
  return question.difficulty === difficulty;
}

function scoreQuestionFit(
  question: Question,
  exam: PrepExam,
  subject: PrepSubject,
  difficulty: DifficultyMode
) {
  let score = 0;
  if (examMatches(question, exam)) score += 3;
  if (getQuestionSubject(question) === subject) score += 4;
  if (difficultyMatches(question, difficulty)) score += 2;
  if (question.type === "PYQ") score += 1;
  return score;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function selectQuizQuestions({
  allQuestions,
  exam,
  subject,
  difficulty,
  count,
}: {
  allQuestions: Question[];
  exam: PrepExam;
  subject: PrepSubject;
  difficulty: DifficultyMode;
  count: number;
}) {
  const ranked = [...allQuestions]
    .map(question => ({
      question,
      score: scoreQuestionFit(question, exam, subject, difficulty),
    }))
    .sort((left, right) => right.score - left.score);

  const perfect = ranked.filter(item => item.score >= 7).map(item => item.question);
  const fallback = ranked.filter(item => item.score < 7).map(item => item.question);
  return [...shuffle(perfect), ...shuffle(fallback)].slice(0, count);
}

export function createSessionId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `session-${Date.now()}`;
}

function toDateKey(value: string | Date) {
  return new Date(value).toLocaleDateString("en-CA");
}

export function getCurrentStreak(sessions: PracticeSessionRecord[]) {
  const days = new Set(sessions.map(session => toDateKey(session.completedAt)));
  if (days.size === 0) return 0;

  const cursor = new Date();
  let streak = 0;
  let currentKey = toDateKey(cursor);

  if (!days.has(currentKey)) {
    cursor.setDate(cursor.getDate() - 1);
    currentKey = toDateKey(cursor);
    if (!days.has(currentKey)) return 0;
  }

  while (days.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function getSevenDayActivity(sessions: PracticeSessionRecord[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = toDateKey(date);
    const completed = sessions.some(session => toDateKey(session.completedAt) === key);
    return {
      key,
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      completed,
      isToday: key === toDateKey(new Date()),
    };
  });
}

export function getDailySubject(preferences: PrepPreferences) {
  const pool = preferences.weakSubjects.length
    ? preferences.weakSubjects
    : PREP_SUBJECTS;
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date().getTime() - start.getTime();
  const day = Math.floor(diff / 86400000);
  return pool[day % pool.length];
}

export function getTodaysSession(
  sessions: PracticeSessionRecord[],
  subject: PrepSubject
) {
  const todayKey = toDateKey(new Date());
  return sessions.find(
    session =>
      toDateKey(session.completedAt) === todayKey && session.subject === subject
  );
}

export function getSubjectStats(sessions: PracticeSessionRecord[]) {
  const subjectMap = new Map<PrepSubject, SubjectStat>();

  for (const subject of PREP_SUBJECTS) {
    subjectMap.set(subject, {
      subject,
      totalQuestions: 0,
      correctCount: 0,
      accuracy: 0,
    });
  }

  for (const session of sessions) {
    const current = subjectMap.get(session.subject);
    if (!current) continue;
    current.totalQuestions += session.totalQuestions;
    current.correctCount += session.correctCount;
    current.accuracy = current.totalQuestions
      ? Math.round((current.correctCount / current.totalQuestions) * 100)
      : 0;
  }

  return Array.from(subjectMap.values()).sort((left, right) => {
    if (left.totalQuestions === 0 && right.totalQuestions === 0) {
      return PREP_SUBJECTS.indexOf(left.subject) - PREP_SUBJECTS.indexOf(right.subject);
    }
    return left.accuracy - right.accuracy;
  });
}

export function getProgressSummary(sessions: PracticeSessionRecord[]) {
  const totalQuestions = sessions.reduce(
    (sum, session) => sum + session.totalQuestions,
    0
  );
  const totalCorrect = sessions.reduce((sum, session) => sum + session.correctCount, 0);
  const totalTimeSec = sessions.reduce((sum, session) => sum + session.durationSec, 0);
  const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    totalQuestions,
    accuracy,
    totalTimeSec,
    streak: getCurrentStreak(sessions),
  };
}

export function getDailyAccuracySeries(sessions: PracticeSessionRecord[], range: 7 | 30 | 90) {
  return Array.from({ length: range }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (range - index - 1));
    const key = toDateKey(date);
    const daySessions = sessions.filter(session => toDateKey(session.completedAt) === key);
    const total = daySessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const correct = daySessions.reduce((sum, session) => sum + session.correctCount, 0);
    return {
      date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      accuracy: total ? Math.round((correct / total) * 100) : 0,
    };
  });
}

export function getWeakTopics(
  questions: Question[],
  sessions: PracticeSessionRecord[]
): TopicStat[] {
  const questionTopicMap = new Map<string | number, string>();
  for (const question of questions) {
    questionTopicMap.set(question.id, question.subtopic || question.topic);
  }

  const topicMap = new Map<string, { total: number; correct: number }>();

  for (const session of sessions) {
    for (const answer of session.answers) {
      const topic = questionTopicMap.get(answer.questionId) || answer.subject;
      const current = topicMap.get(topic) || { total: 0, correct: 0 };
      current.total += 1;
      if (answer.isCorrect) current.correct += 1;
      topicMap.set(topic, current);
    }
  }

  return Array.from(topicMap.entries())
    .map(([topic, value]) => ({
      topic,
      total: value.total,
      accuracy: value.total ? Math.round((value.correct / value.total) * 100) : 0,
    }))
    .sort((left, right) => left.accuracy - right.accuracy)
    .slice(0, 12);
}

export function getNinetyDayGrid(sessions: PracticeSessionRecord[]) {
  return Array.from({ length: 90 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (89 - index));
    const key = toDateKey(date);
    const session = sessions.find(item => toDateKey(item.completedAt) === key);
    return {
      key,
      practiced: Boolean(session),
      score: session ? `${session.correctCount}/${session.totalQuestions}` : "Rest day",
      label: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
    };
  });
}

export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function formatLongDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}
