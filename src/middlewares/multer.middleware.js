const multer = require('multer');
const path = require('path');

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../../uploads/profiles');
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        const fileName = path.basename(file.originalname, fileExt);
        const userId = req.user.id;
        cb(null, `${Date.now()}-${fileName}-${userId}${fileExt}`);
    }
});

const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../../public/images');
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        const fileName = path.basename(file.originalname, fileExt);
        const userId = req.user.id;
        cb(null, `${Date.now()}-${fileName}-${userId}${fileExt}`);
    }
});

const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(__dirname, '../../uploads/documents');
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        const docType = file.fieldname;
        const userId = req.user.id;
        cb(null, `${Date.now()}-${docType}-${userId}${fileExt}`);
    }
});

const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
        return res.status(500).json({ error: `Upload error: ${err.message}` });
    }
    next();
};

const profileUploader = multer({ storage: profileStorage }).single('profile');
const productUploader = multer({ storage: productStorage }).single('thumbnail');
const documentUploader = multer({ storage: documentStorage });

const documentsUploader = documentUploader.fields([
    { name: 'identification', maxCount: 1 },
    { name: 'addressProof', maxCount: 1 },
    { name: 'accountProof', maxCount: 1 }
]);

module.exports = { profileUploader, productUploader, documentUploader, documentsUploader, handleMulterErrors };