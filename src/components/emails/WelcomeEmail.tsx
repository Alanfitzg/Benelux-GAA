import React from "react";

interface WelcomeEmailProps {
  userName: string;
  clubName?: string;
  clubCrestUrl?: string;
}

export function WelcomeEmail({
  userName,
  clubName,
  clubCrestUrl,
}: WelcomeEmailProps) {
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://playaway.ie/logo.png"
          alt="PlayAway"
          style={{
            width: "180px",
            height: "auto",
            marginBottom: "12px",
          }}
        />
        <p
          style={{
            margin: "0",
            fontSize: "14px",
            color: "rgba(255,255,255,0.8)",
            letterSpacing: "1px",
          }}
        >
          Your passport to Gaelic Games worldwide
        </p>
      </div>

      {/* Main Content */}
      <div style={{ backgroundColor: "#264673", padding: "40px 30px" }}>
        {/* User & Club Identification */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          {clubCrestUrl && (
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "12px",
                borderRadius: "12px",
                display: "inline-block",
                marginBottom: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={clubCrestUrl}
                alt={clubName ? `${clubName} crest` : "Club crest"}
                style={{
                  width: "72px",
                  height: "72px",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          )}
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "600",
              margin: "0 0 8px 0",
              color: "#ffffff",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Welcome, {userName}
          </h2>
          {clubName && (
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
          )}
        </div>

        {/* Welcome Message */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
            padding: "0 10px",
          }}
        >
          <p
            style={{
              fontSize: "22px",
              lineHeight: "1.6",
              margin: "0 0 16px 0",
              color: "#ffffff",
              fontWeight: "600",
              fontStyle: "italic",
              textShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            Céad Míle Fáilte
          </p>
          <p
            style={{
              fontSize: "15px",
              lineHeight: "1.8",
              margin: "0",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            You&apos;re now part of the global Gaelic Games travel community.
            Discover tournaments, connect with clubs worldwide, and plan your
            next adventure.
          </p>
        </div>

        {/* Primary CTA Button */}
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
            }}
          >
            Browse European Tournaments
          </a>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            margin: "0 0 24px 0",
            paddingTop: "24px",
          }}
        />

        {/* Complete Your Profile CTA */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "15px",
              color: "rgba(255,255,255,0.9)",
              fontWeight: "500",
            }}
          >
            Complete your profile
          </p>
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "13px",
              color: "rgba(255,255,255,0.7)",
              lineHeight: "1.6",
            }}
          >
            Add your trip preferences so we can recommend the perfect
            tournaments and destinations for you.
          </p>
          <a
            href="https://playaway.ie/profile"
            style={{
              display: "inline-block",
              backgroundColor: "transparent",
              color: "#ffffff",
              padding: "14px 32px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              borderRadius: "6px",
              border: "2px solid rgba(255,255,255,0.5)",
            }}
          >
            Add Trip Preferences
          </a>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            margin: "0 0 24px 0",
            paddingTop: "24px",
          }}
        />

        {/* Secondary CTA - Club Admin */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "15px",
              color: "rgba(255,255,255,0.9)",
              fontWeight: "500",
            }}
          >
            Are you a coach, committee member, or trip organiser?
          </p>
          <p
            style={{
              margin: "0 0 16px 0",
              fontSize: "13px",
              color: "rgba(255,255,255,0.7)",
              lineHeight: "1.6",
            }}
          >
            Discover how PlayAway can help you plan tournaments, find host
            clubs, and organise unforgettable GAA trips abroad.
          </p>
          <a
            href="https://playaway.ie/how-it-works"
            style={{
              display: "inline-block",
              backgroundColor: "transparent",
              color: "#ffffff",
              padding: "14px 32px",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
              borderRadius: "6px",
              border: "2px solid rgba(255,255,255,0.5)",
            }}
          >
            See How It Works
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
        {/* Social Icons */}
        <div style={{ marginBottom: "20px" }}>
          <a
            href="https://instagram.com/playaway.ie"
            style={{
              display: "inline-block",
              width: "36px",
              height: "36px",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              textAlign: "center",
              lineHeight: "36px",
              textDecoration: "none",
              margin: "0 8px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cdn-icons-png.flaticon.com/512/174/174855.png"
              alt="Instagram"
              width="18"
              height="18"
              style={{ verticalAlign: "middle" }}
            />
          </a>
          <a
            href="https://facebook.com/playaway.ie"
            style={{
              display: "inline-block",
              width: "36px",
              height: "36px",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              textAlign: "center",
              lineHeight: "36px",
              textDecoration: "none",
              margin: "0 8px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cdn-icons-png.flaticon.com/512/174/174848.png"
              alt="Facebook"
              width="18"
              height="18"
              style={{ verticalAlign: "middle" }}
            />
          </a>
          <a
            href="https://twitter.com/playaway_ie"
            style={{
              display: "inline-block",
              width: "36px",
              height: "36px",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              textAlign: "center",
              lineHeight: "36px",
              textDecoration: "none",
              margin: "0 8px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
              alt="Twitter"
              width="18"
              height="18"
              style={{ verticalAlign: "middle" }}
            />
          </a>
        </div>

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
