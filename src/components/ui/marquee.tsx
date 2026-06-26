"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // duration in seconds for one loop
}

export function Marquee({ children, className, speed = 20 }: MarqueeProps) {
  return (
    <div className={cn("flex w-full overflow-hidden whitespace-nowrap bg-secondary border-y-2 border-border py-3", className)}>
      <motion.div
        className="flex min-w-full items-center justify-around gap-8 pr-8"
        animate={{ x: ["0%", "-100%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        {children}
      </motion.div>
      <motion.div
        className="flex min-w-full items-center justify-around gap-8 pr-8"
        animate={{ x: ["0%", "-100%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
        aria-hidden="true"
      >
        {children}
      </motion.div>
    </div>
  );
}
