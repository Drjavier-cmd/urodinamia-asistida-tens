import {
  assessmentBank,
  assessmentBlueprint,
  bibliographyByModule,
  changeHistory,
  competencyProfiles,
  incidentScenarios,
  pendingClinicalItems,
  practicalItems,
  sourceLayers,
} from "../../training-data.ts";
import type { CourseDefinition } from "../../course-platform/types.ts";

export const URODYNAMICS_COURSE_ID = "urodinamia-asistida";

const modules = [
  { id: "fundamentos", title: "¿Qué es la urodinamia?", shortTitle: "Qué es" },
  { id: "senales", title: "¿Qué mide el equipo?", shortTitle: "Presiones" },
  { id: "equipo", title: "Preparar sala, equipo y materiales", shortTitle: "Sala y material" },
  { id: "flujo", title: "Realizar la uroflujometría libre", shortTitle: "Flujo libre" },
  { id: "residuo", title: "Medir residuo y trasladar el uroflujómetro", shortTitle: "Residuo y traslado" },
  { id: "cateteres", title: "Asistir la instalación y fijación", shortTitle: "Catéteres" },
  { id: "cero", title: "Sentar, conectar, nivelar y hacer cero", shortTitle: "Conexión y cero" },
  { id: "llenado", title: "Asistir la fase de llenado", shortTitle: "Llenado" },
  { id: "vaciado", title: "Registrar el vaciado y cerrar el estudio", shortTitle: "Vaciado" },
];

const equipmentLayer = sourceLayers.find((layer) => layer.name === "Manual del equipo");
const protocolLayer = sourceLayers.find((layer) => layer.name === "Protocolo local");

export const urodynamicsCourseDefinition: CourseDefinition = {
  id: URODYNAMICS_COURSE_ID,
  slug: "urodinamia-asistida",
  href: "/",
  title: "Urodinamia asistida",
  summary: "Entrenamiento didáctico digital para TENS que participan asistiendo en urodinamias.",
  lifecycleStatus: "active",
  modules: modules.map((module) => ({
    ...module,
    status: "available",
    objective: null,
  })),
  competencies: competencyProfiles.map((profile) => ({
    ...profile,
    status: "available",
  })),
  assessment: {
    status: "available",
    passingPercentage: 80,
    questions: assessmentBank,
    pretestQuestionIds: assessmentBlueprint.pretestIds,
    posttestQuestionIds: assessmentBlueprint.posttestIds,
    criticalQuestionIds: assessmentBlueprint.posttestCriticalIds,
  },
  criticalFailures: [],
  scenarios: incidentScenarios.map((scenario) => ({
    ...scenario,
    status: "available",
  })),
  checklist: practicalItems.map((item) => ({
    ...item,
    status: "available",
  })),
  bibliography: bibliographyByModule,
  governance: {
    author: {
      name: "Docente responsable del curso",
      status: "pending-author-approval",
    },
    reviewer: {
      name: "Pendiente",
      status: "pending-reviewer-approval",
    },
    version: changeHistory[0]?.version ?? "0.8",
    reviewDate: changeHistory[0]?.date ?? null,
    institutionalProtocol: {
      name: "Protocolo local",
      status: "pending-institutional-protocol",
      description: protocolLayer?.description ?? "Pendiente de aprobación institucional.",
    },
    equipment: {
      name: "Manual y modelo del equipo",
      status: "pending-institutional-protocol",
      description: equipmentLayer?.description ?? "Pendiente de anexar.",
    },
  },
  pendingApprovals: pendingClinicalItems.map((title, index) => ({
    id: `urodinamia-pendiente-${index + 1}`,
    title,
    owners: ["Autor clínico", "Revisor", "Institución"],
  })),
};
