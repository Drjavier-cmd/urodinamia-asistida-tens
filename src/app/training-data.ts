export type AssessmentQuestion = {
  id: string;
  domain: string;
  moduleId: string;
  moduleTitle: string;
  prompt: string;
  options: string[];
  answer: number;
  rationale: string;
};

export type AssessmentBlueprint = {
  pretestIds: readonly string[];
  posttestIds: readonly string[];
  posttestCriticalIds: readonly string[];
};

export type CompetencyProfile = {
  id: string;
  title: string;
  subtitle: string;
  know: string[];
  recognize: string[];
  execute: string[];
  outside: string[];
};

export type PracticalItem = {
  id: string;
  group: string;
  label: string;
  evidence: string;
  layer: "Estándar general" | "Manual del equipo" | "Protocolo local";
};

export type IncidentScenario = {
  id: string;
  title: string;
  cue: string;
  priority: "Señal" | "Circuito" | "Paciente";
  detect: string;
  notify: string;
};

export const competencyProfiles: CompetencyProfile[] = [
  {
    id: "tens",
    title: "TENS / técnico ayudante",
    subtitle: "Perfil destinatario del curso",
    know: [
      "Orden del procedimiento: flujo libre, residuo, instalación, montaje de presión, llenado, vaciado y cierre.",
      "Función de Pves, Pabd y del cálculo Pdet = Pves − Pabd.",
      "Materiales, conexiones y controles técnicos que deben estar disponibles en cada etapa.",
    ],
    recognize: [
      "Uroflujómetro apagado, receptor con contenido o embudo desalineado.",
      "Aire, acodamiento, desconexión, desplazamiento o una curva que no responde.",
      "Dolor, mareo, malestar súbito o signos de compromiso vital que exigen aviso y escalamiento.",
    ],
    execute: [
      "Preparar sala y materiales; trasladar y posicionar el uroflujómetro con cuidado.",
      "Asistir la instalación y fijar las líneas según la técnica enseñada y la indicación profesional.",
      "Conectar, nivelar, realizar el cero y marcar eventos solo dentro de la autorización local.",
    ],
    outside: [
      "Indicar el estudio, interpretar curvas, emitir diagnósticos o informar resultados clínicos.",
      "Reinsertar, avanzar o recolocar catéteres invasivos de manera autónoma.",
      "Modificar el protocolo, el equipo o una decisión clínica sin instrucción del profesional responsable.",
    ],
  },
  {
    id: "responsable",
    title: "Profesional responsable",
    subtitle: "Conduce el procedimiento",
    know: [
      "Indicación clínica, protocolo del centro, manual del equipo y criterios de calidad del registro.",
      "Técnica de instalación, respuesta ante eventos y límites de delegación definidos por el centro.",
      "Interpretación clínica y documentación final del estudio.",
    ],
    recognize: [
      "Artefactos que comprometen la validez y eventos clínicos que requieren modificar o suspender el procedimiento.",
      "Cuándo una corrección técnica recupera una señal y cuándo el estudio deja de ser interpretable.",
      "Necesidad de adaptar la asistencia a la condición del paciente.",
    ],
    execute: [
      "Indicar y conducir las maniobras clínicas e invasivas asignadas por el protocolo local.",
      "Supervisar las correcciones, decidir continuidad o suspensión e interpretar el registro.",
      "Documentar desviaciones y comunicar el resultado según las normas del centro.",
    ],
    outside: [
      "Delegar tareas sin verificar entrenamiento, autorización y supervisión local.",
      "Usar la finalización de esta web como sustituto de evaluación práctica.",
      "Omitir el manual del fabricante o el protocolo institucional cuando difieran del material general.",
    ],
  },
  {
    id: "supervisor",
    title: "Docente / supervisor práctico",
    subtitle: "Observa y valida desempeño",
    know: [
      "Objetivos del curso, respuestas esperadas, rúbrica práctica y protocolo vigente del centro.",
      "Diferencia entre conocimiento teórico, desempeño con ayuda y ejecución lograda.",
      "Cambios de versión y contenidos pendientes de validación.",
    ],
    recognize: [
      "Errores críticos, necesidad de recuperación dirigida y tareas aún no observadas.",
      "Diferencias entre el equipo usado en la web y el equipo real del hospital.",
      "Situaciones que deben escalarse al profesional responsable o al centro.",
    ],
    execute: [
      "Observar directamente, registrar evidencia, retroalimentar y repetir los ítems no logrados.",
      "Firmar la evaluación solo cuando se cumplen los criterios institucionales.",
      "Mantener la hoja de adaptación y el historial de revisión del curso.",
    ],
    outside: [
      "Certificar una competencia no observada o basada únicamente en el puntaje web.",
      "Aprobar contenido de seguridad, infecciones o equipo sin la validación institucional correspondiente.",
      "Cambiar la técnica clínica enseñada por el autor sin revisión y registro del cambio.",
    ],
  },
];

export const assessmentBank: AssessmentQuestion[] = [
  {
    id: "flow-ready",
    domain: "Flujo libre",
    moduleId: "flujo",
    moduleTitle: "Flujo libre",
    prompt: "Antes del flujo libre, ¿qué conjunto de controles debe estar confirmado?",
    options: [
      "Equipo encendido, receptor vacío, embudo alineado y privacidad",
      "Catéter vesical instalado y puerta abierta",
      "Solo el volumen que espera obtener el operador",
    ],
    answer: 0,
    rationale: "La medición parte con el equipo operativo, sin contenido previo, bien alineado y en condiciones de privacidad.",
  },
  {
    id: "flow-catheter",
    domain: "Flujo libre",
    moduleId: "flujo",
    moduleTitle: "Flujo libre",
    prompt: "¿Qué caracteriza al primer flujo libre?",
    options: [
      "Se realiza sin catéteres",
      "Se realiza después de instalar los catéteres de presión",
      "Siempre se realiza con el paciente de pie",
    ],
    answer: 0,
    rationale: "El primer flujo es una medición no instrumentada; los catéteres se instalan después.",
  },
  {
    id: "sequence-flow-first",
    domain: "Secuencia",
    moduleId: "flujo",
    moduleTitle: "Flujo libre",
    prompt: "¿Qué medición se realiza antes de instalar los catéteres y comenzar el montaje de presión?",
    options: [
      "La uroflujometría libre",
      "La fase de llenado instrumentado",
      "La tos de control",
    ],
    answer: 0,
    rationale: "La uroflujometría libre es el primer registro y se realiza antes de instalar los catéteres.",
  },
  {
    id: "flow-position",
    domain: "Flujo libre",
    moduleId: "flujo",
    moduleTitle: "Flujo libre",
    prompt: "Según la enseñanza de este curso, ¿qué posición se prefiere para el flujo libre?",
    options: [
      "Sentado en mujeres y hombres; el hombre también puede hacerlo de pie",
      "De pie en todas las mujeres",
      "En litotomía para todos los pacientes",
    ],
    answer: 0,
    rationale: "La posición preferida en este curso es sentada para ambos; el hombre puede usar la posición de pie si corresponde.",
  },
  {
    id: "flow-privacy",
    domain: "Flujo libre",
    moduleId: "flujo",
    moduleTitle: "Flujo libre",
    prompt: "Si al paciente le cuesta iniciar la micción, ¿qué apoyo se contempla?",
    options: [
      "Mantener privacidad y, si se requiere, usar sonido de agua corriendo",
      "Abrir la puerta para observarlo",
      "Instalar un catéter antes de esperar",
    ],
    answer: 0,
    rationale: "La privacidad favorece una micción representativa; el sonido de agua puede facilitar el inicio.",
  },
  {
    id: "transfer-close",
    domain: "Traslado",
    moduleId: "residuo",
    moduleTitle: "Residuo y traslado",
    prompt: "¿Qué debe ocurrir con el uroflujómetro después del flujo libre?",
    options: [
      "Vaciar el receptor y trasladar el equipo cuidadosamente hacia la camilla si se usará allí",
      "Trasladarlo con el contenido para no perder la muestra",
      "Dejar el mismo receptor lleno para el vaciado final",
    ],
    answer: 0,
    rationale: "El cierre incluye vaciar el contenido indicado y mover el equipo sin dañarlo, dejando un receptor limpio.",
  },
  {
    id: "pvr-method",
    domain: "Traslado",
    moduleId: "residuo",
    moduleTitle: "Residuo y traslado",
    prompt: "¿Quién define si el residuo postmiccional se mide por ecografía o con sonda Nelaton?",
    options: [
      "El profesional responsable",
      "El software de urodinamia",
      "El TENS de manera autónoma",
    ],
    answer: 0,
    rationale: "El TENS prepara y asiste el método indicado; la decisión corresponde al profesional responsable.",
  },
  {
    id: "vesical-sterile",
    domain: "Catéteres",
    moduleId: "cateteres",
    moduleTitle: "Catéteres",
    prompt: "¿Qué condición se exige para la instalación del catéter vesical en este curso?",
    options: [
      "Técnica estéril",
      "Solo guantes de procedimiento en cualquier caso",
      "Instalarlo antes del flujo libre",
    ],
    answer: 0,
    rationale: "La instalación vesical es el paso estéril descrito por el docente.",
  },
  {
    id: "male-fixation",
    domain: "Catéteres",
    moduleId: "cateteres",
    moduleTitle: "Catéteres",
    prompt: "En la fijación masculina enseñada, ¿qué envuelven las dos lengüetas cortadas?",
    options: [
      "El catéter urodinámico",
      "El pene completo",
      "La pierna",
    ],
    answer: 0,
    rationale: "Se usa una cinta longitudinal con un extremo dividido; sus lengüetas envuelven el catéter, no el pene.",
  },
  {
    id: "female-fixation",
    domain: "Catéteres",
    moduleId: "cateteres",
    moduleTitle: "Catéteres",
    prompt: "¿Cómo se estabiliza la línea vesical en la mujer según el curso?",
    options: [
      "Fijación inmediata al labio mayor y una segunda fijación a la pierna",
      "Solo alrededor del abdomen",
      "Sin ninguna fijación",
    ],
    answer: 0,
    rationale: "La fijación primaria estabiliza el catéter y la segunda descarga la tracción durante el movimiento.",
  },
  {
    id: "pves-source",
    domain: "Presiones",
    moduleId: "senales",
    moduleTitle: "Presiones",
    prompt: "¿Qué medición proviene del catéter vesical?",
    options: ["Presión vesical total", "Presión abdominal", "Flujo urinario"],
    answer: 0,
    rationale: "La presión vesical total proviene del catéter vesical; su abreviatura se presenta después, en el módulo de presiones.",
  },
  {
    id: "pabd-source",
    domain: "Presiones",
    moduleId: "senales",
    moduleTitle: "Presiones",
    prompt: "¿Qué canal aporta la referencia de presión abdominal?",
    options: ["Pabd", "Pdet", "Flujo"],
    answer: 0,
    rationale: "Pabd se obtiene por el canal abdominal, representado en este curso por el catéter rectal con balón.",
  },
  {
    id: "pdet-formula",
    domain: "Presiones",
    moduleId: "senales",
    moduleTitle: "Presiones",
    prompt: "¿Qué relación calcula el software para obtener la presión del detrusor?",
    options: [
      "Presión del detrusor = presión vesical − presión abdominal",
      "Presión del detrusor = presión vesical + presión abdominal",
      "La presión del detrusor se mide mediante un tercer catéter",
    ],
    answer: 0,
    rationale: "La presión del detrusor es igual a la presión vesical menos la presión abdominal; depende de que ambas señales sean técnicamente fiables.",
  },
  {
    id: "air-free",
    domain: "Calidad técnica",
    moduleId: "cero",
    moduleTitle: "Conexión y cero",
    prompt: "¿Por qué deben eliminarse las burbujas de las líneas de presión?",
    options: [
      "Porque alteran la transmisión de la columna de líquido",
      "Porque cambian el color del registro",
      "Solo por una razón estética",
    ],
    answer: 0,
    rationale: "El procedimiento mide columnas de líquido; el aire deteriora la transmisión de presión.",
  },
  {
    id: "sensor-level",
    domain: "Calidad técnica",
    moduleId: "cero",
    moduleTitle: "Conexión y cero",
    prompt: "¿Dónde se nivelan los sensores en la posición de estudio?",
    options: [
      "A la altura de la sínfisis púbica",
      "A la altura del hombro",
      "En cualquier altura si el software marca cero",
    ],
    answer: 0,
    rationale: "Nivelación y cero son controles diferentes; el cero no compensa una altura incorrecta.",
  },
  {
    id: "cough-control",
    domain: "Calidad técnica",
    moduleId: "cero",
    moduleTitle: "Conexión y cero",
    prompt: "¿Qué respuesta técnica se espera en una tos de control?",
    options: [
      "Pves y Pabd responden de forma semejante y Pdet cambia poco",
      "Solo responde Pdet",
      "Pabd permanece completamente plana",
    ],
    answer: 0,
    rationale: "La tos permite comprobar que ambos canales transmiten el mismo cambio abdominal.",
  },
  {
    id: "flat-pabd",
    domain: "Vigilancia",
    moduleId: "llenado",
    moduleTitle: "Llenado",
    prompt: "Durante una tos de control, la curva de presión abdominal permanece plana mientras la presión vesical responde. ¿Qué corresponde primero?",
    options: [
      "Detectar la respuesta discordante y avisar al profesional responsable",
      "Eliminar la curva abdominal y continuar solo con la presión vesical",
      "Concluir que existe una contracción involuntaria del detrusor",
    ],
    answer: 0,
    rationale: "Durante una tos, ambas curvas de presión deben responder. Si la abdominal permanece plana, el TENS reconoce la discordancia y avisa; fuera de una maniobra de control, un cambio vesical aislado puede corresponder a actividad del detrusor y no demuestra por sí solo una falla técnica.",
  },
  {
    id: "negative-curve",
    domain: "Vigilancia",
    moduleId: "vaciado",
    moduleTitle: "Vaciado",
    prompt: "Una curva se vuelve negativa o deja de estar 'viva'. ¿Cuál es el rol mínimo esperado?",
    options: [
      "Reconocer que la señal es dudosa y avisar al profesional responsable",
      "Emitir un diagnóstico con esa curva",
      "Ocultarla y continuar sin registrarlo",
    ],
    answer: 0,
    rationale: "El objetivo formativo es reconocer una señal técnicamente dudosa, no interpretarla clínicamente.",
  },
  {
    id: "voiding-ready",
    domain: "Vaciado",
    moduleId: "vaciado",
    moduleTitle: "Vaciado",
    prompt: "Antes de autorizar el vaciado instrumentado, ¿qué se vuelve a comprobar?",
    options: [
      "Posición, receptor, embudo, uroflujómetro y señales",
      "Solo que la puerta esté abierta",
      "Que los catéteres ya se hayan retirado",
    ],
    answer: 0,
    rationale: "Presión y flujo deben conservarse sincronizados en la posición definida y con el receptor listo.",
  },
  {
    id: "voiding-privacy",
    domain: "Vaciado",
    moduleId: "vaciado",
    moduleTitle: "Vaciado",
    prompt: "¿Qué condición debe conservarse durante el vaciado final?",
    options: [
      "La posición definida, el uroflujómetro listo y la privacidad",
      "La puerta abierta para observar al paciente",
      "El receptor usado previamente sin vaciar",
    ],
    answer: 0,
    rationale: "El vaciado mantiene la posición definida, el montaje de flujo listo y un entorno que favorezca una micción representativa.",
  },
  {
    id: "scope-interpretation",
    domain: "Rol y límites",
    moduleId: "fundamentos",
    moduleTitle: "Qué es",
    prompt: "¿Qué acción queda fuera del objetivo de este curso para TENS?",
    options: [
      "Interpretar clínicamente las curvas y emitir un diagnóstico",
      "Preparar el equipo",
      "Avisar si una señal pierde calidad",
    ],
    answer: 0,
    rationale: "El curso entrena asistencia y calidad técnica; la interpretación clínica corresponde al profesional responsable.",
  },
  {
    id: "patient-event",
    domain: "Rol y límites",
    moduleId: "llenado",
    moduleTitle: "Llenado",
    prompt: "El paciente presenta dolor intenso, mareo o malestar súbito. ¿Qué corresponde al TENS?",
    options: [
      "Avisar de inmediato al profesional y detener solo ante compromiso vital",
      "Continuar para no perder el registro",
      "Realizar una corrección invasiva sin avisar",
    ],
    answer: 0,
    rationale: "El TENS detecta y avisa. La pausa autónoma se reserva para un compromiso vital inmediato y el escalamiento sigue el protocolo local.",
  },
];

export const assessmentBlueprint: AssessmentBlueprint = {
  pretestIds: [
    "flow-catheter",
    "transfer-close",
    "sequence-flow-first",
    "pves-source",
    "air-free",
    "flat-pabd",
    "voiding-privacy",
    "scope-interpretation",
  ],
  posttestIds: [
    "flow-ready",
    "flow-position",
    "flow-privacy",
    "pvr-method",
    "vesical-sterile",
    "male-fixation",
    "female-fixation",
    "pabd-source",
    "pdet-formula",
    "sensor-level",
    "cough-control",
    "negative-curve",
    "voiding-ready",
    "patient-event",
  ],
  posttestCriticalIds: [
    "vesical-sterile",
    "negative-curve",
    "patient-event",
  ],
};

export const practicalItems: PracticalItem[] = [
  {
    id: "room-material",
    group: "Preparación",
    label: "Sala y materiales listos antes de recibir al paciente",
    evidence: "Identifica el material faltante sin iniciar el procedimiento.",
    layer: "Protocolo local",
  },
  {
    id: "flow-device",
    group: "Uroflujo",
    label: "Comprueba encendido o batería, receptor vacío y embudo alineado",
    evidence: "Realiza los tres controles frente al equipo real.",
    layer: "Manual del equipo",
  },
  {
    id: "flow-privacy",
    group: "Uroflujo",
    label: "Prepara una posición sentada y condiciones de privacidad",
    evidence: "Da una instrucción clara y deja al paciente en privacidad.",
    layer: "Estándar general",
  },
  {
    id: "transfer-device",
    group: "Traslado",
    label: "Vacía el receptor y traslada el uroflujómetro sin dañarlo",
    evidence: "Asegura partes móviles y deja un receptor limpio para la fase siguiente.",
    layer: "Manual del equipo",
  },
  {
    id: "vesical-field",
    group: "Instalación y fijación",
    label: "Prepara el paso vesical estéril sin contaminar el campo",
    evidence: "Entrega material en el orden indicado y reconoce una ruptura de técnica.",
    layer: "Protocolo local",
  },
  {
    id: "fixation",
    group: "Instalación y fijación",
    label: "Fija las líneas según sexo y técnica enseñada, sin tracción ni acodamiento",
    evidence: "Demuestra fijación femenina y masculina en simulador o paciente supervisado.",
    layer: "Protocolo local",
  },
  {
    id: "channels",
    group: "Montaje de presión",
    label: "Conecta Pves y Pabd a sus canales correctos y mantiene la línea sin aire",
    evidence: "Traza verbalmente cada conexión y comprueba permeabilidad externa.",
    layer: "Manual del equipo",
  },
  {
    id: "level-zero",
    group: "Montaje de presión",
    label: "Nivela a pubis y realiza cero ambiental en el orden indicado",
    evidence: "Distingue nivelación de puesta a cero y confirma llaves o puertos.",
    layer: "Estándar general",
  },
  {
    id: "cough-test",
    group: "Control de calidad",
    label: "Realiza la tos de control y reconoce respuesta comparable de Pves y Pabd",
    evidence: "Comunica al profesional si uno de los canales no responde.",
    layer: "Estándar general",
  },
  {
    id: "artifacts",
    group: "Control de calidad",
    label: "Detecta burbujas, acodamiento, desplazamiento y curva no responsiva o negativa",
    evidence: "Describe el hallazgo y avisa, sin decidir correcciones de forma autónoma.",
    layer: "Estándar general",
  },
  {
    id: "voiding",
    group: "Vaciado",
    label: "Revisa el uroflujómetro y conserva posición y privacidad durante el vaciado",
    evidence: "Confirma receptor, embudo, señales y entorno antes de dar la orden.",
    layer: "Protocolo local",
  },
  {
    id: "close",
    group: "Cierre",
    label: "Asiste el residuo, retiro y cierre según indicación profesional",
    evidence: "Entrega el equipo limpio y registra incidentes o desviaciones.",
    layer: "Protocolo local",
  },
];

export const incidentScenarios: IncidentScenario[] = [
  {
    id: "pabd-loss",
    title: "Pérdida de Pabd",
    cue: "Pves responde a la tos y Pabd permanece plana; Pdet cambia de forma discordante.",
    priority: "Señal",
    detect: "Reconocer que durante la tos la presión abdominal permanece plana y que el cambio de Pdet es derivado. El hallazgo puede corresponder a un artefacto y no autoriza una interpretación clínica.",
    notify: "Avisar al profesional responsable qué curva no respondió y durante qué maniobra. Esperar su indicación antes de revisar o modificar el circuito.",
  },
  {
    id: "bubbles",
    title: "Burbujas en la línea",
    cue: "Se observa aire en el circuito o una respuesta amortiguada e irregular.",
    priority: "Circuito",
    detect: "Identificar aire visible o una respuesta amortiguada e irregular como posible artefacto que puede influir en las decisiones sobre el registro.",
    notify: "Avisar al profesional responsable y seguir su indicación. El TENS no elimina el aire ni decide repetir o aceptar el trazado de forma autónoma.",
  },
  {
    id: "kink",
    title: "Acodamiento",
    cue: "Una línea queda doblada, comprimida por la pierna o atrapada en la camilla.",
    priority: "Circuito",
    detect: "Reconocer visualmente que el trayecto externo está doblado, comprimido o atrapado, sin atribuir por sí solo significado clínico al cambio de curva.",
    notify: "Avisar al profesional y señalar dónde se observa el acodamiento. Corregirlo solo si recibe una indicación directa.",
  },
  {
    id: "displacement",
    title: "Desplazamiento",
    cue: "La cinta se despega, cambia la longitud externa o aparece un salto brusco de base.",
    priority: "Circuito",
    detect: "Reconocer un cambio en la cinta, la longitud externa o la línea de base, sin traccionar, avanzar ni reinsertar el catéter.",
    notify: "Avisar de inmediato para que el profesional decida si corresponde revisar la fijación, recolocar o continuar.",
  },
  {
    id: "negative",
    title: "Curva negativa o sin vida",
    cue: "La señal cae bajo su base, permanece plana o no acompaña una maniobra de control.",
    priority: "Señal",
    detect: "Reconocer una señal técnicamente dudosa; no convertirla en una conclusión clínica.",
    notify: "Comunicar qué canal cambió, cuándo ocurrió y qué se observaba en ese momento. La revisión técnica se realiza según la indicación profesional.",
  },
  {
    id: "pain",
    title: "Dolor",
    cue: "El paciente comunica dolor nuevo o intenso durante instalación, llenado o vaciado.",
    priority: "Paciente",
    detect: "Escuchar el síntoma y observar si coincide con manipulación, tracción o llenado.",
    notify: "Avisar inmediatamente al profesional responsable. Detener de forma autónoma solo ante compromiso vital inmediato y activar el protocolo local.",
  },
  {
    id: "vagal",
    title: "Reacción vagal sospechada",
    cue: "Aparecen mareo, náuseas, sudoración, palidez o malestar súbito.",
    priority: "Paciente",
    detect: "Reconocer un cambio clínico súbito y priorizar la seguridad por sobre la continuidad del registro.",
    notify: "Solicitar de inmediato al profesional responsable. Si existe compromiso vital, detener y activar el escalamiento local; no tratar de forma autónoma.",
  },
];

export const sourceLayers = [
  {
    name: "Estándar general",
    status: "Disponible",
    description: "Principios de calidad y terminología respaldados por documentos ICS.",
  },
  {
    name: "Manual del equipo",
    status: "Pendiente de anexar",
    description: "Botones, conexiones y secuencias específicas del uroflujómetro y software del hospital.",
  },
  {
    name: "Protocolo local",
    status: "Pendiente de aprobación",
    description: "Atribuciones, seguridad, infecciones, residuos, suspensión y escalamiento del centro.",
  },
];

export const bibliographyByModule = [
  {
    module: "Módulos 1-2 · Ciclo y señales",
    source: "ICS Good Urodynamic Practices and Terms 2016",
    href: "https://www.ics.org/folder/standardisation/current-ics-standardisations/d/international-continence-society-good-urodynamic-practices-and-terms-2016-urodynamics-uroflowmetry-cystometry-and-pressure-flow-study/download",
  },
  {
    module: "Módulos 3-5 · Preparación, flujo y residuo",
    source: "ICS Good Urodynamic Practices and Terms 2016, secciones de preparación, uroflujometría y PVR",
    href: "https://www.ics.org/folder/standardisation/current-ics-standardisations/d/international-continence-society-good-urodynamic-practices-and-terms-2016-urodynamics-uroflowmetry-cystometry-and-pressure-flow-study/download",
  },
  {
    module: "Módulo 6 · Catéteres y fijación",
    source: "Técnica docente del autor del curso + protocolo local pendiente de aprobación",
    href: "",
  },
  {
    module: "Módulos 7-9 · Cero, llenado y vaciado",
    source: "ICS Good Urodynamic Practices and Terms 2016",
    href: "https://www.ics.org/folder/standardisation/current-ics-standardisations/d/international-continence-society-good-urodynamic-practices-and-terms-2016-urodynamics-uroflowmetry-cystometry-and-pressure-flow-study/download",
  },
  {
    module: "Módulo 9 · Estudio presión-flujo",
    source: "ICS-SUFU Standard 2023 · Parte 1: teoría y práctica",
    href: "https://doi.org/10.1016/j.cont.2023.100710",
  },
  {
    module: "Módulo 9 · Análisis y reporte",
    source: "ICS-SUFU Standard 2023 · Parte 2: análisis, reporte y diagnóstico",
    href: "https://doi.org/10.1016/j.cont.2023.100709",
  },
  {
    module: "Formación y evaluación",
    source: "ICS School of Urodynamics",
    href: "https://www.ics.org/institute/urodynamics",
  },
];

export const changeHistory = [
  {
    version: "0.8",
    date: "23 julio 2026",
    change: "Flujo libre con imágenes separadas y momento de la orden explícito; fijación masculina redibujada; nivelación simplificada; ejercicio de llenado retirado y escenarios limitados a detectar y avisar, con curvas de pérdida de Pabd.",
  },
  {
    version: "0.7",
    date: "23 julio 2026",
    change: "Fórmula de presión del detrusor redactada como igualdad explícita en el módulo, la decisión de sala, el postest y los materiales institucionales.",
  },
  {
    version: "0.6",
    date: "23 julio 2026",
    change: "Pretest reordenado: fijación masculina trasladada a evaluación posterior, presiones escritas inicialmente sin abreviaturas y caso de señal abdominal corregido con tos de control.",
  },
  {
    version: "0.5",
    date: "23 julio 2026",
    change: "Pdet derivado, evaluación estratificada, preguntas críticas, bloqueo progresivo, persistencia protegida y bibliografía ICS-SUFU 2023.",
  },
  {
    version: "0.4",
    date: "22 julio 2026",
    change: "Matriz de competencias, pretest, postest, recuperación dirigida, rúbrica práctica, escenarios y gobierno científico.",
  },
  {
    version: "0.3",
    date: "21 julio 2026",
    change: "Corrección docente de la fijación masculina: una cinta longitudinal con lengüetas que envuelven el catéter.",
  },
  {
    version: "0.2",
    date: "21 julio 2026",
    change: "Secuencia operativa completa, imágenes reales de equipo y exploradores de presión, flujo y cero.",
  },
];

export const pendingClinicalItems = [
  "Nombre de publicación del autor y docente clínico.",
  "Nombre del revisor clínico y aprobación formal del centro.",
  "Redacción final sobre la condición de preparación del catéter abdominal/rectal. El punto fue excluido de las evaluaciones.",
  "Capítulo institucional de higiene, desinfección, residuos, prevención de contaminación y criterios de suspensión.",
  "Manual y modelo exacto del uroflujómetro, transductores y software del hospital.",
];
