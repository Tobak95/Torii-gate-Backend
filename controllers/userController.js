const USER = require("../models/users");
const bcrypt = require("bcryptjs");
const generateToken = require("../helpers/generateToken");
const { sendWelcomeEmail } = require("../email/sendEmail");

const handleRegister = async (req, res) => {
  //we tend to destructure from userSchema
  const { fullName, email, password, phoneNumber, role } = req.body;
  try {
    //check if user already exists
    const existingUser = await USER.findOne({
      $or: [{ email: email || null }, { phoneNumber: phoneNumber || null }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or Phone Number already exists" });
    }
    //protecting users password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    //verify process
    const verificationToken = generateToken();
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    //save to db
    const user = await USER.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "tenant",
      phoneNumber,
      verificationToken,
      verificationTokenExpires,
    });

    //sending an email - this comes after the user is created and we need to construct the client Url
    const clientUrl = `${process.env.FRONTEND_URL}/verify-email/ ${verificationToken}`;
    await sendWelcomeEmail({
      email: user.email,
      fullName: user.fullName,
      clientUrl,
    });

    return res
      .status(201)
      .json({ success: true, message: "user Registered Successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleVerifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    //find the user
    //1. find the user by the token
    const user = await USER.findOne({
      verificationToken: token,
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }
    //if token is expired
    if (user.verificationTokenExpires < Date.now()) {
      return res
        .status(404)
        .json({ message: "Verification Token has expired", email: user.email });
    };
    //check is the user is already verified
    if (user.isVerified) {
      return res
        .status(400)
        .json({ message: "Email already verified"});
    }
    // the user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    //send a success message
    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleRegister, handleVerifyEmail };
