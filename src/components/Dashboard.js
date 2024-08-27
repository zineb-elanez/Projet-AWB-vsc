import React, { useState } from 'react';
import Sidebar from './Sidebar';
import RoleDetails from './RoleDetails';
import ApplicationDetails from './ApplicationDetails';
import UserDetails from './UserDetails';
//import RightDetails from './RightDetails';
import './Dashboard.css';

const Dashboard = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const renderDetails = () => {
    switch (selectedItem) {
      case 'roles':
        return <RoleDetails />;
      case 'applications':
        return <ApplicationDetails />;
      case 'users':
        return <UserDetails />;
     
      default:
        return <div>Veuillez sélectionner un élément.</div>;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar onSelect={setSelectedItem} />
      <div className="details">
        {renderDetails()}
      </div>
    </div>
  );
};

export default Dashboard;
