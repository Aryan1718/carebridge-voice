import { useEffect, useRef } from "react";

export type AgentState = null | "listening" | "talking";

interface OrbProps {
  colors: [string, string];
  seed?: number;
  agentState: AgentState;
}

export function Orb({ colors, seed = 0, agentState }: OrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const baseRadius = Math.min(rect.width, rect.height) / 3;

    let startTime = Date.now() + seed;
    const particles: Array<{ x: number; y: number; angle: number; speed: number; radius: number }> = [];

    // Initialize particles
    const particleCount = agentState === "talking" ? 40 : 20;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: centerX,
        y: centerY,
        angle: (Math.PI * 2 * i) / particleCount + seed,
        speed: agentState === "talking" ? 0.02 : 0.01,
        radius: baseRadius * 1.5,
      });
    }

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Calculate radius based on state
      let radius = baseRadius;
      let glowRadius = baseRadius * 1.1;

      if (agentState === "listening") {
        // Gentle breathing pulse
        const breathe = Math.sin(elapsed * Math.PI * 2 / 2.5) * 0.05;
        radius = baseRadius * (1 + breathe);
        glowRadius = baseRadius * (1.1 + breathe * 0.5);
      } else if (agentState === "talking") {
        // Faster, more intense pulse
        const pulse = Math.sin(elapsed * Math.PI * 4) * 0.15;
        radius = baseRadius * (1 + Math.abs(pulse));
        glowRadius = baseRadius * (1.3 + Math.abs(pulse) * 0.5);
      }

      // Draw particles
      particles.forEach((particle, i) => {
        particle.angle += particle.speed;
        const orbitRadius = particle.radius + Math.sin(elapsed + i) * 10;
        particle.x = centerX + Math.cos(particle.angle) * orbitRadius;
        particle.y = centerY + Math.sin(particle.angle) * orbitRadius;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = agentState === "talking" ? colors[1] + "80" : colors[0] + "60";
        ctx.fill();
      });

      // Draw outer glow
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius,
        centerX,
        centerY,
        glowRadius
      );
      glowGradient.addColorStop(0, colors[0] + "40");
      glowGradient.addColorStop(0.5, colors[1] + "20");
      glowGradient.addColorStop(1, colors[1] + "00");

      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Draw main orb
      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.7, colors[1]);
      gradient.addColorStop(1, colors[1] + "CC");

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Add highlight
      const highlightGradient = ctx.createRadialGradient(
        centerX - radius * 0.4,
        centerY - radius * 0.4,
        0,
        centerX - radius * 0.4,
        centerY - radius * 0.4,
        radius * 0.5
      );
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors, seed, agentState]);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
