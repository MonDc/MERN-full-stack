
const { MongoClient, ObjectID } = require('mongodb')
const conf = require('../conf');
const dbUrl = conf.dbUrl;
const dbName = conf.dbName;
var nodemailer = require("nodemailer");
var Transport = nodemailer.createTransport({
    host: "webmail.ahmad-osman.com",
    port: 25,
    secure: false, // upgrade later with STARTTLS
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: "hossien@ahmad-osman.com",
        pass: "!234qweR"
    }
});

function sendverfyEmail(toEmail, subject, message) {
    mailOptions = {
        from: "hossien@ahmad-osman.com",
        to: toEmail,
        subject: subject,
        html: message
    }
    Transport.sendMail(mailOptions, function (error, response) {
        if (error) {

            console.log(error);
            console.log("email has been not sended");
            callback(error)
        } else {
            console.log("Message sent: " + response.message);
            console.log("Email has ben sent");
            callback(response)
        }
    });

}
function verfyEmail(verifynumber, callback) {
    (async function mongo() {
        let client;
        try {
            client = await MongoClient.connect(dbUrl, { useNewUrlParser: true });
            const db = client.db(dbName);
            const col = await db.collection('users');
            const user = await col.findOne({
                verifyNumber: parseInt(verifynumber)
            });
            if (user) {
                const response = await col.updateOne(
                    {
                        verifyNumber: parseInt(verifynumber)  // _id: fieldname in DB , new.. that means the object wich have this id 
                    },
                    {
                        $set: {
                            verify: true  // password:field name in DB and newPassword is input text name
                        }
                    });
                client.close();
                callback(user);
            } else {
                client.close();
                callback(false)
            }
            //console.log(user)


        } catch (error) {
            console.log(error.message)
            client.close();
            callback(null)

        }
    }())
}

module.exports = {
    sendverfyEmail,
    verfyEmail

};

