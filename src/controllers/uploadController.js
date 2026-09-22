const { UploadService } = require('../services/uploadService');
const { getS3SignedUrl } = require('../helper/fileUpload');

async function uploadFile(req, res) {
    try {
        const result = await UploadService.uploadFile(req);
        return res.status(result.status).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

async function getSignedFileUrl(req, res) {
    try {
        const { url, download } = req.query;
        if (!url) {
            return res.status(400).send({ message: 'File URL is required' });
        }

        const signedUrl = await getS3SignedUrl(url, download === 'true');
        return res.status(200).send({ data: signedUrl });
    } catch (error) {
        return res.status(500).send({ message: 'Unable to authorize file access' });
    }
}

module.exports = { uploadFile, getSignedFileUrl };