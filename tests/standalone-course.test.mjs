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
