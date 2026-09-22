// routes/uploadRoutes.js

const express = require('express');
const { uploadFile, getSignedFileUrl } = require('../controllers/uploadController');
const { verifyTokenAndAdminOrSchool } = require('../middlewares/verification');
const router = express.Router();

router.post('/upload', uploadFile);
router.get('/signed-url', verifyTokenAndAdminOrSchool, getSignedFileUrl);

module.exports = router;
