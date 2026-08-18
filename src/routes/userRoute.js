const router = require("express").Router();
const userController = require("../controllers/userController");
// const { validateRegistration,
//     validateLogin, } = require('../DTO/userDTO');
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAdminOrSchool,
  verifyTutor,
  verifyTokenOptional,
} = require("../middlewares/verification");

// Only admins can create new users
router.post("/tutor", verifyTokenAndAdmin, userController.createUserAPI);

router.post("/student", verifyTokenOptional, userController.createStudentAPI);

router.put("/update/:id", verifyToken, userController.updateProfileAPI);

router.delete("/remove", verifyToken, userController.removeUserAPI);

router.get("/find", verifyToken, userController.getUserDataAPI);

router.get("/students", verifyTutor, userController.getAllStudentsAPI);

router.get("/getStudentByAdmin", verifyTokenAndAdminOrSchool, userController.getstudentByAdmin);

router.get("/Get-all", verifyTokenAndAdmin, userController.getAllUsersAPI);

router.put("/student-update/:id", verifyTokenAndAdminOrSchool, userController.studentsUpdateProfileAPI);
  
router.get("/user/:id", userController.getUserByIdAPI);

router.put("/admin-update/:id", verifyTokenAndAdmin, userController.updateByAdminAPI);

router.delete("/admin-remove/:id", verifyTokenAndAdmin, userController.removeByAdminAPI);

router.put("/update-student-status/:studentId",verifyTokenAndAdmin, userController.updateStudentStatusAPI);

router.post("/send-password-setup-link", userController.sendPasswordSetupLinkAPI);

router.post("/set-password", userController.setPasswordAPI);


router.get("/student-report", verifyTokenAndAdmin, userController.getStudentReportByAdminAPI);

router.get("/dashboard-stats", verifyTokenAndAdminOrSchool, userController.getDashboardStatsAPI);


module.exports = router;
