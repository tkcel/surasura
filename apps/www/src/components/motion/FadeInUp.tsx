"use client";

import { type ReactNode } from "react";
import { type Variants, motion } from "framer-motion";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

export function FadeInUp({
  children,
  className,
  hoverLift = false,
}: {
  children: ReactNode;
  className?: string;
  hoverLift?: boolean;
}) {
  return (
    <motion.div
      variants={variants}
      className={className}
      {...(hoverLift && { whileHover: { y: -4 } })}
    >
      {children}
    </motion.div>
  );
}
