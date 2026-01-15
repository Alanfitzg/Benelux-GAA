import { EventRejectedEmail } from "@/components/emails/EventRejectedEmail";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";

interface SendEventRejectedEmailParams {
  to: string;
  userName: string;
  eventTitle: string;
  rejectionReason: string;
  eventId: string;
}

export async function sendEventRejectedEmail({
  to,
  userName,
  eventTitle,
  rejectionReason,
  eventId,
}: SendEventRejectedEmailParams) {
  try {
    const emailHtml = await render(
      EventRejectedEmail({
        userName,
        eventTitle,
        rejectionReason,
        eventId,
      })
    );

    const success = await sendEmail({
      to,
      subject: `Event Update: "${eventTitle}" requires changes`,
      html: emailHtml,
    });

    if (!success) {
      console.error("Failed to send event rejected email");
      return {
        success: false,
        error: "Failed to send email",
      };
    }

    console.log("Event rejected email sent successfully to:", to);
    return { success: true };
  } catch (error) {
    console.error("Error sending event rejected email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
