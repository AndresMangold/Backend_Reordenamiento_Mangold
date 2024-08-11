# PROYECTO FINAL: Programación Backend.

Este proyecto simula un servidor con persistencia de datos alojado en MongoDB donde es posible visualizar productos, gestionarlos y añadirlos a un carrito de compras. También se incluye la gestión de usuarios, autenticación y autorización con características avanzadas.


# Características Principales
- Gestión de Productos: Crea, actualiza, elimina y lista productos con filtros, paginación y ordenamientos.
- Gestión de Usuarios: Registro, inicio de sesión, cambio de roles (usuario estándar/premium).
- Autenticación y Autorización: Autenticación segura con JWT y autenticación vía GitHub.
- Recuperación de Contraseñas: Restablecimiento de contraseñas a través de correos electrónicos de recuperación.
- Gestión de Sesiones: Manejo de sesiones utilizando express-session y connect-mongo.
- Documentación de API: Documentación generada automáticamente con Swagger.


# Deploy

El deploy de esta API se realizó desde Railway. Click aquí



# Para correr este proyecto:

> **Clonar el repositorio**  
> - `git clone https://github.com/AndresMangold/Backend_Reordenamiento_Mangold/tree/entrega-final`
>
> **Instalar las dependencias**  
> - `npm i`
>
> **Conexión a MongoDB**  
> - Conectar MongoDB Compass utilizando la dirección IP `0.0.0.0/0`
>
> **Ejecutar el servidor**  
> - `nodemon ./src/app.js`
>
> **Acceder a la Aplicación**  
> - [localhost:8080](http://localhost:8080/)



# Frameworks y librerías utilizadas en este proyecto:

- Node.js: Entorno de ejecución para la construcción del servidor.
- Express: Framework para construir aplicaciones web y API.
- Express Handlebars: Motor de plantillas para la generación de vistas.
- Express Sessions: Manejo de sesiones de usuario.
- Socket.io: Comunicación en tiempo real.
- Mongoose: ODM para interactuar con MongoDB.
- Mongoose Paginate: Paginación en modelos de Mongoose.
- Session-file-store: Almacenamiento de sesiones en archivos.
- Connect-mongo: Almacenamiento de sesiones en MongoDB.
- Cookie-parser: Análisis de cookies HTTP.
- DotEnv: Manejo de variables de entorno.
- JsonWebToken: Autenticación basada en tokens.
- NodeMailer: Envío de correos electrónicos.
- Passport: Middleware para la autenticación de usuarios.
    - passport-github2: Estrategia de autenticación con GitHub.
    - passport-jwt: Estrategia de autenticación con JWT.
    - passport-local: Estrategia de autenticación local.
- Swagger: Generación de documentación de API.
- Winston: Registro de logs.


## Flow para la compra de un producto y expedición del ticket:

> Click en el [Ejemplo](https://drive.google.com/file/d/1NOa6h9smDInsRmOxwrpHZIcPPxpiNZK8/view?usp=sharing)

## Usuario Premium: Creación de producto, eliminación y aviso por correo.

> Click en el [Ejemplo](https://drive.google.com/file/d/1KwgrZhq1kc8yTWIGfsaSBV9VLBxvFKvq/view?usp=sharing)

## Eliminación del admin a los usuarios por inactividad:

> Click en el [Ejemplo](https://drive.google.com/file/d/18JShNUVQvvT0wpFSqc7fTehtDd7HAuGQ/view?usp=sharing)

# Para testear la API:


- Para Utilizar **SWAGGER**:
    - Iniciar la API a través del comando: ***nodemon ./src/app.js*** y entrar a [http://localhost:8080](http://localhost:8080/)


    - Una vez iniciada la sesión con **cualquier user autenticado**, abrir una pestaña con el endpoint **/apidocs/** : [http://localhost:8080/apidocs/](http://localhost:8080/apidocs)



- Para Utilizar los **TESTS**: Mocha, Chai y Supertest:
    - Desde la consola correr el comando ***npm test***

