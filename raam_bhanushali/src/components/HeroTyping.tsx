"use client";

import { TypeAnimation } from "react-type-animation";

type HeroTypingProps = {
  items?: string[];
};

export default function HeroTyping({
  items = [],
}: HeroTypingProps) {
  const validItems = items.filter(
    (item) =>
      typeof item === "string" &&
      item.trim().length > 0
  );

  const sequence: (string | number)[] =
    validItems.length > 0
      ? validItems.flatMap((item) => [
          item,
          2000,
        ])
      : ["Professional", 2000];

  return (
    <TypeAnimation
      sequence={sequence}
      wrapper="span"
      speed={50}
      repeat={Infinity}
      className="text-cyan-300 text-2xl font-medium"
    />
  );
}