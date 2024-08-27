import React from 'react';
import { useLocation } from 'react-router-dom';
import './NavBar.css'; 
import logo from '../LOAWB.png'; 
import Logout from './Logout';


const Navbar = () => {
  const location = useLocation();
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src={logo} alt="Logo" className="navbar-logo" />
        <span className="navbar-title">Espace Administrateur</span>
        {location.pathname==='/' ?<sapn className="mot">"croire   en    vous"</sapn> : null }
      </div>
      <div className="navbar-links">
        {location.pathname === '/dashboard'&&<Logout/>}
      </div>
    </nav>
  );
};

export default Navbar;
