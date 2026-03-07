"use client";

import { useEffect, useState } from "react";

const phraseBank = [
  "Meeting runner.",
  "Email sender.",
  "Lunchbox packer.",
  "Laundry folder.",
  "Dinner planner.",
  "Carpool driver.",
  "Errand runner.",
  "Weekend hoster.",
  "Morning juggler.",
  "Thread stash builder.",
  "Canvas stash builder.",
  "Background stitcher.",
  "Late-night stitcher.",
  "Roadtrip stitcher.",
  "Weekend stitcher.",
  "Travel stitcher.",
  "Stocking stitcher.",
  "Thread knot finder.",
  "Needle threader.",
  "Pattern note taker.",
  "Silent frogger.",
  "Thread card keeper.",
];

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function getRandomRoles(count = 7): string[] {
  return shuffle(phraseBank).slice(0, count);
}

function RotatingRoles() {
  const [roles, setRoles] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [showNeedlepointer, setShowNeedlepointer] = useState(false);

  useEffect(() => {
    let mounted = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const runCycle = () => {
      const nextRoles = getRandomRoles(7);
      setRoles(nextRoles);
      setVisibleCount(0);
      setShowNeedlepointer(false);

      nextRoles.forEach((_, i) => {
        timeouts.push(
          setTimeout(() => {
            if (mounted) setVisibleCount(i + 1);
          }, i * 450)
        );
      });

      timeouts.push(
        setTimeout(() => {
          if (mounted) setShowNeedlepointer(true);
        }, nextRoles.length * 450 + 300)
      );

      timeouts.push(
        setTimeout(() => {
          if (mounted) runCycle();
        }, nextRoles.length * 450 + 300 + 1800)
      );
    };

    runCycle();

    return () => {
      mounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="roles-section">
      <div className="roles-list">
        {roles.map((role, index) => (
          <p
            key={`${role}-${index}`}
            className={`role-line ${index < visibleCount ? "show" : ""}`}
          >
            {role}
          </p>
        ))}
      </div>

      <div className={`needlepointer ${showNeedlepointer ? "show" : ""}`}>
        Needlepointer.
      </div>

      <p className="sr-only">
        {roles.join(" ")} Needlepointer — the one that&apos;s hers.
      </p>
    </div>
  );
}

export default RotatingRoles;
export { RotatingRoles as HeroRoles };
