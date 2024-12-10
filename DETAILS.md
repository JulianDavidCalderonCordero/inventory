# Sobre el proyecto

## Detalles de diseño

- Los productos solo contienen informacón general de la unidad, y aparte existen los "batch" o "lotes" que son las entradas de una cierta cantidad de un producto con una fecha de caducdad especifica.
- La tabla "movements" registra los retiros e ingresos de producto al inventario para llevar una trazabilidad del inventario.

## Sugerencias o posibles mejoras
- La interfaz se puede organizar de mejor manera para una mejor experiencia de usuario. Actualmente todo en una misma vista puede ser confuso y seria mejor organizar por funcionalidades los componentes.
- La lógica de la API puede organizarse de mejor manera separándola por servicios.
- Por temas de seguridad sería mejor usar variable de entorno y/o configuración para temas como la conexión a base de datos.
- Se puede simular un caso más real colocando más campos a algunas entidades de la base de datos.