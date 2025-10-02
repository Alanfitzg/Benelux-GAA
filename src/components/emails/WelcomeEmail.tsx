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
        backgroundColor: "#ffffff",
        color: "#333333",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#4472C4",
          color: "white",
          padding: "30px 20px",
          textAlign: "center",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            margin: "0 0 10px 0",
            fontStyle: "italic",
          }}
        >
          PlayAway
        </h1>
        <p
          style={{
            fontSize: "16px",
            margin: "0",
            fontWeight: "300",
          }}
        >
          A travel platform that connects Global Gaelic Games communities
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: "30px 20px" }}>
        {/* Greeting */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "normal",
              margin: "0 0 10px 0",
            }}
          >
            Dear {userName}
          </h2>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              margin: "0 0 20px 0",
              color: "#4472C4",
            }}
          >
            Cead mile Failte
          </h3>

          {/* Club Crest */}
          {clubCrestUrl && (
            <div style={{ margin: "20px 0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={clubCrestUrl}
                alt={`${clubName} crest`}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "contain",
                  border: "2px solid #4472C4",
                  borderRadius: "8px",
                  padding: "8px",
                  backgroundColor: "#f8f9fa",
                }}
              />
            </div>
          )}
        </div>

        {/* Welcome Section */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              margin: "0 0 15px 0",
            }}
          >
            Welcome to <em style={{ color: "#4472C4" }}>PlayAway</em>
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0 0 10px 0",
            }}
          >
            The travel platform built by and for the global Gaelic Games
            community.
          </p>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0",
            }}
          >
            Whether you&apos;re a player, coach, volunteer, or just love being
            part of GAA life abroad, PlayAway makes it easier to travel,
            connect, and compete — while supporting the clubs that keep our
            community alive.
          </p>
        </div>

        {/* What is PlayAway Section */}
        <div
          style={{
            backgroundColor: "#e8f1ff",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            border: "2px solid #4472C4",
          }}
        >
          <h3
            style={{
              backgroundColor: "#4472C4",
              color: "white",
              padding: "10px 20px",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 15px 0",
              display: "inline-block",
            }}
          >
            What is PlayAway?
          </h3>
          <p
            style={{
              fontSize: "15px",
              lineHeight: "1.6",
              margin: "0",
            }}
          >
            PlayAway is the first platform designed to simplify GAA travel
            across Europe and beyond. From tournaments to training camps, we
            help clubs list their events, take bookings in advance, and welcome
            teams from around the world — reducing risk, and costs
          </p>
        </div>

        {/* Why does it matter Section */}
        <div
          style={{
            backgroundColor: "#e8f1ff",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px",
            border: "2px solid #4472C4",
          }}
        >
          <h3
            style={{
              backgroundColor: "#4472C4",
              color: "white",
              padding: "10px 20px",
              borderRadius: "20px",
              fontSize: "18px",
              fontWeight: "bold",
              margin: "0 0 15px 0",
              display: "inline-block",
            }}
          >
            Why does it matter?
          </h3>
          <p
            style={{
              fontSize: "15px",
              lineHeight: "1.6",
              margin: "0 0 15px 0",
            }}
          >
            Tourism around Gaelic Games is already happening - but without
            structure, opportunities are lost.
          </p>
          <p
            style={{
              fontSize: "15px",
              fontWeight: "bold",
              margin: "0 0 10px 0",
            }}
          >
            PlayAway changes that by:
          </p>
          <ul
            style={{
              fontSize: "15px",
              lineHeight: "1.6",
              margin: "0",
              paddingLeft: "20px",
            }}
          >
            <li>Investigating events and promoting opportunities to travel</li>
            <li>
              Creating new revenue streams for local clubs and communities
            </li>
            <li>Strengthening club links worldwide</li>
            <li>
              <strong>
                Protecting both the clubs and the hosts by offering rules and
                guidelines for both traveling teams and hosts, while ensuring
                the best bang for buck for the customers!
              </strong>
            </li>
          </ul>
        </div>

        {/* Quick Start Guide */}
        <div style={{ marginBottom: "30px" }}>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#d32f2f",
              margin: "0 0 15px 0",
            }}
          >
            Quick Start Guide:
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                borderLeft: "4px solid #4472C4",
              }}
            >
              <strong>Step 1:</strong> Complete your player profile with
              position, skill level, and travel preferences
            </div>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                borderLeft: "4px solid #4472C4",
              }}
            >
              <strong>Step 2:</strong> Browse tournaments by date, location, or
              competition level
            </div>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                borderLeft: "4px solid #4472C4",
              }}
            >
              <strong>Step 3:</strong> Connect with clubs for training sessions
              or friendly matches
            </div>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                borderLeft: "4px solid #4472C4",
              }}
            >
              <strong>Step 4:</strong> Use our trip planner to create your
              perfect GAA adventure
            </div>
          </div>

          {/* Popular Destinations Sidebar */}
          <div
            style={{
              backgroundColor: "#f0f4f8",
              border: "2px solid #4472C4",
              borderRadius: "8px",
              padding: "15px",
              marginTop: "20px",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#4472C4",
                margin: "0 0 10px 0",
              }}
            >
              Popular Destinations This Season:
            </h4>
            <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Ireland:</strong> Experience GAA at its source with 500+
                clubs
              </p>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>USA & Canada:</strong> Join the thriving North American
                GAA scene
              </p>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Australia:</strong> Combine GAA with incredible travel
                experiences
              </p>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Europe:</strong> Play in tournaments from Barcelona to
                Berlin
              </p>
              <p style={{ margin: "0" }}>
                <strong>Middle East & Asia:</strong> Discover emerging GAA
                communities
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
          }}
        >
          <p
            style={{
              fontSize: "16px",
              margin: "0",
              lineHeight: "1.6",
            }}
          >
            <strong>Need Help?</strong> Our team is here to assist with
            tournament registrations, travel planning, or connecting with clubs.
            Just reply to this email!
          </p>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p
            style={{
              fontSize: "16px",
              margin: "0 0 5px 0",
            }}
          >
            Looking forward to seeing you on pitches around the world!
          </p>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              margin: "0 0 5px 0",
              color: "#4472C4",
            }}
          >
            Slán go fóill,
          </p>
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              margin: "0",
              color: "#4472C4",
            }}
          >
            The PlayAway Team
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          textAlign: "center",
          borderTop: "1px solid #e9ecef",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "#6c757d",
            margin: "0",
          }}
        >
          © 2025 PlayAway - Connecting GAA Communities Worldwide
        </p>
      </div>
    </div>
  );
}
