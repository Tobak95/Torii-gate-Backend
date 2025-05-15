const router = require("express").Router();
const {
  handleRegister,
  handleVerifyEmail,
  handleLogin
} = require("../controllers/userController");

router.post("/register", handleRegister);
router.post("/verify-email/:token", handleVerifyEmail);
router.post("/login", handleLogin)

module.exports = router;

//this route expoted above would be inported inside the index.js as const-userRouter = require("./routes/userRouter")

//line 16 0f my index.js insude my app.use before the userRouter
// app.use('/api/auth', userRouter) the api/auth is importatant
