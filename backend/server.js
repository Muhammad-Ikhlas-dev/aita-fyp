const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Serve static files for face-api models
app.use('/models', express.static(path.join(__dirname, 'models')));

// Create labeled_images directory if it doesn't exist
const uploadDir = path.join(__dirname, 'labeled_images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve labeled images for face-api training
app.use('/labeled_images', express.static(uploadDir));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Get name from query parameter or default to 'unnamed'
        const name = req.query.name || 'unnamed';
        // Clean the name (remove special characters)
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
        // Create filename: name_timestamp.extension
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `${cleanName}_${timestamp}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    },
    fileFilter: function (req, file, cb) {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
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
                name: name
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

// Get list of students from labeled_images folder with file details
app.get('/api/students', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);

        // Group files by student name
        const studentMap = new Map();

        files
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
            .forEach(file => {
                // Extract student name from filename (format: name_timestamp.ext)
                const nameWithoutExt = file.replace(/\.[^/.]+$/, '');
                const parts = nameWithoutExt.split('_');

                // Remove timestamp (last part that's all digits)
                if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
                    parts.pop();
                }

                const studentName = parts.join('_');

                // Store the most recent file for each student
                if (!studentMap.has(studentName)) {
                    const ext = file.split('.').pop();
                    studentMap.set(studentName, {
                        name: studentName,
                        filename: file,
                        extension: ext,
                        url: `/labeled_images/${file}`
                    });
                }
            });

        const students = Array.from(studentMap.values());

        res.json({
            success: true,
            students: students,
            count: students.length
        });
    } catch (error) {
        console.error('Error reading students:', error);
        res.status(500).json({
            success: false,
            message: 'Error reading student data',
            error: error.message
        });
    }
});

// Delete student
app.delete('/api/students/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(uploadDir, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Delete the file
        fs.unlinkSync(filePath);

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
});

// Mark attendance
app.post('/api/attendance/mark', (req, res) => {
    try {
        const { students, timestamp } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Students array is required'
            });
        }

        // Create attendance record
        const attendanceRecord = {
            timestamp: timestamp || new Date().toISOString(),
            students: students,
            count: students.length
        };

        // Log attendance (in production, you'd save this to a database)
        console.log('Attendance marked:', attendanceRecord);

        // You can save to a JSON file or database here
        const attendanceDir = path.join(__dirname, 'attendance_logs');
        if (!fs.existsSync(attendanceDir)) {
            fs.mkdirSync(attendanceDir, { recursive: true });
        }

        const logFile = path.join(attendanceDir, `attendance_${Date.now()}.json`);
        fs.writeFileSync(logFile, JSON.stringify(attendanceRecord, null, 2));

        res.json({
            success: true,
            message: `Attendance marked for ${students.length} student(s)`,
            record: attendanceRecord
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking attendance',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File is too large. Maximum size is 10MB.'
            });
        }
    }
    res.status(500).json({
        success: false,
        message: error.message || 'Something went wrong!'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Upload directory: ${uploadDir}`);
});
