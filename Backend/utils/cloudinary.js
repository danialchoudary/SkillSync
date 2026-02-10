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

const createCloudinaryStorage = (folderName) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            const timestamp = Date.now();
            const cleanName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');

            const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

            return {
                folder: folderName,
                public_id: `${timestamp}-${cleanName}`,
                resource_type: 'auto',
                format: isPdf ? 'pdf' : undefined,
                access_mode: 'public'
            };
        },
    });
};

export { cloudinary, createCloudinaryStorage };
