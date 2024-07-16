const { Router } = require('express');
const { Controller } = require('../controllers/session.controller');
const { verifyToken } = require('../utils/jwt');
const upload = require('../middlewares/multer.middleware');

const router = Router();
const controller = new Controller();

router.post('/premium/:uid', verifyToken, (req, res) => {
    controller.changeRole(req, res);
});

router.post('/:uid/documents', verifyToken, upload.fields([{ name: 'profile' }, { name: 'product' }, { name: 'documents' }]), async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await controller.usersRepository.getUserById(uid);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const files = req.files;
        if (!files || Object.keys(files).length === 0) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        const documentTypes = ['profile', 'product', 'documents'];
        documentTypes.forEach(type => {
            if (files[type]) {
                files[type].forEach(file => {
                    user.documents.push({ name: file.originalname, reference: file.path });
                });
            }
        });

        await user.save();

        res.status(200).json({ message: 'Documentos subidos y guardados correctamente', documents: user.documents });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
