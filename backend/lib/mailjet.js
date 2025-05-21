/* 
const mailjet = require('node-mailjet').apiConnect(
    process.env.MJ_APIKEY_PUBLIC,
    process.env.MJ_APIKEY_PRIVATE
);
 */


function sendPasswordResetEmailMJ(RECIPIENT_EMAIL, RESET_URL) {
   /*  console.log("sendPasswordResetEmailMJ", RECIPIENT_EMAIL, RESET_URL);


    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                "From": {
                    "Email": "notification-email-bot1@deveshrx.com",
                    "Name": "Devesh Rx Apps & Games"
                },
                "To": [
                    {
                        "Email": `${RECIPIENT_EMAIL}`,
                        "Name": `${RECIPIENT_EMAIL}`
                    }
                ],
                "TemplateID": 6562272,
                "TemplateLanguage": true,
                "Subject": "Password Reset for SMS Drive [Devesh Rx Apps & Games Account]",
                "Variables": {
                    "PASSWORD_RESET_URL": `${RESET_URL}`,
                    "USER_EMAIL": `${RECIPIENT_EMAIL}`
                }
            },
        ],
    })

    return request
        .then(result => {
            console.log(result.body)

            return true;
        })
        .catch(err => {
            console.log(err.statusCode)

            return false;
        })
 */

}



module.exports = { sendPasswordResetEmailMJ };

