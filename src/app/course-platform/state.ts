export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type CourseChecklistStatus = "not-observed" | "assisted" | "achieved";

export type CourseRuntimeState = {
  schemaVersion: 1;
  courseId: string;
  courseVersion: string;
  activeModuleId: string | null;
  moduleAnswers: Record<string, number>;
  completedModuleIds: string[];
  posttest: {
    passed: boolean;
    attemptCount: number;
  };
  checklist: {
    statuses: Record<string, CourseChecklistStatus>;
    criticalFailureIds: string[];
  };
};

export function safeReadJson<T>(storage: StorageLike, key: string): T | null {
  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

export function safeWriteJson(storage: StorageLike, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function courseStateStorageKey(courseId: string, courseVersion: string): string {
  return `urology-training:${encodeURIComponent(courseId)}:${encodeURIComponent(courseVersion)}:state`;
}

export function createCourseRuntimeState(
  courseId: string,
  courseVersion: string,
): CourseRuntimeState {
  return {
    schemaVersion: 1,
    courseId,
    courseVersion,
    activeModuleId: null,
    moduleAnswers: {},
    completedModuleIds: [],
    posttest: {
      passed: false,
      attemptCount: 0,
    },
    checklist: {
      statuses: {},
      criticalFailureIds: [],
    },
  };
}

export function readCourseRuntimeState(
  storage: StorageLike,
  courseId: string,
  courseVersion: string,
): CourseRuntimeState | null {
  const stored = safeReadJson<Partial<CourseRuntimeState>>(
    storage,
    courseStateStorageKey(courseId, courseVersion),
  );

  if (
    !stored
    || stored.schemaVersion !== 1
    || stored.courseId !== courseId
    || stored.courseVersion !== courseVersion
  ) {
    return null;
  }

  const initial = createCourseRuntimeState(courseId, courseVersion);
  return {
    ...initial,
    ...stored,
    moduleAnswers: stored.moduleAnswers ?? {},
    completedModuleIds: stored.completedModuleIds ?? [],
    posttest: {
      ...initial.posttest,
      ...(stored.posttest ?? {}),
    },
    checklist: {
      ...initial.checklist,
      ...(stored.checklist ?? {}),
      statuses: stored.checklist?.statuses ?? {},
      criticalFailureIds: stored.checklist?.criticalFailureIds ?? [],
    },
  };
}

export function writeCourseRuntimeState(
  storage: StorageLike,
  state: CourseRuntimeState,
): boolean {
  return safeWriteJson(
    storage,
    courseStateStorageKey(state.courseId, state.courseVersion),
    state,
  );
}
