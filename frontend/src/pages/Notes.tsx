import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Download, Search, Filter } from "lucide-react";
import apiService from "../services/api";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

const Notes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      try {
        await apiService.getNotes(
          selectedClass === "all" ? undefined : selectedClass,
          selectedSubject === "all" ? undefined : selectedSubject
        );
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, [selectedClass, selectedSubject]);

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
          📚 Class Notes
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          Access organized class notes by subject and chapter
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} />}
        />
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
        >
          <option value="all">All Classes</option>
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
        </select>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
        >
          <option value="all">All Subjects</option>
          <option value="math">Math</option>
          <option value="science">Science</option>
          <option value="english">English</option>
        </select>
      </motion.div>

      {/* Notes Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {[
          {
            title: "Algebra Basics",
            subject: "Math",
            chapter: "Chapter 3",
            date: "2024-04-10",
          },
          {
            title: "Photosynthesis",
            subject: "Science",
            chapter: "Chapter 5",
            date: "2024-04-09",
          },
          {
            title: "Shakespeare Overview",
            subject: "English",
            chapter: "Chapter 2",
            date: "2024-04-08",
          },
        ].map((note, idx) => (
          <Card key={idx} className="flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <BookOpen size={24} className="text-primary-600 dark:text-primary-400" />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {note.date}
              </span>
            </div>
            <h3 className="font-display font-bold text-lg mb-1">{note.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {note.subject} • {note.chapter}
            </p>
            <Button variant="outline" size="sm" className="w-full mt-auto">
              <Download size={16} />
              Download
            </Button>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Notes;
