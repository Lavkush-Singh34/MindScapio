import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";
import ScrollToTop from "./components/shared/ScrollToTop";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Navbar />
      <main>
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
