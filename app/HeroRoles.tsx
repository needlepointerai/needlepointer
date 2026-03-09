"use client";

import { useEffect, useState } from "react";

const ROLES = [
  "Carpool captain.",
  "Deadline chaser.",
  "Canvas hoarder.",
  "Laundry folder.",
  "Influencer.",
  "Lunchbox packer.",
  "Email sender.",
  "Silent frogger.",
  "Overdraft-er.",
];

const NEEDLE_ROLE = "Needlepointer.";

export default function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<"typing" | "hold" | "erasing">("typing");
  const [charIndex, setCharIndex] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 100);
  }, []);

  useEffect(() => {
    if (showFinal) return;
    const current = ROLES[roleIndex];

    if (phase === "typing") {
      if (charIndex < current.length) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 60);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("hold"), 900);
        return () => clearTimeout(t);
      }
    }
    if (phase === "hold") {
      const t = setTimeout(() => setPhase("erasing"), 400);
      return () => clearTimeout(t);
    }
    if (phase === "erasing") {
      if (charIndex > 0) {
        const t = setTimeout(() => {
          setDisplayed(current.slice(0, charIndex - 1));
          setCharIndex((c) => c - 1);
        }, 35);
        return () => clearTimeout(t);
      } else {
        const nextIndex = roleIndex + 1;
        if (nextIndex >= ROLES.length) {
          setShowFinal(true);
        } else {
          setRoleIndex(nextIndex);
          setPhase("typing");
        }
      }
    }
  }, [phase, charIndex, roleIndex, showFinal]);

  return (
    <>
    <section
      style={{
        minHeight: "100svh",
        background: "#EEF2F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Nautical depth gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(ellipse at 15% 60%, rgba(74,124,142,0.10) 0%, transparent 55%),
                            radial-gradient(ellipse at 85% 25%, rgba(74,124,142,0.07) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "none" : "translateY(-8px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <span
          style={{
            fontSize: 13,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#4A7C8E",
          }}
        >
          Needlepointer
        </span>
      </div>

      {/* Main content */}
      <div
        style={{
          maxWidth: 360,
          width: "100%",
          textAlign: "center",
          opacity: fadeIn ? 1 : 0,
          transform: fadeIn ? "none" : "translateY(16px)",
          transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
        }}
      >
        {/* Typewriter */}
        <div
          style={{
            minHeight: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          {!showFinal ? (
            <span
              style={{
                fontSize: 28,
                fontWeight: 400,
                fontStyle: "italic",
                fontFamily: "Georgia, Times New Roman, serif",
                color: "#7BAFC0",
                letterSpacing: "-0.01em",
              }}
            >
              {displayed}
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "1em",
                  background: "#7BAFC0",
                  marginLeft: 2,
                  verticalAlign: "middle",
                  animation: "blink 1s step-end infinite",
                }}
              />
            </span>
          ) : (
            <span
              style={{
                fontSize: 28,
                fontWeight: 400,
                fontStyle: "italic",
                fontFamily: "Georgia, Times New Roman, serif",
                color: "#1E3A47",
                letterSpacing: "-0.02em",
                animation: "fadeUp 0.5s ease forwards",
              }}
            >
              {NEEDLE_ROLE}
            </span>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 32,
            height: 1,
            background: "#4A7C8E",
            margin: "0 auto 28px",
            opacity: showFinal ? 1 : 0.35,
            transition: "opacity 0.6s ease",
          }}
        />

        {/* Bridge line */}
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "#4A7C8E",
            fontStyle: "italic",
            fontFamily: "Georgia, Times New Roman, serif",
            marginBottom: 20,
          }}
        >
          Out there we wear a lot of hats—but in here, we&#39;re just needlepointers.
        </p>

        {/* Body copy */}
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: "#2C4A57",
            fontWeight: 400,
            marginBottom: 12,
          }}
        >
          The corner of the internet where your <strong>canvas stash</strong> gets a proper catalog, your <strong>WIPs</strong> get the spotlight they deserve, and your <strong>thread collection</strong> finally has a home.
        </p>

        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: "#4A7C8E",
            marginBottom: 40,
            fontFamily: "Georgia, Times New Roman, serif",
            fontStyle: "italic",
          }}
        >
          Share progress, meet your people. This craft isn&#39;t a hobby—it&#39;s a lifestyle.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
          <a
            href="/signup"
            style={{
              display: "block",
              width: "100%",
              padding: "14px 0",
              background: "#4A7C8E",
              color: "#FFFFFF",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: 8,
              fontWeight: 700,
              transition: "background 0.2s ease",
              textAlign: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3A6475")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#4A7C8E")}
          >
            Start Your Stash
          </a>
          <a
            href="/login"
            style={{
              fontSize: 13,
              color: "#4A7C8E",
              textDecoration: "none",
              letterSpacing: "0.04em",
              borderBottom: "1px solid #7BAFC0",
              paddingBottom: 1,
            }}
          >
            Sign in
          </a>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>

    {/* Features section */}
    <section
      style={{
        background: "#EEF2F5",
        padding: "48px 24px 64px",
      }}
    >
      {/* Divider */}
      <div style={{ width: "100%", height: 1, background: "#C8D8E0", marginBottom: 48 }} />

      <div
        style={{
          maxWidth: 360,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "36px 24px",
        }}
      >
        {[
          { title: "CANVAS STASH", sub: "finally organized", color: "#4A7C8E" },
          { title: "WIPS", sub: "no judgment", color: "#4A7C8E" },
          { title: "THREADS", sub: "all of them", color: "#4A7C8E" },
          { title: "COMMUNITY", sub: "your people", color: "#C4956A" },
        ].map(({ title, sub, color }) => (
          <div key={title}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#1E3A47",
                marginBottom: 4,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 13,
                color,
                fontFamily: "Georgia, Times New Roman, serif",
                fontStyle: "italic",
              }}
            >
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom tagline */}
      <div
        style={{
          textAlign: "center",
          marginTop: 56,
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#7BAFC0",
        }}
      >
        Your craft. Cataloged.
      </div>
    </section>
    </>
  );
}
