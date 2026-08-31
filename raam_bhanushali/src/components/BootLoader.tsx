"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BootLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let value = 0;

    const timer = setInterval(() => {
      value += 2;

      setProgress(value);

      if (value >= 100) {
        clearInterval(timer);

        setTimeout(() => {
          setLoading(false);
        }, 600);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
  <AnimatePresence mode="wait">

    {loading ? (
      <motion.div
        key="loader"
        className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]"
        exit={{ opacity: 0 }}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-5xl font-bold text-cyan-400"
        >
          AI Portfolio
        </motion.h1>

        <p className="mt-8 text-zinc-400">
          Initializing Neural Engine...
        </p>

        <div className="w-96 h-3 bg-zinc-800 rounded-full mt-10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
            animate={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-4 text-cyan-400">
          {progress}%
        </p>
      </motion.div>
    ) : (
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {children}
      </motion.div>
    )}

  </AnimatePresence>
);
}