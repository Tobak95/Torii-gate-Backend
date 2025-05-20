const USER = require("../models/users");
const bcrypt = require("bcryptjs");
const generateToken = require("../helpers/generateToken");
const { sendWelcomeEmail } = require("../email/sendEmail");
const jwt = require("jsonwebtoken");

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
    const clientUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
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
    }
    //check is the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
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

//handleLogin
const handleLogin = async (req, res) => {
  const { email, password, role } = req.body;
  //this is an input validation..... so the user didnt fill up the required field
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, password and role are required" });
  }
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Account not found, Register" });
    }
    //error 403 means forbidden
    if (user.role !== role) {
      return res.status(403).json({ message: "Access Denied fot this role" });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Email not verified, Check your email" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //generate token  (validity, period) jwt would be used for authorization,
    //payload means the unique identification of the user
    //jsonwebtoken is used to sign the token, and its would be installed in the terminal as npm i jasonwebtoken

    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "3 days",
      }
    );

    return res.status(200).json({
      token,
      message: "Login successful",
      success: true,
      user: {
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    //generate token again
    const newToken = generateToken();
    const tokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    user.verificationToken = newToken;
    user.verificationTokenExpires = tokenExpires;
    await user.save();
    //Send an email
    const clientUrl = `${process.env.FRONTEND_URL}/verify-email/${newToken}`;
    await sendWelcomeEmail({
      email: user.email,
      fullName: user.fullName,
      clientUrl,
    });

    return res
      .status(201)
      .json({ success: true, message: "Verification Email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const handleForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const user = await USER.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.resetPasswordToken = generateToken()
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 //1 hr
    await user.save()

    //send the mail

    res.status(200).json({success: true, message: 'Password resent link is sent to your email'})
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleRegister,
  handleVerifyEmail,
  handleLogin,
  resendVerificationEmail,
  handleForgotPassword,
};
