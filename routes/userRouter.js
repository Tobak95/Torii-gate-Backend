const router = require("express").Router();
const { handleRegister } = require("../controllers/userController");

router.post("/register", handleRegister);

module.exports = router;

//this route expoted above would be inported inside the index.js as const-userRouter = require("./routes/userRouter")

//line 16 0f my index.js insude my app.use before the userRouter
// app.use('/api/auth', userRouter) the api/auth is importatant
