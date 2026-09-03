export const courseRoutes = {
  home: "/",
  pretest: "/pretest",
  course: "/curso",
  scenarios: "/escenarios",
  posttest: "/postest",
  practice: "/practica",
  sources: "/fuentes",
} as const;

export type CourseRoute =
  | { page: "home" }
  | { page: "pretest" }
  | { page: "course" }
  | { page: "module"; moduleNumber: number }
  | { page: "scenarios" }
  | { page: "posttest" }
  | { page: "practice" }
  | { page: "sources" }
  | { page: "not-found" };

function normalizeSlashes(path: string): string {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const compact = withLeadingSlash.replace(/\/{2,}/g, "/");
  return compact.length > 1 ? compact.replace(/\/$/, "") : compact;
}

export function coursePathFromLocation(pathname: string, baseUrl: string): string {
  const basePath = normalizeSlashes(new URL(baseUrl, "https://course.local").pathname);
  const normalizedPathname = normalizeSlashes(pathname);

  if (basePath !== "/" && normalizedPathname === basePath) {
    return "/";
  }

  if (basePath !== "/" && normalizedPathname.startsWith(`${basePath}/`)) {
    return normalizeSlashes(normalizedPathname.slice(basePath.length));
  }

  return normalizedPathname;
}

export function courseHref(path: string, baseUrl: string): string {
  const normalizedPath = normalizeSlashes(path);
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return normalizedPath === "/" ? `${base}/` : `${base}${normalizedPath}`;
}

export function modulePath(moduleNumber: number): string {
  return `/curso/modulo/${moduleNumber}`;
}

export function matchCourseRoute(path: string): CourseRoute {
  const normalizedPath = normalizeSlashes(path);
  const exactRoutes: Record<string, CourseRoute> = {
    [courseRoutes.home]: { page: "home" },
    [courseRoutes.pretest]: { page: "pretest" },
    [courseRoutes.course]: { page: "course" },
    [courseRoutes.scenarios]: { page: "scenarios" },
    [courseRoutes.posttest]: { page: "posttest" },
    [courseRoutes.practice]: { page: "practice" },
    [courseRoutes.sources]: { page: "sources" },
  };

  if (exactRoutes[normalizedPath]) {
    return exactRoutes[normalizedPath];
  }

  const moduleMatch = normalizedPath.match(/^\/curso\/modulo\/(\d+)$/);
  if (moduleMatch) {
    const moduleNumber = Number(moduleMatch[1]);
    if (Number.isInteger(moduleNumber) && moduleNumber >= 1 && moduleNumber <= 9) {
      return { page: "module", moduleNumber };
    }
  }

  return { page: "not-found" };
}
