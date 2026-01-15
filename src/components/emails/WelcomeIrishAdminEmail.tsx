import React from "react";

interface WelcomeIrishAdminEmailProps {
  userName: string;
  clubName: string;
}

export function WelcomeIrishAdminEmail({
  userName,
  clubName,
}: WelcomeIrishAdminEmailProps) {
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
        {/* Welcome */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "600",
              margin: "0 0 8px 0",
              color: "#ffffff",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Welcome, Club Admin!
          </h2>
          <p
            style={{
              fontSize: "16px",
              margin: "0",
              color: "rgba(255,255,255,0.9)",
              fontWeight: "500",
            }}
          >
            {clubName}
          </p>
        </div>

        {/* Congratulations Message */}
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
            Congratulations <strong>{userName}</strong>! Your application to
            become a Club Admin for <strong>{clubName}</strong> has been
            approved.
          </p>
          <p
            style={{
              fontSize: "15px",
              lineHeight: "1.6",
              margin: "0",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            You can now organise team trips to European clubs, track your
            team&apos;s travel history, and connect with GAA clubs across the
            continent.
          </p>
        </div>

        {/* Dashboard Features */}
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
              fontSize: "20px",
              fontWeight: "700",
              margin: "0 0 12px 0",
              color: "#1a3352",
              textAlign: "center",
            }}
          >
            Your Admin Dashboard
          </h3>
          <p
            style={{
              fontSize: "14px",
              lineHeight: "1.7",
              margin: "0 0 20px 0",
              color: "#4b5563",
              textAlign: "center",
            }}
          >
            Everything you need to plan and manage your club&apos;s European
            adventures. Browse tournaments, connect with host clubs, and keep
            track of your team&apos;s trips.
          </p>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "12px 8px",
                    borderBottom: "1px solid #e5e7eb",
                    verticalAlign: "top",
                  }}
                >
                  <strong style={{ color: "#1a3352", fontSize: "14px" }}>
                    Browse Tournaments
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Discover upcoming tournaments across Europe and register
                    your team&apos;s interest
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "12px 8px",
                    borderBottom: "1px solid #e5e7eb",
                    verticalAlign: "top",
                  }}
                >
                  <strong style={{ color: "#1a3352", fontSize: "14px" }}>
                    Trip History
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Keep a record of all your club&apos;s trips and tournament
                    participations
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "12px 8px",
                    borderBottom: "1px solid #e5e7eb",
                    verticalAlign: "top",
                  }}
                >
                  <strong style={{ color: "#1a3352", fontSize: "14px" }}>
                    Twin Club Connections
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Find and connect with a twin club in Europe to build lasting
                    relationships
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "12px 8px",
                    borderBottom: "1px solid #e5e7eb",
                    verticalAlign: "top",
                  }}
                >
                  <strong style={{ color: "#1a3352", fontSize: "14px" }}>
                    Club Network
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Build a network of friendly clubs across Europe for future
                    trips
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "12px 8px",
                    verticalAlign: "top",
                  }}
                >
                  <strong style={{ color: "#1a3352", fontSize: "14px" }}>
                    Team Management
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Manage your club profile and coordinate trip registrations
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* How It Works Section */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
            borderLeft: "4px solid #10b981",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              margin: "0 0 12px 0",
              color: "#1a3352",
            }}
          >
            Planning Your First Trip?
          </h3>
          <ol
            style={{
              margin: "0",
              padding: "0 0 0 20px",
              fontSize: "14px",
              lineHeight: "1.8",
              color: "#4b5563",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              Browse tournaments on the{" "}
              <a
                href="https://playaway.ie/events"
                style={{ color: "#264673", fontWeight: "600" }}
              >
                Events page
              </a>
            </li>
            <li style={{ marginBottom: "8px" }}>
              Register your team&apos;s interest in attending
            </li>
            <li style={{ marginBottom: "8px" }}>
              Connect directly with the host club
            </li>
            <li>Enjoy your European GAA adventure!</li>
          </ol>
        </div>

        {/* Primary CTA */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href="https://playaway.ie/events"
            style={{
              display: "inline-block",
              backgroundColor: "#ffffff",
              color: "#264673",
              padding: "16px 40px",
              fontSize: "16px",
              fontWeight: "700",
              textDecoration: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              marginBottom: "12px",
            }}
          >
            Browse Tournaments
          </a>
          <br />
          <a
            href="https://playaway.ie/club-admin"
            style={{
              display: "inline-block",
              color: "#ffffff",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "500",
              textDecoration: "underline",
            }}
          >
            Go to Your Dashboard
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
