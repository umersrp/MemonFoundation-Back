const router = require("express").Router();
const schoolController = require("../controllers/schoolController");
const { verifyTokenAndAdmin } = require("../middlewares/verification");

// Public: active schools for student registration dropdown (must be before /:id)
router.get("/dropdown", schoolController.getActiveSchoolsForDropdownAPI);

router.post("/", verifyTokenAndAdmin, schoolController.createSchoolAPI);
router.get("/", verifyTokenAndAdmin, schoolController.getAllSchoolsAPI);
router.get("/:id", verifyTokenAndAdmin, schoolController.getSchoolByIdAPI);
router.put("/:id", verifyTokenAndAdmin, schoolController.updateSchoolAPI);
router.patch("/:id/status", verifyTokenAndAdmin, schoolController.updateSchoolStatusAPI);
router.delete("/:id", verifyTokenAndAdmin, schoolController.deleteSchoolAPI);

module.exports = router;
