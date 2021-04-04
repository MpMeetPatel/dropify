import nodemailer from "nodemailer";

interface options {
	to: string,
	subject?: string,
	text?: string,
	html?: string
}

export const sendEmail = async (options: options) => {
  // 1) create transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      // This credentials will not work for you as it's temporary, replace with your
      user: "ddfdd8fb93c94f",
      pass: 'c8809ead1fa34e'
    }
  });

  // 2) define mail options
  const mailOptions = {
    from: "Meet Patel <meet@pro.io>",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  // 3) send the mail
  await transporter.sendMail(mailOptions);
};
