import React from "react";

interface EventRejectedEmailProps {
  userName: string;
  eventTitle: string;
  rejectionReason: string;
  eventId: string;
}

export function EventRejectedEmail({
  userName,
  eventTitle,
  rejectionReason,
  eventId,
}: EventRejectedEmailProps) {
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
              backgroundColor: "#dc2626",
              borderRadius: "50%",
              width: "64px",
              height: "64px",
              lineHeight: "64px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "32px", color: "#ffffff" }}>!</span>
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
            Event Not Approved
          </h2>
          <p
            style={{
              fontSize: "16px",
              margin: "0",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Hi {userName},
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
            Unfortunately, your event submission has not been approved at this
            time.
          </p>

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
                margin: "0",
                color: "#ffffff",
              }}
            >
              {eventTitle}
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#dc2626",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: "600",
                margin: "0 0 4px 0",
                color: "rgba(255,255,255,0.9)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Reason
            </p>
            <p
              style={{
                fontSize: "15px",
                lineHeight: "1.6",
                margin: "0",
                color: "#ffffff",
              }}
            >
              {rejectionReason}
            </p>
          </div>
        </div>

        {/* What to do next */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "700",
              margin: "0 0 12px 0",
              color: "#1a3352",
            }}
          >
            What happens next?
          </h3>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.7",
              margin: "0 0 16px 0",
              color: "#4b5563",
            }}
          >
            You can edit your event to address the feedback and resubmit it for
            approval. Once updated, our team will review it again.
          </p>

          <a
            href={`https://playaway.ie/club-admin/events/${eventId}/edit`}
            style={{
              display: "inline-block",
              backgroundColor: "#264673",
              color: "#ffffff",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            Edit & Resubmit Event
          </a>
        </div>

        {/* Help Text */}
        <p
          style={{
            fontSize: "13px",
            lineHeight: "1.6",
            margin: "0",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
          }}
        >
          Questions? Just reply to this email — we&apos;re here to help.
        </p>
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
