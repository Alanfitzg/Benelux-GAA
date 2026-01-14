import React from "react";

interface WelcomeEuropeanAdminEmailProps {
  userName: string;
  clubName: string;
}

export function WelcomeEuropeanAdminEmail({
  userName,
  clubName,
}: WelcomeEuropeanAdminEmailProps) {
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
            You can now create events, host visiting teams, and earn revenue for
            your club through the PlayAway platform.
          </p>
        </div>

        {/* Dashboard Features - MOVED TO TOP with hype intro */}
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
            For the first time, all travel data will be centralised for your
            benefit. See how many clubs are interested in visiting your club,
            build a network of friends across Europe, find a twin club, and set
            earning targets for your club.
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
                    Events
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Create tournaments, manage registrations, and track
                    attendance
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
                    Expressions of Interest
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Track teams interested in visiting your club and manage
                    applications
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
                    Earnings
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Monitor your club&apos;s revenue from hosting and set
                    targets
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
                    Testimonials
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Collect and display feedback from visiting teams
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
                    Post-Trip Surveys
                  </strong>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    Receive feedback to improve your hosting experience
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Important Notice Box - White with amber left border */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "24px",
            borderLeft: "4px solid #f59e0b",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "700",
              margin: "0 0 12px 0",
              color: "#dc2626",
            }}
          >
            Important Information
          </h3>
          <ul
            style={{
              margin: "0",
              padding: "0 0 0 20px",
              fontSize: "14px",
              lineHeight: "1.8",
              color: "#4b5563",
            }}
          >
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#1a3352" }}>
                Content Responsibility:
              </strong>{" "}
              You are responsible for all content posted on behalf of your club
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong style={{ color: "#1a3352" }}>
                Verification Required:
              </strong>{" "}
              All events will be reviewed by PlayAway staff before going live
            </li>
            <li>
              <strong style={{ color: "#1a3352" }}>Terms Agreement:</strong> You
              will need to agree to our Terms & Conditions when you first log in
              as an admin
            </li>
          </ul>
        </div>

        {/* Documents Section */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              margin: "0 0 16px 0",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Essential Reading
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)",
              textAlign: "center",
              margin: "0 0 16px 0",
            }}
          >
            Please review these documents to understand how hosting works:
          </p>

          {/* Document Links - Stacked layout for better mobile */}
          <a
            href="https://playaway.ie/products"
            style={{
              display: "block",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "8px",
              textDecoration: "none",
            }}
          >
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "top" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ fontSize: "24px", marginRight: "8px" }}>
                        📄
                      </span>
                      <span
                        style={{
                          color: "#1a3352",
                          fontWeight: "600",
                          fontSize: "15px",
                        }}
                      >
                        Products Guide
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "13px",
                        color: "#6b7280",
                        lineHeight: "1.5",
                      }}
                    >
                      Learn about Team Tickets and Player Day-Passes
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor: "#1a3352",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "8px 16px",
                        borderRadius: "4px",
                      }}
                    >
                      View PDF →
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </a>

          <a
            href="https://playaway.ie/host-terms"
            style={{
              display: "block",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "8px",
              textDecoration: "none",
            }}
          >
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "top" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ fontSize: "24px", marginRight: "8px" }}>
                        📋
                      </span>
                      <span
                        style={{
                          color: "#1a3352",
                          fontWeight: "600",
                          fontSize: "15px",
                        }}
                      >
                        Host Terms & Conditions
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "13px",
                        color: "#6b7280",
                        lineHeight: "1.5",
                      }}
                    >
                      Platform fees, payouts, and your responsibilities
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor: "#1a3352",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "8px 16px",
                        borderRadius: "4px",
                      }}
                    >
                      View PDF →
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </a>

          <a
            href="https://playaway.ie/platform-rules"
            style={{
              display: "block",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "16px",
              textDecoration: "none",
            }}
          >
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "top" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ fontSize: "24px", marginRight: "8px" }}>
                        ⚖️
                      </span>
                      <span
                        style={{
                          color: "#1a3352",
                          fontWeight: "600",
                          fontSize: "15px",
                        }}
                      >
                        Platform Rules & Laws
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 12px 0",
                        fontSize: "13px",
                        color: "#6b7280",
                        lineHeight: "1.5",
                      }}
                    >
                      Legal requirements and EU compliance
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        backgroundColor: "#1a3352",
                        color: "#ffffff",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "8px 16px",
                        borderRadius: "4px",
                      }}
                    >
                      View PDF →
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </a>
        </div>

        {/* Primary CTA */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <a
            href="https://playaway.ie/club-admin"
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
