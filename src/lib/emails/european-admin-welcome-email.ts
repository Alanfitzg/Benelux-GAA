import { WelcomeEuropeanAdminEmail } from "@/components/emails/WelcomeEuropeanAdminEmail";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";

interface SendEuropeanAdminWelcomeEmailParams {
  to: string;
  userName: string;
  clubName: string;
}

export async function sendEuropeanAdminWelcomeEmail({
  to,
  userName,
  clubName,
}: SendEuropeanAdminWelcomeEmailParams) {
  try {
    const emailHtml = await render(
      WelcomeEuropeanAdminEmail({
        userName,
        clubName,
      })
    );

    const success = await sendEmail({
      to,
      subject: `Welcome Club Admin! You're now hosting on PlayAway 🎉`,
      html: emailHtml,
    });

    if (!success) {
      console.error("Failed to send European admin welcome email");
      return {
        success: false,
        error: "Failed to send email",
      };
    }

    console.log("European admin welcome email sent successfully to:", to);
    return { success: true };
  } catch (error) {
    console.error("Error sending European admin welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
