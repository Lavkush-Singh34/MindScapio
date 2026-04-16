import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Loader } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/Button";
import Input from "../components/Input";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("student@test.com");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ email });
      navigate("/");
    } catch (err) {
      setError("Invalid credentials. Try student@test.com or teacher@test.com");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-linear-to-br from-primary-500 to-primary-700 mb-4">
              <span className="text-2xl font-display font-bold text-white">M</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 dark:text-neutral-100">
              MindScapio
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Your learning companion
            </p>
          </motion.div>

          {/* Form */}
          <motion.form onSubmit={handleLogin} className="space-y-6" variants={itemVariants}>
            {/* Email Input */}
            <div>
              <Input
                type="email"
                placeholder="student@test.com or teacher@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                icon={<Mail size={18} />}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Log In
                </>
              )}
            </Button>

            {/* Demo Info */}
            <div className="p-3 rounded-lg bg-primary-50 border border-primary-200 dark:bg-primary-900/20 dark:border-primary-800">
              <p className="text-xs font-medium text-primary-700 dark:text-primary-400 mb-2">
                📝 Demo Credentials
              </p>
              <div className="text-xs text-primary-600 dark:text-primary-300 space-y-1">
                <p>
                  <strong>Student:</strong> student@test.com
                </p>
                <p>
                  <strong>Teacher:</strong> teacher@test.com
                </p>
              </div>
            </div>
          </motion.form>
        </div>

        {/* Footer */}
        <motion.p variants={itemVariants} className="text-center text-sm text-neutral-600 dark:text-neutral-400 mt-6">
          Privacy & Security | © 2024 MindScapio
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
