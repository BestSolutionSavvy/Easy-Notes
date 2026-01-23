const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";
const JWT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Generates a JWT token for a user
 * @param {Object} user - The user object for which to generate the token
 * @returns {String} The generated JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
};

/**
 * Verifies and decodes a JWT token
 * @param {String} token - The token to verify
 * @returns {Object} The decoded data from the token
 * @throws {Error} If the token is not valid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

/**
 * Middleware to authenticate requests using JWT from httpOnly cookies
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_MAX_AGE,
};
