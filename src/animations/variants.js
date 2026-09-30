const easeOut = [0.22, 1, 0.36, 1];

export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -4, transition: { duration: 0.18, ease: "easeIn" } },
};

export const pageTransition = { duration: 0.35, ease: easeOut };

export const containerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const itemStagger = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

// Shared props for sections that stagger their children in when scrolled into view
export const inViewStagger = {
  variants: containerStagger,
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, margin: "-80px 0px" },
};
