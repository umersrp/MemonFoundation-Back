const { UploadService } = require('../services/uploadService');

async function uploadFile(req, res) {
    try {
        const result = await UploadService.uploadFile(req);
        return res.status(result.status).send(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

module.exports = { uploadFile };