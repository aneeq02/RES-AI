import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Decorative looping video that only plays while on screen, never autoplays
 * for reduced-motion users, and exposes a visible pause/play control.
 */
export default function AutoVideo({ src, className = "", style, label, showControl = true }) {
  const ref = useRef(null);
  const [userPaused, setUserPaused] = useState(prefersReducedMotion);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [userPaused]);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      video.play().catch(() => {});
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  return (
    <>
      <video
        ref={ref}
        className={className}
        style={style}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={encodeURI(src)} type="video/mp4" />
      </video>
      {showControl && (
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-ink/20 bg-canvas text-ink transition hover:bg-canvas/80"
          aria-label={playing ? "Pause video" : "Play video"}
        >
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
      )}
    </>
  );
}
