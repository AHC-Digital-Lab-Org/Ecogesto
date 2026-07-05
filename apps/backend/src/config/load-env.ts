import { config } from "dotenv";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// El módulo vive a distinta profundidad al ejecutarse desde src/ o dist/src/.
// Ambas rutas son independientes del directorio actual y portables entre sistemas.
const envPaths = ["../../../../.env", "../../../../../.env"]
  .map((relativePath) => fileURLToPath(new URL(relativePath, import.meta.url)));
const envPath = envPaths.find(existsSync);

if (envPath) {
  config({ path: envPath });
}
