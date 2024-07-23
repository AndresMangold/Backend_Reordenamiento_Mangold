const { Router } = require('express');
const path = require('path');
const { Controller } = require('../controllers/session.controller');
const { verifyToken } = require('../utils/jwt');
const { documentsUploader, profileUploader, handleMulterErrors } = require('../middlewares/multer.middleware');
const { logger } = require('../utils/logger'); 

const router = Router();
const controller = new Controller();

router.post('/premium/:uid', verifyToken, async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await controller.usersRepository.getUserById(uid);
        if (!user) {
            req.logger.warn(`Usuario con ID ${uid} no encontrado.`);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (user.role === 'premium') {
            req.logger.info(`El usuario con ID ${uid} ya es premium.`);
            return res.status(400).json({ error: 'El usuario ya es premium' });
        }

        const requiredDocuments = ['identification', 'addressProof', 'accountProof'];
        const userDocuments = user.documents.map(doc => doc.name);

        const hasAllDocuments = requiredDocuments.every(doc =>
            userDocuments.includes(doc)
        );

        if (!hasAllDocuments) {
            req.logger.warn(`El usuario con ID ${uid} no ha terminado de procesar su documentación.`);
            return res.status(400).json({ error: 'El usuario no ha terminado de procesar su documentación' });
        }

        await controller.usersRepository.changeRole(uid, 'premium');
        req.logger.info(`Rol del usuario con ID ${uid} actualizado a premium.`);
        res.status(200).json({ message: 'Rol del usuario actualizado a premium' });
    } catch (error) {
        req.logger.error(`Error al actualizar el rol del usuario con ID ${uid}: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

router.post('/:uid/documents', verifyToken, (req, res, next) => {
    documentsUploader(req, res, (err) => {
        if (err) {
            req.logger.error(`Error al subir documentos: ${err.message}`);
            return handleMulterErrors(err, req, res, next);
        }
        next();
    });
}, async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await controller.usersRepository.getUserById(uid);
        if (!user) {
            req.logger.warn(`Usuario con ID ${uid} no encontrado.`);
            return res.status(404).send('Usuario no encontrado');
        }

        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            req.logger.warn(`No se subió ningún archivo para el usuario con ID ${uid}.`);
            return res.status(400).send('No se subió ningún archivo');
        }

        Object.keys(files).forEach(fieldname => {
            files[fieldname].forEach(file => {
                const docType = fieldname;
                user.documents.push({ name: docType, reference: file.path });
                req.logger.info(`Archivo subido: ${file.path} para el usuario con ID ${uid}`);
            });
        });

        await user.save();
        req.logger.info(`Documentos del usuario con ID ${uid} actualizados correctamente.`);
        res.redirect('/sessions/profile?uploadSuccess=true');
    } catch (error) {
        req.logger.error(`Error al actualizar documentos para el usuario con ID ${uid}: ${error.message}`);
        res.status(500).send(error.message);
    }
});

router.post('/:uid/profile-picture', verifyToken, (req, res, next) => {
    profileUploader(req, res, (err) => {
        if (err) {
            req.logger.error(`Error al subir la foto de perfil: ${err.message}`);
            return handleMulterErrors(err, req, res, next);
        }
        next();
    });
}, async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await controller.usersRepository.getUserById(uid);
        if (!user) {
            req.logger.warn(`Usuario con ID ${uid} no encontrado.`);
            return res.status(404).send('Usuario no encontrado');
        }

        if (req.file) {
            const profilePicture = req.file.path;
            user.profilePicture = profilePicture;
            await user.save();
            req.logger.info(`Foto de perfil actualizada para el usuario con ID ${uid}: ${profilePicture}`);
        }

        res.redirect('/sessions/profile?uploadSuccess=true');
    } catch (error) {
        req.logger.error(`Error al actualizar la foto de perfil para el usuario con ID ${uid}: ${error.message}`);
        res.status(500).send(error.message);
    }
});

module.exports = router;
