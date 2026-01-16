import { PostEventReviewEmail } from "@/components/emails/PostEventReviewEmail";
import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";

interface SendPostEventReviewEmailParams {
  to: string;
  recipientName: string;
  recipientClubName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  targetClubName: string;
  reviewToken: string;
}

export async function sendPostEventReviewEmail({
  to,
  recipientName,
  recipientClubName,
  eventTitle,
  eventDate,
  eventLocation,
  targetClubName,
  reviewToken,
}: SendPostEventReviewEmailParams) {
  try {
    const reviewUrl = `${process.env.NEXTAUTH_URL}/review/${reviewToken}`;
    const expiryDays = 7;

    const emailHtml = await render(
      PostEventReviewEmail({
        recipientName,
        recipientClubName,
        eventTitle,
        eventDate,
        eventLocation,
        targetClubName,
        reviewUrl,
        expiryDays,
      })
    );

    const success = await sendEmail({
      to,
      subject: `Share your experience: ${eventTitle}`,
      html: emailHtml,
    });

    if (!success) {
      console.error("Failed to send post-event review email");
      return {
        success: false,
        error: "Failed to send email",
      };
    }

    console.log("Post-event review email sent successfully to:", to);
    return { success: true };
  } catch (error) {
    console.error("Error sending post-event review email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
