"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export default function AnimatedLogo({
  size = 20,
  className = "",
}: AnimatedLogoProps) {
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Zap
      className={`transition-colors ${shaking ? "logo-shake logo-color-shift" : ""} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
