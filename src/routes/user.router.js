const { Router } = require('express');
const path = require('path');
const { Controller } = require('../controllers/session.controller');
const { verifyToken } = require('../utils/jwt');
const { documentUploader } = require('../middlewares/multer.middleware');

const router = Router();
const controller = new Controller();

router.post('/premium/:uid', verifyToken, async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await controller.usersRepository.getUserById(uid);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (user.role === 'premium') {
            return res.status(400).json({ error: 'El usuario ya es premium' });
        }

        const requiredDocuments = ['identification', 'addressProof', 'accountProof'];
        const userDocuments = user.documents.map(doc => doc.name);

        const hasAllDocuments = requiredDocuments.every(doc =>
            userDocuments.includes(doc)
        );

        if (!hasAllDocuments) {
            return res.status(400).json({ error: 'El usuario no ha terminado de procesar su documentación' });
        }

        await controller.usersRepository.changeRole(uid, 'premium');
        res.status(200).json({ message: 'Rol del usuario actualizado a premium' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:uid/documents', verifyToken, documentUploader.fields([
    { name: 'identification', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'accountProof', maxCount: 1 }
]), async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await controller.usersRepository.getUserById(uid);
        if (!user) {
            return res.status(404).send('Usuario no encontrado');
        }

        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            return res.status(400).send('No se subió ningún archivo');
        }

        Object.keys(files).forEach(fieldname => {
            files[fieldname].forEach(file => {
                const docType = fieldname; 
                user.documents.push({ name: docType, reference: file.path });
            });
        });

        await user.save();

        res.redirect('/sessions/profile');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;
