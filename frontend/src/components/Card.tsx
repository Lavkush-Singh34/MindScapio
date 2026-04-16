import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  as?: "div" | "a" | "button";
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  href,
  as = "div",
}) => {
  const baseClasses =
    "rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-800 card-shadow";

  const classes = `${baseClasses} ${className}`;

  const content = (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={classes}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  if (as === "a" && href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  if (as === "button") {
    return (
      <button className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
};

export default Card;
