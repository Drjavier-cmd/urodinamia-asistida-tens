"use client";

import { useMemo, useState } from "react";
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
  type AssessmentQuestion,
} from "./training-data";
import type { CourseChecklistStatus } from "./course-platform/state";
import { buildAssessment, derivePdetSeries, evaluateAssessment } from "./training-logic";

type AssessmentMode = "pretest" | "postest";
type PracticalStatus = CourseChecklistStatus;
type ScenarioPhase = "detect" | "notify";

const practicalStatus: Array<{ id: PracticalStatus; label: string }> = [
  { id: "not-observed", label: "No observado" },
  { id: "assisted", label: "Con ayuda" },
  { id: "achieved", label: "Logrado" },
];

const scenarioPhases: Array<{ id: ScenarioPhase; number: string; label: string }> = [
  { id: "detect", number: "01", label: "Detectar" },
  { id: "notify", number: "02", label: "Avisar" },
];

export function TrainingRoadmap({
  onGoToPretest,
  onGoToCourse,
  onGoToScenarios,
  onGoToPosttest,
  onGoToPractice,
}: {
  onGoToPretest: () => void;
  onGoToCourse: () => void;
  onGoToScenarios: () => void;
  onGoToPosttest: () => void;
  onGoToPractice: () => void;
}) {
  const steps = [
    { number: "01", title: "Pretest", detail: "Línea base sin aprobación", action: onGoToPretest },
    { number: "02", title: "Curso guiado", detail: "9 módulos en orden de sala", action: onGoToCourse },
    { number: "03", title: "Escenarios", detail: "Detectar y avisar", action: onGoToScenarios },
    { number: "04", title: "Postest", detail: "Umbral interno: 80% + críticas", action: onGoToPosttest },
    { number: "05", title: "Práctica", detail: "Observación y firma del supervisor", action: onGoToPractice },
  ];

  return (
    <section className="training-roadmap" id="ruta-formacion" aria-labelledby="training-roadmap-title">
      <header>
        <div>
          <p className="eyebrow">Ruta de capacitación</p>
          <h2 id="training-roadmap-title">La web enseña; la sala demuestra competencia</h2>
        </div>
        <p>El postest permite alcanzar un umbral interno de aprobación teórica. No acredita identidad, competencia práctica ni autorización institucional.</p>
      </header>
      <ol>
        {steps.map((step) => (
          <li key={step.number}>
            <button type="button" onClick={step.action}>
              <span>{step.number}</span>
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CompetencyMatrix() {
  const [activeId, setActiveId] = useState(competencyProfiles[0].id);
  const profile = competencyProfiles.find((item) => item.id === activeId) ?? competencyProfiles[0];
  const columns = [
    { title: "Debe saber", items: profile.know, className: "matrix-know" },
    { title: "Debe reconocer", items: profile.recognize, className: "matrix-recognize" },
    { title: "Debe ejecutar", items: profile.execute, className: "matrix-execute" },
    { title: "Fuera de alcance", items: profile.outside, className: "matrix-outside" },
  ];

  return (
    <section className="training-section competency-section" id="competencias" aria-labelledby="competency-title">
      <header className="training-section-header">
        <div>
          <p className="eyebrow">Matriz de competencias</p>
          <h2 id="competency-title">Responsabilidades formativas por perfil</h2>
        </div>
        <p>Esta matriz organiza el entrenamiento. Las atribuciones reales dependen del protocolo y la autorización del centro.</p>
      </header>
      <div className="profile-selector" role="tablist" aria-label="Perfiles de competencia">
        {competencyProfiles.map((item) => (
          <button
            type="button"
            role="tab"
            key={item.id}
            onClick={() => setActiveId(item.id)}
            aria-selected={activeId === item.id}
          >
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
          </button>
        ))}
      </div>
      <div className="competency-grid" role="tabpanel">
        {columns.map((column) => (
          <article className={column.className} key={column.title}>
            <h3>{column.title}</h3>
            <ul>
              {column.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </div>
      <p className="scope-banner"><strong>Límite explícito:</strong> terminar la web no autoriza a realizar tareas invasivas, interpretar curvas ni certificar competencia.</p>
    </section>
  );
}

type AssessmentProps = {
  mode: AssessmentMode;
  onReviewModule: (id: string) => void;
  unlocked?: boolean;
  courseProgress?: number;
  onGoToCourse?: () => void;
  onContinue?: () => void;
  onGoToPractice?: () => void;
  onResult?: (passed: boolean) => void;
};

export function Assessment({
  mode,
  onReviewModule,
  unlocked = true,
  courseProgress = 0,
  onGoToCourse,
  onContinue,
  onGoToPractice,
  onResult,
}: AssessmentProps) {
  const isPost = mode === "postest";
  const questionCount = isPost ? 10 : 8;
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(
    () => evaluateAssessment(
      questions,
      answers,
      isPost ? assessmentBlueprint.posttestCriticalIds : [],
    ),
    [answers, isPost, questions],
  );
  const { score, mistakes, criticalMistakes } = result;
  const passed = isPost && result.passed;

  function start() {
    if (!unlocked) return;
    setQuestions(buildAssessment(assessmentBank, assessmentBlueprint, mode, questionCount));
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
    onResult?.(false);
  }

  function finish() {
    setSubmitted(true);
    onResult?.(result.passed);
  }

  if (isPost && !unlocked) {
    return (
      <section className="training-section assessment-section posttest locked-section" id="postest" aria-labelledby="posttest-locked-title">
        <div className="locked-panel">
          <p className="eyebrow">Evaluación teórica bloqueada</p>
          <h2 id="posttest-locked-title">Completa primero los nueve módulos</h2>
          <p>El postest se habilita con 100% del recorrido guiado. Progreso actual: <strong>{courseProgress}%</strong>.</p>
          <button type="button" className="primary-button" onClick={onGoToCourse}>Volver al curso<span aria-hidden="true">→</span></button>
        </div>
      </section>
    );
  }

  if (!questions.length) {
    return (
      <section className={`training-section assessment-section ${mode}`} id={mode} aria-labelledby={`${mode}-title`}>
        <div className="assessment-intro">
          <div>
            <p className="eyebrow">{isPost ? "Evaluación teórica" : "Diagnóstico inicial"}</p>
            <h2 id={`${mode}-title`}>{isPost ? "Postest estratificado" : "Pretest diagnóstico"}</h2>
            <p>{isPost
              ? "Diez preguntas de un banco independiente, con todos los dominios representados. El umbral interno exige 80% y todas las preguntas críticas correctas."
              : "Ocho preguntas de un banco diagnóstico independiente. El orden y las alternativas cambian en cada intento; no aprueba ni reprueba."}</p>
          </div>
          <div className="assessment-rules" aria-label="Reglas de evaluación">
            <span><b>{questionCount}</b> preguntas</span>
            <span><b>{isPost ? "8" : "Sin nota"}</b> {isPost ? "dominios" : "diagnóstico"}</span>
            <span><b>{isPost ? "80%" : "Banco"}</b> {isPost ? "mínimo" : "independiente"}</span>
            <span><b>{isPost ? "100%" : "Aleatorio"}</b> {isPost ? "preguntas críticas" : "orden y alternativas"}</span>
          </div>
          <button type="button" className="primary-button" onClick={start}>
            {isPost ? "Iniciar postest" : "Iniciar pretest"}<span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className={`training-section assessment-section ${mode}`} id={mode} aria-labelledby={`${mode}-result-title`}>
        <div className={`assessment-result ${isPost ? (passed ? "passed" : "needs-review") : "baseline"}`}>
          <div className="score-ring" aria-label={`${score}% de respuestas correctas`}><strong>{score}%</strong><span>{questions.length - mistakes.length}/{questions.length}</span></div>
          <div>
            <p className="eyebrow">{isPost ? "Resultado teórico" : "Línea base"}</p>
            <h2 id={`${mode}-result-title`}>{isPost
              ? (passed ? "Umbral interno alcanzado" : (criticalMistakes.length ? "Recuperación crítica requerida" : "Recuperación dirigida requerida"))
              : "Pretest completado"}</h2>
            <p>{isPost
              ? (passed
                ? "Se alcanzó el umbral interno de aprobación teórica. Este resultado no verifica identidad ni competencia práctica."
                : criticalMistakes.length
                  ? "Una o más preguntas críticas fueron incorrectas. Deben corregirse aunque el puntaje total sea 80% o superior."
                  : "Revisa los módulos señalados y realiza un nuevo intento. Este resultado no autoriza práctica autónoma.")
              : "Usa los errores para decidir qué módulos requieren mayor atención antes de avanzar."}</p>
          </div>
        </div>
        {mistakes.length > 0 ? (
          <div className="remediation-list">
            <div className="remediation-heading"><span>Recuperación dirigida</span><strong>{mistakes.length} tema{mistakes.length === 1 ? "" : "s"} por revisar</strong></div>
            {mistakes.map((question) => (
              <article key={question.id}>
                <div>
                  <span>{question.domain}</span>
                  <strong>{question.prompt}</strong>
                  <p>{question.rationale}</p>
                </div>
                <button type="button" className="secondary-button" onClick={() => onReviewModule(question.moduleId)}>Ir a {question.moduleTitle}</button>
              </article>
            ))}
          </div>
        ) : (
          <p className="perfect-result">Todas las respuestas fueron correctas en este intento.</p>
        )}
        <div className="assessment-result-actions">
          <button type="button" className="secondary-button" onClick={start}>Nuevo banco aleatorio</button>
          {isPost && passed && <button type="button" className="primary-button" onClick={onGoToPractice}>Ir a evaluación práctica<span aria-hidden="true">→</span></button>}
          {!isPost && <button type="button" className="primary-button" onClick={onContinue}>Comenzar módulos<span aria-hidden="true">→</span></button>}
        </div>
      </section>
    );
  }

  const question = questions[currentIndex];
  const selected = answers[question.id];
  const answered = selected !== undefined;

  return (
    <section className={`training-section assessment-section ${mode}`} id={mode} aria-labelledby={`${mode}-question-title`}>
      <div className="assessment-toolbar">
        <div>
          <p className="eyebrow">{isPost ? "Postest" : "Pretest"} · Pregunta {currentIndex + 1}</p>
          <strong>{currentIndex + 1} de {questions.length}</strong>
        </div>
        <div className="assessment-progress" aria-label={`${Math.round(((currentIndex + 1) / questions.length) * 100)}% del test`}>
          <span style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </div>
      <div className="assessment-question">
        <span>{question.domain}</span>
        <h2 id={`${mode}-question-title`}>{question.prompt}</h2>
        <div className="assessment-options">
          {question.options.map((option, index) => (
            <button
              type="button"
              key={option}
              onClick={() => setAnswers((current) => ({ ...current, [question.id]: index }))}
              aria-pressed={selected === index}
            >
              <span>{String.fromCharCode(65 + index)}</span>{option}
            </button>
          ))}
        </div>
      </div>
      <footer className="assessment-footer">
        <button type="button" className="secondary-button" onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} disabled={currentIndex === 0}>Anterior</button>
        <small>Las respuestas correctas se muestran al finalizar.</small>
        {currentIndex === questions.length - 1 ? (
          <button type="button" className="primary-button" onClick={finish} disabled={!answered}>Finalizar</button>
        ) : (
          <button type="button" className="primary-button" onClick={() => setCurrentIndex((index) => index + 1)} disabled={!answered}>Siguiente<span aria-hidden="true">→</span></button>
        )}
      </footer>
    </section>
  );
}

function PabdLossCurves() {
  const pves = [36, 36, 37, 36, 36, 68, 39, 36, 36, 37, 36];
  const pabd = [24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];
  const pdet = derivePdetSeries(pves, pabd);
  const series = [
    { name: "Pves", values: pves, row: 45, className: "pves" },
    { name: "Pabd", values: pabd, row: 105, className: "pabd" },
    { name: "Pdet", values: pdet, row: 165, className: "pdet" },
  ];

  function points(values: number[], row: number) {
    const baseline = values[0];
    return values.map((value, index) => {
      const x = 78 + (index * 430) / (values.length - 1);
      const y = row - (value - baseline) * 0.78;
      return `${x},${y}`;
    }).join(" ");
  }

  return (
    <figure className="scenario-curves">
      <figcaption>
        <strong>Ejemplo de curvas durante la tos</strong>
        <span>Pdet se calcula punto a punto como Pves − Pabd.</span>
      </figcaption>
      <svg viewBox="0 0 530 190" role="img" aria-label="Pves responde a la tos, Pabd permanece plana y Pdet muestra el cambio derivado">
        <path className="scenario-grid" d="M70 45 H518 M70 105 H518 M70 165 H518" />
        <path className="cough-marker" d="M293 18 V177" />
        <text className="cough-label" x="300" y="17">Tos</text>
        {series.map((item) => (
          <g key={item.name} className={`scenario-series series-${item.className}`}>
            <text x="8" y={item.row + 5}>{item.name}</text>
            <polyline points={points(item.values, item.row)} />
          </g>
        ))}
      </svg>
      <p>Durante la tos, Pves responde, Pabd permanece plana y el cambio de Pdet resulta de la resta. El gráfico muestra la discordancia técnica; no establece un diagnóstico.</p>
    </figure>
  );
}

export function ScenarioLab() {
  const [scenarioId, setScenarioId] = useState(incidentScenarios[0].id);
  const [phase, setPhase] = useState<ScenarioPhase>("detect");
  const scenario = incidentScenarios.find((item) => item.id === scenarioId) ?? incidentScenarios[0];
  const activePhase = scenarioPhases.find((item) => item.id === phase) ?? scenarioPhases[0];

  function chooseScenario(id: string) {
    setScenarioId(id);
    setPhase("detect");
  }

  return (
    <section className="training-section scenario-section" id="escenarios" aria-labelledby="scenario-title">
      <header className="training-section-header">
        <div>
          <p className="eyebrow">Laboratorio de decisiones</p>
          <h2 id="scenario-title">Detectar y avisar</h2>
        </div>
        <p>El TENS reconoce el hallazgo y lo comunica. La interpretación del registro y la decisión correctiva corresponden al profesional responsable.</p>
      </header>
      <div className="scenario-workspace">
        <nav className="scenario-nav" aria-label="Escenarios de sala">
          {incidentScenarios.map((item) => (
            <button key={item.id} type="button" onClick={() => chooseScenario(item.id)} aria-current={item.id === scenarioId ? "true" : undefined}>
              <span>{item.priority}</span><strong>{item.title}</strong>
            </button>
          ))}
        </nav>
        <article className="scenario-stage">
          <div className="scenario-cue">
            <span>{scenario.priority}</span>
            <h3>{scenario.title}</h3>
            <p>{scenario.cue}</p>
          </div>
          {scenario.id === "pabd-loss" && <PabdLossCurves />}
          <div className="scenario-phase-tabs" role="tablist" aria-label="Secuencia de respuesta">
            {scenarioPhases.map((item) => (
              <button type="button" role="tab" key={item.id} onClick={() => setPhase(item.id)} aria-selected={phase === item.id}>
                <span>{item.number}</span><strong>{item.label}</strong>
              </button>
            ))}
          </div>
          <div className={`scenario-response phase-${phase}`} role="tabpanel">
            <span>Paso {activePhase.number}</span>
            <h3>{activePhase.label}</h3>
            <p>{scenario[phase]}</p>
          </div>
          <p className="scenario-limit"><strong>Regla común:</strong> el TENS no decide si el trazado se acepta ni corrige el circuito de forma autónoma. Solo detiene por iniciativa propia ante compromiso vital inmediato; en los demás casos detecta, avisa y sigue la indicación profesional.</p>
        </article>
      </div>
    </section>
  );
}

export function PracticalEvaluation({
  unlocked,
  onGoToPosttest,
  statuses,
  onStatusesChange,
}: {
  unlocked: boolean;
  onGoToPosttest: () => void;
  statuses: Record<string, PracticalStatus>;
  onStatusesChange: (statuses: Record<string, PracticalStatus>) => void;
}) {
  const [participant, setParticipant] = useState("");
  const [evaluator, setEvaluator] = useState("");
  const [center, setCenter] = useState("");
  const [equipment, setEquipment] = useState("");
  const [date, setDate] = useState("");
  const [session, setSession] = useState("");
  const [notes, setNotes] = useState("");

  const groups = useMemo(() => {
    return practicalItems.reduce<Record<string, typeof practicalItems>>((result, item) => {
      result[item.group] = [...(result[item.group] ?? []), item];
      return result;
    }, {});
  }, []);

  const counts = practicalItems.reduce(
    (result, item) => {
      const status = statuses[item.id] ?? "not-observed";
      result[status] += 1;
      return result;
    },
    { "not-observed": 0, assisted: 0, achieved: 0 } as Record<PracticalStatus, number>,
  );
  const allItemsAchieved = counts.achieved === practicalItems.length;
  const metadataComplete = [participant, evaluator, center, equipment, date, session].every((value) => value.trim());
  const readyForReview = allItemsAchieved && metadataComplete;

  if (!unlocked) {
    return (
      <section className="training-section practical-section locked-section" id="practica" aria-labelledby="practical-locked-title">
        <div className="locked-panel">
          <p className="eyebrow">Evaluación práctica bloqueada</p>
          <h2 id="practical-locked-title">Primero alcanza el umbral interno del postest</h2>
          <p>La pauta web se habilita solo después de obtener al menos 80% y responder correctamente todas las preguntas críticas.</p>
          <button type="button" className="primary-button" onClick={onGoToPosttest}>Ir al postest<span aria-hidden="true">→</span></button>
        </div>
      </section>
    );
  }

  return (
    <section className="training-section practical-section" id="practica" aria-labelledby="practical-title">
      <header className="training-section-header">
        <div>
          <p className="eyebrow">Evaluación práctica supervisada</p>
          <h2 id="practical-title">Checklist de desempeño en sala</h2>
        </div>
        <p>Debe completarlo un supervisor durante observación directa. El sitio solo organiza el registro y no emite una certificación.</p>
      </header>
      <div className="practical-meta">
        <label><span>Participante</span><input value={participant} onChange={(event) => setParticipant(event.target.value)} placeholder="Nombre e identificación local" /></label>
        <label><span>Supervisor</span><input value={evaluator} onChange={(event) => setEvaluator(event.target.value)} placeholder="Nombre y cargo" /></label>
        <label><span>Centro / unidad</span><input value={center} onChange={(event) => setCenter(event.target.value)} placeholder="Servicio o unidad" /></label>
        <label><span>Equipo / software</span><input value={equipment} onChange={(event) => setEquipment(event.target.value)} placeholder="Modelo y versión" /></label>
        <label><span>Fecha</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label><span>Sesión / intento</span><input value={session} onChange={(event) => setSession(event.target.value)} placeholder="Número o código local" /></label>
      </div>
      <p className="practical-record-note">Los datos permanecen en esta sesión del navegador. Para registro institucional, imprime la pauta o utiliza el PDF aprobado por el centro.</p>
      <div className="practical-summary" aria-label="Resumen de la evaluación">
        <span><b>{counts.achieved}</b> logrados</span>
        <span><b>{counts.assisted}</b> con ayuda</span>
        <span><b>{counts["not-observed"]}</b> no observados</span>
      </div>
      <div className="practical-groups">
        {Object.entries(groups).map(([group, items]) => (
          <section key={group}>
            <h3>{group}</h3>
            {items.map((item) => (
              <article className="practical-item" key={item.id}>
                <div className="practical-copy">
                  <span>{item.layer}</span>
                  <strong>{item.label}</strong>
                  <p>{item.evidence}</p>
                </div>
                <div className="status-control" role="group" aria-label={`Resultado: ${item.label}`}>
                  {practicalStatus.map((status) => (
                    <button
                      type="button"
                      key={status.id}
                      onClick={() => onStatusesChange({ ...statuses, [item.id]: status.id })}
                      aria-pressed={(statuses[item.id] ?? "not-observed") === status.id}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>
      <label className="practical-notes"><span>Observaciones y recuperación requerida</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} /></label>
      <div className={`practical-decision ${readyForReview ? "ready-review" : "incomplete"}`}>
        <div>
          <span>Estado del checklist</span>
          <strong>{readyForReview ? "Completo para revisión y firma" : (allItemsAchieved ? "Faltan datos de identificación" : "Evaluación incompleta")}</strong>
          <p>{readyForReview
            ? "Todos los ítems y campos están completos, pero la competencia existe solo cuando el supervisor y el centro la aprueban."
            : allItemsAchieved
              ? "Completa participante, supervisor, centro, equipo, fecha y sesión antes de imprimir."
              : "Los ítems con ayuda o no observados requieren práctica adicional y nueva observación."}</p>
        </div>
        <button type="button" className="secondary-button" onClick={() => window.print()}>Imprimir checklist</button>
      </div>
    </section>
  );
}

export function GovernanceAndDownloads() {
  const [tab, setTab] = useState<"governance" | "sources" | "downloads">("governance");

  return (
    <section className="training-section governance-section" id="gobierno" aria-labelledby="governance-title">
      <header className="training-section-header">
        <div>
          <p className="eyebrow">Gobierno científico</p>
          <h2 id="governance-title">Autoría, fuentes, versión y materiales</h2>
        </div>
        <p>El docente define el contenido clínico. La implementación digital organiza y programa el material, sin asumir autoría ni aprobación clínica.</p>
      </header>
      <div className="governance-tabs" role="tablist" aria-label="Gobierno científico y descargas">
        <button type="button" role="tab" onClick={() => setTab("governance")} aria-selected={tab === "governance"}>Gobierno</button>
        <button type="button" role="tab" onClick={() => setTab("sources")} aria-selected={tab === "sources"}>Fuentes por módulo</button>
        <button type="button" role="tab" onClick={() => setTab("downloads")} aria-selected={tab === "downloads"}>Paquete de capacitación</button>
      </div>

      <div className="governance-panel" role="tabpanel" hidden={tab !== "governance"}>
        <div className="governance-roles">
          <article><span>Autor y docente clínico</span><strong>Docente responsable del curso</strong><p>Nombre de publicación pendiente de completar.</p></article>
          <article><span>Revisor clínico</span><strong>Pendiente</strong><p>Debe ser designado y aprobar la versión institucional.</p></article>
          <article><span>Implementación digital</span><strong>Asistencia técnica</strong><p>Organización, diseño y programación; sin autoría clínica.</p></article>
          <article><span>Versión vigente</span><strong>0.8 · Borrador docente</strong><p>Revisión de trabajo: 23 julio 2026.</p></article>
        </div>
        <div className="source-layer-grid">
          {sourceLayers.map((layer) => (
            <article key={layer.name}>
              <span>{layer.status}</span><strong>{layer.name}</strong><p>{layer.description}</p>
            </article>
          ))}
        </div>
        <div className="safety-lock">
          <span>Contenido bloqueado hasta validación</span>
          <h3>Seguridad, infecciones y criterios de suspensión</h3>
          <p>La versión institucional deberá definir higiene, desinfección, residuos, prevención de contaminación y escalamiento. No se incorporan instrucciones operativas hasta la aprobación del docente y del centro.</p>
        </div>
        <div className="pending-grid">
          <div>
            <h3>Pendientes científicos e institucionales</h3>
            <ul>{pendingClinicalItems.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div>
            <h3>Historial de cambios</h3>
            {changeHistory.map((item) => (
              <article className="change-row" key={item.version}>
                <span>v{item.version}</span><div><strong>{item.date}</strong><p>{item.change}</p></div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="governance-panel" role="tabpanel" hidden={tab !== "sources"}>
        <div className="bibliography-list">
          {bibliographyByModule.map((entry) => (
            <article key={entry.module}>
              <span>{entry.module}</span>
              {entry.href ? <a href={entry.href} target="_blank" rel="noreferrer">{entry.source}</a> : <strong>{entry.source}</strong>}
            </article>
          ))}
        </div>
        <p className="source-note">Las fuentes generales no sustituyen el manual del equipo ni el protocolo local. La técnica de fijación se conserva como contenido docente del autor.</p>
      </div>

      <div className="governance-panel" role="tabpanel" hidden={tab !== "downloads"}>
        <div className="download-grid">
          <a href="/downloads/Paquete_Capacitacion_Urodinamia_Asistida.docx" download>
            <span>DOCX editable</span><strong>Paquete para Capacitación</strong><p>Ficha institucional, programa, objetivos, guía del relator, respuestas, rúbrica y hoja de adaptación.</p>
          </a>
          <a href="/downloads/Checklist_Practico_Supervisado.pdf" download>
            <span>PDF imprimible</span><strong>Checklist práctico</strong><p>Registro de observación, resultado por ítem, comentarios y firmas.</p>
          </a>
          <a href="/downloads/Urodinamia_Asistida_Paquete_Institucional.zip" download>
            <span>Archivo completo</span><strong>Paquete institucional</strong><p>Documento editable, checklist DOCX y checklist PDF en una sola descarga.</p>
          </a>
        </div>
        <p className="download-warning"><strong>Borrador no acreditante.</strong> Requiere completar autor, revisor, equipo, protocolo local y aprobación institucional antes de uso formal.</p>
      </div>
    </section>
  );
}
