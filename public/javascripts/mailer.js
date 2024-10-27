
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const db = require('./db-modules.js');
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }

});

async function sendVerification(email) {
    let emailToken = await db.getToken(email);
    emailToken = emailToken[0].verification_token;
    let link = `http://localhost:3000/verify?token=${emailToken}`;    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Please verify you email !',
        html: `<h1>Please click the link to verify your email</h1>
        <a href="http://localhost:3000/verify?token=${emailToken}">Click me to verify!</a>`
    
    }
    await emailTransporter.sendMail(mailOptions);
}

async function sendMarketingEmail(data) {
    let accounts = await db.getAllAccounts();
    let emails = accounts.map(account => {
        if (account.role == "user") {
            return account.email;
        } else {
            return
        }
    }).filter(email => email !== undefined);
    console.log(emails)
    for (const email of emails) {
        const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: data.subject,
        html: data.html
        }
        await emailTransporter.sendMail(mailOptions);
    }
}
    

module.exports = {
    "sendMarketingEmail": sendMarketingEmail,
    "emailTransporter": emailTransporter,
    "sendVerification": sendVerification,

}