import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const courseRoutePaths = [
  "/pretest",
  "/curso",
  ...Array.from({ length: 9 }, (_, index) => `/curso/modulo/${index + 1}`),
  "/escenarios",
  "/postest",
  "/practica",
  "/fuentes",
];

export async function generateRouteEntrypoints(distDir = path.join(projectRoot, "dist")) {
  const indexPath = path.join(distDir, "index.html");
  const appShell = await readFile(indexPath);

  await Promise.all(courseRoutePaths.map(async (routePath) => {
    const routeDirectory = path.join(distDir, ...routePath.split("/").filter(Boolean));
    await mkdir(routeDirectory, { recursive: true });
    await writeFile(path.join(routeDirectory, "index.html"), appShell);
  }));
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  await generateRouteEntrypoints();
}
