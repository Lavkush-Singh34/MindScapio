import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AuthSuccess = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef(false); // Prevent double execution in StrictMode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleAuthSuccess = async () => {
      try {
        // Extract token from URL query params
        // URL format: /auth/success?token=xxx
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          // No token found — redirect to login
          navigate("/login", { replace: true });
          return;
        }

        // Store token and fetch user profile
        await login(token);

        // Clean token from URL for security then redirect
        navigate("/dashboard", { replace: true });
      } catch {
        // Auth failed — redirect to login
        navigate("/login", { replace: true });
      }
    };

    handleAuthSuccess();
  }, [login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">

        {/* ── Spinner ───────────────────────────────────────── */}
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />

        <h2 className="text-xl font-semibold text-gray-800">
          Signing you in...
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
};

export default AuthSuccess;
