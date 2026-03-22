import Link from "next/link";
import {
  Users,
  GitMerge,
  Pencil,
  LayoutGrid,
  WifiOff,
  Download,
  Github,
  ArrowRight,
  Zap,
} from "lucide-react";

/* ─── Hero canvas illustration (pure CSS + SVG, no client JS) ─── */
function HeroIllustration() {
  return (
    <div className="hero-illustration" aria-hidden="true">
      {/* Dot-grid canvas surface */}
      <svg
        className="canvas-grid"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dot-grid"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" style={{ fill: 'var(--wb-outline-variant-alpha-25)' }} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Rough-style sticky notes */}
      <div className="sketch-note note-orange">Ship it!</div>
      <div className="sketch-note note-blue">CRDT sync</div>
      <div className="sketch-note note-green">Live cursors</div>

      {/* Rough-style rectangle shape */}
      <svg
        className="sketch-shape"
        width="160"
        height="90"
        viewBox="0 0 160 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 4 6 Q 6 3 12 4 L 148 2 Q 154 3 156 8 L 157 82 Q 156 88 150 87 L 10 88 Q 4 87 3 81 Z"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ stroke: 'var(--wb-primary)', fill: 'var(--wb-primary-alpha-08)' }}
        />
      </svg>

      {/* Arrow connector sketch */}
      <svg
        className="sketch-arrow"
        width="120"
        height="40"
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 2 20 Q 40 18 80 22 Q 100 23 112 20"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          style={{ stroke: 'var(--wb-secondary)' }}
        />
        <path
          d="M 104 14 L 116 20 L 104 26"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ stroke: 'var(--wb-secondary)' }}
        />
      </svg>

      {/* Freehand scribble line */}
      <svg
        className="sketch-scribble"
        width="200"
        height="60"
        viewBox="0 0 200 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 4 30 Q 20 10 40 32 Q 60 54 80 28 Q 100 4 120 30 Q 140 56 160 26 Q 180 2 196 30"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
          style={{ stroke: 'var(--wb-tertiary-container)' }}
        />
      </svg>

      {/* Cursor presence indicators */}
      <div className="cursor-presence cursor-a">
        <div className="cursor-dot" style={{ background: 'var(--wb-primary)' }} />
        <div className="cursor-label" style={{ background: 'var(--wb-primary)' }}>
          Alice
        </div>
      </div>
      <div className="cursor-presence cursor-b">
        <div
          className="cursor-dot"
          style={{ background: 'var(--wb-tertiary-container)' }}
        />
        <div
          className="cursor-label"
          style={{ background: 'var(--wb-tertiary-container)', color: 'var(--wb-on-tertiary-container)' }}
        >
          Bob
        </div>
      </div>

      {/* Ambient glow blobs */}
      <div className="glow-blob glow-primary" />
      <div className="glow-blob glow-secondary" />
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div className="feature-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="feature-icon-wrap">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  );
}

/* ─── Tech badge ─── */
function TechBadge({
  name,
  role,
  accent = false,
}: {
  name: string;
  role: string;
  accent?: boolean;
}) {
  return (
    <div className={`tech-badge${accent ? " tech-badge--accent" : ""}`}>
      <span className="tech-badge-name">{name}</span>
      <span className="tech-badge-role">{role}</span>
    </div>
  );
}

/* ─── Page (Server Component) ─── */
export default function HomePage() {
  return (
    <>
      {/* Inline styles keep this a pure server component with zero client JS */}
      <style>{`
        /* ================================================================
           Landing Page — The Infinite Curator
           All tokens reference var(--wb-*) from globals.css
           ================================================================ */

        .landing-root {
          min-height: 100vh;
          background-color: var(--wb-surface);
          color: var(--wb-on-surface);
          overflow-x: hidden;
        }

        /* ── Navbar ─────────────────────────────────────── */
        .landing-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(1.5rem, 5vw, 5rem);
          height: 60px;
          background: var(--wb-glass-bg);
          backdrop-filter: var(--wb-glass-blur);
          -webkit-backdrop-filter: var(--wb-glass-blur);
          border-bottom: 1px solid var(--wb-ghost-border);
        }
        .nav-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-manrope, 'Manrope', sans-serif);
          font-weight: 800;
          font-size: 1.0625rem;
          color: var(--wb-on-surface);
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .nav-logo-dot {
          width: 8px; height: 8px;
          border-radius: 9999px;
          background: var(--wb-gradient-primary);
          flex-shrink: 0;
        }
        .nav-links {
          display: none;
          align-items: center;
          gap: 0.25rem;
        }
        @media (min-width: 640px) {
          .nav-links { display: flex; }
        }
        .nav-link {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--wb-on-surface-variant);
          text-decoration: none;
          padding: 0.375rem 0.75rem;
          border-radius: var(--wb-radius-md);
          transition: background 0.15s, color 0.15s;
        }
        .nav-link:hover {
          background: var(--wb-surface-container-low);
          color: var(--wb-on-surface);
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }
        .nav-cta {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--wb-on-primary-solid);
          text-decoration: none;
          padding: 0.5rem 1.125rem;
          border-radius: var(--wb-radius-md);
          background: var(--wb-gradient-primary);
          box-shadow: var(--wb-primary-shadow-sm);
          transition: opacity 0.15s, transform 0.15s;
        }
        .nav-cta:hover { opacity: 0.88; transform: translateY(-1px); }

        /* ── Hero ────────────────────────────────────────── */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 3rem;
          padding: 9rem clamp(1.5rem, 5vw, 6rem) 5rem;
          overflow: hidden;
        }
        @media (max-width: 880px) {
          .hero-section {
            grid-template-columns: 1fr;
            padding-top: 7.5rem;
            text-align: center;
          }
          .hero-actions { justify-content: center; }
          .hero-social-proof { justify-content: center; }
          .hero-illustration-col { display: none; }
        }
        .hero-bg-blob {
          position: absolute;
          width: 700px; height: 700px;
          border-radius: 9999px;
          background: radial-gradient(ellipse, var(--wb-primary-alpha-10) 0%, transparent 65%);
          top: -200px; right: -200px;
          pointer-events: none;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--wb-primary);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
          padding: 0.375rem 0.875rem;
          background: var(--wb-primary-alpha-10);
          border-radius: var(--wb-radius-full);
          width: fit-content;
          animation: fadeUp 0.5s ease both;
        }
        .hero-heading {
          font-family: var(--font-manrope, 'Manrope', sans-serif);
          font-weight: 800;
          font-size: clamp(2.75rem, 6.5vw, 5rem);
          line-height: 1.03;
          letter-spacing: -0.035em;
          color: var(--wb-on-surface);
          margin: 0 0 1.5rem;
          animation: fadeUp 0.5s 0.07s ease both;
        }
        .hero-heading-gradient {
          background: var(--wb-gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-tagline {
          font-size: clamp(1rem, 2.2vw, 1.1875rem);
          line-height: 1.7;
          color: var(--wb-on-surface-variant);
          max-width: 44ch;
          margin: 0 0 2.5rem;
          animation: fadeUp 0.5s 0.14s ease both;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.875rem;
          animation: fadeUp 0.5s 0.21s ease both;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--wb-on-primary-solid);
          text-decoration: none;
          padding: 0.875rem 1.875rem;
          border-radius: var(--wb-radius-md);
          background: var(--wb-gradient-primary);
          box-shadow: var(--wb-primary-shadow-md);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--wb-primary-shadow-lg);
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--wb-on-surface-variant);
          text-decoration: none;
          padding: 0.875rem 1.625rem;
          border-radius: var(--wb-radius-md);
          background: var(--wb-surface-container-low);
          transition: background 0.15s, color 0.15s, transform 0.15s;
        }
        .btn-ghost:hover {
          background: var(--wb-surface-container);
          color: var(--wb-on-surface);
          transform: translateY(-1px);
        }
        .hero-social-proof {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 2.25rem;
          font-size: 0.8125rem;
          color: var(--wb-on-surface-variant);
          animation: fadeUp 0.5s 0.28s ease both;
        }
        .avatar-stack {
          display: flex;
        }
        .avatar-chip {
          width: 26px; height: 26px;
          border-radius: 9999px;
          border: 2px solid var(--wb-surface);
          margin-left: -7px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--wb-on-primary-solid);
        }
        .avatar-chip:first-child { margin-left: 0; }

        /* ── Hero illustration ── */
        .hero-illustration-col {
          position: relative;
          animation: fadeIn 0.8s 0.3s ease both;
        }
        .hero-illustration {
          position: relative;
          height: 500px;
          border-radius: var(--wb-radius-xl);
          overflow: hidden;
          background: var(--wb-surface-container-lowest);
          box-shadow:
            var(--wb-shadow-ambient),
            0 0 0 1px var(--wb-ghost-border);
        }
        .canvas-grid {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
        }
        .sketch-note {
          position: absolute;
          padding: 0.625rem 0.875rem;
          border-radius: 3px;
          font-size: 0.8125rem;
          font-weight: 600;
          box-shadow: 0 2px 4px var(--wb-surface-shadow-alpha-14), 2px 3px 0 var(--wb-surface-shadow-alpha-05);
        }
        .note-orange {
          top: 14%; left: 10%;
          background: var(--wb-tertiary-container);
          color: var(--wb-on-tertiary-container);
          transform: rotate(-2.5deg);
          animation: floatIn 0.7s 0.5s ease both;
        }
        .note-blue {
          top: 44%; left: 52%;
          background: var(--wb-primary-alpha-20);
          color: var(--wb-on-primary-container);
          transform: rotate(1.5deg);
          animation: floatIn 0.7s 0.7s ease both;
          backdrop-filter: blur(8px);
          border: 1px solid var(--wb-primary-alpha-30);
        }
        .note-green {
          bottom: 18%; left: 18%;
          background: var(--wb-sticky-green-bg);
          color: var(--wb-sticky-green-text);
          transform: rotate(-1deg);
          animation: floatIn 0.7s 0.9s ease both;
        }
        .sketch-shape {
          position: absolute;
          top: 30%; left: 7%;
          animation: floatIn 0.7s 0.6s ease both;
        }
        .sketch-arrow {
          position: absolute;
          top: 56%; left: 28%;
          animation: floatIn 0.7s 0.8s ease both;
        }
        .sketch-scribble {
          position: absolute;
          bottom: 14%; right: 6%;
          animation: floatIn 0.7s 1s ease both;
        }
        .cursor-presence {
          position: absolute;
          display: flex;
          align-items: flex-end;
          gap: 4px;
        }
        .cursor-a {
          top: 26%; right: 16%;
          animation: floatIn 0.7s 1.1s ease both;
        }
        .cursor-b {
          bottom: 30%; right: 28%;
          animation: floatIn 0.7s 1.3s ease both;
        }
        .cursor-dot {
          width: 9px; height: 9px;
          border-radius: 9999px;
          flex-shrink: 0;
        }
        .cursor-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--wb-on-primary-solid);
          padding: 2px 7px;
          border-radius: 9999px;
          white-space: nowrap;
        }
        .glow-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
          pointer-events: none;
        }
        .glow-primary {
          width: 280px; height: 280px;
          top: -60px; right: -60px;
          background: var(--wb-primary-alpha-18-container);
        }
        .glow-secondary {
          width: 180px; height: 180px;
          bottom: -50px; left: -50px;
          background: var(--wb-tertiary-alpha-14);
        }

        /* ── Features section ──────────────────────────── */
        .features-section {
          padding: 6rem clamp(1.5rem, 5vw, 6rem);
          background: var(--wb-surface-container-lowest);
        }
        .section-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--wb-primary);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .section-heading {
          font-family: var(--font-manrope, 'Manrope', sans-serif);
          font-weight: 800;
          font-size: clamp(1.75rem, 4vw, 2.875rem);
          letter-spacing: -0.027em;
          color: var(--wb-on-surface);
          margin: 0 0 0.875rem;
        }
        .section-subheading {
          font-size: 1.0625rem;
          line-height: 1.65;
          color: var(--wb-on-surface-variant);
          max-width: 52ch;
          margin: 0 0 3.25rem;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.125rem;
        }
        @media (max-width: 900px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .features-grid { grid-template-columns: 1fr; }
        }
        .feature-card {
          padding: 1.75rem;
          border-radius: var(--wb-radius-lg);
          background: var(--wb-glass-bg);
          backdrop-filter: var(--wb-glass-blur);
          -webkit-backdrop-filter: var(--wb-glass-blur);
          box-shadow: var(--wb-shadow-ambient);
          border: 1px solid var(--wb-ghost-border);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: fadeUp 0.5s ease both;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 20px 48px -8px var(--wb-surface-shadow-alpha-13),
            0 0 0 1px var(--wb-primary-alpha-18-container);
        }
        .feature-icon-wrap {
          width: 42px; height: 42px;
          border-radius: var(--wb-radius-md);
          background: var(--wb-primary-alpha-12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--wb-primary);
          margin-bottom: 1.125rem;
        }
        .feature-title {
          font-family: var(--font-manrope, 'Manrope', sans-serif);
          font-weight: 700;
          font-size: 1rem;
          color: var(--wb-on-surface);
          margin: 0 0 0.5rem;
        }
        .feature-desc {
          font-size: 0.9375rem;
          line-height: 1.62;
          color: var(--wb-on-surface-variant);
          margin: 0;
        }

        /* ── Tech section ──────────────────────────────── */
        .tech-section {
          padding: 6rem clamp(1.5rem, 5vw, 6rem);
          background: var(--wb-surface);
        }
        .tech-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: start;
        }
        @media (max-width: 860px) {
          .tech-content { grid-template-columns: 1fr; gap: 3rem; }
        }
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-top: 2rem;
        }
        .tech-badge {
          padding: 1rem 1.125rem;
          border-radius: var(--wb-radius-lg);
          background: var(--wb-surface-container-lowest);
          box-shadow: var(--wb-shadow-ambient);
          border: 1px solid var(--wb-ghost-border);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          transition: transform 0.2s ease;
        }
        .tech-badge:hover { transform: translateY(-2px); }
        .tech-badge--accent {
          background: var(--wb-primary-alpha-07);
          border-color: var(--wb-primary-alpha-20);
        }
        .tech-badge-name {
          font-family: var(--font-manrope, 'Manrope', sans-serif);
          font-weight: 700;
          font-size: 0.9375rem;
          color: var(--wb-on-surface);
        }
        .tech-badge-role {
          font-size: 0.8125rem;
          color: var(--wb-on-surface-variant);
          line-height: 1.4;
        }

        /* Arch diagram */
        .arch-diagram {
          padding: 1.75rem;
          border-radius: var(--wb-radius-lg);
          background: var(--wb-surface-container-lowest);
          box-shadow: var(--wb-shadow-ambient);
          border: 1px solid var(--wb-ghost-border);
        }
        .arch-diagram-title {
          font-family: var(--font-manrope, 'Manrope', sans-serif);
          font-weight: 700;
          font-size: 0.9375rem;
          color: var(--wb-on-surface);
          margin: 0 0 1.25rem;
        }
        .arch-flow {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }
        .arch-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          flex-wrap: wrap;
        }
        .arch-node {
          padding: 0.3125rem 0.75rem;
          border-radius: var(--wb-radius-md);
          font-weight: 600;
          white-space: nowrap;
          font-size: 0.8125rem;
        }
        .arch-node--primary {
          background: var(--wb-primary-alpha-14);
          color: var(--wb-on-primary-container);
        }
        .arch-node--surface {
          background: var(--wb-surface-container-low);
          color: var(--wb-on-surface-variant);
        }
        .arch-node--accent {
          background: var(--wb-tertiary-alpha-14);
          color: var(--wb-tertiary);
        }
        .arch-arrow {
          color: var(--wb-outline-variant);
          font-size: 0.875rem;
          flex-shrink: 0;
        }
        .arch-label {
          color: var(--wb-on-surface-variant);
          font-size: 0.75rem;
          line-height: 1.4;
        }
        .arch-divider {
          height: 1px;
          background: var(--wb-ghost-border);
          margin: 0.375rem 0;
        }
        .arch-footer-note {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--wb-primary);
        }

        /* ── CTA section ───────────────────────────────── */
        .cta-section {
          padding: 7rem clamp(1.5rem, 5vw, 6rem);
          background: var(--wb-surface-container-lowest);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-bg-glow {
          position: absolute;
          width: 640px; height: 640px;
          border-radius: 9999px;
          background: radial-gradient(ellipse, var(--wb-primary-alpha-12) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .cta-heading {
          font-family: var(--font-manrope, 'Manrope', sans-serif);
          font-weight: 800;
          font-size: clamp(2.125rem, 5vw, 3.375rem);
          letter-spacing: -0.028em;
          color: var(--wb-on-surface);
          margin: 0 0 1rem;
          position: relative;
        }
        .cta-sub {
          font-size: 1.0625rem;
          color: var(--wb-on-surface-variant);
          margin: 0 0 2.5rem;
          position: relative;
        }
        .cta-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          position: relative;
        }
        .btn-github {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--wb-on-surface-variant);
          text-decoration: none;
          padding: 0.875rem 1.5rem;
          border-radius: var(--wb-radius-md);
          background: var(--wb-surface-container-low);
          transition: background 0.15s, color 0.15s;
        }
        .btn-github:hover {
          background: var(--wb-surface-container);
          color: var(--wb-on-surface);
        }

        /* ── Site footer ───────────────────────────────── */
        .site-footer {
          padding: 1.75rem clamp(1.5rem, 5vw, 6rem);
          background: var(--wb-surface);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          border-top: 1px solid var(--wb-ghost-border);
        }
        .footer-brand {
          font-family: var(--font-manrope, 'Manrope', sans-serif);
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--wb-on-surface-variant);
        }
        .footer-links {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .footer-link {
          font-size: 0.875rem;
          color: var(--wb-on-surface-variant);
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-link:hover { color: var(--wb-on-surface); }

        /* ── Keyframes ─────────────────────────────────── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="landing-root">

        {/* ── Navbar ── */}
        <nav className="landing-nav">
          <Link href="/" className="nav-logo">
            <span className="nav-logo-dot" />
            The Infinite Curator
          </Link>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#tech" className="nav-link">Architecture</a>
          </div>
          <div className="nav-actions">
            <Link href="/auth/signin" className="nav-cta">Sign In</Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero-section" aria-labelledby="hero-heading">
          <div className="hero-bg-blob" aria-hidden="true" />

          {/* Left: copy */}
          <div>
            <div className="hero-eyebrow">
              <Zap size={11} aria-hidden="true" />
              CRDT-powered collaboration
            </div>

            <h1 id="hero-heading" className="hero-heading">
              The{" "}
              <span className="hero-heading-gradient">Infinite</span>
              <br />
              Curator
            </h1>

            <p className="hero-tagline">
              Where ideas converge in real-time. A collaborative whiteboard
              built with CRDT technology for seamless multi-user creativity —
              no conflicts, no limits.
            </p>

            <div className="hero-actions">
              <Link href="/dashboard" className="btn-primary">
                Start Creating
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a href="#tech" className="btn-ghost">
                View Architecture
              </a>
            </div>

            <div className="hero-social-proof">
              <div className="avatar-stack" aria-hidden="true">
                {[
                  { bg: 'var(--wb-primary)', label: "A" },
                  { bg: 'var(--wb-tertiary-container)', label: "B" },
                  { bg: 'var(--wb-avatar-emerald)', label: "C" },
                  { bg: 'var(--wb-avatar-violet)', label: "D" },
                ].map((a) => (
                  <div
                    key={a.label}
                    className="avatar-chip"
                    style={{ background: a.bg }}
                  >
                    {a.label}
                  </div>
                ))}
              </div>
              <span>Join creators collaborating in real-time</span>
            </div>
          </div>

          {/* Right: canvas illustration */}
          <div className="hero-illustration-col" aria-hidden="true">
            <HeroIllustration />
          </div>
        </section>

        {/* ── Features ── */}
        <section
          id="features"
          className="features-section"
          aria-labelledby="features-heading"
        >
          <p className="section-label">Capabilities</p>
          <h2 id="features-heading" className="section-heading">
            Everything you need to create together
          </h2>
          <p className="section-subheading">
            Engineered for speed, built for scale. Every feature is
            thoughtfully designed to keep your team in flow.
          </p>

          <div className="features-grid">
            <FeatureCard
              icon={<Users size={20} aria-hidden="true" />}
              title="Real-time Collaboration"
              description="See everyone's cursors, selections, and edits as they happen. Zero latency between intention and action."
              delay={0}
            />
            <FeatureCard
              icon={<GitMerge size={20} aria-hidden="true" />}
              title="Conflict-Free Editing"
              description="CRDT-powered state ensures no conflicts, even offline. Yjs manages every operation with mathematical precision."
              delay={60}
            />
            <FeatureCard
              icon={<Pencil size={20} aria-hidden="true" />}
              title="Hand-Drawn Aesthetic"
              description="Beautiful sketchy rendering via rough.js for a natural, tactile feel — every line feels intentional."
              delay={120}
            />
            <FeatureCard
              icon={<LayoutGrid size={20} aria-hidden="true" />}
              title="Room System"
              description="Create boards, invite collaborators, manage permissions. Owner, editor, and viewer roles built in."
              delay={180}
            />
            <FeatureCard
              icon={<WifiOff size={20} aria-hidden="true" />}
              title="Offline Support"
              description="Keep working offline — changes are persisted locally via IndexedDB and merge seamlessly on reconnect."
              delay={240}
            />
            <FeatureCard
              icon={<Download size={20} aria-hidden="true" />}
              title="Export & Share"
              description="Export boards as PNG or SVG, share via invite links with unique room codes your team can join instantly."
              delay={300}
            />
          </div>
        </section>

        {/* ── Tech showcase ── */}
        <section
          id="tech"
          className="tech-section"
          aria-labelledby="tech-heading"
        >
          <div className="tech-content">
            {/* Left: heading + badges */}
            <div>
              <p className="section-label">Tech Stack</p>
              <h2 id="tech-heading" className="section-heading">
                Built on the right primitives
              </h2>
              <p className="section-subheading">
                Every technology choice is deliberate. This is a
                portfolio-grade implementation of production-ready patterns —
                designed for interviews and real-world scale alike.
              </p>

              <div className="tech-grid">
                <TechBadge
                  name="Next.js 14"
                  role="App Router, RSC, streaming"
                  accent
                />
                <TechBadge
                  name="Yjs"
                  role="CRDT engine, conflict resolution"
                  accent
                />
                <TechBadge
                  name="Socket.io"
                  role="Ephemeral presence and cursors"
                />
                <TechBadge
                  name="MongoDB Atlas"
                  role="Board persistence, auth"
                />
                <TechBadge
                  name="TypeScript"
                  role="Strict mode, end-to-end types"
                />
                <TechBadge
                  name="rough.js"
                  role="Hand-drawn canvas rendering"
                />
              </div>
            </div>

            {/* Right: arch diagram */}
            <div>
              <div className="arch-diagram">
                <p className="arch-diagram-title">System Architecture</p>
                <div className="arch-flow">
                  <div className="arch-row">
                    <div className="arch-node arch-node--primary">Browser</div>
                    <span className="arch-arrow">→</span>
                    <div className="arch-node arch-node--surface">Next.js (Vercel)</div>
                  </div>

                  <div className="arch-row" style={{ paddingLeft: "1rem" }}>
                    <span className="arch-label">Yjs CRDT updates</span>
                    <span className="arch-arrow">↓</span>
                    <div className="arch-node arch-node--accent">WS Server (Railway)</div>
                    <span className="arch-arrow">↔</span>
                    <div className="arch-node arch-node--primary">y-websocket</div>
                  </div>

                  <div className="arch-divider" />

                  <div className="arch-row">
                    <div className="arch-node arch-node--surface">Socket.io</div>
                    <span className="arch-arrow">→</span>
                    <span className="arch-label">cursor:move, presence events</span>
                  </div>

                  <div className="arch-row">
                    <div className="arch-node arch-node--surface">NextAuth.js</div>
                    <span className="arch-arrow">→</span>
                    <span className="arch-label">Google + GitHub OAuth, JWT shared with WS</span>
                  </div>

                  <div className="arch-row">
                    <div className="arch-node arch-node--surface">MongoDB Atlas</div>
                    <span className="arch-arrow">→</span>
                    <span className="arch-label">Boards, members, metadata</span>
                  </div>

                  <div className="arch-divider" />

                  <div className="arch-row">
                    <span className="arch-footer-note">
                      Turborepo monorepo — web + ws-server + shared packages
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section" aria-labelledby="cta-heading">
          <div className="cta-bg-glow" aria-hidden="true" />
          <h2 id="cta-heading" className="cta-heading">
            Ready to collaborate?
          </h2>
          <p className="cta-sub">
            Sign in with Google or GitHub and create your first board in
            seconds.
          </p>
          <div className="cta-actions">
            <Link
              href="/auth/signin"
              className="btn-primary"
              style={{ fontSize: "1rem", padding: "0.9375rem 2.25rem" }}
            >
              Get Started — it&apos;s free
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-github"
            >
              <Github size={16} aria-hidden="true" />
              View on GitHub
            </a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="site-footer">
          <span className="footer-brand">
            The Infinite Curator &copy; 2026
          </span>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="#features" className="footer-link">Features</a>
            <a href="#tech" className="footer-link">Architecture</a>
            <Link href="/auth/signin" className="footer-link">Sign In</Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
          </nav>
        </footer>

      </div>
    </>
  );
}
