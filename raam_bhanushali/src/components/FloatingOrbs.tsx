"use client";

import { motion } from "framer-motion";

const orbs = [
  {
    size: 300,
    top: "10%",
    left: "10%",
    color: "#06b6d4",
  },
  {
    size: 250,
    top: "60%",
    left: "70%",
    color: "#9333ea",
  },
  {
    size: 180,
    top: "30%",
    left: "80%",
    color: "#ec4899",
  },
];

export default function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">

      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            top: orb.top,
            left: orb.left,
            opacity: 0.18,
          }}
          animate={{
            y: [-40, 40, -40],
            x: [-30, 30, -30],
          }}
          transition={{
            duration: 10 + index * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

    </div>
  );
}