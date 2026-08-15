"use client";

import { useEffect, useMemo, useState } from "react";
import { TrainingCompletion, TrainingPreparation } from "../../training-center";
import {
  createCourseRuntimeState,
  readCourseRuntimeState,
  safeReadJson,
  writeCourseRuntimeState,
  type CourseChecklistStatus,
} from "../../course-platform/state";
import {
  deriveCompletedStageIds,
  derivePdetSeries,
} from "../../training-logic";
import {
  URODYNAMICS_COURSE_ID,
  urodynamicsCourseDefinition,
} from "./definition";

type Question = {
  prompt: string;
  options: string[];
  answer: number;
  success: string;
  retry: string;
};

type Stage = {
  id: string;
  tag: string;
  title: string;
  shortTitle: string;
  time: string;
  lead: string;
  objective: string;
  image: string;
  mobileImage?: string;
  imageAlt: string;
  imageCaption: string;
  imageClass?: string;
  roleNote?: string;
  actions: string[];
  alert: string;
  question: Question;
};

type SignalKey = "pves" | "pabd" | "pdet";
type SexMode = "mujer" | "hombre";
type SensorLevel = "alto" | "correcto" | "bajo";
type TraceMode = "estable" | "tos" | "artefacto";
type PvrMode = "ecografia" | "nelaton";
type CyclePhase = "llenado" | "sensaciones" | "vaciado";

const stages: Stage[] = [
  {
    id: "fundamentos",
    tag: "Inicio",
    title: "¿Qué es la urodinamia?",
    shortTitle: "Qué es",
    time: "4 min",
    lead:
      "Es un estudio que simula un ciclo vesical: la vejiga se llena y después se vacía mientras el equipo registra lo que ocurre.",
    objective:
      "Reconocer las etapas del ciclo antes de revisar el equipo y sus conexiones.",
    image: "/images/urodinamia-que-es.jpg",
    mobileImage: "/images/ciclo-vesical-resumen.jpg",
    imageAlt:
      "Representación visual del montaje de urodinamia y de las fases de llenado, sensación y vaciado.",
    imageCaption: "Un solo estudio observa el llenado, las sensaciones y el vaciado.",
    imageClass: "cycle-overview-image",
    roleNote:
      "El TENS prepara el material, ayuda a posicionar al paciente, conecta lo indicado y vigila la calidad técnica durante el procedimiento, siempre bajo conducción profesional.",
    actions: [
      "Llenado: la vejiga recibe líquido de forma controlada.",
      "Sensaciones: se registran cuando el paciente las comunica.",
      "Vaciado: se registra la micción junto con las presiones.",
    ],
    alert:
      "Este módulo explica la secuencia del examen; no enseña a interpretar resultados clínicos.",
    question: {
      prompt: "¿Qué representa la urodinamia en este curso?",
      options: [
        "Solo una medición del chorro",
        "Un ciclo de llenado, sensaciones y vaciado",
        "Solo una ecografía de la vejiga",
      ],
      answer: 1,
      success: "Correcto. El estudio sigue el ciclo desde el llenado hasta el vaciado.",
      retry: "La urodinamia observa el ciclo vesical completo, no una sola medición.",
    },
  },
  {
    id: "senales",
    tag: "Concepto técnico",
    title: "¿Qué mide el equipo?",
    shortTitle: "Presiones",
    time: "5 min",
    lead:
      "El sistema registra dos presiones y calcula una tercera curva. Cada señal tiene un origen distinto.",
    objective:
      "Relacionar Pves y Pabd con sus catéteres y comprender que Pdet es una resta calculada.",
    image: "/images/real-montaje-presiones.png",
    imageAlt:
      "Montaje de urodinamia con catéter vesical, catéter rectal, bomba, flujómetro y computador.",
    imageCaption: "Las presiones vesical y abdominal llegan por canales separados al software.",
    actions: [
      "Pves: presión vesical total.",
      "Pabd: presión abdominal de referencia.",
      "Pdet = Pves − Pabd.",
    ],
    alert:
      "Pdet no proviene de un tercer catéter. Si Pves o Pabd falla, el cálculo también pierde validez.",
    question: {
      prompt: "¿Qué cálculo realiza el software para obtener la presión del detrusor?",
      options: [
        "La mide directamente con un tercer sensor",
        "Presión del detrusor = presión vesical − presión abdominal",
        "Presión del detrusor = presión vesical + presión abdominal",
      ],
      answer: 1,
      success: "Correcto. La presión del detrusor es igual a la presión vesical menos la presión abdominal.",
      retry: "La presión del detrusor es una curva calculada: presión vesical menos presión abdominal.",
    },
  },
  {
    id: "equipo",
    tag: "Antes de iniciar",
    title: "Preparar sala, equipo y materiales",
    shortTitle: "Sala y material",
    time: "7 min",
    lead:
      "Antes de comenzar deben quedar listos el baño de flujo, la camilla y el material que utilizará el profesional durante el montaje de presión.",
    objective:
      "Reconocer los dos catéteres y reunir el material sin improvisar durante la instalación.",
    image: "/images/cateteres-cistometria.png",
    imageAlt:
      "Catéter rectal con balón junto a catéter vesical de cistometría.",
    imageCaption: "Izquierda: catéter rectal con balón. Derecha: catéter vesical de cistometría.",
    imageClass: "catheter-image",
    actions: [
      "Flujo: uroflujómetro cargado, silla, embudo y receptáculo vacío.",
      "Presión: riñón con suero y dos jeringas de 20 mL conectadas a los sensores; una tercera disponible para el médico.",
      "Instalación: lubricante, cintas, guantes estériles, guantes de procedimiento y material estéril indicado.",
    ],
    alert:
      "El catéter rectal con balón y el catéter vesical tienen funciones diferentes. Rotula y separa sus conexiones antes de recibir al paciente.",
    question: {
      prompt: "¿Qué debe estar preparado antes de instalar los catéteres?",
      options: [
        "Solo los dos catéteres",
        "Material, suero, jeringas, cintas, lubricante y guantes",
        "El material puede reunirse después de iniciar",
      ],
      answer: 1,
      success: "Correcto. La preparación completa evita interrupciones durante el paso estéril.",
      retry: "La instalación comienza solo cuando el material indicado ya está disponible.",
    },
  },
  {
    id: "flujo",
    tag: "Paso 1",
    title: "Realizar la uroflujometría libre",
    shortTitle: "Flujo libre",
    time: "7 min",
    lead:
      "Es el primer examen y se realiza sin catéteres, idealmente en un baño privado con la puerta cerrada. El paciente llega con deseo normal y orina cuando se le indica.",
    objective:
      "Comprobar privacidad, batería, receptáculo y alineación para obtener una micción lo más habitual posible.",
    image: "/images/uroflujo-mujer-sentada.png",
    imageAlt:
      "Mujer sentada con embudo, receptor vacío y uroflujómetro alineados directamente bajo el asiento.",
    imageCaption: "Posición preferente sentada: embudo, receptor vacío y uroflujómetro alineados bajo el asiento.",
    imageClass: "flow-image",
    actions: [
      "Mujeres y hombres: preferentemente sentados; el hombre también puede realizarlo de pie.",
      "Antes de usar: batería cargada, receptáculo vacío y embudo alineado.",
      "Dar la orden cuando el paciente esté posicionado, haya comprendido la instrucción y los controles estén completos; después salir y cerrar la puerta.",
    ],
    alert:
      "No hay catéter durante el flujo libre. En la mujer, el embudo va debajo del asiento y centrado con la salida de orina.",
    question: {
      prompt: "¿Qué revisión corresponde antes de autorizar el flujo libre?",
      options: [
        "Receptáculo vacío, embudo alineado, batería y privacidad",
        "Instalar primero el catéter vesical",
        "Dejar la puerta abierta para observar",
      ],
      answer: 0,
      success: "Correcto. Esas cuatro condiciones se verifican antes de dar la orden de orinar.",
      retry: "El flujo libre se realiza sin catéteres y con privacidad.",
    },
  },
  {
    id: "residuo",
    tag: "Paso 2",
    title: "Medir residuo y trasladar el uroflujómetro",
    shortTitle: "Residuo y traslado",
    time: "5 min",
    lead:
      "Al terminar el flujo libre se vacía el receptáculo y se registra o mide el volumen si está indicado. Luego se evalúa el residuo postmiccional y se prepara el equipo para la camilla.",
    objective:
      "Cerrar correctamente el flujo libre y dejar listo el siguiente tramo del procedimiento.",
    image: "/images/uroflujo-mujer-sentada.png",
    imageAlt:
      "Uroflujómetro con embudo y recipiente vacío alineados bajo una silla.",
    imageCaption: "Después del flujo, se vacía el recipiente y se instala uno limpio para la fase siguiente.",
    imageClass: "flow-image",
    actions: [
      "Vaciar el receptáculo y registrar el volumen si el profesional lo indica.",
      "Residuo postmiccional: ecografía o sonda Nelaton, según decisión profesional.",
      "Trasladar el uroflujómetro y dejar un receptáculo limpio cerca de la camilla.",
    ],
    alert:
      "No confundas el flujo libre con la fase instrumentada: la medición del residuo ocurre después de la micción y antes de instalar los catéteres de urodinamia.",
    question: {
      prompt: "¿Quién define si el residuo se mide por ecografía o con sonda Nelaton?",
      options: [
        "El paciente",
        "El profesional responsable",
        "Siempre el TENS de forma autónoma",
      ],
      answer: 1,
      success: "Correcto. El TENS prepara y asiste el método indicado por el profesional.",
      retry: "La elección del método corresponde al profesional responsable.",
    },
  },
  {
    id: "cateteres",
    tag: "Paso 3",
    title: "Asistir la instalación y fijación",
    shortTitle: "Catéteres",
    time: "10 min",
    lead:
      "El paciente pasa cuidadosamente a litotomía. El profesional instala los catéteres y el TENS mantiene disponibles los materiales, ilumina y fija las líneas según indicación.",
    objective:
      "Asistir el paso estéril vesical y estabilizar cada trayecto sin tracción, compresión ni acodamiento.",
    image: "/images/real-litotomia.png",
    imageAlt:
      "Camilla ginecológica preparada para colocar al paciente en posición de litotomía.",
    imageCaption: "Litotomía permite instalar y comprobar el trayecto de ambos catéteres.",
    actions: [
      "Vesical: paso estéril, antisepsia según protocolo, lubricante mínimo y zona adhesiva seca.",
      "Mujer: vesical al labio mayor y segunda cinta a la pierna. Rectal: purgar el balón, fijar junto al glúteo y luego a la pierna.",
      "Hombre: una cinta longitudinal con un extremo dividido; las dos lengüetas envuelven el catéter. El vesical no se fija a la pierna.",
    ],
    alert:
      "Mover al paciente con cuidado para evitar mareo o reacción vagal. En el hombre, las lengüetas envuelven el catéter urodinámico, nunca el pene.",
    question: {
      prompt: "En el hombre, ¿qué envuelven las dos lengüetas de la cinta?",
      options: [
        "El pene",
        "El catéter urodinámico",
        "Ambos catéteres juntos",
      ],
      answer: 1,
      success: "Correcto. Las puntas cruzadas sujetan el catéter sin rodear ni comprimir el pene.",
      retry: "La cinta se divide para que sus dos puntas envuelvan solo el catéter.",
    },
  },
  {
    id: "cero",
    tag: "Paso 4",
    title: "Sentar, conectar, nivelar y hacer cero",
    shortTitle: "Conexión y cero",
    time: "8 min",
    lead:
      "Con ambos catéteres instalados, el paciente vuelve a una posición sentada o semisentada cómoda. En esa posición se conectan las líneas y se calibra su altura.",
    objective:
      "Conectar sin aire, nivelar los sensores con el pubis, realizar el cero y validar ambas curvas.",
    image: "/images/real-circuito-presiones.png",
    imageAlt:
      "Circuito de presión vesical y abdominal conectado a transductores y a una gráfica.",
    imageCaption: "Pves y Pabd deben llegar por canales separados y responder de forma coherente.",
    actions: [
      "Conectar suero al canal de infusión, Pves al vesical y Pabd al rectal.",
      "Eliminar todo el aire y nivelar los transductores a la altura de la sínfisis púbica.",
      "Abrir a atmósfera, hacer cero, cerrar y realizar las pruebas de transmisión indicadas.",
    ],
    alert:
      "Hacer cero no corrige un sensor ubicado demasiado alto o bajo. Cero y altura de referencia son controles distintos.",
    question: {
      prompt: "En una tos de control técnicamente adecuada, ¿qué esperas?",
      options: [
        "Suben Pves y Pabd de forma similar y Pdet cambia poco",
        "Solo sube Pves",
        "Solo sube Pdet",
      ],
      answer: 0,
      success: "Correcto. La tos confirma transmisión simultánea en ambos canales.",
      retry: "La presión abdominal se transmite a vejiga y recto al mismo tiempo.",
    },
  },
  {
    id: "llenado",
    tag: "Paso 5",
    title: "Asistir la fase de llenado",
    shortTitle: "Llenado",
    time: "7 min",
    lead:
      "Durante el llenado se registran sensaciones y eventos en tiempo real mientras se vigilan comodidad, líneas y calidad de las curvas.",
    objective:
      "Mantener el montaje estable, marcar lo que comunica el paciente, detectar cambios técnicos y avisar.",
    image: "/images/real-equipo-curvas.png",
    imageAlt:
      "Paciente conectado al equipo de urodinamia durante la fase de llenado.",
    imageCaption: "La observación técnica continúa durante todo el llenado.",
    actions: [
      "Marcar sensaciones y maniobras cuando ocurren, no al final.",
      "Vigilar burbujas, acodamientos, desconexiones y desplazamientos.",
      "Detectar cambios técnicos o síntomas y avisar al profesional responsable; no decidir una corrección de forma autónoma.",
    ],
    alert:
      "No existe una relación fija entre volumen, sensación y presión. El simulador muestra secuencia, no valores normales.",
    question: {
      prompt: "Durante una tos de control, la curva de presión abdominal permanece plana mientras la presión vesical responde. ¿Qué corresponde al TENS?",
      options: [
        "Continuar sin comunicarlo porque la presión vesical sí respondió",
        "Detectar la respuesta discordante y avisar al profesional responsable",
        "Concluir que existe una contracción involuntaria del detrusor",
      ],
      answer: 1,
      success: "Correcto. El TENS reconoce que la presión abdominal no respondió durante la tos y lo comunica; la interpretación y la conducta corresponden al profesional responsable.",
      retry: "Durante una tos de control ambas presiones deben responder. El TENS detecta la discordancia y avisa, sin atribuirle por sí solo un significado clínico.",
    },
  },
  {
    id: "vaciado",
    tag: "Paso 6",
    title: "Registrar el vaciado y cerrar el estudio",
    shortTitle: "Vaciado",
    time: "7 min",
    lead:
      "Antes de autorizar la micción se revisa el uroflujómetro. Durante el vaciado se conserva la posición definida y se vuelve a dejar al paciente en privacidad.",
    objective:
      "Conservar la continuidad entre llenado y vaciado y comprobar la calidad final antes de desconectar.",
    image: "/images/real-montaje-presiones.png",
    imageAlt:
      "Esquema de urodinamia con bomba de infusión, presiones, flujómetro y computador.",
    imageCaption: "Presión y flujo deben registrarse de forma sincronizada durante el vaciado.",
    actions: [
      "Confirmar receptáculo, embudo y uroflujómetro antes de dar la orden de orinar.",
      "Mantener la posición, dejar al paciente solo y conservar activas presión y flujo.",
      "Al finalizar: residuo si se indica, retiro de catéteres por el profesional y cierre del procedimiento.",
    ],
    alert:
      "Cambiar la posición justo antes de vaciar puede modificar presiones, flujo y calidad de comparación.",
    question: {
      prompt: "¿Qué debe ocurrir antes de dar la orden de orinar al final del estudio?",
      options: [
        "Retirar primero el catéter rectal",
        "Confirmar posición, receptáculo, embudo, flujómetro y señales",
        "Abrir la puerta para observar el vaciado",
      ],
      answer: 1,
      success: "Correcto. La continuidad técnica se conserva hasta el final.",
      retry: "Primero se revisa el montaje; después se da privacidad y la orden de orinar.",
    },
  },
];

const signalData: Record<SignalKey, { name: string; source: string; meaning: string }> = {
  pves: {
    name: "Pves",
    source: "Catéter vesical",
    meaning: "Presión vesical total: componente del detrusor más presión abdominal transmitida.",
  },
  pabd: {
    name: "Pabd",
    source: "Catéter rectal con balón",
    meaning: "Presión abdominal de referencia utilizada para separar el componente transmitido.",
  },
  pdet: {
    name: "Pdet",
    source: "Cálculo del software",
    meaning: "Presión del detrusor estimada mediante la resta Pves − Pabd.",
  },
};

const equipment = [
  { code: "01", name: "Catéter vesical", role: "Mide Pves y permite la infusión vesical según el sistema." },
  { code: "02", name: "Catéter rectal con balón", role: "Mide Pabd. El balón se purga antes de instalarlo." },
  { code: "03", name: "Riñón con suero", role: "Mantiene disponible el suero fisiológico para preparar el circuito." },
  { code: "04", name: "Jeringas de 20 mL", role: "Dos conectadas a los sensores y una adicional disponible para el médico." },
  { code: "05", name: "Lubricante y cintas", role: "Se preparan antes de litotomía; usar lubricante mínimo y fijar sobre piel seca." },
  { code: "06", name: "Guantes y campo", role: "Guantes estériles, de procedimiento y material estéril según el protocolo local." },
  { code: "07", name: "Uroflujómetro", role: "Batería cargada, embudo alineado y receptáculo vacío antes de cada micción." },
  { code: "08", name: "Sensores y software", role: "Reciben Pves y Pabd, calculan Pdet y permiten registrar eventos." },
];

const cyclePhases: Record<CyclePhase, {
  number: string;
  title: string;
  headline: string;
  detail: string;
  image: string;
  imageAlt: string;
}> = {
  llenado: {
    number: "01",
    title: "Llenado",
    headline: "La vejiga recibe líquido",
    detail: "El equipo inicia el llenado controlado mientras registra las presiones.",
    image: "/images/ciclo-llenado.png",
    imageAlt: "Ilustración de la vejiga durante la fase de llenado.",
  },
  sensaciones: {
    number: "02",
    title: "Sensaciones",
    headline: "El paciente comunica lo que siente",
    detail: "Cada sensación se marca en el momento en que el paciente la informa.",
    image: "/images/ciclo-sensacion.png",
    imageAlt: "Ilustración de una vejiga llena asociada a la sensación vesical.",
  },
  vaciado: {
    number: "03",
    title: "Vaciado",
    headline: "El paciente orina",
    detail: "El sistema registra simultáneamente el flujo y las presiones.",
    image: "/images/ciclo-vaciado.png",
    imageAlt: "Ilustración de la vejiga durante la fase de vaciado y flujo urinario.",
  },
};

const traceModes: Record<TraceMode, {
  label: string;
  title: string;
  detail: string;
  values: { pves: number[]; pabd: number[] };
}> = {
  estable: {
    label: "Estable",
    title: "Base estable",
    detail: "Pves y Pabd mantienen una relación coherente; Pdet no muestra saltos técnicos.",
    values: {
      pves: [36, 38, 37, 39, 38, 40, 39, 40, 41, 40, 42, 41],
      pabd: [24, 25, 24, 26, 25, 26, 25, 27, 27, 26, 28, 27],
    },
  },
  tos: {
    label: "Tos",
    title: "Tos de control",
    detail: "Pves y Pabd ascienden juntos; la diferencia Pdet cambia poco.",
    values: {
      pves: [34, 37, 78, 39, 37, 80, 38, 36, 76, 38, 36, 35],
      pabd: [22, 25, 66, 27, 25, 68, 26, 24, 64, 26, 24, 23],
    },
  },
  artefacto: {
    label: "Dudoso",
    title: "Canal abdominal sin respuesta",
    detail: "Pves cambia y Pabd no acompaña; la resta crea una falsa elevación de Pdet.",
    values: {
      pves: [34, 37, 78, 39, 38, 76, 38, 37, 75, 38, 37, 35],
      pabd: [22, 23, 22, 23, 22, 23, 22, 23, 22, 23, 22, 23],
    },
  },
};

function CycleExplorer() {
  const [phase, setPhase] = useState<CyclePhase>("llenado");
  const selected = cyclePhases[phase];

  return (
    <div className="interactive-box cycle-explorer">
      <div className="interactive-heading">
        <span>Ciclo vesical simulado</span>
        <strong>Selecciona cada etapa</strong>
      </div>
      <div className="cycle-stepper" role="group" aria-label="Etapas del ciclo vesical">
        {(Object.keys(cyclePhases) as CyclePhase[]).map((key) => (
          <button key={key} type="button" onClick={() => setPhase(key)} aria-pressed={phase === key}>
            <span>{cyclePhases[key].number}</span>
            <strong>{cyclePhases[key].title}</strong>
          </button>
        ))}
      </div>
      <div className={`cycle-focus cycle-phase-${phase}`}>
        <figure className="cycle-phase-visual">
          <img src={selected.image} alt={selected.imageAlt} />
        </figure>
        <div className="cycle-copy">
          <span>Etapa {selected.number}</span>
          <strong>{selected.headline}</strong>
          <p>{selected.detail}</p>
        </div>
      </div>
    </div>
  );
}

function SignalExplorer() {
  const [active, setActive] = useState<SignalKey>("pves");
  const signal = signalData[active];

  return (
    <div className="interactive-box signal-explorer">
      <div className="interactive-heading">
        <span>Explora las señales</span>
        <strong>Selecciona una curva</strong>
      </div>
      <div className="signal-buttons" role="group" aria-label="Señales de presión">
        {(Object.keys(signalData) as SignalKey[]).map((key) => (
          <button
            type="button"
            key={key}
            onClick={() => setActive(key)}
            aria-pressed={active === key}
          >
            {signalData[key].name}
          </button>
        ))}
      </div>
      <div className={`signal-detail signal-${active}`}>
        <span>{signal.name}</span>
        <div>
          <strong>{signal.source}</strong>
          <p>{signal.meaning}</p>
        </div>
      </div>
      <div className="equation" aria-label="Pdet es igual a Pves menos Pabd">
        <b>Pdet</b><span>=</span><b>Pves</b><span>−</span><b>Pabd</b>
      </div>
    </div>
  );
}

function EquipmentExplorer() {
  const [active, setActive] = useState(0);
  const selected = equipment[active];

  return (
    <div className="interactive-box equipment-explorer">
      <div className="interactive-heading">
        <span>Inventario interactivo</span>
        <strong>Selecciona cada componente</strong>
      </div>
      <div className="catheter-key" aria-label="Diferencia entre los catéteres de presión">
        <div>
          <span className="catheter-swatch rectal" aria-hidden="true" />
          <p><strong>Rectal con balón</strong><small>Canal Pabd</small></p>
        </div>
        <div>
          <span className="catheter-swatch vesical" aria-hidden="true" />
          <p><strong>Vesical de cistometría</strong><small>Canal Pves + infusión</small></p>
        </div>
      </div>
      <div className="equipment-list">
        {equipment.map((item, index) => (
          <button
            type="button"
            key={item.code}
            onClick={() => setActive(index)}
            aria-pressed={active === index}
          >
            <span>{item.code}</span>
            {item.name}
          </button>
        ))}
      </div>
      <div className="equipment-readout">
        <span>{selected.code}</span>
        <div>
          <strong>{selected.name}</strong>
          <p>{selected.role}</p>
        </div>
      </div>
    </div>
  );
}

function FlowExplorer() {
  const [mode, setMode] = useState<SexMode>("mujer");
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const checks = [
    ["bateria", "Batería cargada"],
    ["receptor", "Receptáculo vacío"],
    ["alineacion", "Embudo alineado"],
    ["privacidad", "Privacidad preparada"],
  ];
  const readyCount = checks.filter(([key]) => ready[key]).length;
  const allReady = readyCount === checks.length;
  const missingCount = checks.length - readyCount;

  return (
    <div className="interactive-box flow-explorer">
      <div className="interactive-heading row-heading">
        <div>
          <span>Posición de flujo libre</span>
          <strong>{mode === "mujer" ? "Mujer sentada" : "Hombre preferentemente sentado"}</strong>
        </div>
        <div className="segmented" role="group" aria-label="Paciente">
          <button type="button" onClick={() => setMode("mujer")} aria-pressed={mode === "mujer"}>Mujer</button>
          <button type="button" onClick={() => setMode("hombre")} aria-pressed={mode === "hombre"}>Hombre</button>
        </div>
      </div>
      <div className={`flow-crop flow-${mode}`}>
        <img
          src={mode === "mujer" ? "/images/uroflujo-mujer-sentada.png" : "/images/uroflujo-hombre-sentado.png"}
          alt={mode === "mujer"
            ? "Mujer sentada con embudo, receptor vacío y uroflujómetro alineados bajo el asiento."
            : "Hombre sentado con embudo, receptor vacío y uroflujómetro alineados bajo el asiento."}
        />
      </div>
      <div className="flow-callout">
        <span aria-hidden="true">↓</span>
        <p>
          {mode === "mujer"
            ? "El embudo queda bajo el asiento, centrado con la salida de orina."
            : "Se prefiere sentado; también puede hacerlo de pie si esa es la posición indicada."}
        </p>
      </div>
      <div className="flow-ready-heading">
        <div>
          <span>Antes de dar la orden</span>
          <strong>{allReady ? "Los cuatro controles están completos" : `Faltan ${missingCount} de ${checks.length} controles`}</strong>
        </div>
        <b className={allReady ? "complete" : ""}>{allReady ? "Dar la orden ahora" : "No dar la orden"}</b>
      </div>
      <div className="flow-ready-grid" aria-label="Controles previos al flujo libre">
        {checks.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setReady((current) => ({ ...current, [key]: !current[key] }))}
            aria-pressed={Boolean(ready[key])}
          >
            <span>{ready[key] ? "✓" : ""}</span>{label}
          </button>
        ))}
      </div>
      <div className={`flow-order ${allReady ? "ready" : ""}`} aria-live="polite">
        <span>{allReady ? "✓" : readyCount}</span>
        <p>{allReady
          ? "Con el paciente sentado, con deseo normal de orinar y la instrucción comprendida, dé la orden de orinar. Luego salga del baño y cierre la puerta para que la micción ocurra en privacidad."
          : "Complete batería, receptáculo, alineación y privacidad. La orden de orinar todavía no debe darse."}</p>
      </div>
      <p className="privacy-note"><strong>Sin catéteres.</strong> Si después de la orden cuesta iniciar, el sonido de agua corriendo puede facilitar el comienzo.</p>
    </div>
  );
}

function ResidualExplorer() {
  const [mode, setMode] = useState<PvrMode>("ecografia");
  const [done, setDone] = useState<Record<string, boolean>>({});
  const transfer = [
    ["vaciar", "Vaciar receptáculo"],
    ["registrar", "Registrar si se indica"],
    ["mover", "Mover uroflujómetro"],
    ["limpio", "Instalar recipiente limpio"],
  ];
  const completed = transfer.filter(([key]) => done[key]).length;

  return (
    <div className="interactive-box residual-explorer">
      <div className="interactive-heading row-heading">
        <div>
          <span>Residuo postmiccional</span>
          <strong>{mode === "ecografia" ? "Medición por ecografía" : "Medición con sonda Nelaton"}</strong>
        </div>
        <div className="segmented" role="group" aria-label="Método para medir residuo">
          <button type="button" onClick={() => setMode("ecografia")} aria-pressed={mode === "ecografia"}>Ecografía</button>
          <button type="button" onClick={() => setMode("nelaton")} aria-pressed={mode === "nelaton"}>Nelaton</button>
        </div>
      </div>
      <div className={`residual-method method-${mode}`}>
        <span aria-hidden="true">{mode === "ecografia" ? "US" : "N"}</span>
        <div>
          <strong>{mode === "ecografia" ? "No invasiva" : "Sondaje indicado por el profesional"}</strong>
          <p>{mode === "ecografia"
            ? "Preparar el ecógrafo o bladder scanner y asistir la medición indicada."
            : "Preparar la sonda Nelaton y el material requerido; la indicación y ejecución dependen del profesional responsable."}</p>
        </div>
      </div>
      <div className="transfer-heading">
        <span>Traslado hacia la camilla</span>
        <strong>{completed} / {transfer.length}</strong>
      </div>
      <div className="transfer-steps">
        {transfer.map(([key, label], index) => (
          <button
            key={key}
            type="button"
            onClick={() => setDone((current) => ({ ...current, [key]: !current[key] }))}
            aria-pressed={Boolean(done[key])}
          >
            <span>{done[key] ? "✓" : index + 1}</span>
            {label}
          </button>
        ))}
      </div>
      <p className={`transfer-status ${completed === transfer.length ? "complete" : ""}`}>
        {completed === transfer.length
          ? "Equipo preparado junto a la camilla."
          : "Completa el cierre del flujo libre antes de pasar a los catéteres."}
      </p>
    </div>
  );
}

function FixationExplorer() {
  const [mode, setMode] = useState<SexMode>("mujer");
  const [anchor, setAnchor] = useState(0);
  const femaleAnchors = [
    ["Vesical", "Fijar inmediatamente el catéter vesical al labio mayor y mantener visible el meato."],
    ["Rectal", "Purgar primero el balón y fijar la línea rectal junto al glúteo, sin desplazarla."],
    ["Pierna", "Añadir una segunda fijación a la pierna para dar movilidad y descargar la tracción."],
  ];
  const maleSteps = [
    ["Cortar", "Preparar una cinta rectangular y cortar uno de sus extremos por el centro para formar dos lengüetas."],
    ["Colocar", "Exponer el glande y adherir una sola cinta longitudinal, con el extremo cortado hacia el meato. El catéter sale entre las dos lengüetas."],
    ["Envolver", "Pasar una lengüeta por cada lado del catéter y cruzarlas para envolverlo. Las puntas fijan el catéter; no rodean el pene."],
  ];
  const activeData = mode === "mujer" ? femaleAnchors : maleSteps;

  return (
    <div className="interactive-box fixation-explorer">
      <div className="interactive-heading row-heading">
        <div>
          <span>Mapa de fijación</span>
          <strong>{mode === "mujer" ? "Paciente mujer" : "Paciente hombre"}</strong>
        </div>
        <div className="segmented" role="group" aria-label="Mapa de fijación">
          <button type="button" onClick={() => { setMode("mujer"); setAnchor(0); }} aria-pressed={mode === "mujer"}>Mujer</button>
          <button type="button" onClick={() => { setMode("hombre"); setAnchor(0); }} aria-pressed={mode === "hombre"}>Hombre</button>
        </div>
      </div>
      {mode === "mujer" ? (
        <div className="fixation-map mujer" aria-label="Esquema de fijación en mujer">
          <span className="thigh thigh-left" />
          <span className="thigh thigh-right" />
          <span className="field-label">Campo perineal</span>
          <span className={`anatomy-point point-meatus ${anchor === 0 ? "active" : ""}`}>Meato</span>
          <span className={`anatomy-point point-anus ${anchor === 1 ? "active" : ""}`}>Ano</span>
          <span className={`anatomy-point point-leg ${anchor === 2 ? "active" : ""}`}>Pierna</span>
          <span className="tube-line vesical-line" />
          <span className="tube-line rectal-line" />
          <span className={`tape-mark tape-primary ${anchor === 0 ? "active" : ""}`} />
          <span className={`tape-mark tape-secondary ${anchor === 1 ? "active" : ""}`} />
          <span className={`tape-mark tape-leg ${anchor === 2 ? "active" : ""}`} />
        </div>
      ) : (
        <div className="male-fixation-sequence" role="group" aria-label="Tres pasos de fijación del catéter vesical masculino">
          {maleSteps.map(([label], index) => (
            <button
              type="button"
              key={label}
              className={`male-fixation-panel step-${index + 1}`}
              onClick={() => setAnchor(index)}
              aria-pressed={anchor === index}
            >
              <span className="male-fixation-visual" aria-hidden="true">
                {index === 0 ? (
                  <>
                    <span className="fix-tape-strip">
                      <i className="fix-tape-cut" />
                      <i className="fix-tab-label tab-a">A</i>
                      <i className="fix-tab-label tab-b">B</i>
                    </span>
                    <span className="fix-cut-guide">Corte desde un extremo</span>
                  </>
                ) : (
                  <>
                    <span className="fix-anatomy">
                      <i className="fix-shaft" />
                      <i className="fix-glans" />
                      <i className="fix-meatus" />
                    </span>
                    <span className="fix-tape-body" />
                    <span className="fix-catheter" />
                    {index === 1 ? (
                      <>
                        <span className="fix-tab-open tab-left" />
                        <span className="fix-tab-open tab-right" />
                      </>
                    ) : (
                      <>
                        <span className="fix-catheter-target" />
                        <span className="fix-tab-wrap tab-left" />
                        <span className="fix-tab-wrap tab-right" />
                        <span className="fix-only-catheter">Solo el catéter</span>
                      </>
                    )}
                  </>
                )}
              </span>
              <span className="male-panel-caption"><b>0{index + 1}</b><strong>{label}</strong></span>
            </button>
          ))}
        </div>
      )}
      {mode === "mujer" && (
        <div className="anchor-controls" role="group" aria-label="Puntos de fijación">
          {activeData.map(([label], index) => (
            <button key={label} type="button" onClick={() => setAnchor(index)} aria-pressed={anchor === index}>
              <span>{index + 1}</span>{label}
            </button>
          ))}
        </div>
      )}
      <p className="anchor-note">{activeData[anchor][1]}</p>
      {mode === "hombre" && (
        <p className="male-safety-note"><strong>Control final:</strong> es una sola cinta. El extremo cortado forma dos lengüetas que se cruzan alrededor del catéter urodinámico, nunca alrededor del pene. El tubo queda permeable, sin acodamiento y no se fija a la pierna.</p>
      )}
    </div>
  );
}

function ZeroExplorer() {
  const [level, setLevel] = useState<SensorLevel>("correcto");
  const messages: Record<SensorLevel, string> = {
    alto: "Sensores sobre la línea del pubis: las dos curvas se desplazan hacia abajo.",
    correcto: "Correcto: la línea de los sensores coincide con el borde superior de la sínfisis púbica.",
    bajo: "Sensores bajo la línea del pubis: las dos curvas se desplazan hacia arriba.",
  };
  const curveShift = level === "alto" ? 16 : level === "bajo" ? -16 : 0;
  const curveCaption = level === "alto"
    ? "Registro desplazado hacia abajo"
    : level === "bajo"
      ? "Registro desplazado hacia arriba"
      : "Registro con sensores a nivel";

  return (
    <div className="interactive-box zero-explorer">
      <div className="interactive-heading">
        <span>Prueba el nivel</span>
        <strong>Mueve el conjunto de sensores</strong>
      </div>
      <div className="level-stage">
        <div className="level-reference-diagram" aria-label="Comparación entre la línea del pubis y la línea de los sensores">
          <span className="pubis-reference-line"><b>Línea del pubis</b></span>
          <span className={`sensor-reference-line sensor-${level}`}><b>Línea de sensores</b><i /></span>
        </div>
        <div className="level-curve-panel">
          <span>{curveCaption}</span>
          <svg viewBox="0 0 440 120" role="img" aria-label={`Par de curvas de presión: ${curveCaption.toLowerCase()}`}>
            <path className="curve-grid-line" d="M8 36 H432 M8 82 H432" />
            <g transform={`translate(0 ${curveShift})`}>
              <path className="level-curve curve-one" d="M8 36 H116 L130 34 L145 10 L159 35 L176 36 H432" />
              <path className="level-curve curve-two" d="M8 82 H116 L130 80 L145 56 L159 81 L176 82 H432" />
            </g>
          </svg>
        </div>
      </div>
      <div className="level-controls" role="group" aria-label="Altura del sensor">
        {(["alto", "correcto", "bajo"] as SensorLevel[]).map((item) => (
          <button key={item} type="button" onClick={() => setLevel(item)} aria-pressed={level === item}>
            {item === "correcto" ? "A nivel" : `Más ${item}`}
          </button>
        ))}
      </div>
      <p className={`level-message ${level === "correcto" ? "ok" : "warn"}`}>{messages[level]}</p>
    </div>
  );
}

function MiniTrace({ values }: { values: number[] }) {
  return (
    <div className="mini-trace" aria-hidden="true">
      {values.map((height, index) => (
        <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
      ))}
    </div>
  );
}

function VoidingExplorer() {
  const [mode, setMode] = useState<TraceMode>("tos");
  const trace = traceModes[mode];
  const traceSeries = [
    { name: "Pves", values: trace.values.pves },
    { name: "Pabd", values: trace.values.pabd },
    { name: "Pdet", values: derivePdetSeries(trace.values.pves, trace.values.pabd) },
  ];

  return (
    <div className="interactive-box voiding-explorer">
      <div className="interactive-heading row-heading">
        <div>
          <span>Control de señales</span>
          <strong>{trace.title}</strong>
        </div>
        <div className="segmented trace-selector" role="group" aria-label="Escenario de señales">
          {(Object.keys(traceModes) as TraceMode[]).map((key) => (
            <button key={key} type="button" onClick={() => setMode(key)} aria-pressed={mode === key}>
              {traceModes[key].label}
            </button>
          ))}
        </div>
      </div>
      <div className="trace-board">
        {traceSeries.map((series) => (
          <div className={`trace-row trace-${series.name.toLowerCase()}`} key={series.name}>
            <b>{series.name}</b>
            <MiniTrace values={series.values} />
          </div>
        ))}
      </div>
      <p className={`trace-message ${mode === "artefacto" ? "warn" : "ok"}`}>{trace.detail}</p>
      <p className="trace-formula-note">Cada punto de Pdet se calcula automáticamente como Pves − Pabd.</p>
      <div className="position-lock">
        <span aria-hidden="true">✓</span>
        <p><strong>Posición conservada</strong> Llenado y vaciado se registran en la misma posición definida.</p>
      </div>
    </div>
  );
}

function StageInteraction({ id }: { id: string }) {
  if (id === "fundamentos") return <CycleExplorer />;
  if (id === "senales") return <SignalExplorer />;
  if (id === "equipo") return <EquipmentExplorer />;
  if (id === "flujo") return <FlowExplorer />;
  if (id === "residuo") return <ResidualExplorer />;
  if (id === "cateteres") return <FixationExplorer />;
  if (id === "cero") return <ZeroExplorer />;
  if (id === "llenado") return null;
  return <VoidingExplorer />;
}

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [posttestPassed, setPosttestPassed] = useState(false);
  const [checklistStatuses, setChecklistStatuses] = useState<Record<string, CourseChecklistStatus>>({});
  const [hydrated, setHydrated] = useState(false);
  const completed = useMemo(() => deriveCompletedStageIds(stages, answers), [answers]);
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const progress = Math.round((completed.length / stages.length) * 100);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const courseVersion = urodynamicsCourseDefinition.governance.version;
        const stored = readCourseRuntimeState(
          window.localStorage,
          URODYNAMICS_COURSE_ID,
          courseVersion,
        );

        if (stored) {
          const storedIndex = stages.findIndex((item) => item.id === stored.activeModuleId);
          setActiveIndex(storedIndex >= 0 ? storedIndex : 0);
          setAnswers(stored.moduleAnswers);
          setPosttestPassed(stored.posttest.passed);
          setChecklistStatuses(stored.checklist.statuses);
        } else {
          const legacy = safeReadJson<{
            activeIndex?: number;
            answers?: Record<string, number>;
          }>(window.localStorage, "urodinamia-asistida-progress");
          if (legacy) {
            setActiveIndex(Math.min(Math.max(legacy.activeIndex ?? 0, 0), stages.length - 1));
            setAnswers(legacy.answers ?? {});
          }
        }
      } catch {
        // El curso puede funcionar aunque el navegador no permita guardar progreso.
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const courseVersion = urodynamicsCourseDefinition.governance.version;
    const state = createCourseRuntimeState(URODYNAMICS_COURSE_ID, courseVersion);
    state.activeModuleId = stages[activeIndex]?.id ?? null;
    state.moduleAnswers = answers;
    state.completedModuleIds = completed;
    state.posttest.passed = posttestPassed;
    state.checklist.statuses = checklistStatuses;
    writeCourseRuntimeState(window.localStorage, state);
  }, [activeIndex, answers, checklistStatuses, completed, hydrated, posttestPassed]);

  const stage = stages[activeIndex];
  const selectedAnswer = answers[stage.id];
  const answered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === stage.question.answer;
  function chooseAnswer(index: number) {
    setAnswers((current) => ({ ...current, [stage.id]: index }));
  }

  function goToStage(index: number) {
    setActiveIndex(Math.min(Math.max(index, 0), stages.length - 1));
    window.setTimeout(() => {
      document.querySelector("#curso")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function goToStageById(id: string) {
    const index = stages.findIndex((item) => item.id === id);
    goToStage(index >= 0 ? index : 0);
  }

  function startTraining() {
    if (completed.length) {
      goToStage(activeIndex);
      return;
    }
    window.setTimeout(() => {
      document.querySelector("#ruta-formacion")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function resetCourse() {
    setActiveIndex(0);
    setAnswers({});
    setPosttestPassed(false);
    setChecklistStatuses({});
  }

  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">Curso interactivo</p>
          <h1 id="page-title">Urodinamia asistida</h1>
          <p className="hero-lede">
            Entrenamiento didáctico digital para TENS que participan asistiendo en urodinamias.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={startTraining}>
              {completed.length ? "Continuar curso" : "Iniciar capacitación"}<span aria-hidden="true">→</span>
            </button>
            <div className="hero-meta" aria-label="Datos del curso">
              <span><b>9</b> módulos</span>
              <span><b>80%</b> postest</span>
              <span><b>{progress}%</b> módulos</span>
            </div>
          </div>
        </div>
        <figure className="hero-visual urodynamics-cover-visual">
          <img src="/images/urodinamia-portada.jpg" alt="Pacientes de distintas edades preparados para un estudio de urodinamia con el equipo conectado." />
        </figure>
      </section>

      <section className="route-band" aria-label="Secuencia principal del procedimiento">
        <div className="route-intro">
          <p className="eyebrow">Orden del procedimiento</p>
          <strong>Una secuencia continua</strong>
        </div>
        <ol>
          {stages.slice(3).map((item, index) => (
            <li key={item.id}>
              <button type="button" onClick={() => goToStage(index + 3)}>
                <span>{index + 1}</span>{item.shortTitle}
              </button>
            </li>
          ))}
        </ol>
      </section>

      <TrainingPreparation onGoToCourse={() => goToStage(activeIndex)} onReviewModule={goToStageById} />

      <section className="course-section" id="curso" aria-label="Curso guiado">
        <div className="course-toolbar">
          <div>
            <p className="eyebrow">Recorrido guiado</p>
            <h2>Aprende en el orden de la sala</h2>
          </div>
          <div className="toolbar-progress">
            <div className="progress-copy">
              <span>Progreso</span>
              <strong>{completed.length} de {stages.length} módulos</strong>
            </div>
            <div className="progress-track" aria-label={`${progress}% completado`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <button type="button" className="reset-button" onClick={resetCourse}>Reiniciar</button>
          </div>
        </div>

        <div className="course-workspace">
          <nav className="stage-nav" aria-label="Módulos del curso">
            {stages.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={index === activeIndex ? "active" : ""}
                aria-current={index === activeIndex ? "step" : undefined}
              >
                <span className="stage-number">{completedSet.has(item.id) ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <span className="stage-label">
                  <small>{item.tag}</small>
                  <strong>{item.shortTitle}</strong>
                </span>
                <span className="stage-time">{item.time}</span>
              </button>
            ))}
          </nav>

          <article className="lesson-stage" key={stage.id}>
            <header className="lesson-header">
              <div>
                <p className="eyebrow">Módulo {activeIndex + 1} · {stage.tag}</p>
                <h2>{stage.title}</h2>
                <p>{stage.lead}</p>
              </div>
              <span className="lesson-time">{stage.time}</span>
            </header>

            {stage.roleNote && (
              <section className="role-strip" aria-label="Rol del TENS">
                <span>Rol del TENS</span>
                <p>{stage.roleNote}</p>
              </section>
            )}

            <div className="lesson-grid">
              <div className="lesson-main">
                <figure className={`stage-photo ${stage.imageClass ?? ""}`}>
                  <picture>
                    {stage.mobileImage ? (
                      <source media="(max-width: 680px)" srcSet={stage.mobileImage} />
                    ) : null}
                    <img src={stage.image} alt={stage.imageAlt} />
                  </picture>
                  <figcaption>{stage.imageCaption}</figcaption>
                </figure>
                <StageInteraction id={stage.id} />
              </div>

              <aside className="lesson-aside" aria-label={stage.id === "fundamentos" ? "Resumen del módulo" : "Acciones del ayudante"}>
                <div className="objective-block">
                  <span>Objetivo operativo</span>
                  <p>{stage.objective}</p>
                </div>
                <div className="action-checks">
                  <span>{stage.id === "fundamentos" ? "Etapas del ciclo" : "En sala"}</span>
                  {stage.actions.map((action, index) => (
                    <div key={action}>
                      <b>{String(index + 1).padStart(2, "0")}</b>
                      <p>{action}</p>
                    </div>
                  ))}
                </div>
                <div className="alert-block">
                  <span>{stage.id === "fundamentos" ? "Límite del módulo" : "Evita este error"}</span>
                  <p>{stage.alert}</p>
                </div>
              </aside>
            </div>

            <section className="knowledge-check" aria-labelledby={`question-${stage.id}`}>
              <div className="question-copy">
                <span>Decisión en sala</span>
                <h3 id={`question-${stage.id}`}>{stage.question.prompt}</h3>
              </div>
              <div className="answer-grid">
                {stage.question.options.map((option, index) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => chooseAnswer(index)}
                    className={selectedAnswer === index ? (isCorrect ? "selected correct" : "selected incorrect") : ""}
                    aria-pressed={selectedAnswer === index}
                  >
                    <span>{String.fromCharCode(65 + index)}</span>{option}
                  </button>
                ))}
              </div>
              {answered && (
                <p className={`answer-feedback ${isCorrect ? "correct" : "incorrect"}`} role="status">
                  {isCorrect ? stage.question.success : stage.question.retry}
                </p>
              )}
            </section>

            <footer className="lesson-footer">
              <button type="button" className="secondary-button" onClick={() => goToStage(activeIndex - 1)} disabled={activeIndex === 0}>
                <span aria-hidden="true">←</span>Anterior
              </button>
              <span>{activeIndex + 1} / {stages.length}</span>
              <button
                type="button"
                className="primary-button next-button"
                onClick={() => goToStage(activeIndex + 1)}
                disabled={!isCorrect || activeIndex === stages.length - 1}
              >
                {isCorrect ? "Siguiente módulo" : "Responde para continuar"}<span aria-hidden="true">→</span>
              </button>
            </footer>
          </article>
        </div>

        {progress === 100 && (
          <div className="completion-banner" role="status">
            <span>Módulos completados</span>
            <strong>El recorrido teórico continúa con escenarios y postest.</strong>
            <p>Completar los módulos no certifica competencia práctica. La aprobación final depende de observación y firma del supervisor.</p>
            <button type="button" className="primary-button" onClick={() => document.querySelector("#escenarios")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Continuar con escenarios<span aria-hidden="true">→</span></button>
          </div>
        )}
      </section>

      <TrainingCompletion
        onReviewModule={goToStageById}
        onGoToCourse={() => goToStage(activeIndex)}
        courseCompleted={progress === 100}
        courseProgress={progress}
        posttestPassed={posttestPassed}
        onPosttestResult={setPosttestPassed}
        checklistStatuses={checklistStatuses}
        onChecklistStatusesChange={setChecklistStatuses}
      />

      <section className="principles-band" aria-label="Principios técnicos">
        <div><span>01</span><strong>Privacidad</strong><p>El flujo libre y el vaciado requieren un entorno reservado.</p></div>
        <div><span>02</span><strong>Receptor listo</strong><p>Vacío, centrado bajo el embudo y con batería disponible.</p></div>
        <div><span>03</span><strong>Sin aire</strong><p>La columna de líquido debe transmitir la presión.</p></div>
        <div><span>04</span><strong>Sin tracción</strong><p>Las cintas estabilizan; no comprimen ni tiran.</p></div>
      </section>

      <footer className="site-footer">
        <p>Material educativo para entrenamiento de ayudantes, sujeto al protocolo local y a supervisión clínica.</p>
        <p>
          Base técnica: <a href="https://pubmed.ncbi.nlm.nih.gov/27917521/" target="_blank" rel="noreferrer">ICS Good Urodynamic Practices 2016</a>
          <span aria-hidden="true"> · </span>
          <a href="https://doi.org/10.1016/j.cont.2023.100710" target="_blank" rel="noreferrer">ICS-SUFU presión-flujo 2023, parte 1</a>
          <span aria-hidden="true"> · </span>
          <a href="https://doi.org/10.1016/j.cont.2023.100709" target="_blank" rel="noreferrer">ICS-SUFU presión-flujo 2023, parte 2</a>
        </p>
      </footer>
    </main>
  );
}
