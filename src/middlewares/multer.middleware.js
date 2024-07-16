const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/'; 
        if (file.fieldname === 'profile') {
            folder += 'profiles/';
        } else if (file.fieldname === 'product') {
            folder += 'products/';
        } else {
            folder += 'documents/';
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

module.exports = upload;
