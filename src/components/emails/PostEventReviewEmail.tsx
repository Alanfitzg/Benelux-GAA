import React from "react";

interface PostEventReviewEmailProps {
  recipientName: string;
  recipientClubName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  targetClubName: string;
  reviewUrl: string;
  expiryDays: number;
}

export function PostEventReviewEmail({
  recipientName,
  recipientClubName,
  eventTitle,
  eventDate,
  eventLocation,
  targetClubName,
  reviewUrl,
  expiryDays,
}: PostEventReviewEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#1a3352",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #264673 0%, #1a3352 100%)",
          padding: "40px 30px 30px 30px",
          textAlign: "center",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            margin: "0 0 8px 0",
            color: "#ffffff",
          }}
        >
          PlayAway
        </h1>
        <p
          style={{
            margin: "0",
            fontSize: "14px",
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "1px",
          }}
        >
          Travel Platform for Global Gaelic Games
        </p>
      </div>

      {/* Main Content */}
      <div style={{ backgroundColor: "#264673", padding: "40px 30px" }}>
        {/* Status Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              width: "64px",
              height: "64px",
              lineHeight: "64px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "32px", color: "#ffffff" }}>★</span>
          </div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: "0 0 8px 0",
              color: "#ffffff",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Share Your Experience
          </h2>
          <p
            style={{
              fontSize: "16px",
              margin: "0",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Hi {recipientName},
          </p>
        </div>

        {/* Message */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0 0 16px 0",
              color: "#ffffff",
            }}
          >
            We hope you had a great time at the event! On behalf of{" "}
            <strong>{recipientClubName}</strong>, we&apos;d love to hear about
            your experience with <strong>{targetClubName}</strong>.
          </p>

          {/* Event Details */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                margin: "0 0 4px 0",
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Event
            </p>
            <p
              style={{
                fontSize: "18px",
                fontWeight: "600",
                margin: "0 0 8px 0",
                color: "#ffffff",
              }}
            >
              {eventTitle}
            </p>
            <p
              style={{
                fontSize: "14px",
                margin: "0",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {eventLocation} • {eventDate}
            </p>
          </div>

          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.6",
              margin: "0",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Your feedback helps us improve the platform and helps other clubs
            make informed decisions.
          </p>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href={reviewUrl}
            style={{
              display: "inline-block",
              backgroundColor: "#10b981",
              color: "#ffffff",
              padding: "16px 40px",
              fontSize: "16px",
              fontWeight: "600",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            Share Your Experience
          </a>
        </div>

        {/* Expiry Notice */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "8px",
            padding: "12px 16px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              margin: "0",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            This link will expire in {expiryDays} days
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#1a3352",
          padding: "30px",
          textAlign: "center",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 8px 0",
            fontWeight: "500",
          }}
        >
          Slán go fóill,
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.9)",
            margin: "0 0 16px 0",
            fontWeight: "500",
          }}
        >
          The PlayAway Team
        </p>
        <p
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.5)",
            margin: "0",
          }}
        >
          © 2025 PlayAway · Connecting GAA Communities Worldwide
        </p>
      </div>
    </div>
  );
}
