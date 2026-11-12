# Definición de Terminado (DoD)

Una historia de usuario está terminada cuando:

1. El código está en una rama feature/* y se integró a develop mediante un Pull Request aprobado por el otro integrante.
2. Cumple todos sus criterios de aceptación, verificados por quien no la desarrolló.
3. Las pruebas automáticas de sus endpoints pasan (Jest + Supertest).
4. Funciona en escritorio y en móvil (ancho mínimo de 360 px) sin errores en consola.
5. Las entradas se validan en el backend y las rutas privadas validan token y rol.
6. Las migraciones y el seed funcionan sobre una base de datos vacía.
7. El README está actualizado y no hay credenciales en el repositorio.
8. Fue presentada en la Sprint Review y aceptada por el Product Owner.