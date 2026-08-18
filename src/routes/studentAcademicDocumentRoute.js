const router = require("express").Router();
const controller = require("../controllers/studentAcademicDocumentController");
const { verifyTokenAndAdminOrSchool } = require("../middlewares/verification");

router.get(
  "/student/:studentId",
  verifyTokenAndAdminOrSchool,
  controller.listByStudentAPI
);
router.post("/", verifyTokenAndAdminOrSchool, controller.createAPI);
router.put("/:id", verifyTokenAndAdminOrSchool, controller.updateAPI);
router.delete("/:id", verifyTokenAndAdminOrSchool, controller.removeAPI);

module.exports = router;
