# Servidor (pendiente)

Aquí irá el backend del taller. Por ahora solo está la estructura de carpetas.

Tecnologías planeadas:

- NestJS con API REST
- PostgreSQL
- Prisma ORM (`prisma/schema.prisma`)
- JWT para el inicio de sesión y los roles (admin, disenador, operario)
- Web Push para las notificaciones

Cada carpeta de `src/modulos` tendrá su controlador, servicio y DTOs, y corresponde a un servicio del cliente:

| Módulo         | Servicio del cliente (`cliente/src/app/services`) |
|----------------|---------------------------------------------------|
| pedidos        | pedidos.service.ts                                |
| produccion     | produccion.service.ts                             |
| empleados      | empleados.service.ts                              |
| pagos          | pagos.service.ts                                  |
| clientes       | clientes.service.ts                               |
| inventario     | inventario.service.ts                             |
| notificaciones | notificaciones.service.ts                         |
| auth           | core/sesion.service.ts                            |
