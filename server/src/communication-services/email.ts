import nodemailer from "nodemailer";
import mjml2html from "mjml";

// Example MJML template function
function getMjmlTemplate(templateName: string, otp: string, email: string): string {
  if (templateName === "otp") {
    return `
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text font-size="20px" color="#333333" font-family="helvetica">
                Hello ${email},
              </mj-text>
              <mj-text font-size="18px" color="#333333">
                Your OTP is: <strong>${otp}</strong>
              </mj-text>
              <mj-text font-size="14px" color="#888888">
                Please use this OTP to complete your verification.
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;
  }
  // Add more templates as needed
  return `
    <mjml>
      <mj-body>
        <mj-section>
          <mj-column>
            <mj-text>
              Default template. OTP: ${otp}
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;
}

export async function sendGmailOtpEmail(otp: string, email: string, templateName: string) {
  try {
    // Prepare MJML template and convert to HTML
    const mjml = getMjmlTemplate(templateName, otp, email);
    const { html } = mjml2html(mjml);

    // Create nodemailer transporter using Gmail and App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_SENDER_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not your Gmail password!
      },
    });

    // Send email
    await transporter.sendMail({
      from: `Your App <${process.env.GMAIL_SENDER_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      html,
    });

    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}