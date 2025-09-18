// authMiddleware.js

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // Get the token from the request header
    const token = req.header('x-auth-token');

    // Check if no token is provided
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied.' });
    }

    // Verify the token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the user from the payload to the request object
        req.user = decoded.user;
        next(); // Move on to the next function (the actual route handler)
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid.' });
    }
};

const isTeacher = (req, res, next) => {
    // This middleware should run AFTER the 'protect' middleware
    if (req.user && req.user.role === 'teacher') {
        next(); // User is a teacher, allow them to proceed
    } else {
        res.status(403).json({ msg: 'Access denied. Only teachers can perform this action.' });
    }
};


module.exports = { protect, isTeacher };