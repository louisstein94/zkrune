"use client";

import { useEffect, useRef } from "react";

const runes = ["ᚱ", "ᛉ", "ᚲ", "ᛏ", "ᛖ", "ᛗ", "ᚾ", "ᛟ"];

export default function RuneAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    // Rune particles
    interface RuneParticle {
      x: number;
      y: number;
      rune: string;
      size: number;
      speed: number;
      opacity: number;
      angle: number;
      rotationSpeed: number;
    }

    const particles: RuneParticle[] = [];
    const particleCount = 15;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        rune: runes[Math.floor(Math.random() * runes.length)],
        size: 30 + Math.random() * 50,
        speed: 0.2 + Math.random() * 0.5,
        opacity: 0.1 + Math.random() * 0.4,
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    // Animation loop
    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach((particle, index) => {
        // Update position
        particle.y -= particle.speed;
        particle.angle += particle.rotationSpeed;

        // Reset if out of bounds
        if (particle.y + particle.size < 0) {
          particle.y = canvas.offsetHeight + particle.size;
          particle.x = Math.random() * canvas.offsetWidth;
        }

        // Draw rune
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.angle);
        ctx.font = `${particle.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = index % 2 === 0 ? "#00FFA3" : "#6B4CFF";

        // Color gradient
        const gradient = ctx.createLinearGradient(-particle.size/2, -particle.size/2, particle.size/2, particle.size/2);
        gradient.addColorStop(0, index % 2 === 0 ? "#00FFA3" : "#6B4CFF");
        gradient.addColorStop(1, index % 2 === 0 ? "#6B4CFF" : "#00FFA3");
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = particle.opacity;
        ctx.fillText(particle.rune, 0, 0);

        ctx.restore();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Canvas for animated runes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Central rune symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Glowing rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-zk-primary/20 animate-pulse-slow" />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-zk-secondary/30 animate-pulse-slow"
            style={{ animationDelay: '0.5s' }}
          />
          
          {/* Central rune */}
          <div className="relative text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-zk-primary via-zk-secondary to-zk-primary animate-glow">
            ᚱ
          </div>

          {/* Orbiting particles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-spin" style={{ animationDuration: '20s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zk-primary shadow-lg shadow-zk-primary/50" />
          </div>
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 animate-spin" 
            style={{ animationDuration: '15s', animationDirection: 'reverse' }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zk-secondary shadow-lg shadow-zk-secondary/50" />
          </div>
        </div>
      </div>

      {/* Circuit lines background */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#6B4CFF" />
          </linearGradient>
        </defs>
        <path
          d="M0,200 Q200,100 400,200 T800,200"
          stroke="url(#circuit-gradient)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse-slow"
        />
        <path
          d="M0,400 Q300,300 600,400 T1200,400"
          stroke="url(#circuit-gradient)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        />
      </svg>
    </div>
  );
}

