-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NULL,
    `tipo_usuario` VARCHAR(191) NOT NULL DEFAULT 'usuario_registrado',
    `ciudad` VARCHAR(191) NULL,
    `pais` VARCHAR(191) NOT NULL DEFAULT 'España',
    `fecha_alta` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `consentimientos` JSON NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'activo',
    `totp_secret` VARCHAR(191) NULL,
    `two_factor_on` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `users_alias_key`(`alias`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `hogar` JSON NULL,
    `movilidad` JSON NULL,
    `dieta` JSON NULL,
    `vivienda` JSON NULL,
    `presupuesto` VARCHAR(191) NULL,
    `motivaciones` JSON NULL,
    `barreras` JSON NULL,
    `nivel_compromiso` VARCHAR(191) NULL,
    `cohort_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `icono` VARCHAR(191) NOT NULL DEFAULT 'eco',
    `color` VARCHAR(191) NOT NULL DEFAULT '#4F9447',
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activa` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecogestures` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `resumen` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `categoria_id` VARCHAR(191) NOT NULL,
    `dificultad` VARCHAR(191) NOT NULL,
    `coste` VARCHAR(191) NOT NULL,
    `impacto` DOUBLE NOT NULL DEFAULT 0,
    `unidad` VARCHAR(191) NOT NULL DEFAULT 'kg CO2e',
    `periodo` VARCHAR(191) NOT NULL DEFAULT 'anual',
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Borrador',
    `version` INTEGER NOT NULL DEFAULT 1,
    `fecha_alta` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_revision` DATETIME(3) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `alias_corto` VARCHAR(191) NULL,
    `idioma` VARCHAR(191) NOT NULL DEFAULT 'es',
    `licencia` VARCHAR(191) NOT NULL DEFAULT 'CC BY-NC-SA 4.0',
    `autor` VARCHAR(191) NOT NULL DEFAULT 'AHC',
    `validador` VARCHAR(191) NULL,
    `subcategoria` VARCHAR(191) NULL,
    `perfiles` JSON NOT NULL,
    `icono` VARCHAR(191) NOT NULL DEFAULT 'eco',
    `fuente` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `confianza` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `impacto_nivel` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `ambito` VARCHAR(191) NOT NULL DEFAULT 'hogar',

    UNIQUE INDEX `ecogestures_codigo_key`(`codigo`),
    UNIQUE INDEX `ecogestures_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecogesture_steps` (
    `id` VARCHAR(191) NOT NULL,
    `ecogesture_id` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `evidencia_requerida` VARCHAR(191) NULL,
    `tiempo_estimado` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `impact_factors` (
    `id` VARCHAR(191) NOT NULL,
    `ecogesture_id` VARCHAR(191) NOT NULL,
    `variable` VARCHAR(191) NOT NULL,
    `formula` VARCHAR(191) NOT NULL,
    `factor` DOUBLE NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `fuente` VARCHAR(191) NOT NULL,
    `confianza` VARCHAR(191) NOT NULL,
    `fecha_revision` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` VARCHAR(191) NOT NULL,
    `ecogesture_id` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `alt_text` VARCHAR(191) NOT NULL,
    `licencia` VARCHAR(191) NOT NULL,
    `autor` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'activo',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `objetivo` VARCHAR(191) NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` VARCHAR(191) NOT NULL DEFAULT 'activo',
    `total_co2` DOUBLE NOT NULL DEFAULT 0,
    `total_coste` DOUBLE NOT NULL DEFAULT 0,
    `total_agua` DOUBLE NOT NULL DEFAULT 0,
    `total_plastico` DOUBLE NOT NULL DEFAULT 0,
    `snapshot` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_items` (
    `id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `ecogesture_id` VARCHAR(191) NOT NULL,
    `prioridad` VARCHAR(191) NOT NULL,
    `porcentaje_aplicacion` DOUBLE NOT NULL DEFAULT 100,
    `plazo` VARCHAR(191) NOT NULL,
    `frecuencia` VARCHAR(191) NOT NULL,
    `impacto_estimado` DOUBLE NOT NULL DEFAULT 0,
    `coste_estimado` DOUBLE NOT NULL DEFAULT 0,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `factor_snapshot` JSON NULL,

    UNIQUE INDEX `plan_items_plan_id_ecogesture_id_key`(`plan_id`, `ecogesture_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `results` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `ecogesture_id` VARCHAR(191) NOT NULL,
    `plan_item_id` VARCHAR(191) NULL,
    `plan_id` VARCHAR(191) NULL,
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_fin` DATETIME(3) NULL,
    `valor` DOUBLE NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `co2_real` DOUBLE NOT NULL DEFAULT 0,
    `evidencia_url` VARCHAR(191) NULL,
    `comentario` VARCHAR(191) NULL,
    `validacion_estado` VARCHAR(191) NOT NULL DEFAULT 'declarado',
    `factor_snapshot` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecoroutes` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `perfil_objetivo` VARCHAR(191) NOT NULL,
    `dificultad_total` VARCHAR(191) NOT NULL,
    `impacto_estimado` DOUBLE NOT NULL DEFAULT 0,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'Borrador',

    UNIQUE INDEX `ecoroutes_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ecoroute_items` (
    `id` VARCHAR(191) NOT NULL,
    `ecoroute_id` VARCHAR(191) NOT NULL,
    `ecogesture_id` VARCHAR(191) NOT NULL,
    `orden` INTEGER NOT NULL,
    `obligatorio` BOOLEAN NOT NULL DEFAULT false,
    `prerequisito_id` VARCHAR(191) NULL,

    UNIQUE INDEX `ecoroute_items_ecoroute_id_ecogesture_id_key`(`ecoroute_id`, `ecogesture_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moodle_links` (
    `id` VARCHAR(191) NOT NULL,
    `ecogesture_id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NULL,
    `activity_id` VARCHAR(191) NULL,
    `enrol_url` VARCHAR(191) NULL,
    `badge_id` VARCHAR(191) NULL,
    `certificate_template_id` VARCHAR(191) NULL,
    `sync_status` VARCHAR(191) NOT NULL DEFAULT 'pendiente',

    UNIQUE INDEX `moodle_links_ecogesture_id_key`(`ecogesture_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badges` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `criteria` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `issuer_name` VARCHAR(191) NOT NULL DEFAULT 'EcoGestos AHC',
    `issuer_url` VARCHAR(191) NOT NULL DEFAULT 'https://ecogestos.local',
    `badge_type` VARCHAR(191) NOT NULL DEFAULT 'open_badge_2',
    `points_awarded` INTEGER NOT NULL DEFAULT 0,
    `rule` JSON NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `badges_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badge_awards` (
    `id` VARCHAR(191) NOT NULL,
    `badge_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `issued_on` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `evidence_url` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'issued',
    `snapshot` JSON NULL,

    UNIQUE INDEX `badge_awards_badge_id_user_id_key`(`badge_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rewards` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `reward_type` VARCHAR(191) NOT NULL DEFAULT 'digital',
    `points_required` INTEGER NOT NULL,
    `stock` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `terms` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `rewards_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reward_redemptions` (
    `id` VARCHAR(191) NOT NULL,
    `reward_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `points_spent` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'solicitado',
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `snapshot` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `usuario` VARCHAR(191) NOT NULL,
    `entidad` VARCHAR(191) NOT NULL,
    `entidad_id` VARCHAR(191) NOT NULL,
    `accion` VARCHAR(191) NOT NULL,
    `antes` JSON NULL,
    `despues` JSON NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecogestures` ADD CONSTRAINT `ecogestures_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecogesture_steps` ADD CONSTRAINT `ecogesture_steps_ecogesture_id_fkey` FOREIGN KEY (`ecogesture_id`) REFERENCES `ecogestures`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `impact_factors` ADD CONSTRAINT `impact_factors_ecogesture_id_fkey` FOREIGN KEY (`ecogesture_id`) REFERENCES `ecogestures`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_ecogesture_id_fkey` FOREIGN KEY (`ecogesture_id`) REFERENCES `ecogestures`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plans` ADD CONSTRAINT `plans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_items` ADD CONSTRAINT `plan_items_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_items` ADD CONSTRAINT `plan_items_ecogesture_id_fkey` FOREIGN KEY (`ecogesture_id`) REFERENCES `ecogestures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `results` ADD CONSTRAINT `results_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `results` ADD CONSTRAINT `results_ecogesture_id_fkey` FOREIGN KEY (`ecogesture_id`) REFERENCES `ecogestures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `results` ADD CONSTRAINT `results_plan_item_id_fkey` FOREIGN KEY (`plan_item_id`) REFERENCES `plan_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `results` ADD CONSTRAINT `results_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecoroute_items` ADD CONSTRAINT `ecoroute_items_ecoroute_id_fkey` FOREIGN KEY (`ecoroute_id`) REFERENCES `ecoroutes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecoroute_items` ADD CONSTRAINT `ecoroute_items_ecogesture_id_fkey` FOREIGN KEY (`ecogesture_id`) REFERENCES `ecogestures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecoroute_items` ADD CONSTRAINT `ecoroute_items_prerequisito_id_fkey` FOREIGN KEY (`prerequisito_id`) REFERENCES `ecogestures`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moodle_links` ADD CONSTRAINT `moodle_links_ecogesture_id_fkey` FOREIGN KEY (`ecogesture_id`) REFERENCES `ecogestures`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `badge_awards` ADD CONSTRAINT `badge_awards_badge_id_fkey` FOREIGN KEY (`badge_id`) REFERENCES `badges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `badge_awards` ADD CONSTRAINT `badge_awards_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reward_redemptions` ADD CONSTRAINT `reward_redemptions_reward_id_fkey` FOREIGN KEY (`reward_id`) REFERENCES `rewards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reward_redemptions` ADD CONSTRAINT `reward_redemptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
