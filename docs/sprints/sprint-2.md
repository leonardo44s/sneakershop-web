# Sprint 2 — Acceso del cliente y compra

**Fechas:** 02/11/2026 – 13/11/2026
**Objetivo:** Un cliente puede registrarse, iniciar sesión y completar una compra.

## Sprint Review

| Historia | Responsable | Puntos | Estado |
|---|---|---|---|
| US-08 Registro de cliente | Richard | 5 | Terminada |
| US-09 Inicio y cierre de sesión del cliente | Justo | 3 | Terminada |
| US-10 Carrito de compras | Justo | 5 | Terminada |
| US-11 Checkout y registro del pedido | Richard | 8 | Terminada |

**Puntos completados:** 21 de 21.
**Demostración:** registro de cliente, inicio y cierre de sesión, carrito que se mantiene al recargar y respeta el stock, y compra completa con código de pedido y descuento de stock.
**Pruebas automáticas:** 35 pruebas en verde, incluida la de dos compras simultáneas del último par.

## Retrospectiva

**Qué salió bien**
- Dejar preparadas las rutas al inicio (R0) evitó conflictos entre los dos.
- El riesgo técnico principal (vender dos veces el mismo par) quedó resuelto con una transacción y comprobado con una prueba automática.
- Reutilizamos el login del Sprint 1 para los clientes, sin repetir código.

**Qué mejorar**
- El checkout dependía del login del cliente, y Richard tuvo que esperar a que se fusionara para hacer las pantallas.
- Seguimos registrando en Jira después de las fechas planificadas del sprint.

**Compromiso para el Sprint 3**
- Identificar las dependencias entre historias en la planificación y ordenar el trabajo para que nadie quede esperando.
- Mantener el tablero actualizado el mismo día que se trabaja.