import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/layout/Navbar";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <AppRoutes />
      </main>
    </div>
  );
};

export default App;
