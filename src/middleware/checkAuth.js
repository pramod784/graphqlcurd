const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const getHeader = req.get("Authorization");
  console.log("middleware called");
  if (!getHeader) {
    req.isAuthenticated = false;
    return next();
  }
  const token = getHeader.split(" ")[1];
  if (!token || token === "") {
    req.isAuthenticated = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
  } catch (err) {
    req.isAuthenticated = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuthenticated = false;
    return next();
  }
  req.isAuthenticated = true;
  req.userId = decodedToken.user_id;
  next();
};
