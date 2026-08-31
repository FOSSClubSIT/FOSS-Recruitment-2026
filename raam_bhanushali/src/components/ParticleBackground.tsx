"use client";

import Particles, { ParticlesProvider } from "@tsparticles/react";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { useCallback, useMemo } from "react";

export default function ParticleBackground() {
  const initParticles = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const options = useMemo<ISourceOptions>(() => ({
    background: {
      color: "transparent",
    },
    fullScreen: {
      enable: false,
    },
    particles: {
      number: {
        density: {
          enable: true,
          width: 900,
          height: 900,
        },
        value: 34,
      },
      color: {
        value: ["#22d3ee", "#60a5fa", "#a78bfa"],
      },
      links: {
        enable: true,
        color: "#38bdf8",
        distance: 145,
        opacity: 0.18,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.45,
        direction: "none",
        outModes: {
          default: "out",
        },
      },
      opacity: {
        value: { min: 0.18, max: 0.55 },
      },
      size: {
        value: { min: 1, max: 2.5 },
      },
    },
    detectRetina: true,
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: {
          enable: false,
        },
        resize: {
          enable: true,
        },
      },
    },
  }), []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <ParticlesProvider init={initParticles}>
        <Particles
          id="resumeforge-particles"
          className="h-full w-full opacity-70"
          options={options}
        />
      </ParticlesProvider>
    </div>
  );
}
