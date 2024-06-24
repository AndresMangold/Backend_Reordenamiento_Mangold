require('dotenv').config();
const { CustomError } = require('../utils/error/customErrors');
const { ErrorCodes } = require('../utils/error/errorCodes');
const nodemailer = require('nodemailer');

class MailingService {
    constructor() {}

    async sendMail(email, token) {
        try {
            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GOOGLE_MAIL,
                    pass: process.env.GOOGLE_PASS
                }
            });

            await transport.sendMail({
                from: 'Servicio Backend App',
                to: email,
                subject: 'BackendApp | Restablecer contraseña',
                html: `
                    <div>
                        <h2>Ingrese al link para poder restablecer su contraseña</h2>
                        <h4>El link tiene una duración de una hora.</h4>
                        <a href="http://localhost:8080/sessions/resetPassword/${token}">Restablecer contraseña</a>
                    </div>`
            });

            return { success: true };
        } catch (error) {
            throw CustomError.createError({
                name: 'Error al enviar correo',
                cause: 'Ocurrió un error y no se pudo enviar el correo al destinatario.',
                message: 'No se pudo enviar el correo',
                code: ErrorCodes.EMAIL_SEND_ERROR
            });
        }
    }
}

module.exports = MailingService;
