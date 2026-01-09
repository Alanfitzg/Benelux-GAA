import { Resend } from "resend";
import { WelcomeEuropeanAdminEmail } from "@/components/emails/WelcomeEuropeanAdminEmail";
import { render } from "@react-email/render";

interface SendEuropeanAdminWelcomeEmailParams {
  to: string;
  userName: string;
  clubName: string;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

export async function sendEuropeanAdminWelcomeEmail({
  to,
  userName,
  clubName,
}: SendEuropeanAdminWelcomeEmailParams) {
  try {
    const resend = getResendClient();

    const emailHtml = await render(
      WelcomeEuropeanAdminEmail({
        userName,
        clubName,
      })
    );

    const data = await resend.emails.send({
      from: "PlayAway <welcome@playaway.ie>",
      to: [to],
      subject: `Welcome Club Admin! You're now hosting on PlayAway 🎉`,
      html: emailHtml,
      headers: {
        "X-Entity-Ref-ID": new Date().getTime().toString(),
      },
    });

    if (data.error) {
      console.error("Resend API error:", data.error);
      return {
        success: false,
        error: data.error.message,
      };
    }

    console.log("European admin welcome email sent successfully:", data);
    return { success: true, emailId: data.data?.id };
  } catch (error) {
    console.error("Error sending European admin welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
