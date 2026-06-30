# Metodologia de Impacto y Calculo

## Principio base

El sistema debe distinguir siempre entre:

- Impacto estimado: valor inicial calculado con supuestos o referencias.
- Impacto declarado: dato registrado por la persona usuaria.
- Impacto validado: dato revisado por tutor, EcoGestor o equipo tecnico.

Los resultados de usuario deben guardar copia del factor y formula usados en el momento del registro. Si la ficha viva cambia despues, el resultado historico no cambia.

## Tipos de calculo soportados

| Tipo | Ejemplo | Tratamiento |
|---|---|---|
| Directo | kWh evitados x factor kg CO2/kWh | Usuario introduce dato y sistema calcula |
| Sustitucion | km coche sustituidos por bici o transporte publico | Usuario indica distancia, frecuencia y medio evitado |
| Habito | apagar router, reducir ducha, botella reutilizable | Formula basada en supuestos configurables |
| Seleccion | cambiar a renovable, dieta con menor impacto | Se pregunta consumo/base y se aplica factor comparativo |
| No CO2 | litros agua, kg plastico, euros, salud, resiliencia | Indicador complementario, no siempre sumable |

## Regla de oro de agregacion

Solo se suma lo que tiene la misma unidad, periodo y calidad metodologica suficiente.

- `kg CO2e/año` se puede sumar con `kg CO2e/año`.
- Litros de agua se suman por separado.
- Kg de plastico se suman por separado.
- Euros se suman por separado y deben distinguir coste inicial de ahorro.
- Impactos indirectos se muestran como cualitativos o estimacion separada.

## Campos obligatorios por factor

| Campo | Descripcion |
|---|---|
| variable_usuario | Variable pedida al usuario: `km_semana`, `duchas_semana`, `kwh_mes`, `botellas_mes` |
| formula_visible | Formula legible: `kgCO2 = km_evitar * factor_coche * semanas` |
| factor | Numero aplicado |
| unidad | `kg CO2e`, `litros`, `kg plastico`, `euros` |
| periodo | dia, semana, mes, año, evento |
| fuente | MITECO, IDAE, REE, FAO, GHG Protocol, literatura, estimacion AHC, pendiente |
| confianza | alta, media, baja, pendiente |
| fecha_revision | Fecha de ultima revision metodologica |
| responsable | Persona o equipo que aprueba el factor |

## Niveles de confianza

| Nivel | Criterio | Como mostrarlo |
|---|---|---|
| Alta | Fuente oficial o tecnica reconocida, formula simple y revisada | "Calculo validado" |
| Media | Fuente reconocible, supuestos razonables, pendiente de revision completa | "Estimacion con supuestos" |
| Baja | Estimacion AHC o literatura indirecta, alta variabilidad | "Estimacion orientativa" |
| Pendiente | Sin fuente o formula suficiente | "Impacto pendiente de calculo" |

## Rangos cualitativos recomendados para CO2

Estos rangos son funcionales para ordenar la interfaz; deben ser aprobados por AHC:

| Nivel | Rango anual sugerido |
|---|---|
| Bajo | 0-30 kg CO2e/año |
| Moderado | 31-100 kg CO2e/año |
| Alto | 101-300 kg CO2e/año |
| Muy alto | mas de 300 kg CO2e/año |
| Indirecto | No se suma al total CO2 |

## Checklist ambiental por EcoGesto

Antes de publicar como validado:

- La accion es concreta y medible.
- La unidad y periodo son claros.
- La formula se puede explicar a una persona no tecnica.
- El factor tiene fuente o queda marcado como estimacion.
- Los supuestos estan documentados.
- El resultado no depende de campos vivos editables.
- La confianza esta marcada.
- El EcoGesto tiene fecha de revision.
- Los impactos no CO2 no se mezclan con CO2.

## 10 EcoGestos recomendados para validacion profunda inicial

Elegidos por alto impacto, claridad de medicion y utilidad pedagogica:

1. Usar transporte publico en trayectos urbanos diarios.
2. Compartir coche al trabajo con compañeros.
3. Usar bicicleta en trayectos urbanos menores de 5 km.
4. Teletrabajar al menos 1 dia a la semana.
5. Contratar electricidad 100% renovable.
6. Regular termostato a 19-20 C en invierno y 24-25 C en verano.
7. Reducir consumo de carne de vacuno a maximo 1 vez por semana.
8. Planificar menu semanal antes de hacer la compra.
9. Compostar residuos organicos en casa o punto comunitario.
10. Acortar la ducha a menos de 5 minutos.

## Disclaimer recomendado para informes

Los impactos mostrados son estimaciones orientativas basadas en fuentes y supuestos indicados en cada EcoGesto. Los resultados reales dependen del contexto, frecuencia, ubicacion, tecnologia sustituida y ejecucion de la persona usuaria. Los indicadores no CO2 se muestran por separado y no deben interpretarse como equivalentes directos de CO2.

