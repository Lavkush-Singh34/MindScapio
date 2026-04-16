import React, { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Upload, CheckCircle, Clock } from "lucide-react";
import apiService from "../services/api";
import Card from "../components/Card";
import Badge, { StatusBadge } from "../components/Badge";
import Button from "../components/Button";

const Homework: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "submitted">(
    "all"
  );
  const [uploading, setUploading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const mockHomework = [
    {
      id: "1",
      subject: "Math",
      description: "Solve questions 1-10 from Chapter 3",
      dueDate: "2024-04-15",
      status: "pending",
    },
    {
      id: "2",
      subject: "Science",
      description: "Write a report on Photosynthesis",
      dueDate: "2024-04-14",
      status: "submitted",
    },
    {
      id: "3",
      subject: "English",
      description: "Essay on 'The Importance of Reading'",
      dueDate: "2024-04-20",
      status: "pending",
    },
  ];

  const handleUpload = async (homeworkId: string, file: File) => {
    setUploading(true);
    try {
      await apiService.submitHomework(homeworkId, file);
      // Refresh data
    } finally {
      setUploading(false);
    }
  };

  const filteredHomework =
    filter === "all"
      ? mockHomework
      : mockHomework.filter((hw) => hw.status === filter);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100">
          📝 Homework
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Submit your homework before the due date
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 mb-8">
        {(["all", "pending", "submitted"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-lg font-medium capitalize transition-all ${
              filter === f
                ? "bg-primary-600 text-white"
                : "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Homework List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredHomework.map((hw) => (
          <Card key={hw.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display font-bold text-lg">{hw.subject}</h3>
                <StatusBadge status={hw.status} />
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                {hw.description}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Due: {new Date(hw.dueDate).toLocaleDateString()}
              </p>
            </div>

            {hw.status === "pending" && (
              <div className="flex gap-2">
                <input
                  type="file"
                  id={`file-${hw.id}`}
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleUpload(hw.id, e.target.files[0]);
                    }
                  }}
                />
                <Button
                  variant="primary"
                  onClick={() =>
                    document.getElementById(`file-${hw.id}`)?.click()
                  }
                  disabled={uploading}
                >
                  <Upload size={16} />
                  Submit
                </Button>
              </div>
            )}

            {hw.status === "submitted" && (
              <Badge variant="success">
                <CheckCircle size={14} />
                Submitted
              </Badge>
            )}
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Homework;
