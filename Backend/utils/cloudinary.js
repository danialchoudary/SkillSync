import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Helper to get variable even if it has leading/trailing spaces in .env
const getEnv = (key) => {
    const val = process.env[key] || process.env[key.trim()] || '';
    return val.trim();
};

const cloud_name = getEnv('CLOUDINARY_CLOUD_NAME');
const api_key = getEnv('CLOUDINARY_API_KEY');
const api_secret = getEnv('CLOUDINARY_API_SECRET');

console.log('Cloudinary Config Initialization:', {
    cloud_name: cloud_name || 'MISSING',
    api_key: api_key ? 'Present' : 'Missing',
    api_secret: api_secret ? 'Present' : 'Missing',
});

cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
});

const createCloudinaryStorage = (folderName, allowedFormats = ['jpg', 'png', 'jpeg']) => {
    const params = {
        folder: folderName,
        public_id: (req, file) => `${Date.now()}-${file.originalname.split('.')[0]}`,
        resource_type: allowedFormats ? 'auto' : 'raw', // 'raw' typically avoids transformation-based 401s for documents
    };

    if (allowedFormats) {
        params.allowed_formats = allowedFormats;
    }

    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: params,
    });
};

export { cloudinary, createCloudinaryStorage };
