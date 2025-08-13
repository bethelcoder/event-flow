const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateJWT(req, res, next) {
  const token = req.session?.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden: Invalid token' });

    req.user = user;
    next();
  });
}

function redirectIfAuthenticated(req, res, next) {
  const token = req.session?.jwt;

  if (!token) {
    return next(); 
  }

  jwt.verify(token, JWT_SECRET, (err) => {
    if (err) {
      return next(); 
    }
    
    return res.redirect('/login');
  });
}

module.exports = { authenticateJWT, redirectIfAuthenticated };
