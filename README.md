# Taller de Confecciones

Aplicación web para un taller que fabrica uniformes deportivos, camisetas y prendas personalizadas. Reemplaza los cuadernos donde se anotaban pedidos, tallas, producción y pagos de los empleados.

Por ahora es una **demostración funcional del frontend**: todos los datos son de ejemplo y se guardan en el navegador (localStorage).

## Cómo ejecutarlo

```bash
cd cliente
npm install
npm start
```

Abrir `http://localhost:4200`. Para compilar: `npm run build`.

## Tecnologías

- Angular 22 con componentes standalone y signals
- Tipografías locales: Sora (títulos) y Manrope (textos), en `public/fuentes`
- TypeScript
- Tailwind CSS 4
- Lucide Icons (`@lucide/angular` con los datos de `lucide`, solo los iconos usados)
- Angular Router con carga diferida por pantalla
- LocalStorage para los datos simulados

## Funciones

- **Inicio:** pedidos activos, entregas de hoy, atrasados, próximas entregas y accesos rápidos.
- **Pedidos:** crear, editar, buscar (cliente, equipo o número), cancelar, abonos y saldo.
- **Jugadores:** registro rápido de nombre, número y talla; resumen por tallas, números repetidos, datos incompletos e historial de cambios.
- **Diseños:** vista para la diseñadora sin información de dinero. Si se cambia un jugador después de terminar el diseño, se genera una alerta.
- **Producción:** contador por proceso (corte, sublimación, costura), registro rápido, aprobación del administrador, prendas dañadas y control para no superar la cantidad pedida.
- **Empleados:** CRUD con procesos, tarifas por prenda, historial de trabajos y pagos.
- **Pagos:** liquidación automática por empleado, filtro por fechas, pagos completos o parciales y bloqueo de pagos duplicados. La tarifa se guarda en cada trabajo para que los cambios futuros no alteren pagos anteriores.
- **Notificaciones:** centro de avisos por rol.
- **Secundarios:** clientes, agenda de entregas, inventario, anticipos y saldos, ingresos y gastos, prendas dañadas y configuración.

## Roles y especialidades

Los **roles** definen qué puede ver cada usuario; las **especialidades** definen qué trabajo hace un operario.

| Rol           | Navegación                                        |
|---------------|---------------------------------------------------|
| Administrador | Inicio, Pedidos, Producción, Pagos y Más (todo)    |
| Diseñadora    | Inicio, Diseños, Historial, Perfil (sin dinero)    |
| Operario      | Inicio, Mis trabajos, Historial, Perfil (sin dinero) |

Especialidades del operario (puede tener varias y una principal): cortador, impresor, sublimador, confeccionista y empaque/entregas. El inicio del operario se arma con la configuración de `shared/oficios.ts`, y si tiene varias especialidades aparece un selector arriba. Los avatares se generan solos según el cargo (`RoleAvatar`), sin fotos.

Desde el menú, el perfil o la barra superior se puede ver la app como cualquier usuario de prueba. El inicio de sesión real con JWT se hará en el backend.

## Datos y migraciones

Los datos viven en LocalStorage. Cuando cambian los modelos, `core/migraciones.ts` actualiza lo guardado sin borrarlo (versión actual: 3). Los datos de ejemplo solo se descargan si el navegador no tiene datos.

## Estructura

```text
taller-confecciones/
├── cliente/src/app/
│   ├── core/          almacenamiento, sesión, guard de roles, datos de ejemplo
│   ├── shared/        componentes, pipes, fechas y constantes
│   ├── layouts/       barra inferior, barra lateral y menú
│   ├── models/        interfaces TypeScript
│   ├── services/      lógica de cada módulo
│   └── features/      pantallas (inicio, pedidos, disenos, produccion, ...)
├── servidor/          estructura para el backend (NestJS + Prisma)
└── README.md
```

## Conexión futura con el backend

Las pantallas nunca leen el localStorage directamente: siempre usan los servicios de `services/`. Para conectar la API solo hay que cambiar el interior de cada servicio (por ejemplo, `PedidosService.crear()` hará un `POST /api/pedidos`) sin tocar la interfaz. Las notificaciones se crean en `NotificacionesService.enviar()`, que será el punto donde se llame al backend para enviar Web Push a los usuarios.

En **Configuración → Restaurar datos de ejemplo** se puede volver al estado inicial.
