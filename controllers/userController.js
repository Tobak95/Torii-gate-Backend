const USER = require("../models/users");
const bcrypt = require("bcryptjs");

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
        .json({ message: "Email or Phone Number alreadt exists" });
    }
    //protecting users password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    //verify process
    //save to db
    const user = await USER.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "tenant",
      phoneNumber,
    });
    return res
      .status(201)
      .json({ success: true, message: "user Registered Successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { handleRegister };
