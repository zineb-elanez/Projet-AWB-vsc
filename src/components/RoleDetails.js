import React, { useState, useEffect } from 'react';
import './Details.css';

const RoleDetails = () => {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', userApplications: [{ username: '', applicationName: '' }] });
  const [editingRoleId, setEditingRoleId] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles', error);
    }
  };

  const handleAddRole = async () => {
    if (isValidRole()) {
      try {
        // Ajouter le rôle
        const roleResponse = await fetch('http://localhost:8081/api/roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newRole.name }),
        });
        const roleData = await roleResponse.json();
  
        // Traiter les userApplications
        for (const ua of newRole.userApplications) {
          // Vérifier si l'utilisateur existe
          let userResponse = await fetch(`http://localhost:8081/api/users?username=${ua.username}`);
          let users = await userResponse.json();
  
          let user;
          if (Array.isArray(users) && users.length > 0) {
            user = users[0]; // Si l'utilisateur existe, prendre le premier utilisateur trouvé
          } else {
            // Créer l'utilisateur s'il n'existe pas
            const createUserResponse = await fetch('http://localhost:8081/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username: ua.username }),
            });
            user = await createUserResponse.json();
          }
  
          // Vérifier si l'application existe
          let appResponse = await fetch(`http://localhost:8081/api/applications?name=${ua.applicationName}`);
          let applications = await appResponse.json();
  
          let application;
          if (Array.isArray(applications) && applications.length > 0) {
            application = applications[0]; // Si l'application existe, prendre la première application trouvée
          } else {
            // Créer l'application si elle n'existe pas
            const createAppResponse = await fetch('http://localhost:8081/api/applications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: ua.applicationName }),
            });
            application = await createAppResponse.json();
          }
  
          // Associer l'utilisateur, le rôle et l'application
          await fetch(`http://localhost:8081/api/users/${user.id}/roles/${roleData.id}/applications/${application.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
  
        // Mettre à jour l'état local avec le nouveau rôle
        setRoles([...roles, roleData]);
        setNewRole({ name: '', userApplications: [{ username: '', applicationName: '' }] });
        setShowForm(false);
      } catch (error) {
        console.error('Erreur lors de l\'ajout du rôle', error);
      }
    }
  };
  

  const handleDeleteRole = async (id) => {
    try {
      await fetch(`http://localhost:8081/api/roles/${id}`, {
        method: 'DELETE',
      });
      setRoles(roles.filter(role => role.id !== id));
      if (selectedRole === id) setSelectedRole(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle', error);
    }
  };

  const handleEditRole = (id) => {
    const role = roles.find(r => r.id === id);
    if (role) {
      setNewRole({ ...role });
      setEditingRoleId(id);
      setShowForm(true);
    }
  };

  const handleSaveEditRole = async () => {
    if (isValidRole()) {
      try {
        const response = await fetch(`http://localhost:8081/api/roles/${editingRoleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRole),
        });
        const data = await response.json();
        setRoles(roles.map(role => role.id === editingRoleId ? data : role));
        setNewRole({ name: '', userApplications: [{ username: '', applicationName: '' }] });
        setEditingRoleId(null);
        setShowForm(false);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle', error);
      }
    }
  };

  const handleUserChange = (userIndex, field, value) => {
    const updatedUserApplications = [...newRole.userApplications];
    updatedUserApplications[userIndex][field] = value;
    setNewRole((prev) => ({
      ...prev,
      userApplications: updatedUserApplications
    }));
  };

  const isValidRole = () => {
    return newRole.name.trim() !== '' && newRole.userApplications.length > 0 && newRole.userApplications.every(ua => ua.username.trim() !== '' && ua.applicationName.trim() !== '');
  };

  const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="details-container">
      <div>
        <p className="Titre">LA LISTE DES RÔLES</p>
      </div>
      <div className="form-control3">
        <input
          type="text"
          placeholder="Rechercher par rôle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-alt"
        />
        <span className="input-border input-border-alt"></span>
      </div>
      {filteredRoles.map((role) => (
        <div key={role.id} className="detail-item">
          <div className="detail-name" onClick={() => setSelectedRole(role.id)}>
            {role.name}
          </div>
          {selectedRole === role.id && (
            <div className="details-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Application</th>
                  </tr>
                </thead>
                <tbody>
                  {role.userApplications && role.userApplications.map((ua, index) => (
                    <tr key={index}>
                      <td>{ua.username}</td>
                      <td>{ua.applicationName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button onClick={() => handleEditRole(role.id)} className="edit-btn">Modifier</button>
          <button onClick={() => handleDeleteRole(role.id)} className="delete-btn">Supprimer</button>
        </div>
      ))}
      <button onClick={() => setShowForm((prev) => !prev)} className="add-row-btn">
        {showForm ? 'Annuler' : 'Ajouter un rôle'}
      </button>
      {showForm && (
        <div className="add-edit-container">
          <input 
            type="text" 
            placeholder="Nom du rôle" 
            value={newRole.name} 
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} 
            className="input"
          />
          {newRole.userApplications.map((ua, index) => (
            <div key={index} className="app-container">
              <input 
                type="text" 
                placeholder="Nom de l'utilisateur" 
                value={ua.username} 
                onChange={(e) => handleUserChange(index, 'username', e.target.value)} 
                className="input"
              />
              <input 
                type="text" 
                placeholder="Nom de l'application" 
                value={ua.applicationName} 
                onChange={(e) => handleUserChange(index, 'applicationName', e.target.value)} 
                className="input"
              />
            </div>
          ))}
          <button 
            onClick={editingRoleId === null ? handleAddRole : handleSaveEditRole} 
            className={editingRoleId === null ? "save-btn" : "edit-btn"}
            disabled={!isValidRole()}
          >
            {editingRoleId === null ? 'Ajouter' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleDetails;
