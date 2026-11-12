# Sprint 1 — Catálogo y acceso del administrador

**Fechas:** 19/10/2026 – 30/10/2026
**Objetivo:** Explorar, filtrar y ver el detalle de las zapatillas; login seguro del administrador.

## Sprint Review

| Historia | Responsable | Puntos | Estado |
|---|---|---|---|
| US-02 Arquitectura, modelo de datos y BD | Richard | 5 | Terminada |
| US-04 Visualizar el catálogo | Justo | 5 | Terminada |
| US-05 Filtrar por marca y talla | Richard | 5 | Terminada |
| US-06 Detalle del producto y talla | Justo | 5 | Terminada |
| US-07 Login del administrador | Richard | 5 | Terminada |
| US-03 Despliegue inicial | Richard | 3 | Pasa al Sprint 3 (pendiente de definición con el docente) |

**Puntos completados:** 25 de 28.
**Demostración:** catálogo con paginación y filtros, detalle con selección de talla y panel de administración protegido.
**Pruebas automáticas:** 21 pruebas en verde (Jest + Supertest).

## Retrospectiva

**Qué salió bien**
- Repartir los archivos entre los dos antes de programar evitó conflictos al fusionar en GitHub.
- Las pruebas automáticas (21 con Jest + Supertest) nos permitieron confirmar que todo seguía funcionando después de cada cambio.
- Las pruebas cruzadas (QA) quedaron registradas en Jira, así cada historia fue verificada por quien no la desarrolló.
- La revisión obligatoria de Pull Requests funcionó: ningún cambio entró a develop sin aprobación del compañero.
- Montar la base de datos en Supabase con Prisma y datos de prueba (seed) nos dejó a los dos trabajando con la misma información.

**Qué mejorar**
- Empezamos tarde a usar Jira, por eso el avance del sprint quedó concentrado en pocos días y el burndown no refleja un trabajo constante.
- Al inicio no teníamos claro el flujo de Pull Requests (crear el PR, asignar revisor, aprobar y fusionar), lo que nos hizo perder tiempo.
- No siempre movimos las tarjetas en Jira el mismo día que trabajamos.
- El despliegue (US-03) quedó pendiente porque no está definido si es obligatorio.

**Compromiso para el Sprint 2**
- Actualizar el tablero de Jira el mismo día que se trabaja cada tarea.
- Hacer una Daily corta (presencial o por chat) los días que trabajemos en el proyecto.
- Revisar y aprobar los Pull Requests del compañero en menos de 24 horas.
- Preguntar al docente si el despliegue es obligatorio para la entrega final.