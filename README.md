# 🟢 Template Node.js - Asociación Ops

### 🎯 Objetivo de este repositorio
Este repositorio tiene como **objetivo principal servir de plantilla oficial** para todos los desarrollos basados en Node.js dentro de la asociación. Su propósito es estandarizar la estructura de los proyectos, garantizar la calidad del código mediante linters automáticos y asegurar un despliegue continuo (CI/CD) fluido hacia Netlify.

---

### 🚀 Cómo desplegar
Para comenzar un nuevo proyecto siguiendo nuestros estándares, sigue estos pasos:

1.  **Solicitud:** Solicita un nuevo repositorio basado en este *template* a través de una conversación en el canal oficial o contactando directamente con tu **Coordinador de Proyecto**.
2.  **Asignación:** Una vez se te asigne el repositorio, clónalo en tu máquina local:
    `git clone https://github.com/tu-asociacion/nombre-de-tu-repo.git`
3.  **Instalación:** Instala las dependencias necesarias (necesitarás Node.js v24 o superior):
    `npm install`
4.  **Desarrollo:** Crea una nueva rama para tus cambios (`git checkout -b feature/nueva-funcionalidad`) y empieza a programar. Al hacer *push* a `main`, el sistema desplegará automáticamente.

---

### ⚡ Herramientas durante el desarrollo
Una vez que hayas ejecutado `npm install`, tendrás acceso a los comandos estandarizados de la asociación para gestionar tu ciclo de desarrollo:

*   **`npm run dev`**: Inicia el servidor de desarrollo local con **Vite**. Úsalo para programar con vista previa en tiempo real.
*   **`npm run lint`**: Ejecuta el motor de **ESLint**. Úsalo para limpiar y corregir automáticamente el estilo de tu código antes de enviarlo (evita que el CI/CD rechace tu código por falta de `camelCase` o puntos y coma).
*   **`npm test`**: Lanza la suite de pruebas con **Vitest**. Úsalo para verificar que tus componentes y utilidades funcionan correctamente antes de hacer un *push*.
*   **`npm run build`**: Genera la versión de producción en la carpeta `dist/`. Es el comando que utiliza nuestro sistema de Ops para el despliegue final.

---

### 📏 Estándares de Uso
Para mantener la coherencia en toda la asociación, aplicamos las siguientes reglas:

*   **Estilo de Código**: Es obligatorio el uso de **camelCase** para variables y funciones. El linter bloqueará cualquier Pull Request que no cumpla con esto.
*   **Formateo**: Usamos [ESLint](https://eslint.org/) con la configuración `recommended`.
*   **Motor de Construcción**: [Vite](https://vitejs.dev/) para un empaquetado ultra rápido.
*   **Tests**: [Vitest](https://vitest.dev/) para pruebas unitarias rápidas y modernas.

---

### 🧪 Obligación: Tests Unitarios
Es **responsabilidad del desarrollador** garantizar la estabilidad de su código. El pipeline de despliegue fallará si los tests no pasan. Los archivos de test deben estar ubicados junto al archivo que prueban siguiendo este estándar:

```text
src/
├── components/
│   ├── Button.js
│   └── Button.test.js     <-- Vitest lo encuentra aquí
├── utils/
│   ├── format.js
│   └── format.test.js     <-- Vitest lo encuentra aquí
```
*Si una funcionalidad no tiene su correspondiente archivo `.test.js`, se considerará incompleta, sin embargo el pipeline seguira adelante*

---

### 🛠️ SOLO PARA DEVOPS
Esta sección detalla la infraestructura técnica que sostiene este template y cómo se conecta con el sistema central de la asociación.

*   **package.json**: Actúa como la interfaz universal de comandos. No importa el framework (React, Vue o Vanilla JS), mientras contenga los scripts estándar (lint, test, build), el Workflow Reutilizable podrá procesar el repo sin cambios manuales.
*   **.eslintrc.json**: Es el motor de gobernanza. Aquí se definen las "leyes" del código (como la obligatoriedad de camelCase). Al estar en la raíz, permite que tanto el editor del desarrollador como el pipeline de GitHub Actions apliquen las mismas reglas de calidad.
*   **.github/workflows/ci.yml**: Este archivo funciona como un "proxy". No contiene la lógica pesada del despliegue, sino que invoca al Workflow Reutilizable de asociacion-ops. Esto nos permite actualizar la lógica de despliegue de 50 repositorios simultáneamente editando un solo archivo en el repo central de Ops.
