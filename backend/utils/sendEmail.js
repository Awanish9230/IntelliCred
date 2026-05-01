const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Force IPv4 because Render sometimes has issues routing outbound IPv6 SMTP traffic
    family: 4, 
  });

  // Define the email options
  const mailOptions = {
    from: `IntelliCred Support <${process.env.EMAIL_FROM || 'support@intellicred.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', options.email);
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
