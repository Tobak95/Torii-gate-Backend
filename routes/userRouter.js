const router = require("express").Router();
const {
  handleRegister,
  handleVerifyEmail,
  handleLogin,
  resendVerificationEmail,
  handleForgotPassword,
  handleResetPassword,
  handleUpdateUser,
  handleGetUser,
} = require("../controllers/userController");

//imported from the auth middleware
const { isLoggedIn, requirePermission } = require("../middleware/auth");

router.post("/register", handleRegister);
router.post("/verify-email/:token", handleVerifyEmail);
router.post("/login", handleLogin);
router.post("/resend-email", resendVerificationEmail);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password", handleResetPassword);
router.get("/user", isLoggedIn, handleGetUser);
//this route is protected, only the landlord can access this route
router.patch(
  "/user",
  isLoggedIn,
  requirePermission("landlord"),
  handleUpdateUser
);

module.exports = router;

//this route exported above would be imported inside the index.js as const-userRouter = require("./routes/userRouter")

//line 16 0f my index.js inside my app.use before the userRouter
// app.use('/api/auth', userRouter) the api/auth is important
