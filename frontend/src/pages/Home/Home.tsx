import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ─── Feature Card Component ────────────────────────────────────
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
  </div>
);

// ─── Class Badge Component ─────────────────────────────────────
const ClassBadge = ({ grade }: { grade: number }) => (
  <div className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl p-4 text-center cursor-pointer transition-colors">
    <p className="text-2xl font-bold text-indigo-600">{grade}</p>
    <p className="text-xs text-indigo-400 mt-1">Class</p>
  </div>
);

// ─── Home Page ─────────────────────────────────────────────────
const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="text-6xl mb-6">🎓</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Smart Learning for
            <br />
            <span className="text-yellow-300">Every Student</span>
          </h1>
          <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-8">
            AI-powered notes, quizzes, flashcards and assignments — all in one
            place for Class 1 to 10.
          </p>

          {/* ── CTA Buttons ─────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
                >
                  Get Started Free →
                </Link>
                <Link
                  to="/notes"
                  className="bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-800 transition-colors border border-indigo-400"
                >
                  Browse Notes
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Classes Section ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">
            Classes We Cover
          </h2>
          <p className="text-gray-500 mt-2">
            Comprehensive content for Class 1 through 10
          </p>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((grade) => (
            <ClassBadge key={grade} grade={grade} />
          ))}
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              Everything Students Need
            </h2>
            <p className="text-gray-500 mt-2">
              Powerful tools to make learning effective and fun
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon="📚"
              title="AI-Powered Notes"
              description="Beautifully formatted notes for every chapter, generated with AI and curated by your teacher."
            />
            <FeatureCard
              icon="🧠"
              title="Smart Flashcards"
              description="Flip through key concepts and definitions before exams. Filter by difficulty to focus on weak areas."
            />
            <FeatureCard
              icon="✅"
              title="Chapter Quizzes"
              description="Test your knowledge with MCQ, true/false and subjective questions. See your score instantly."
            />
            <FeatureCard
              icon="📝"
              title="Assignments"
              description="View homework and assignments with due dates. Download as PDF and submit on time."
            />
            <FeatureCard
              icon="🏆"
              title="Leaderboard"
              description="See how you rank against classmates on quizzes. Compete and stay motivated."
            />
            <FeatureCard
              icon="📊"
              title="Progress Tracking"
              description="Parents and students can track quiz scores, completed chapters and overall progress."
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
          <p className="text-gray-500 mt-2">Get started in 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Login with Google",
              description:
                "Sign in using your Gmail account. No password needed — one tap and you're in.",
            },
            {
              step: "02",
              title: "Select Your Class",
              description:
                "Choose your child's class and subject. All content is organized class-wise for easy access.",
            },
            {
              step: "03",
              title: "Start Learning",
              description:
                "Read notes, attempt quizzes, flip flashcards and track progress — all in one place.",
            },
          ].map(({ step, title, description }) => (
            <div key={step} className="text-center">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="bg-indigo-600 text-white py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-indigo-100 mb-8">
              Join thousands of students already using MindScapio to ace their
              exams.
            </p>
            <Link
              to="/login"
              className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg inline-block"
            >
              Get Started Free →
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-2xl mb-2">🎓</p>
          <p className="font-semibold text-white">MindScapio</p>
          <p className="text-sm mt-1">
            Smart tutoring platform for Class 1–10
          </p>
          <p className="text-xs mt-4">
            © {new Date().getFullYear()} MindScapio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
