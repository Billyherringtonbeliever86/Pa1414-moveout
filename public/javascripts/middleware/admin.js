const session = require('express-session');

const verifyAdmin = (req, res, next) => {
    let email = req.session.email;
    if (email == process.env.ADMIN_EMAIL) {
        req.session.admin = true;
        next();
    } else {
       return res.status(401).render('pages/error', {
        session: {
            email: email
          },
          message: "Unathoraized access",
          code: 401
       })
    }
   

}

module.exports = verifyAdmin