const nodemailer = require('nodemailer');

const sendForgotPassEmail = async (email, id) => {
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
      subject: 'Forgot Password',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <header style="background-color: #4CAF50; color: white; text-align: center; padding: 20px;">
              <h1 style="margin: 0; font-size: 24px;">Welcome to Savage AI!</h1>
            </header>
            <main style="padding: 20px;">
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONT_URL}/password?id=${id}" 
                   style="display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; 
                   padding: 12px 20px; border-radius: 5px; font-size: 16px;">
                   Change your password
                </a>
              </p>
              <p style="font-size: 14px; color: #666; margin: 30px 0 0; text-align: center;">
                If you didn’t create an account, you can safely ignore this email.
              </p>
            </main>
            <footer style="background-color: #f8f8f8; text-align: center; padding: 10px 20px; font-size: 12px; color: #777;">
              <p style="margin: 0;">&copy; 2025 HaddajiDev. All Rights Reserved.</p>
            </footer>
          </div>
        </div>
      `
    };
    

    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

module.exports = sendForgotPassEmail;