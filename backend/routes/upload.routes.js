const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'labeled_images');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const name = req.query.name || 'unnamed';
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `${cleanName}_${timestamp}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

router.post('/', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        const name = req.query.name;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name parameter is required'
            });
        }
        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                name
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

module.exports = router;
