const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**This is an onboarding check, it checks if you have already passed this once-off state/page */
const onboardingJWT = (req, res, next) => {
  const token = req.session?.jwt;
  if(!token) {
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if(err) return res.status(403).json({ message: 'Forbidden: Invalid token' });

    if(user.role){
      return res.status(200).json({ message : "User alredy onboarded", role: user.role});
    }
    
    req.user = user;
    next();
  });
}

/** This is to protect routes, no unauthorized access */
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

/** This is for when current logged-in users try to visit pages meant to be visited when logged out */
function redirectIfAuthenticated(req, res, next) {
  const token = req.session?.jwt;
  
  if (!token) {
    return next(); 
  }

  jwt.verify(token, JWT_SECRET, (err) => {
    if (err) {
      return next(); 
    }
    
    return res.redirect('/login');//We can't send authenticated users back to login, send them to dashboard rather
  });
}

module.exports = { onboardingJWT, authenticateJWT, redirectIfAuthenticated };
