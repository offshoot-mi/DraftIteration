// Rewrite/server/utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (userId, userRole) => {
  return jwt.sign(
    { id: userId, role: userRole }, // Payload
    process.env.JWT_SECRET,          // Secret Key
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d', // Expiration
    }
  );
};

export default generateToken;