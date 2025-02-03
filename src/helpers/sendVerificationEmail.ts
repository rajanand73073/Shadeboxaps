import nodemailer from "nodemailer";

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rajanandup70@gmail.com", // Your Gmail address
    pass: "ywwk ywzgxesb rczu", // App Password
  },
});

// Function to send the verification email
export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    const mailOptions = {
      from: '"shadebox" <rajanandup70@gmail.com>', // Sender's email address
      to: email, // Recipient's email address
      subject: "Your Verification Code",
      html: `
        <h2>Hello ${username},</h2>
        <p>Thank you for registering! Please use the following code to complete your verification:</p>
        <h1>${verifyCode}</h1>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send verification email" };
  }
}
