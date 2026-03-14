import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PromoVideoProps {
  onClose: () => void;
}

const SCENE_DURATIONS = [4500, 3500, 4000, 5000, 3500, 3500, 4000];
const TOTAL_DURATION = SCENE_DURATIONS.reduce((a, b) => a + b, 0);

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  baseVx: number;
  baseVy: number;
}

const PARTICLE_COLORS = [
  "rgba(160,100,255,",
  "rgba(100,150,255,",
  "rgba(180,120,255,",
  "rgba(80,180,255,",
  "rgba(200,100,255,",
];

function initParticles(count: number, w: number, h: number): Particle[] {
  return Array.from({ length: count }, () => {
    const baseVx = (Math.random() - 0.5) * 0.6;
    const baseVy = (Math.random() - 0.5) * 0.6;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.2,
      color:
        PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    };
  });
}

export default function PromoVideo({ onClose }: PromoVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const sceneRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const burstRef = useRef(false);

  const [scene, setScene] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(false);

  const [visibleCards, setVisibleCards] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [line1Visible, setLine1Visible] = useState(false);
  const [line2Visible, setLine2Visible] = useState(false);

  useEffect(() => {
    setVisibleCards([false, false, false, false]);
    setLine1Visible(false);
    setLine2Visible(false);
    if (scene === 3) {
      for (const i of [0, 1, 2, 3]) {
        setTimeout(
          () => {
            setVisibleCards((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          },
          400 + i * 350,
        );
      }
    }
    if (scene === 4) {
      setTimeout(() => setLine1Visible(true), 500);
      setTimeout(() => setLine2Visible(true), 1500);
    }
  }, [scene]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) {
        particlesRef.current = initParticles(120, canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    let burstActive = false;
    let burstProgress = 0;

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const currentScene = sceneRef.current;

      if (burstRef.current && !burstActive) {
        burstActive = true;
        burstProgress = 0;
        burstRef.current = false;
        for (const p of particlesRef.current) {
          const angle = Math.atan2(p.y - h / 2, p.x - w / 2);
          const speed = Math.random() * 8 + 3;
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
        }
      }

      if (burstActive) {
        burstProgress += 0.02;
        if (burstProgress > 1) {
          burstActive = false;
          for (const p of particlesRef.current) {
            p.vx = p.baseVx;
            p.vy = p.baseVy;
          }
        }
      }

      if (currentScene === 2 && !burstActive) {
        for (const p of particlesRef.current) {
          const dx = w / 2 - p.x;
          const dy = h / 2 - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            p.vx += (dx / dist) * 0.15;
            p.vy += (dy / dist) * 0.15;
            p.vx *= 0.9;
            p.vy *= 0.9;
          }
        }
      }

      for (const p of particlesRef.current) {
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x += p.vx;
        p.y += p.vy;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        const glow = currentScene === 0 || currentScene === 6 ? 1.6 : 1;
        const alpha = p.opacity * glow;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.min(alpha, 1)})`;
        ctx.fill();
      }

      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = currentScene === 0 ? 100 : 80;
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(150,100,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(elapsed / TOTAL_DURATION, 1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const advanceScene = useCallback(() => {
    const current = sceneRef.current;
    if (current >= 6) {
      onClose();
      return;
    }
    setPhase("out");
    setTimeout(() => {
      const next = current + 1;
      sceneRef.current = next;
      setScene(next);
      setPhase("in");
      if (next === 2 || next === 6) {
        burstRef.current = true;
        if (next === 2) setFlash(true);
        setTimeout(() => setFlash(false), 300);
      }
    }, 600);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(advanceScene, SCENE_DURATIONS[scene]);
    return () => clearTimeout(timer);
  }, [scene, advanceScene]);

  const contentStyle: React.CSSProperties = {
    opacity: phase === "in" ? 1 : 0,
    transform: phase === "in" ? "translateY(0)" : "translateY(10px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glitch {
          0%   { text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
          20%  { text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; }
          40%  { text-shadow: 1px 0 #ff00ff, -1px 0 #00ffff; }
          60%  { text-shadow: -3px 0 #ff00ff, 3px 0 #00ffff; }
          80%  { text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
          100% { text-shadow: none; }
        }
        @keyframes glowPulse {
          0%, 100% { transform: scale(0.95); opacity: 0.6; }
          50%       { transform: scale(1.05); opacity: 1; }
        }
        @keyframes codeRain {
          from { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.7; }
          90%  { opacity: 0.7; }
          to   { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 8px oklch(0.62 0.24 285 / 0.5), 0 0 20px oklch(0.62 0.24 285 / 0.3); }
          50%       { box-shadow: 0 0 20px oklch(0.62 0.24 285 / 0.9), 0 0 40px oklch(0.62 0.24 285 / 0.5); }
        }
        @keyframes flashIn {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes floatWireframe {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes sparkDrop {
          0%   { opacity: 0; transform: scale(0.5) translateY(-20px); }
          30%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .glitch-text { animation: glitch 2s ease-in-out infinite; }
        .glow-pulse  { animation: glowPulse 2.4s ease-in-out infinite; }
        .promo-skip-btn:hover { background: rgba(255,255,255,0.18) !important; }
        .promo-cta-btn:hover { transform: translateY(-3px) scale(1.03); }
      `}</style>

      {flash && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "white",
            animation: "flashIn 0.3s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#000",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />

        {/* Letterbox bars */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8vh",
            background: "#000",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8vh",
            background: "#000",
            zIndex: 2,
          }}
        />

        {/* Progress bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "3px",
            width: `${progress * 100}%`,
            background:
              "linear-gradient(90deg, oklch(0.62 0.24 285), oklch(0.65 0.22 250))",
            zIndex: 10,
            transition: "width 0.1s linear",
          }}
        />

        {/* Close/Skip button */}
        <button
          type="button"
          data-ocid="promo.close_button"
          onClick={onClose}
          className="promo-skip-btn"
          style={{
            position: "absolute",
            top: "calc(8vh + 16px)",
            right: "20px",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "100px",
            color: "rgba(255,255,255,0.8)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            transition: "background 0.2s",
            fontFamily: "sans-serif",
          }}
        >
          <X size={14} />
          Skip
        </button>

        {/* Scene content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3,
            paddingTop: "8vh",
            paddingBottom: "8vh",
          }}
        >
          <div
            style={{
              ...contentStyle,
              width: "100%",
              maxWidth: "900px",
              padding: "0 24px",
              textAlign: "center",
            }}
          >
            {scene === 0 && <Scene1 />}
            {scene === 1 && <Scene2 />}
            {scene === 2 && <Scene3 />}
            {scene === 3 && <Scene4 visibleCards={visibleCards} />}
            {scene === 4 && (
              <Scene5 line1={line1Visible} line2={line2Visible} />
            )}
            {scene === 5 && <Scene6 />}
            {scene === 6 && <Scene7 onClose={onClose} />}
          </div>
        </div>

        {scene === 4 && <CodeRain />}
      </div>
    </>
  );
}

// ── Scene 1: Hook ──────────────────────────────────────────────────
const WIREFRAMES = [
  {
    top: "-120px",
    left: "-80px",
    width: "180px",
    height: "100px",
    delay: "0s",
    dur: 4,
  },
  {
    top: "-60px",
    right: "-100px",
    width: "130px",
    height: "70px",
    delay: "1s",
    dur: 5,
  },
  {
    bottom: "-100px",
    left: "-60px",
    width: "100px",
    height: "50px",
    delay: "2s",
    dur: 6,
  },
  {
    bottom: "-80px",
    right: "-80px",
    width: "160px",
    height: "90px",
    delay: "0.5s",
    dur: 7,
  },
];

function Scene1() {
  return (
    <div style={{ position: "relative" }}>
      {WIREFRAMES.map((wf) => (
        <div
          key={wf.delay}
          style={{
            position: "absolute",
            top: wf.top,
            left: (wf as { left?: string }).left,
            right: (wf as { right?: string }).right,
            bottom: (wf as { bottom?: string }).bottom,
            width: wf.width,
            height: wf.height,
            border: "1px dashed rgba(140,100,255,0.25)",
            borderRadius: "8px",
            animation: `floatWireframe ${wf.dur}s ease-in-out infinite`,
            animationDelay: wf.delay,
          }}
        />
      ))}

      <p
        style={{
          fontFamily: "monospace",
          fontSize: "11px",
          letterSpacing: "0.35em",
          color: "rgba(160,120,255,0.7)",
          textTransform: "uppercase",
          marginBottom: "28px",
          animation: "fadeUp 0.8s ease 0.3s both",
        }}
      >
        PIXEL FORGE PRESENTS
      </p>

      <h1
        style={{
          fontSize: "clamp(1.8rem, 4vw, 4rem)",
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.15,
          maxWidth: "800px",
          margin: "0 auto",
          animation: "fadeUp 1s ease 1s both",
          fontFamily: "sans-serif",
        }}
      >
        Every great brand begins with a powerful digital presence.
      </h1>
    </div>
  );
}

// ── Scene 2: Problem ───────────────────────────────────────────────
const GRID_ROWS = [0, 1, 2];
const GRID_COLS = [0, 1, 2];

function Scene2() {
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: "-100px -200px",
          background: "rgba(20,20,20,0.7)",
          filter: "grayscale(0.6) brightness(0.7)",
          borderRadius: "12px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "-80px",
          left: "10%",
          right: "10%",
          pointerEvents: "none",
        }}
      >
        {GRID_ROWS.map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "8px",
              transform: `translateX(${(i % 2 === 0 ? 1 : -1) * 12}px) rotate(${(i - 1) * 0.8}deg)`,
              opacity: 0.18,
            }}
          >
            {GRID_COLS.map((j) => (
              <div
                key={j}
                style={{
                  flex: 1,
                  height: "28px",
                  border: "1px dashed rgba(150,150,150,0.5)",
                  borderRadius: "4px",
                  opacity: 0.5 + j * 0.15,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <h2
        className="glitch-text"
        style={{
          fontSize: "clamp(1.4rem, 3.2vw, 3.2rem)",
          fontWeight: 800,
          color: "rgba(220,220,220,0.85)",
          lineHeight: 1.2,
          maxWidth: "720px",
          margin: "0 auto",
          position: "relative",
          animation: "fadeUp 0.8s ease 0.4s both",
          fontFamily: "sans-serif",
        }}
      >
        Most businesses are stuck with websites that don&apos;t perform.
      </h2>
    </div>
  );
}

// ── Scene 3: Transformation ────────────────────────────────────────
const FORGE_LETTERS = [
  { ch: "P", id: "f0" },
  { ch: "I", id: "f1" },
  { ch: "X", id: "f2" },
  { ch: "E", id: "f3" },
  { ch: "L", id: "f4" },
  { ch: "_", id: "f5" },
  { ch: "F", id: "f6" },
  { ch: "O", id: "f7" },
  { ch: "R", id: "f8" },
  { ch: "G", id: "f9" },
  { ch: "E", id: "f10" },
];

function Scene3() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {FORGE_LETTERS.map(({ ch, id }, idx) => (
          <span
            key={id}
            style={{
              fontSize: "clamp(2.5rem, 7vw, 7rem)",
              fontWeight: 900,
              background:
                "linear-gradient(135deg, oklch(0.82 0.22 285), oklch(0.72 0.22 250))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: ch === "_" ? "transparent" : undefined,
              backgroundClip: "text",
              display: "inline-block",
              animation: `sparkDrop 0.5s ease ${0.3 + idx * 0.08}s both`,
              fontFamily: "sans-serif",
              letterSpacing: ch === "_" ? "0.3em" : "0.02em",
              color: ch === "_" ? "transparent" : undefined,
            }}
          >
            {ch === "_" ? "\u00A0" : ch}
          </span>
        ))}
      </div>

      <p
        style={{
          fontSize: "clamp(1rem, 2vw, 1.6rem)",
          color: "rgba(200,180,255,0.85)",
          animation: "fadeUp 0.8s ease 1.4s both",
          fontFamily: "sans-serif",
          fontStyle: "italic",
        }}
      >
        Where pixels become powerful.
      </p>
    </div>
  );
}

// ── Scene 4: Expertise ─────────────────────────────────────────────
const FEATURE_CARDS = [
  {
    label: "Modern Design",
    icon: "✦",
    desc: "Pixel-perfect interfaces that captivate",
  },
  {
    label: "High Performance",
    icon: "⚡",
    desc: "Lightning-fast load times, always",
  },
  {
    label: "Conversion Focused",
    icon: "◎",
    desc: "Every element drives action",
  },
  {
    label: "Built for Growth",
    icon: "↗",
    desc: "Scalable foundations for your business",
  },
];

function Scene4({ visibleCards }: { visibleCards: boolean[] }) {
  return (
    <div>
      <p
        style={{
          fontFamily: "monospace",
          fontSize: "11px",
          letterSpacing: "0.3em",
          color: "rgba(160,120,255,0.6)",
          textTransform: "uppercase",
          marginBottom: "32px",
          animation: "fadeUp 0.7s ease 0.2s both",
        }}
      >
        OUR EXPERTISE
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          maxWidth: "840px",
          margin: "0 auto",
        }}
      >
        {FEATURE_CARDS.map((card, i) => (
          <div
            key={card.label}
            data-ocid={`promo.item.${i + 1}`}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              borderRadius: "16px",
              padding: "28px 20px",
              textAlign: "center",
              opacity: visibleCards[i] ? 1 : 0,
              transform: visibleCards[i] ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                marginBottom: "12px",
                background:
                  "linear-gradient(135deg, oklch(0.75 0.22 285), oklch(0.72 0.22 250))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {card.icon}
            </div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "8px",
                fontFamily: "sans-serif",
              }}
            >
              {card.label}
            </h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "rgba(180,160,220,0.75)",
                fontFamily: "sans-serif",
                lineHeight: 1.5,
              }}
            >
              {card.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Scene 5: Credibility ───────────────────────────────────────────
function Scene5({ line1, line2 }: { line1: boolean; line2: boolean }) {
  return (
    <div>
      <p
        style={{
          fontSize: "clamp(1.6rem, 3.5vw, 3.5rem)",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "20px",
          opacity: line1 ? 1 : 0,
          transform: line1 ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
          fontFamily: "sans-serif",
        }}
      >
        Crafted with precision.
      </p>
      <p
        style={{
          fontSize: "clamp(1.6rem, 3.5vw, 3.5rem)",
          fontWeight: 800,
          background:
            "linear-gradient(135deg, oklch(0.82 0.22 285), oklch(0.72 0.22 250))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          opacity: line2 ? 1 : 0,
          transform: line2 ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
          fontFamily: "sans-serif",
        }}
      >
        Designed for impact.
      </p>
    </div>
  );
}

// ── Scene 6: Agency Identity ───────────────────────────────────────
function Scene6() {
  return (
    <div style={{ position: "relative" }}>
      <div
        className="glow-pulse"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "300px",
          background:
            "radial-gradient(ellipse, oklch(0.62 0.24 285 / 0.25) 0%, transparent 70%)",
          pointerEvents: "none",
          borderRadius: "50%",
        }}
      />

      <h2
        style={{
          fontSize: "clamp(2.5rem, 6vw, 7rem)",
          fontWeight: 900,
          background:
            "linear-gradient(135deg, oklch(0.82 0.22 285), oklch(0.72 0.22 250), oklch(0.78 0.20 230))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.02em",
          marginBottom: "16px",
          position: "relative",
          animation: "fadeUp 0.8s ease 0.3s both",
          fontFamily: "sans-serif",
        }}
      >
        PIXEL FORGE
      </h2>

      <div
        style={{
          height: "1px",
          width: "200px",
          margin: "0 auto 20px",
          background:
            "linear-gradient(90deg, transparent, oklch(0.62 0.24 285 / 0.8), transparent)",
          animation: "fadeUp 0.8s ease 0.6s both",
        }}
      />

      <p
        style={{
          fontSize: "clamp(0.95rem, 1.8vw, 1.4rem)",
          fontStyle: "italic",
          color: "rgba(200,180,255,0.85)",
          animation: "fadeUp 0.8s ease 0.8s both",
          fontFamily: "serif",
        }}
      >
        Where Ideas Become Digital Experiences
      </p>
    </div>
  );
}

// ── Scene 7: CTA ───────────────────────────────────────────────────
function Scene7({ onClose }: { onClose: () => void }) {
  const handleGetStarted = () => {
    onClose();
    setTimeout(() => {
      document
        .querySelector("#contact")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div>
      <h2
        style={{
          fontSize: "clamp(1.8rem, 4vw, 4.5rem)",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "16px",
          animation: "fadeUp 0.8s ease 0.3s both",
          fontFamily: "sans-serif",
        }}
      >
        Build your digital future.
      </h2>

      <p
        style={{
          fontSize: "clamp(1rem, 2vw, 1.6rem)",
          background:
            "linear-gradient(135deg, oklch(0.82 0.22 285), oklch(0.72 0.22 250))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontWeight: 700,
          marginBottom: "40px",
          animation: "fadeUp 0.8s ease 0.7s both",
          fontFamily: "sans-serif",
        }}
      >
        Powered by Pixel Forge
      </p>

      <button
        type="button"
        data-ocid="promo.primary_button"
        onClick={handleGetStarted}
        className="promo-cta-btn"
        style={{
          padding: "16px 40px",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#fff",
          background:
            "linear-gradient(135deg, oklch(0.62 0.24 285), oklch(0.65 0.22 250))",
          border: "none",
          borderRadius: "100px",
          cursor: "pointer",
          animation:
            "fadeUp 0.8s ease 1.1s both, borderGlow 2s ease-in-out 1.5s infinite",
          fontFamily: "sans-serif",
          letterSpacing: "0.02em",
          transition: "transform 0.2s ease",
        }}
      >
        Get Started →
      </button>
    </div>
  );
}

// ── Code Rain ──────────────────────────────────────────────────────
const CODE_CHARS = [
  "<",
  "/",
  ">",
  "{",
  "}",
  ";",
  "(",
  ")",
  "=",
  "[",
  "]",
  "*",
  "&",
  "#",
];

const CODE_COLUMNS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  char: CODE_CHARS[i % CODE_CHARS.length],
  left: `${(i / 22) * 100}%`,
  duration: `${3 + (i % 3)}s`,
  delay: `${(i % 5) * 0.4}s`,
  color: i % 2 === 0 ? "rgba(180,100,255,0.45)" : "rgba(80,200,255,0.4)",
  fontSize: `${10 + (i % 8)}px`,
}));

function CodeRain() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {CODE_COLUMNS.map((col) => (
        <div
          key={col.id}
          style={{
            position: "absolute",
            left: col.left,
            top: 0,
            fontFamily: "monospace",
            fontSize: col.fontSize,
            color: col.color,
            animation: `codeRain ${col.duration} linear ${col.delay} infinite`,
            userSelect: "none",
          }}
        >
          {col.char}
        </div>
      ))}
    </div>
  );
}
