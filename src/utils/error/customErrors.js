class CustomError {
    static createError({
        name = 'Error',
        cause,
        message,
        code = 1,
        otherProblems = 'No listados'

    }) {
        const error = new Error(message);
        error.cause = cause;
        error.name = name;
        error.code = code;
        error.otherProblems = otherProblems;
        return error;
    }

}

module.exports = { CustomError };