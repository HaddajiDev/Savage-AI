const nodemailer = require('nodemailer');


const sendVerificationEmail = async (email, token) => {
  try {    
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Email Verification',
      html: `<p>Please verify your email by clicking the link:</p><br />
       <a href='${process.env.BACKEND}/user/api/signup?token=${token}'>verify here</a>`
    };

    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

module.exports = sendVerificationEmail;