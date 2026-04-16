import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./layouts/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Homework from "./pages/Homework";
import "./App.css";

// Placeholder page component
const PlaceholderPage: React.FC<{ name: string }> = ({ name }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold capitalize">{name}</h1>
    <p className="text-neutral-600 dark:text-neutral-400 mt-2">
      Coming soon...
    </p>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notes />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/homework"
            element={
              <ProtectedRoute>
                <Layout>
                  <Homework />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Placeholder Routes */}
          {["announcements", "tests", "progress", "doubts", "schedule"].map(
            (page) => (
              <Route
                key={page}
                path={`/${page}`}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PlaceholderPage name={page} />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            )
          )}

          {/* Admin Routes - Placeholder */}
          {["notes", "homework", "announcements", "tests", "doubts"].map(
            (page) => (
              <Route
                key={`admin-${page}`}
                path={`/admin/${page}`}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <PlaceholderPage name={`Manage ${page}`} />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            )
          )}

          {/* Settings & Profile */}
          {["profile", "settings"].map((page) => (
            <Route
              key={page}
              path={`/${page}`}
              element={
                <ProtectedRoute>
                  <Layout>
                    <PlaceholderPage name={page} />
                  </Layout>
                </ProtectedRoute>
              }
            />
          ))}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;