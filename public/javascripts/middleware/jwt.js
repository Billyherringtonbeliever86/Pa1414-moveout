const jwt = require('jsonwebtoken');
const session = require('express-session');
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.session.email = null;
        return res.status(401).render('pages/error', {
            session: {
                email: ""  
              },
            message: "No user user token found",
            code: 401
        }
        )
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.session.email = decoded.email;
        next();
    } catch (error) {
        req.session.email = null;
        res.status(403).render('pages/error', {
            session: {
              email: ""  
            },
            message: "Expired login session",
            code: 403
        })
    }


}

module.exports = verifyToken