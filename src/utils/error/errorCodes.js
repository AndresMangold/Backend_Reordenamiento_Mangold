const ErrorCodes = {
    DATABASE_ERROR: 1,
    UNDEFINED_CART: 2,
    UNDEFINED_PRODUCT: 3,
    CART_UPDATE_ERROR: 4,
    PRODUCT_NOT_IN_CART: 5,
    INVALID_PAGE_NUMBER: 6,
    INVALID_PRODUCT_DATA: 7,
    PRODUCT_CREATION_ERROR: 8,
    PRODUCT_UPDATE_ERROR: 9,
    PRODUCT_DELETION_ERROR: 10,
    INSUFFICIENT_STOCK: 11,
    TICKET_CREATION_ERROR: 12,
    CART_CLEAR_ERROR: 13,
    INVALID_CREDENTIALS: 14,
    AGE_VALIDATION_ERROR: 15,
    EMAIL_ALREADY_REGISTERED: 16,
    ADMIN_USER_REGISTRATION_ERROR: 17,
    PASSWORD_UPDATE_ERROR: 18,
    GITHUB_LOGIN_ERROR: 19,
    USER_DELETION_ERROR: 20,
    CART_CREATE_ERROR: 21,
    USER_REGISTER_ERROR: 22,
    INVALID_PASSWORD: 23,
    USER_LOGIN_ERROR: 24,
    UNDEFINED_USER: 25,
    DUPLICATE_PRODUCT_CODE: 26,         
    INVALID_QUANTITY: 27,               
    UNDEFINED_DATA: 28, 
};

module.exports = { ErrorCodes };