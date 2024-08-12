const { ErrorCodes } = require("../utils/error/errorCodes");

const errorHandler = (error, req, res, next) => {
    console.log(error.cause);
    switch (error.code) {
        case ErrorCodes.DATABASE_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.UNDEFINED_CART:
            res.status(404).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.UNDEFINED_PRODUCT:
            res.status(404).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.CART_UPDATE_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.PRODUCT_NOT_IN_CART:
            res.status(404).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.INVALID_PAGE_NUMBER:
            res.status(400).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.INVALID_PRODUCT_DATA:
            res.status(400).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.PRODUCT_CREATION_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.PRODUCT_UPDATE_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.PRODUCT_DELETION_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.INSUFFICIENT_STOCK:
            res.status(400).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.TICKET_CREATION_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.CART_CLEAR_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.INVALID_CREDENTIALS:
            res.status(401).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.AGE_VALIDATION_ERROR:
            res.status(400).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.EMAIL_ALREADY_REGISTERED:
            res.status(409).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.ADMIN_USER_REGISTRATION_ERROR:
            res.status(400).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.PASSWORD_UPDATE_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.GITHUB_LOGIN_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.USER_DELETION_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.CART_CREATE_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.USER_REGISTER_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.INVALID_PASSWORD:
            res.status(401).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.USER_LOGIN_ERROR:
            res.status(500).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        case ErrorCodes.UNDEFINED_USER:
            res.status(404).send({ status: 'Error', error: error.name, cause: error.cause });
            break;
        default:
            res.status(500).send({ status: 'Error', error: 'Desconocido' });
    }

    next(error);
}

module.exports = { errorHandler };