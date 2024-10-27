const multer = require('multer');
const path = require('path');

const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.env.PROJECT_DIR, '/public/images/uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});


const uploadImage = multer({ storage: imageStorage });

module.exports = uploadImage