import React from 'react';
import './Sidebar.css';

const Sidebar = ({ onSelect }) => {
  return (
    <div className="sidebar">
       <div>
        <button className='bouton15'  onClick={() => onSelect('roles')}>Roles</button>
        </div>
      <div>
        <button className='bouton15' onClick={() => onSelect('applications')}> Applications</button>
        </div>
      <div>
        <button  className='bouton15' onClick={() => onSelect('users')}>Utilisateurs</button>
        </div>
    </div>
  );
};

export default Sidebar;
