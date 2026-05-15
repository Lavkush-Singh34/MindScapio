import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ──────────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-indigo-600"
          >
            🎓 MindScapio
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/notes"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Notes
                </Link>
                <Link
                  to="/assignments"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Assignments
                </Link>

                {/* ── Admin link — only for admin/teacher ───────── */}
                {(user?.role === "admin" || user?.role === "teacher") && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}

                {/* ── User avatar + dropdown ─────────────────────── */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {user?.displayName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="text-gray-700 font-medium text-sm">
                      {user?.displayName}
                    </span>
                  </button>

                  {/* ── Dropdown menu ─────────────────────────────── */}
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        My Profile
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* ── Mobile hamburger ──────────────────────────────── */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────────── */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-2">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {user?.displayName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {user?.displayName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Dashboard
                </Link>
                <Link
                  to="/notes"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Notes
                </Link>
                <Link
                  to="/assignments"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Assignments
                </Link>
                {(user?.role === "admin" || user?.role === "teacher") && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  My Profile
                </Link>
                <hr className="border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-indigo-600 font-medium"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
