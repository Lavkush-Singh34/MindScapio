import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // ── Redirect if already logged in ─────────────────────────
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* ── Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

          {/* ── Logo & Title ──────────────────────────────────── */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎓</div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome to MindScapio
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Your smart tutoring platform
            </p>
          </div>

          {/* ── Benefits list ─────────────────────────────────── */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-6 space-y-2">
            {[
              "📚 Access notes for all classes",
              "🧠 Practice with flashcards",
              "✅ Attempt quizzes and track scores",
              "📝 View and download assignments",
            ].map((benefit) => (
              <p key={benefit} className="text-sm text-indigo-700">
                {benefit}
              </p>
            ))}
          </div>

          {/* ── Google Login Button ───────────────────────────── */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* ── Divider ───────────────────────────────────────── */}
          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* ── Public content note ───────────────────────────── */}
          <p className="text-center text-sm text-gray-500">
            Just browsing?{" "}
            <a
              href="/"
              className="text-indigo-600 hover:underline font-medium"
            >
              Explore without login
            </a>
          </p>
        </div>

        {/* ── Footer note ───────────────────────────────────── */}
        <p className="text-center text-xs text-gray-400 mt-4">
          By logging in you agree to our terms of service
        </p>
      </div>
    </div>
  );
};

export default Login;
