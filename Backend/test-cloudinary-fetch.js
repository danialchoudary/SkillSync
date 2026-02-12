import { v2 as cloudinary } from 'cloudinary';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testPrivateDownload() {
    const publicId = 'skillsync/application-resumes/1769838294128-CV';
    console.log('Testing private_download_url for:', publicId);

    try {
        // Generate a private download URL
        const downloadUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
            resource_type: 'image',
            attachment: false
        });

        console.log('Generated Download URL:', downloadUrl);

        const response = await fetch(downloadUrl);
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        if (response.ok) {
            const buffer = await response.arrayBuffer();
            console.log('Success! Buffer size:', buffer.byteLength);
        } else {
            console.log('X-Cld-Error:', response.headers.get('x-cld-error'));
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

testPrivateDownload();
