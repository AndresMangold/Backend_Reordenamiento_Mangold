require('dotenv').config();
const { CustomError } = require('../utils/error/customErrors');
const { ErrorCodes } = require('../utils/error/errorCodes');
const nodemailer = require('nodemailer');

class MailingService {
    constructor() {}

    async sendMail({ to, subject, html }) {
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
                to,
                subject,
                html
            });

            return { success: true };
        } catch (error) {
            console.error('Error al enviar correo:', error);
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
