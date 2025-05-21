var express = require('express');
var router = express.Router();
const db = require('./../lib/db');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

const { sendPasswordResetEmailMJ } = require('../lib/mailjet');
const { getAuth } = require('firebase-admin/auth');
const { APP_NAME } = require('../const');

/* GET users listing. 
router.get('/login', function (req, res, next) {
    res.send('respond with a resource');
});
*/
router.get('/', function (req, res, next) {
    res.send('Auth Pathway');
});

const PASSWORD_REST_BASE_URL = "https://example.com/account"

router.post('/verify', (req, res) => {

    console.log('/verify -> Verify: ')

    try {
        const token = req.cookies.token || req.body.token;

        console.log(req.cookies);

        // verify a token symmetric - synchronous
        var decoded = verifyJWT(token);
        console.log('decoded', decoded);

        res.json({
            error: false,
            cookies: req.cookies,
            decoded: decoded
        });
    } catch (error) {
        console.log("error: ", error);

        res.json({
            error: true,
            error_msg: error
        });
    }


})


router.post('/register', async (req, res) => {
    console.log("/auth/register -->");


    try {
        const { email, password } = req.body;
        console.log("req Body", req.body);

        if (!(email && password)) {
            res.status(400).json({
                error: true,
                error_msg: "error feild"
            });;
        }
        // check if user exist

        // encrypt password
        const myEncPassword = await bcrypt.hash(password, 10);

        // save the user in DB with enc password
        /*   const userDB = new UserDB({ email: email, password: myEncPassword, isAdmin: false });
          await userDB.save()
          console.log("New User ID: " + userDB.id); */


        const result = await db.query(
            'INSERT INTO users_db (email,password) VALUES ($1,$2) RETURNING *',
            [String(email), String(myEncPassword)]
        );

        console.log("new user created \n", result.rows[0]);
        const userDB = result.rows[0];



        // generate token & send it
        var token = createJWTToken({
            app: APP_NAME,
            email: email,
            isAdmin: false,
        });

        console.log("Gen Tokem: " + token);

        // Firebase Custom Token
        const uid = String(userDB.id);
        const additionalData = {
            app: APP_NAME,
            email: email,
            isAdmin: false

        };

        var fbCustomToken = await FirebaseCreateCustomToken(uid, additionalData);

        const user = { email: email, jwt_token: token, firebase_custom_token: fbCustomToken, error: false };

        res.status(200).json(user);

    } catch (error) {
        console.log("Error: ", error);

        res.status(200).json({
            error: true,
            error_msg: error
        });


    }



})


router.post('/login', async (req, res) => {


    var encPassword = "";
    try {
        // get all data from user
        const { email, password } = req.body;

        // find user in db

        // var user = await UserDB.findOne({ email: email }).exec()
        var result = await db.query('SELECT * FROM users_db WHERE email = $1', [email]);
        var user = null
        console.log("Result -> ", result.rowCount);

        if (result.rowCount != 0) {
            user = result.rows[0];

        }


        //var user = {}
        console.log("---\nuser", user);

        if (user != null) {
            encPassword = user.password;

        }

        if (encPassword == null) {
            res.send("email invalid");

        }
        // match password

        const isValid = await bcrypt.compare(password, encPassword);
        var token = "";
        if (isValid) {
            // create jwt token
            token = createJWTToken({
                app: APP_NAME,
                email: user.email,
                isAdmin: user.isAdmin
            })

            // send a token in user cookie
            console.log('Cookies: ')
            console.log(req.cookies);
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days, 24 hours, 60 min, 60 sec, 1000 mili
                httpOnly: true
            }



            // Firebase Create Custom Auth Token
            const uid = String(user.id);
            const additionalData = {
                app: APP_NAME,
                email: user.email,
                isAdmin: user.isAdmin
            };

            var fbCustomToken = await FirebaseCreateCustomToken(uid, additionalData);



            res.status(200)
                .cookie("token", token, options)
                .json({ success: true, jwt_token: token, firebase_custom_token: fbCustomToken, error: false, email: email });



        } else {
            res.status(200)
                .json({ error: true, invalidPassword: true });

        }


    } catch (error) {
        console.log(error);
        console.log("Error: ", error);
        res.status(200).json({ error: true, error_msg: error });
    }
});

// Password Reset API
router.post('/passwordreset', async (req, res) => {

    console.log("/auth/passwordreset");


    try {
        // get all data from user
        const { email } = req.body || "NULLL";
        console.log("/auth/passwordreset --> " + email);

        // find user in db
        var result = await db.query('SELECT * FROM users_db WHERE email = $1', [email]);
        var user = null;
        if (result.rowCount != 0) {
            user = result.rows[0];

        }


        console.log("---\nuser", user);

        if (user != null) {
            const userEmail = user.email;

            const resetId = generateRandomAlphanumeric(20);
            const passResetToken = resetId;

            // user.passResetToken = resetId;
            const result = await db.query('UPDATE users_db SET pass_reset_token = $1 WHERE email = $2', [passResetToken, userEmail]);

            //await user.save();
            console.log("User DB Saved");
            console.log(result.rows);


            const resetURL = PASSWORD_REST_BASE_URL + "?id=" + resetId;

            var sent = await sendPasswordResetEmailMJ(userEmail, resetURL);

            res.status(200)
                .json({ error: false, invalidEmail: false, success: true });
        } else {

            res.status(200)
                .json({ error: true, invalidEmail: true });
        }



    } catch (error) {
        console.log(error);
        console.log("Error: ", error);
        res.status(200).json({ error: true, error_msg: error });
    }
});

router.post('/passwordreset/:resetId', async (req, res) => {

    console.log('/passwordreset/:resetId ------> \n', req.params);

    const resetId = req.params.resetId;
    const newPassword = req.body.password;


    //var user = await UserDB.findOne({ passResetToken: resetId }).exec()
    var result = await db.query('SELECT * FROM users_db WHERE pass_reset_token = $1', [resetId]);

    var user = null;
    if (result.rowCount != 0) {
        user = result.rows[0];
    }
    if (user != null) {

        console.log("User found");
        console.log(user);

        const userEmail = user.email;

        // encrypt password
        const myEncPassword = await bcrypt.hash(newPassword, 10);

        // save new password to database
        // user.password = myEncPassword;
        // user.passResetToken = null;
        // await user.save();
        const result1 = await db.query('UPDATE users_db SET password = $1, pass_reset_token = NULL WHERE email = $2',
            [myEncPassword, userEmail]);

        if (result1.rowCount != 0) {
            console.log("Updated Password: ", result1.rows);

        }


        res.status(200).json({ error: false, success: true });

    } else {
        console.log("User not found");

        res.status(200).json({ error: true, error_msg: "email invalid" });
    }

});


router.post('/signout', (req, res) => {

    console.log('/signout ')

    res.status(200)
        .clearCookie()
        .send("Sign out successfull")


})



/* router.get('/passwordreset/:resetId', async (req, res) => {

    console.log('/passwordreset/:resetId ------> \n', req.params);

    const resetId = req.params.resetId;


    var user = await UserDB.findOne({ passResetToken: resetId }).exec()
    if (user != null) {

        console.log("User found");
        console.log(user);




    } else {
        res.status(200).json({ error: true, error_msg: "email invalid" });
    }
    res.send(req.params)

});
 */


/*
router.post('/deleteaccount', (req, res) => {
    const { email,uid } = req.body;

    var user=UserDB.findOne({email:email,id:uid}).exec();

    var userDeleted = new UserDeletedDB({ email: email });
    userDeleted.save()
    user.remove();
})
*/

module.exports = router;



async function FirebaseCreateCustomToken(uid, data) {

    console.log("User Id: " + uid);


    var fbCustomToken = null
    await getAuth()
        .createCustomToken(uid, data)
        .then((customToken) => {
            // Send token back to client
            console.log("Firebase Custom Token Created");

            fbCustomToken = customToken;
        })
        .catch((error) => {
            console.log('Error creating custom token:', error);
        });

    return fbCustomToken

}

var JWT_SECRET_KEY = String(process.env.JWT_SECRET_KEY)

function createJWTToken(data) {

    var token = jwt.sign(
        data,
        JWT_SECRET_KEY,
        {
            expiresIn: '2h'
        }
    );

    return token;


}


function verifyJWT(token) {
    var decoded = jwt.verify(token, JWT_SECRET_KEY);

    return decoded;
}


function generateRandomAlphanumeric(length) {
    return Array(length).fill(0).map(() => {
        return Math.random().toString(36).charAt(2);
    }).join('');
}
