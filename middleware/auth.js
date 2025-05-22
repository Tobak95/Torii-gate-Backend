const jwt = require("jsonwebtoken");
//the auth would if the user is logged in or not
//jwt is a token that is generated when the user logs in, it has to be called above

const isLoggedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) {
      return res
        .status(401)
        .json({ message: "Unauthorized to perform action" });
    }
    req.user = {
      email: payload.email,
      role: payload.role,
      userId: payload.userId,
    };
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Authentication Failed" });
  }
};

//also check if the user has requires permission to access the route

const requirePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to assess this route" });
    }
    next();
  };
};

module.exports = {
  isLoggedIn,
  requirePermission,
};
