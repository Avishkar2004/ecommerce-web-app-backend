const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = (recipientEmail, username) => {
  // console.log("email username:", username);
  const mailOptions = {
    from: process.env.MAIL_FORM,
    to: recipientEmail,
    subject: "Welcome! You Have Successfully Signed Up!",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
        <div style="text-align: center; padding: 10px 0; background-color: #f9f9f9; border-radius: 10px;">
          <h1 style="color: #4CAF50; font-size: 24px;">Welcome, ${username}!</h1>
          <p style="font-size: 18px; color: #555;">Thank you for signing up and logging in to our service.</p>
          <p style="font-size: 16px; margin: 20px 0;">We are excited to have you on board. If you have any questions, feel free to reach out to us.</p>
          <a href="http://localhost:3000" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; margin-top: 20px;">Go to Your Dashboard</a>
          <p style="font-size: 14px; color: #999; margin-top: 20px;">If you did not create this account, please contact our support team immediately.</p>
          <p style="font-size: 14px; margin-top: 10px;">Best Regards,</p>
          <p style="font-size: 14px; color: #4CAF50; font-weight: bold;">The ShopEase Team</p>
        </div>
      </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    }
  });
};

module.exports = sendMail;
