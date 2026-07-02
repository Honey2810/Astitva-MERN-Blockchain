import jwt from 'jsonwebtoken';

/**
 * Generates a signed JSON Web Token (JWT) with user ID payload
 * @param {string} id - The MongoDB User ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Session remains active for 30 days
  });
};

export default generateToken;
