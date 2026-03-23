import "./landing.css";
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
            <Link href="/signin" className="nav-cta">Sign In</Link>
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
              href="/signin"
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
            <Link href="/signin" className="footer-link">Sign In</Link>
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
