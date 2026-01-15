import { WelcomeIrishAdminEmail } from "@/components/emails/WelcomeIrishAdminEmail";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";

interface SendIrishAdminWelcomeEmailParams {
  to: string;
  userName: string;
  clubName: string;
}

export async function sendIrishAdminWelcomeEmail({
  to,
  userName,
  clubName,
}: SendIrishAdminWelcomeEmailParams) {
  try {
    const emailHtml = await render(
      WelcomeIrishAdminEmail({
        userName,
        clubName,
      })
    );

    const success = await sendEmail({
      to,
      subject: `Welcome Club Admin! Start planning your European trips with PlayAway`,
      html: emailHtml,
    });

    if (!success) {
      console.error("Failed to send Irish admin welcome email");
      return {
        success: false,
        error: "Failed to send email",
      };
    }

    console.log("Irish admin welcome email sent successfully to:", to);
    return { success: true };
  } catch (error) {
    console.error("Error sending Irish admin welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
