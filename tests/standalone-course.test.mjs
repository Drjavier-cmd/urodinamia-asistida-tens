import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("the standalone entry renders only Urodinamia asistida", async () => {
  const app = await read("../src/App.tsx");

  assert.match(app, /UrodynamicsCourse/);
  assert.doesNotMatch(app, /CourseSwitcher|courseRegistry|HospitalizedCareCourse/);
});

test("the extracted source has no dependency on the other course or ChatGPT hosting", async () => {
  const files = await Promise.all([
    read("../src/App.tsx"),
    read("../src/app/courses/urodinamia/definition.ts"),
    read("../src/app/courses/urodinamia/urodynamics-course.tsx"),
    read("../vite.config.ts"),
  ]);
  const source = files.join("\n");

  assert.doesNotMatch(source, /cuidados-hospitalizados|cuidados-urologicos-paciente-hospitalizado/);
  assert.doesNotMatch(source, /chatgpt\.site|git\.chatgpt-team\.site/);
});

test("course identity and evaluation boundaries remain explicit", async () => {
  const definition = await read("../src/app/courses/urodinamia/definition.ts");
  const training = await read("../src/app/training-center.tsx");

  assert.match(definition, /URODYNAMICS_COURSE_ID = "urodinamia-asistida"/);
  assert.match(definition, /passingPercentage: 80/);
  assert.match(training, /La web enseña; la sala demuestra competencia/);
  assert.match(training, /No acredita identidad, competencia práctica ni autorización institucional/);
  assert.match(training, /No observado/);
  assert.match(training, /Con ayuda/);
  assert.match(training, /Logrado/);
});

test("GitHub Pages base path is dedicated to this product", async () => {
  const config = await read("../vite.config.ts");

  assert.match(config, /\/urodinamia-asistida-tens\//);
  assert.doesNotMatch(config, /urodynamic-tutor-demo|revision-tens/);
});

test("the pilot exposes a real page graph and nine module URLs", async () => {
  const routes = await read("../src/app/course-platform/routes.ts");
  const course = await read("../src/app/courses/urodinamia/urodynamics-course.tsx");

  for (const path of ["/pretest", "/curso", "/escenarios", "/postest", "/practica", "/fuentes"]) {
    assert.match(routes, new RegExp(path.replaceAll("/", "\\/")));
  }
  assert.match(routes, /\/curso\/modulo\/\$\{moduleNumber\}/);
  assert.match(routes, /moduleNumber >= 1 && moduleNumber <= 9/);
  assert.match(course, /window\.history\.pushState/);
  assert.match(course, /window\.addEventListener\("popstate"/);
  assert.doesNotMatch(course, /scrollIntoView/);
});

test("module progress and the two evaluation gates remain persistent", async () => {
  const course = await read("../src/app/courses/urodinamia/urodynamics-course.tsx");
  const state = await read("../src/app/course-platform/state.ts");
  const logic = await read("../src/app/training-logic.ts");

  assert.match(course, /readCourseRuntimeState\(/);
  assert.match(course, /writeCourseRuntimeState\(/);
  assert.match(course, /state\.moduleAnswers = answers/);
  assert.match(course, /unlocked=\{progress === 100\}/);
  assert.match(course, /unlocked=\{progress === 100 && posttestPassed\}/);
  assert.match(state, /moduleAnswers: Record<string, number>/);
  assert.match(logic, /score >= threshold && criticalMistakes\.length === 0/);
  assert.match(logic, /threshold = 80/);
});

test("the fixed course inventory remains nine modules, eight pretest questions and seven scenarios", async () => {
  const course = await read("../src/app/courses/urodinamia/urodynamics-course.tsx");
  const training = await read("../src/app/training-center.tsx");
  const data = await read("../src/app/training-data.ts");
  const stageBlock = course.slice(course.indexOf("const stages"), course.indexOf("const signalData"));
  const scenarioBlock = data.slice(data.indexOf("export const incidentScenarios"), data.indexOf("export const sourceLayers"));

  assert.equal([...stageBlock.matchAll(/^\s{4}id: "/gm)].length, 9);
  assert.match(training, /const questionCount = isPost \? 10 : 8/);
  assert.equal([...scenarioBlock.matchAll(/^\s{4}id: "/gm)].length, 7);
});

test("the introduction explains the study before the procedural sequence", async () => {
  const course = await read("../src/app/courses/urodinamia/urodynamics-course.tsx");
  const fundamentals = course.slice(course.indexOf('id: "fundamentos"'), course.indexOf('id: "senales"'));

  assert.match(fundamentals, /intenta simular un ciclo normal de llenado y micción en un ambiente controlado/);
  assert.match(fundamentals, /Flujo libre: registra una micción espontánea sin catéteres/);
  assert.match(fundamentals, /Cistometría de llenado/);
  assert.match(fundamentals, /Fase de vaciado/);
  assert.ok(course.indexOf('id: "senales"') < course.indexOf('id: "equipo"'));
  assert.ok(course.indexOf('id: "equipo"') < course.indexOf('id: "flujo"'));
});

test("direct GitHub Pages routes restore without a dead link", async () => {
  const fallback = await read("../public/404.html");
  const index = await read("../index.html");

  assert.match(fallback, /pathSegmentsToKeep = 1/);
  assert.match(fallback, /location\.replace/);
  assert.match(index, /restoreCourseRoute/);
  assert.match(index, /history\.replaceState/);
});

test("the pilot removes the two unreliable labelled images and avoids catheter upscaling", async () => {
  const course = await read("../src/app/courses/urodinamia/urodynamics-course.tsx");
  const styles = await read("../src/standalone.css");

  assert.doesNotMatch(course, /urodinamia-portada\.jpg|urodinamia-que-es\.jpg/);
  assert.match(course, /ciclo-vesical-resumen\.jpg/);
  assert.match(styles, /width: min\(100% - 36px, 447px\)/);
  assert.match(styles, /\.cycle-phase-visual img[\s\S]*object-fit: contain/);
});
