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
        const dest = path.join(__dirname, '../../uploads/products');
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
        const dest = path.join(__dirname, '../../uploads/profiles');
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        const docType = file.fieldname; 
        const userId = req.user.id; 
        cb(null, `${Date.now()}-${docType}-${userId}${fileExt}`);
    }
});

const profileUploader = multer({ storage: profileStorage });
const productUploader = multer({ storage: productStorage });
const documentUploader = multer({ storage: documentStorage });

module.exports = { profileUploader, productUploader, documentUploader };
