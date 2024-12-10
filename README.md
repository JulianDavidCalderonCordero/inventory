# Inventory
El proyecto se ejecuta en 2 partes:
## Backend
API Rest, para ejecutarla realizar los siguientes pasos:
- En la terminal situarse en la carpeta *backend*
- ejecutar en la terminal `npm install`
- ejecutar el proyecto con `npm start`
- esperar el mensaje *Listening on port 3000* para saber que ya está funcionando

Los endpoint que tiene son:
- get http://localhost:3000/products -> para obtener todos los productos
- get http://localhost:3000/inventory -> para obtener el inventario de cada producto con sus respectivas cantidades para los estados de expiración
- post http://localhost:3000/products -> para crear/insertar un nuevo producto a la base de datos
- post http://localhost:3000/batches/entry -> para registrar un nuevo lote de un producto, especificando la cantidad y fecha de caducidad del mismo
- post http://localhost:3000/batches/exit -> para registrar el retiro de productor de inventario

## Frontend
Interfaz web, para ejecutarla siga los siguientes pasos:
- En la terminal situarse en la carpeta *frontend*
- ejecutar en la terminal `npm install`
- compilar el proyecto con `npm build`
- ejecutar el proyecto compilado con `npm preview` e ingresar a la URL que se imprime en consola

Es una interfaz básica con un menú *Inventary* donde está toda la aplicación. Consta de:
- 1 formulario para la creación del producto, solo ingresando el nombre y descripción del producto. 
- 1 formulario para el registro de entrada o salida de inventario de un producto en particular
- 1 tabla de inventario para ver las cantidades de productos según 3 estados de caducidad (valid, near_expiry, expired).

Es necesario actualizar la ventana del navegador por cada inserción o retiro de productos de inventario, para ver los datos actualizados.

## Base de datos
El motor de base de datos es Postgres. El script de creación de las tablas está en */backend/scripts/database.sql*, aunque no es necesario porque la base de datos usada se desplegó en el servicio en la nube aiven.io. La configuración ya está en el archivo */backend/source/database.js*