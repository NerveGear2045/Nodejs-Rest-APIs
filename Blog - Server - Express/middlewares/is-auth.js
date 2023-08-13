require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Can not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  let decodedToken;
  const token = authHeader.split(' ')[1];
  try {
    decodedToken = jwt.verify(token, process.env.sr);
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
  if (!decodedToken) {
    const error = new Error('Can not authenticated.');
    error.statusCode = 401;
    throw err;
  }
  req.userId = decodedToken.userId;
  next();
};
