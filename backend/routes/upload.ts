import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// Configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter (images and videos)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload endpoint
router.post('/', requireAdmin, upload.single('file'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            success: true,
            url: fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed: ' + error.message });
    }
});

// Delete file endpoint
router.delete('/:filename', requireAdmin, (req: Request, res: Response) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join('uploads', filename);

        // Prevent directory traversal
        if (filename.includes('..') || filename.includes('/')) {
            res.status(400).json({ error: 'Invalid filename' });
            return;
        }

        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            res.json({ success: true, message: 'File deleted' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Delete failed' });
    }
});

export default router;
