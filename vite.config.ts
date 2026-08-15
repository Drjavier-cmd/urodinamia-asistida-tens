import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const publicBase = "/urodinamia-asistida-tens/";

export default defineConfig({
  root: projectRoot,
  base: publicBase,
  publicDir: path.resolve(projectRoot, "public"),
  plugins: [
    {
      name: "standalone-asset-paths",
      enforce: "pre",
      transform(code, id) {
        if (!/[\\/]src[\\/]app[\\/]/.test(id)) {
          return null;
        }

        return code
          .replaceAll('"/images/', `"${publicBase}images/`)
          .replaceAll('"/downloads/', `"${publicBase}downloads/`);
      },
    },
    react(),
  ],
  build: {
    outDir: path.resolve(projectRoot, "dist"),
    emptyOutDir: true,
  },
});
