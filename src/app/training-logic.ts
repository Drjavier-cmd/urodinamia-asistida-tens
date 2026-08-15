import type { AssessmentBlueprint, AssessmentQuestion } from "./training-data";
export { safeReadJson, safeWriteJson } from "./course-platform/state.ts";

export type AssessmentMode = "pretest" | "postest";

export type AssessmentResult = {
  correctCount: number;
  score: number;
  mistakes: AssessmentQuestion[];
  criticalMistakes: AssessmentQuestion[];
  passed: boolean;
};

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function shuffleQuestionOptions(question: AssessmentQuestion, random: () => number): AssessmentQuestion {
  const choices = question.options.map((label, index) => ({
    label,
    correct: index === question.answer,
  }));
  const shuffledChoices = shuffle(choices, random);

  return {
    ...question,
    options: shuffledChoices.map((choice) => choice.label),
    answer: shuffledChoices.findIndex((choice) => choice.correct),
  };
}

export function buildAssessment(
  bank: AssessmentQuestion[],
  blueprint: AssessmentBlueprint,
  mode: AssessmentMode,
  count: number,
  random: () => number = Math.random,
): AssessmentQuestion[] {
  const poolIds = new Set(mode === "pretest" ? blueprint.pretestIds : blueprint.posttestIds);
  const pool = bank.filter((question) => poolIds.has(question.id));

  if (pool.length < count) {
    throw new Error(`El banco ${mode} no contiene ${count} preguntas elegibles.`);
  }

  if (mode === "pretest") {
    return shuffle(pool, random).slice(0, count).map((question) => shuffleQuestionOptions(question, random));
  }

  const selected = new Map<string, AssessmentQuestion>();
  const criticalIds = new Set(blueprint.posttestCriticalIds);

  pool.filter((question) => criticalIds.has(question.id)).forEach((question) => {
    selected.set(question.id, question);
  });

  const domains = [...new Set(pool.map((question) => question.domain))];
  domains.forEach((domain) => {
    if ([...selected.values()].some((question) => question.domain === domain)) return;
    const candidate = shuffle(
      pool.filter((question) => question.domain === domain && !selected.has(question.id)),
      random,
    )[0];
    if (candidate) selected.set(candidate.id, candidate);
  });

  if (selected.size > count) {
    throw new Error("La pauta del postest exige más preguntas que el tamaño configurado.");
  }

  shuffle(pool.filter((question) => !selected.has(question.id)), random)
    .slice(0, count - selected.size)
    .forEach((question) => selected.set(question.id, question));

  return shuffle([...selected.values()], random).map((question) => shuffleQuestionOptions(question, random));
}

export function evaluateAssessment(
  questions: AssessmentQuestion[],
  answers: Record<string, number>,
  criticalIds: readonly string[],
  threshold = 80,
): AssessmentResult {
  const mistakes = questions.filter((question) => answers[question.id] !== question.answer);
  const criticalSet = new Set(criticalIds);
  const criticalMistakes = mistakes.filter((question) => criticalSet.has(question.id));
  const correctCount = questions.length - mistakes.length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  return {
    correctCount,
    score,
    mistakes,
    criticalMistakes,
    passed: questions.length > 0 && score >= threshold && criticalMistakes.length === 0,
  };
}

export function deriveCompletedStageIds(
  stages: Array<{ id: string; question: { answer: number } }>,
  answers: Record<string, number>,
): string[] {
  return stages
    .filter((stage) => answers[stage.id] === stage.question.answer)
    .map((stage) => stage.id);
}

export function derivePdetSeries(pves: number[], pabd: number[]): number[] {
  if (pves.length !== pabd.length) {
    throw new Error("Pves y Pabd deben tener la misma cantidad de puntos.");
  }
  return pves.map((value, index) => value - pabd[index]);
}
