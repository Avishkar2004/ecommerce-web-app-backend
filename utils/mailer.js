const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendMail = (recipientEmail) => {
  const mailOptions = {
    from: process.env.MAIL_FORM,
    to: recipientEmail,
    subject: "Welcome! You have successfully signed up!",
    text: "Thank you for signing up. You have successfully logged in to our service!",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = sendMail;
