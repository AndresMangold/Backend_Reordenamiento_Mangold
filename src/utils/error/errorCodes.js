const ErrorCodes = {
    DATABASE_ERROR: 1,                  // Error al interactuar con la base de datos
    UNDEFINED_CART: 2,                  // El carrito no existe
    UNDEFINED_PRODUCT: 3,               // El producto no existe
    CART_UPDATE_ERROR: 4,               // Error al actualizar el carrito
    PRODUCT_NOT_IN_CART: 5,             // El producto no está en el carrito
    INVALID_PAGE_NUMBER: 6,             // Número de página no válido
    INVALID_PRODUCT_DATA: 7,            // Datos del producto no válidos
    PRODUCT_CREATION_ERROR: 8,          // Error al crear un producto
    PRODUCT_UPDATE_ERROR: 9,            // Error al actualizar un producto
    PRODUCT_DELETION_ERROR: 10,         // Error al eliminar un producto
    INSUFFICIENT_STOCK: 11,             // No hay suficiente stock para el producto
    TICKET_CREATION_ERROR: 12,          // Error al crear el ticket
    CART_CLEAR_ERROR: 13,               // Error al vaciar el carrito
    INVALID_CREDENTIALS: 14,            // Credenciales inválidas
    AGE_VALIDATION_ERROR: 15,           // La edad debe ser mayor a 1
    EMAIL_ALREADY_REGISTERED: 16,       // El email ya está registrado
    ADMIN_USER_REGISTRATION_ERROR: 17,  // Error al registrar admin o super admin de esta manera
    PASSWORD_UPDATE_ERROR: 18,          // Error al actualizar la contraseña
    GITHUB_LOGIN_ERROR: 19,             // Error en el login de GitHub
    USER_DELETION_ERROR: 20,            // Error al eliminar el usuario
    CART_CREATE_ERROR: 21,              // Error al crear el carrito
    USER_REGISTER_ERROR: 22,            // Error al registrar el usuario
    INVALID_PASSWORD: 23,               // Contraseña incorrecta
    USER_LOGIN_ERROR: 24,               // Error en el login
    UNDEFINED_USER: 25                  // El usuario no existe
};

module.exports = { ErrorCodes };