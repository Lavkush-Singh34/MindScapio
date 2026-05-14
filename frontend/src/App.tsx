import './App.css'
import { Outlet } from 'react-router-dom'

const App = () => {

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
