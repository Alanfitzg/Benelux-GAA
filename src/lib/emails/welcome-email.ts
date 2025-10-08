import { Resend } from "resend";
import { WelcomeEmail } from "@/components/emails/WelcomeEmail";
import { render } from "@react-email/render";

interface SendWelcomeEmailParams {
  to: string;
  userName: string;
  clubName?: string;
  clubCrestUrl?: string;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

export async function sendWelcomeEmail({
  to,
  userName,
  clubName,
  clubCrestUrl,
}: SendWelcomeEmailParams) {
  try {
    const resend = getResendClient();

    const emailHtml = await render(
      WelcomeEmail({
        userName,
        clubName,
        clubCrestUrl,
      })
    );

    const data = await resend.emails.send({
      from: "PlayAway <welcome@playaway.ie>",
      to: [to],
      subject: `Cead mile Failte ${userName} - Welcome to PlayAway! 🇮🇪`,
      html: emailHtml,
      headers: {
        "X-Entity-Ref-ID": new Date().getTime().toString(),
      },
    });

    console.log("Welcome email sent successfully:", data);
    return { success: true, emailId: data.data?.id };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Helper function to get club crest URL from club data
export function getClubCrestUrl(): string | undefined {
  // This would typically fetch from your database or use a default crest
  // For now, return undefined to use default behavior
  return undefined;
}
