PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "alias" TEXT NOT NULL,
  "email" TEXT,
  "nombre" TEXT,
  "tipo_usuario" TEXT NOT NULL DEFAULT 'usuario_registrado',
  "ciudad" TEXT,
  "pais" TEXT NOT NULL DEFAULT 'España',
  "fecha_alta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "consentimientos" JSONB NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'activo',
  "totp_secret" TEXT,
  "two_factor_on" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "profiles" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "hogar" JSONB,
  "movilidad" JSONB,
  "dieta" JSONB,
  "vivienda" JSONB,
  "presupuesto" TEXT,
  "motivaciones" JSONB,
  "barreras" JSONB,
  "nivel_compromiso" TEXT,
  "cohort_id" TEXT,
  CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "parent_id" TEXT,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT,
  "icono" TEXT NOT NULL DEFAULT 'eco',
  "color" TEXT NOT NULL DEFAULT '#4F9447',
  "orden" INTEGER NOT NULL DEFAULT 0,
  "activa" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ecogestures" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "codigo" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "resumen" TEXT NOT NULL,
  "descripcion" TEXT,
  "categoria_id" TEXT NOT NULL,
  "dificultad" TEXT NOT NULL,
  "coste" TEXT NOT NULL,
  "impacto" REAL NOT NULL DEFAULT 0,
  "unidad" TEXT NOT NULL DEFAULT 'kg CO2e',
  "periodo" TEXT NOT NULL DEFAULT 'anual',
  "estado" TEXT NOT NULL DEFAULT 'Borrador',
  "version" INTEGER NOT NULL DEFAULT 1,
  "fecha_alta" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fecha_revision" DATETIME,
  "slug" TEXT NOT NULL,
  "alias_corto" TEXT,
  "idioma" TEXT NOT NULL DEFAULT 'es',
  "licencia" TEXT NOT NULL DEFAULT 'CC BY-NC-SA 4.0',
  "autor" TEXT NOT NULL DEFAULT 'AHC',
  "validador" TEXT,
  "subcategoria" TEXT,
  "perfiles" JSONB NOT NULL,
  "icono" TEXT NOT NULL DEFAULT 'eco',
  "fuente" TEXT NOT NULL DEFAULT 'pendiente',
  "confianza" TEXT NOT NULL DEFAULT 'pendiente',
  "impacto_nivel" TEXT NOT NULL DEFAULT 'pendiente',
  "ambito" TEXT NOT NULL DEFAULT 'hogar',
  CONSTRAINT "ecogestures_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ecogesture_steps" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ecogesture_id" TEXT NOT NULL,
  "orden" INTEGER NOT NULL,
  "titulo" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "evidencia_requerida" TEXT,
  "tiempo_estimado" TEXT,
  CONSTRAINT "ecogesture_steps_ecogesture_id_fkey" FOREIGN KEY ("ecogesture_id") REFERENCES "ecogestures" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "impact_factors" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ecogesture_id" TEXT NOT NULL,
  "variable" TEXT NOT NULL,
  "formula" TEXT NOT NULL,
  "factor" REAL NOT NULL,
  "unidad" TEXT NOT NULL,
  "fuente" TEXT NOT NULL,
  "confianza" TEXT NOT NULL,
  "fecha_revision" DATETIME,
  CONSTRAINT "impact_factors_ecogesture_id_fkey" FOREIGN KEY ("ecogesture_id") REFERENCES "ecogestures" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ecogesture_id" TEXT,
  "tipo" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt_text" TEXT NOT NULL,
  "licencia" TEXT NOT NULL,
  "autor" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'activo',
  CONSTRAINT "media_assets_ecogesture_id_fkey" FOREIGN KEY ("ecogesture_id") REFERENCES "ecogestures" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "plans" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "objetivo" TEXT,
  "fecha_creacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "estado" TEXT NOT NULL DEFAULT 'activo',
  "total_co2" REAL NOT NULL DEFAULT 0,
  "total_coste" REAL NOT NULL DEFAULT 0,
  "total_agua" REAL NOT NULL DEFAULT 0,
  "total_plastico" REAL NOT NULL DEFAULT 0,
  "snapshot" JSONB,
  CONSTRAINT "plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "plan_items" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "plan_id" TEXT NOT NULL,
  "ecogesture_id" TEXT NOT NULL,
  "prioridad" TEXT NOT NULL,
  "porcentaje_aplicacion" REAL NOT NULL DEFAULT 100,
  "plazo" TEXT NOT NULL,
  "frecuencia" TEXT NOT NULL,
  "impacto_estimado" REAL NOT NULL DEFAULT 0,
  "coste_estimado" REAL NOT NULL DEFAULT 0,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "factor_snapshot" JSONB,
  CONSTRAINT "plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "plan_items_ecogesture_id_fkey" FOREIGN KEY ("ecogesture_id") REFERENCES "ecogestures" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "results" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "ecogesture_id" TEXT NOT NULL,
  "plan_item_id" TEXT,
  "plan_id" TEXT,
  "fecha_inicio" DATETIME,
  "fecha_fin" DATETIME,
  "valor" REAL NOT NULL,
  "unidad" TEXT NOT NULL,
  "co2_real" REAL NOT NULL DEFAULT 0,
  "evidencia_url" TEXT,
  "comentario" TEXT,
  "validacion_estado" TEXT NOT NULL DEFAULT 'declarado',
  "factor_snapshot" JSONB,
  CONSTRAINT "results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "results_ecogesture_id_fkey" FOREIGN KEY ("ecogesture_id") REFERENCES "ecogestures" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "results_plan_item_id_fkey" FOREIGN KEY ("plan_item_id") REFERENCES "plan_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "results_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ecoroutes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "codigo" TEXT NOT NULL,
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "perfil_objetivo" TEXT NOT NULL,
  "dificultad_total" TEXT NOT NULL,
  "impacto_estimado" REAL NOT NULL DEFAULT 0,
  "estado" TEXT NOT NULL DEFAULT 'Borrador'
);

CREATE TABLE IF NOT EXISTS "ecoroute_items" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ecoroute_id" TEXT NOT NULL,
  "ecogesture_id" TEXT NOT NULL,
  "orden" INTEGER NOT NULL,
  "obligatorio" BOOLEAN NOT NULL DEFAULT false,
  "prerequisito_id" TEXT,
  CONSTRAINT "ecoroute_items_ecoroute_id_fkey" FOREIGN KEY ("ecoroute_id") REFERENCES "ecoroutes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ecoroute_items_ecogesture_id_fkey" FOREIGN KEY ("ecogesture_id") REFERENCES "ecogestures" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ecoroute_items_prerequisito_id_fkey" FOREIGN KEY ("prerequisito_id") REFERENCES "ecogestures" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "moodle_links" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ecogesture_id" TEXT NOT NULL,
  "course_id" TEXT,
  "activity_id" TEXT,
  "enrol_url" TEXT,
  "badge_id" TEXT,
  "certificate_template_id" TEXT,
  "sync_status" TEXT NOT NULL DEFAULT 'pendiente',
  CONSTRAINT "moodle_links_ecogesture_id_fkey" FOREIGN KEY ("ecogesture_id") REFERENCES "ecogestures" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "badges" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "criteria" TEXT NOT NULL,
  "image_url" TEXT,
  "issuer_name" TEXT NOT NULL DEFAULT 'EcoGestos AHC',
  "issuer_url" TEXT NOT NULL DEFAULT 'https://ecogestos.local',
  "badge_type" TEXT NOT NULL DEFAULT 'open_badge_2',
  "points_awarded" INTEGER NOT NULL DEFAULT 0,
  "rule" JSONB,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "badge_awards" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "badge_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "issued_on" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "evidence_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'issued',
  "snapshot" JSONB,
  CONSTRAINT "badge_awards_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "badge_awards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "rewards" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "reward_type" TEXT NOT NULL DEFAULT 'digital',
  "points_required" INTEGER NOT NULL,
  "stock" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "terms" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "reward_redemptions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reward_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "points_spent" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'solicitado',
  "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" DATETIME NOT NULL,
  "notes" TEXT,
  "snapshot" JSONB,
  CONSTRAINT "reward_redemptions_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "reward_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "usuario" TEXT NOT NULL,
  "entidad" TEXT NOT NULL,
  "entidad_id" TEXT NOT NULL,
  "accion" TEXT NOT NULL,
  "antes" JSONB,
  "despues" JSONB,
  "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip" TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_alias_key" ON "users" ("alias");
CREATE UNIQUE INDEX IF NOT EXISTS "ecogestures_codigo_key" ON "ecogestures" ("codigo");
CREATE UNIQUE INDEX IF NOT EXISTS "ecogestures_slug_key" ON "ecogestures" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "plan_items_plan_id_ecogesture_id_key" ON "plan_items" ("plan_id", "ecogesture_id");
CREATE UNIQUE INDEX IF NOT EXISTS "ecoroutes_codigo_key" ON "ecoroutes" ("codigo");
CREATE UNIQUE INDEX IF NOT EXISTS "ecoroute_items_ecoroute_id_ecogesture_id_key" ON "ecoroute_items" ("ecoroute_id", "ecogesture_id");
CREATE UNIQUE INDEX IF NOT EXISTS "moodle_links_ecogesture_id_key" ON "moodle_links" ("ecogesture_id");
CREATE UNIQUE INDEX IF NOT EXISTS "badges_code_key" ON "badges" ("code");
CREATE UNIQUE INDEX IF NOT EXISTS "badge_awards_badge_id_user_id_key" ON "badge_awards" ("badge_id", "user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "rewards_code_key" ON "rewards" ("code");

PRAGMA foreign_keys=ON;
