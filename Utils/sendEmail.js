import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
  host: process.env.SMPT_HOST ,
  port:process.env.SMPT_PORT ,
  auth: {
    user: process.env.SMPT_USER,
    pass: process.env.SMPT_PASS
  }
  });

  await transporter.sendMail({
    to,
    subject,
    text,
    from:"myid@gmail.com" //ye baad mechange hoga
  });
};

// host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
