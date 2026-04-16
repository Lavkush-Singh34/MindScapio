import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ClipboardList, Megaphone, BarChart3, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../services/api";
import Card from "../components/Card";
import Badge from "../components/Badge";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingHomework: 0,
    announcements: 0,
    testScore: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homework, announcements, progress] = await Promise.all([
          apiService.getHomework("pending"),
          apiService.getAnnouncements(),
          apiService.getProgress(),
        ]);

        setStats({
          pendingHomework: homework.length,
          announcements: announcements.length,
          testScore: progress?.averageScore || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (user?.role !== "student") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 md:p-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Teacher Dashboard - Manage your classes and content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Manage Notes",
              icon: BookOpen,
              description: "Create and upload class notes",
              color: "primary",
            },
            {
              title: "Manage Homework",
              icon: ClipboardList,
              description: "Set and track homework assignments",
              color: "accent",
            },
            {
              title: "Announcements",
              icon: Megaphone,
              description: "Post important announcements",
              color: "primary",
            },
          ].map((item, idx) => (
            <Card key={idx} className="bg-gradient-to-br">
              <item.icon className="text-2xl mb-3 text-primary-600 dark:text-primary-400" />
              <h3 className="font-display font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 md:p-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        {[
          {
            icon: ClipboardList,
            label: "Pending Tasks",
            value: stats.pendingHomework,
            color: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
          },
          {
            icon: Megaphone,
            label: "New Announcements",
            value: stats.announcements,
            color: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
          },
          {
            icon: BarChart3,
            label: "Average Score",
            value: `${stats.testScore}%`,
            color: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
          },
        ].map((stat, idx) => (
          <Card key={idx} className="relative overflow-hidden">
            <div className={`inline-flex p-3 rounded-lg mb-3 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              {stat.label}
            </p>
            <p className="text-2xl md:text-3xl font-display font-bold">
              {stat.value}
            </p>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Homework */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Today's Homework</h3>
            <Clock size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <ul className="space-y-2">
            {[
              { subject: "Math", due: "Today 5:00 PM" },
              { subject: "Science", due: "Tomorrow" },
              { subject: "English", due: "Tomorrow" },
            ].map((hw, idx) => (
              <li key={idx} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {hw.subject}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Due: {hw.due}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        {/* Latest Announcements */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Latest Announcements</h3>
            <Megaphone size={20} className="text-accent-500" />
          </div>
          <ul className="space-y-2">
            {[
              { title: "Mid-term exams schedule", important: true },
              { title: "School assembly tomorrow" },
              { title: "New library resources available" },
            ].map((ann, idx) => (
              <li key={idx} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 flex-1">
                    {ann.title}
                  </p>
                  {ann.important && (
                    <Badge variant="warning" className="ml-2 text-xs">
                      Important
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
