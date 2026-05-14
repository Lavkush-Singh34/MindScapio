import './App.css'
import Footer from './components/footer/Footer'
import { Outlet } from 'react-router-dom'
import Header from './components/header/Header'

const Layout = () => {

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

export default Layout;
