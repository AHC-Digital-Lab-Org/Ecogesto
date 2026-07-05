import "../src/config/load-env.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.startsWith("file:")) {
  throw new Error("DATABASE_URL debe usar SQLite con el formato file:...");
}

const prismaDir = fileURLToPath(new URL("../prisma/", import.meta.url));
const configuredPath = decodeURIComponent(databaseUrl.slice("file:".length).split("?", 1)[0]);
const databasePath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.resolve(prismaDir, configuredPath);
const migrationPath = fileURLToPath(
  new URL("../prisma/migrations/20260618170000_initial/migration.sql", import.meta.url)
);
const migration = readFileSync(migrationPath, "utf8");
const database = new DatabaseSync(databasePath);

try {
  database.exec(migration);
  console.log(`Base de datos preparada: ${databasePath}`);
} finally {
  database.close();
}
