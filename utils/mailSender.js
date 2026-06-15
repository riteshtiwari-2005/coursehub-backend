const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("SMTP Connected");

    const info = await transporter.sendMail({
      from: `"CourseHub" <${process.env.MAIL_SENDER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("Mail sent:", info.messageId);

    return info;
  } catch (error) {
    console.log(error);
    return error.message;
  }
};

module.exports = mailSender;