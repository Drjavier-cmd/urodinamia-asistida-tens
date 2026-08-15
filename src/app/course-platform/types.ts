export type ApprovalStatus =
  | "approved"
  | "pending-author-approval"
  | "pending-reviewer-approval"
  | "pending-institutional-protocol";

export type CourseLifecycleStatus = "active" | "architecture-only";
export type CourseContentStatus = "available" | "pending-approval";

export type CourseModuleDefinition = {
  id: string;
  title: string;
  shortTitle: string;
  status: CourseContentStatus;
  objective: string | null;
};

export type CourseCompetencyDefinition = {
  id: string;
  title: string;
  subtitle: string;
  know: string[];
  recognize: string[];
  execute: string[];
  outside: string[];
  status?: CourseContentStatus;
};

export type CourseAssessmentQuestion = {
  id: string;
  domain: string;
  moduleId: string;
  moduleTitle: string;
  prompt: string;
  options: string[];
  answer: number;
  rationale: string;
};

export type CourseAssessmentDefinition = {
  status: CourseContentStatus;
  passingPercentage: number | null;
  questions: CourseAssessmentQuestion[];
  pretestQuestionIds: readonly string[];
  posttestQuestionIds: readonly string[];
  criticalQuestionIds: readonly string[];
};

export type CourseCriticalFailureDefinition = {
  id: string;
  title: string;
  description: string;
  independentOfPercentage: true;
  status: CourseContentStatus;
};

export type CourseScenarioDefinition = {
  id: string;
  title: string;
  cue: string;
  priority: string;
  detect: string;
  notify: string;
  status?: CourseContentStatus;
};

export type CourseChecklistItemDefinition = {
  id: string;
  group: string;
  label: string;
  evidence: string;
  layer: string;
  status?: CourseContentStatus;
};

export type CourseBibliographyEntry = {
  module: string;
  source: string;
  href: string;
};

export type GovernanceParty = {
  name: string;
  status: ApprovalStatus;
};

export type ApplicabilityDefinition = {
  name: string;
  status: ApprovalStatus;
  description: string;
};

export type CourseGovernanceDefinition = {
  author: GovernanceParty;
  reviewer: GovernanceParty;
  version: string;
  reviewDate: string | null;
  institutionalProtocol: ApplicabilityDefinition;
  equipment: ApplicabilityDefinition;
};

export type PendingApproval = {
  id: string;
  title: string;
  owners: string[];
};

export type CourseDefinition = {
  id: string;
  slug: string;
  href: string;
  title: string;
  summary: string;
  lifecycleStatus: CourseLifecycleStatus;
  modules: CourseModuleDefinition[];
  competencies: CourseCompetencyDefinition[];
  assessment: CourseAssessmentDefinition;
  criticalFailures: CourseCriticalFailureDefinition[];
  scenarios: CourseScenarioDefinition[];
  checklist: CourseChecklistItemDefinition[];
  bibliography: CourseBibliographyEntry[];
  governance: CourseGovernanceDefinition;
  pendingApprovals: PendingApproval[];
};
