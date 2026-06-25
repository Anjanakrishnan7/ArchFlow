import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './PublicLayout.css';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;




