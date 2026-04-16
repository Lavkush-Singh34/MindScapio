import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface BadgeProps {
  variant?: "success" | "pending" | "warning" | "info" | "default";
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className = "",
}) => {
  const variantClasses: Record<string, string> = {
    success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    warning: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    default: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  };

  return (
    <motion.span
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </motion.span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    submitted: { variant: "success" as const, icon: CheckCircle, label: "Submitted" },
    pending: { variant: "pending" as const, icon: Clock, label: "Pending" },
    important: { variant: "warning" as const, icon: AlertCircle, label: "Important" },
  };

  const conf = config[status as keyof typeof config] || config.pending;
  const Icon = conf.icon;

  return (
    <Badge variant={conf.variant}>
      <Icon size={14} />
      {conf.label}
    </Badge>
  );
};

export default Badge;
