type EventType =
  | "DADS_AND_LADS"
  | "GAELIC4MOTHERS_AND_OTHERS"
  | "SOCIAL_CAMOGIE";

const eventTypeLabels: Record<EventType, string> = {
  DADS_AND_LADS: "Dads & Lads",
  GAELIC4MOTHERS_AND_OTHERS: "Gaelic4Mothers&Others",
  SOCIAL_CAMOGIE: "Social Camogie",
};

export function ggeTeamRegistrationConfirmation({
  clubName,
  contactName,
  eventType,
  eventLocation,
  eventDate,
  venueName,
  hostClubName,
  status,
}: {
  clubName: string;
  contactName: string;
  eventType: EventType;
  eventLocation: string;
  eventDate: string;
  venueName: string;
  hostClubName: string;
  status: "CONFIRMED" | "WAITING_LIST";
}): { subject: string; html: string; text: string } {
  const isConfirmed = status === "CONFIRMED";
  const subject = isConfirmed
    ? `Registration Confirmed: ${eventTypeLabels[eventType]} in ${eventLocation}`
    : `Waiting List: ${eventTypeLabels[eventType]} in ${eventLocation}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Gaelic Games Europe</h1>
              <p style="color: #f5c842; margin: 10px 0 0 0; font-size: 16px;">Recreational Games 2026</p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color: ${isConfirmed ? "#22c55e" : "#eab308"}; padding: 15px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold;">
                ${isConfirmed ? "✓ Registration Confirmed" : "⏳ Added to Waiting List"}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                Dear ${contactName},
              </p>

              ${
                isConfirmed
                  ? `
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                Great news! Your team <strong>${clubName}</strong> has been registered for the <strong>${eventTypeLabels[eventType]}</strong> blitz.
              </p>
              `
                  : `
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                Thank you for registering <strong>${clubName}</strong> for the <strong>${eventTypeLabels[eventType]}</strong> blitz. The event is currently at capacity, so your team has been added to the waiting list. We will notify you if a spot becomes available.
              </p>
              `
              }

              <!-- Event Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #1e3a5f; margin: 0 0 15px 0; font-size: 18px;">Event Details</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 5px 0; color: #666;">Event Type:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold;">${eventTypeLabels[eventType]}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666;">Date:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold;">${eventDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666;">Location:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold;">${eventLocation}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666;">Venue:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold;">${venueName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666;">Host Club:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold;">${hostClubName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #333; font-size: 16px; margin: 20px 0;">
                If you have any questions, please contact us at <a href="mailto:recreationalofficer.europe@gaa.ie" style="color: #1e3a5f;">recreationalofficer.europe@gaa.ie</a>
              </p>

              <p style="color: #333; font-size: 16px; margin: 20px 0 0 0;">
                Best regards,<br>
                <strong>Gaelic Games Europe</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 20px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">
                Gaelic Games Europe - Recreational Games 2026
              </p>
              <p style="color: #f5c842; margin: 10px 0 0 0; font-size: 12px;">
                Powered by PlayAway
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Gaelic Games Europe - Recreational Games 2026

${isConfirmed ? "REGISTRATION CONFIRMED" : "ADDED TO WAITING LIST"}

Dear ${contactName},

${
  isConfirmed
    ? `Great news! Your team ${clubName} has been registered for the ${eventTypeLabels[eventType]} blitz.`
    : `Thank you for registering ${clubName} for the ${eventTypeLabels[eventType]} blitz. The event is currently at capacity, so your team has been added to the waiting list. We will notify you if a spot becomes available.`
}

EVENT DETAILS:
- Event Type: ${eventTypeLabels[eventType]}
- Date: ${eventDate}
- Location: ${eventLocation}
- Venue: ${venueName}
- Host Club: ${hostClubName}

If you have any questions, please contact us at recreationalofficer.europe@gaa.ie

Best regards,
Gaelic Games Europe
`;

  return { subject, html, text };
}

export function ggeHostApplicationConfirmation({
  clubName,
  contactName,
  eventType,
  proposedDate,
  location,
  venueName,
}: {
  clubName: string;
  contactName: string;
  eventType: EventType;
  proposedDate: string;
  location: string;
  venueName: string;
}): { subject: string; html: string; text: string } {
  const subject = `Host Application Received: ${eventTypeLabels[eventType]} in ${location}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Gaelic Games Europe</h1>
              <p style="color: #f5c842; margin: 10px 0 0 0; font-size: 16px;">Recreational Games 2026</p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color: #3b82f6; padding: 15px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold;">
                📝 Host Application Received
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                Dear ${contactName},
              </p>

              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                Thank you for submitting a host application on behalf of <strong>${clubName}</strong> for a <strong>${eventTypeLabels[eventType]}</strong> blitz.
              </p>

              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                Your application is now under review. We will be in touch once it has been processed.
              </p>

              <!-- Application Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #1e3a5f; margin: 0 0 15px 0; font-size: 18px;">Application Summary</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 5px 0; color: #666;">Event Type:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold;">${eventTypeLabels[eventType]}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666;">Proposed Date:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold;">${proposedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666;">Location:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold;">${location}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #666;">Venue:</td>
                        <td style="padding: 5px 0; color: #333; font-weight: bold;">${venueName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="color: #333; font-size: 16px; margin: 20px 0;">
                If you have any questions, please contact us at <a href="mailto:recreationalofficer.europe@gaa.ie" style="color: #1e3a5f;">recreationalofficer.europe@gaa.ie</a>
              </p>

              <p style="color: #333; font-size: 16px; margin: 20px 0 0 0;">
                Best regards,<br>
                <strong>Gaelic Games Europe</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 20px; text-align: center;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">
                Gaelic Games Europe - Recreational Games 2026
              </p>
              <p style="color: #f5c842; margin: 10px 0 0 0; font-size: 12px;">
                Powered by PlayAway
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Gaelic Games Europe - Recreational Games 2026

HOST APPLICATION RECEIVED

Dear ${contactName},

Thank you for submitting a host application on behalf of ${clubName} for a ${eventTypeLabels[eventType]} blitz.

Your application is now under review. We will be in touch once it has been processed.

APPLICATION SUMMARY:
- Event Type: ${eventTypeLabels[eventType]}
- Proposed Date: ${proposedDate}
- Location: ${location}
- Venue: ${venueName}

If you have any questions, please contact us at recreationalofficer.europe@gaa.ie

Best regards,
Gaelic Games Europe
`;

  return { subject, html, text };
}
