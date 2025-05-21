var jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../const');


const checkAdminAuth = function (req, res, next) {

    const token = req.cookies.token || req.body.token || null;

    if (isAdmin(token)) {
        console.log("Admin Access");
        next();
    } else {
        res.json({
            "status": "error",
            "msg": "Admin access is needed :)"
        })
    }

}
const checkUserAuth = function (req, res, next) {
    console.log("Middleware: checkUserAuth ");
    
    next()
}


module.exports = {
    checkAdminAuth,
    checkUserAuth
}

function isAdmin(token) {
    if (token == null || token == undefined) {
        return false;

    }

    try {


        // verify a token symmetric - synchronous
        var decoded = jwt.verify(token, JWT_SECRET_KEY);

        console.log('decoded', decoded);

        const isAdmin = decoded.isAdmin || false;

        return isAdmin;


    } catch (error) {
        console.log("error: ", error);

        return false
    }

}


