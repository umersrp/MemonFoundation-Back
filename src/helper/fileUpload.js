require('dotenv').config();
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const path = require('path');
const { logger } = require('../utils/logger');

console.log("new bucket url", process.env.AWS_BUCKET_URL);


const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

if (!accessKeyId) {
    throw new Error('AWS access key is not defined');
}
if (!secretAccessKey) {
    throw new Error('AWS secret key is not defined');
}

const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

// Use memory storage instead of disk storage to avoid local filesystem issues
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

const uploadFileToS3 = async (file) => {
    console.log("new bucket url", process.env.AWS_BUCKET_URL)
    try {
        // Generate unique filename with timestamp to avoid conflicts
        const timestamp = Date.now();
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = `${timestamp}-${sanitizedFilename}`;

        const uploadParams = {
            Bucket: bucketName,
            Body: file.buffer, // Use buffer from memory storage instead of file stream
            Key: uniqueFilename,
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        return { 
            message: 'File uploaded successfully', 
            Key: uniqueFilename,
            ...uploadParams 
        };
    } catch (error) {
        console.error('S3 Upload Error:', error);
        return { message: `File upload failed: ${error.message}` };
    }
};

const fileUpload = async (req) => {
    try {
        // Use multer.any() to accept files from any field name
        const uploadAny = multer({ 
            storage: multer.memoryStorage(),
            limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
        }).any();

        const uploadResult = await new Promise((resolve, reject) => {
            uploadAny(req, {}, (err) => {
                if (err) return reject({ status: 400, message: err.message });
                resolve({ status: 200 });
            });
        });

        if (uploadResult.status !== 200) {
            return uploadResult;
        }

        // Get the first file from req.files (multer.any() puts files in req.files array)
        const uploadedFile = req?.files?.[0] || req?.file;
        
        if (!uploadedFile) {
            return { status: 400, message: 'No file uploaded. Please ensure file is sent with form data.' };
        }

        const s3UploadResult = await uploadFileToS3(uploadedFile);
        if (!s3UploadResult || s3UploadResult.message.includes('failed')) {
            return { status: 500, message: s3UploadResult?.message || 'Error Uploading File to S3' };
        }

        return { status: 200, s3UploadResult };
    } catch (error) {
        console.error('File upload error:', error);
        return { status: 500, message: error.message || 'File upload failed' };
    }
};


const uploadFileToS3Path = async (filePath) => {
    try {
        const file = fs.readFileSync(path.resolve(__dirname, filePath));
        const uploadParams = {
            Bucket: bucketName,
            Body: file,
            Key: `AI-${path.basename(filePath)}`,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        return {
            status: 200,
            message: `${process.env.AWS_BUCKET_URL + uploadParams.Key}`,
            ...uploadParams,
        };
    } catch (error) {
        logger.log({
            level: 'error',
            message: `Error uploading file to S3: ${error.message}`,
        });
        return { message: 'Error uploading file to S3' };
    }
};

module.exports = { fileUpload, uploadFileToS3Path };
