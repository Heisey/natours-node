const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // ~~ Config Transport
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // ~~ Set Mail config
    const mailOptions = {
        from: 'Me Bitch <heiseymediatest@outlook.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
        // html:
    };

    // ^^ Send Email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;