import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/error-handlers";
import { z } from "zod";

const ErrorReportSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  type: z.enum([
    "javascript",
    "unhandled-rejection",
    "react-error",
    "network",
    "custom",
  ]),
  message: z.string(),
  stack: z.string().optional(),
  url: z.string(),
  userAgent: z.string(),
  userId: z.string().optional(),
  sessionId: z.string(),
  additional: z.record(z.unknown()).optional(),
});

const ClientErrorsRequestSchema = z.object({
  errors: z.array(ErrorReportSchema),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Parse and validate request body
  const body = await request.json();
  const { errors } = ClientErrorsRequestSchema.parse(body);

  // In development, just log to console
  if (process.env.NODE_ENV === "development") {
    console.group("📥 Client Error Reports Received");
    errors.forEach((error, index) => {
      console.group(`Error ${index + 1}/${errors.length} [${error.type}]`);
      console.log("ID:", error.id);
      console.log("Message:", error.message);
      console.log("URL:", error.url);
      console.log("Session:", error.sessionId);
      if (error.userId) console.log("User:", error.userId);
      if (error.stack) console.log("Stack:", error.stack);
      if (error.additional) console.log("Additional:", error.additional);
      console.groupEnd();
    });
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: `Logged ${errors.length} error(s) to console`,
    });
  }

  // In production, you would:
  // 1. Save to database
  // 2. Send to external error tracking service (Sentry, LogRocket, etc.)
  // 3. Alert on critical errors
  // 4. Aggregate and analyze patterns

  try {
    // Example: Save to database (you would implement this)
    // await saveErrorsToDatabase(errors)

    // Example: Send to external service
    // await sendToErrorTrackingService(errors)

    // For now, just log critical information
    const criticalErrors = errors.filter(
      (error) =>
        error.type === "javascript" ||
        error.type === "unhandled-rejection" ||
        (error.type === "network" &&
          error.additional &&
          typeof error.additional.status === "number" &&
          error.additional.status >= 500)
    );

    if (criticalErrors.length > 0) {
      console.error("🚨 Critical client errors received:", {
        count: criticalErrors.length,
        totalErrors: errors.length,
        errors: criticalErrors.map((e) => ({
          id: e.id,
          type: e.type,
          message: e.message,
          url: e.url,
          userId: e.userId,
          sessionId: e.sessionId,
        })),
      });

      // You could send alerts here for critical errors
      // await sendCriticalErrorAlert(criticalErrors)
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${errors.length} error report(s)`,
      criticalCount: criticalErrors.length,
    });
  } catch (processingError) {
    console.error("Failed to process client error reports:", processingError);

    // Even if processing fails, we should return success to prevent
    // the client from retrying and creating more errors
    return NextResponse.json({
      success: true,
      message: "Error reports received but processing failed",
      warning: "Processing error occurred",
    });
  }
});

// Optional: GET endpoint to retrieve error statistics (for admin)
export const GET = withErrorHandler(async () => {
  // This would require authentication and admin privileges
  // For now, return a simple status

  return NextResponse.json({
    message: "Client error logging endpoint is active",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Example functions you would implement:

// async function saveErrorsToDatabase(errors: z.infer<typeof ErrorReportSchema>[]) {
//   Implementation would depend on your database choice
//   Example with Prisma:
//   await prisma.clientError.createMany({
//     data: errors.map(error => ({
//       errorId: error.id,
//       type: error.type,
//       message: error.message,
//       stack: error.stack,
//       url: error.url,
//       userAgent: error.userAgent,
//       userId: error.userId,
//       sessionId: error.sessionId,
//       additional: error.additional ? JSON.stringify(error.additional) : null,
//       timestamp: new Date(error.timestamp),
//     })),
//   })
// }

// async function sendToErrorTrackingService(errors: z.infer<typeof ErrorReportSchema>[]) {
//   Example: Send to Sentry, LogRocket, or custom service
//   for (const error of errors) {
//     await fetch('https://api.external-service.com/errors', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.ERROR_SERVICE_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(error),
//     })
//   }
// }

// async function sendCriticalErrorAlert(errors: z.infer<typeof ErrorReportSchema>[]) {
//   Example: Send email, Slack notification, or SMS for critical errors
//   await fetch('https://hooks.slack.com/your-webhook', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       text: `🚨 ${errors.length} critical client error(s) detected`,
//       attachments: errors.map(error => ({
//         color: 'danger',
//         fields: [
//           { title: 'Type', value: error.type, short: true },
//           { title: 'Message', value: error.message, short: false },
//           { title: 'URL', value: error.url, short: false },
//         ],
//       })),
//     }),
//   })
// }
