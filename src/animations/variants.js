export const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

export const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.5,
};

export const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

export const itemStagger = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 50 },
  },
};

export const backgroundGradient = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.5, 0.3],
    rotate: [0, 90, 0],
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "linear",
    },
  },
};
