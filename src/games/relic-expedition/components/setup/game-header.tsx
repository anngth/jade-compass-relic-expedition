import React from "react";

export function GameHeader() {
  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-center">
      <h1
        className="font-pixel text-[var(--primary)]"
        style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
      >
        JADE COMPASS
      </h1>
      <p className="font-pixel text-base text-[var(--accent)] sm:text-xl">
        Relic Expedition
      </p>
    </div>
  );
}
