import React, { useState, useEffect } from 'react';
import './Details.css';

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', applicationRoles: [{ applicationName: '', roleName: '' }] });
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs', error);
    }
  };

  const handleAddUser = async () => {
    if (isValidUser()) {
      try {
        // Ajouter l'utilisateur
        const userResponse = await fetch('http://localhost:8081/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: newUser.username }),
        });
        const userData = await userResponse.json();
  
        // Traiter les applicationRoles
        for (const ar of newUser.applicationRoles) {
          // Vérifier si l'application existe
          let appResponse = await fetch(`http://localhost:8081/api/applications?name=${ar.applicationName}`);
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
              body: JSON.stringify({ name: ar.applicationName }),
            });
            application = await createAppResponse.json();
          }
  
          // Vérifier si le rôle existe
          let roleResponse = await fetch(`http://localhost:8081/api/roles?name=${ar.roleName}`);
          let roles = await roleResponse.json();
  
          let role;
          if (Array.isArray(roles) && roles.length > 0) {
            role = roles[0]; // Si le rôle existe, prendre le premier rôle trouvé
          } else {
            // Créer le rôle s'il n'existe pas
            const createRoleResponse = await fetch('http://localhost:8081/api/roles', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name: ar.roleName }),
            });
            role = await createRoleResponse.json();
          }
  
          // Associer l'utilisateur, l'application et le rôle
          await fetch(`http://localhost:8081/api/users/${userData.id}/roles/${role.id}/applications/${application.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
  
        // Mettre à jour l'état local avec le nouvel utilisateur
        setUsers([...users, userData]);
        setNewUser({ username: '', applicationRoles: [{ applicationName: '', roleName: '' }] });
        setShowForm(false);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'utilisateur', error);
      }
    }
  };
  const handleDeleteUser = async (id) => {
    try {
      await fetch(`http://localhost:8081/api/users/${id}`, { // Utilisez des backticks pour les templates littéraux
        method: 'DELETE',
      });
      setUsers(users.filter(user => user.id !== id));
      if (selectedUser === id) setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur', error);
    }
  };
  
  const handleEditUser = (id) => {
    const user = users.find(u => u.id === id);
    setNewUser({ ...user });
    setEditingIndex(id);
    setShowForm(true);
  };

  const handleSaveEditUser = async () => {
    if (isValidUser()) {
      try {
        const response = await fetch(`http://localhost:8081/api/users/${editingIndex}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newUser),
        });
        const data = await response.json();
        setUsers(users.map(user => user.id === editingIndex ? data : user));
        setNewUser({ username: '', applicationRoles: [] });
        setEditingIndex(null);
        setShowForm(false);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur', error);
      }
    }
  };

  const handleRoleChange = (roleIndex, field, value) => {
    const updatedApplicationRoles = [...newUser.applicationRoles];
    updatedApplicationRoles[roleIndex][field] = value;
    setNewUser((prev) => ({
      ...prev,
      applicationRoles: updatedApplicationRoles
    }));
  };

  const isValidUser = () => {
    return newUser.username.trim() !== '' && newUser.applicationRoles.length > 0 && newUser.applicationRoles.every(ar => ar.applicationName.trim() !== '' && ar.roleName.trim() !== '');
  };

  const filteredUsers = users.filter(user => user.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="details-container">
      <div>
        <p className='Titre'>LA LISTE DES UTILISATEURS</p>
      </div>
      <div className="form-control3">
        <input
          type="text"
          placeholder="Rechercher par utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-alt"
        />
        <span className="input-border input-border-alt"></span>
      </div>
      {filteredUsers.map((user) => (
        <div key={user.id} className="detail-item">
          <div className="detail-name" onClick={() => setSelectedUser(user.id)}>
            {user.username}
          </div>
          {selectedUser === user.id && (
            <div className="details-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {user.applicationRoles && user.applicationRoles.map((ar, index) => (
                    <tr key={index}>
                      <td>{ar.applicationName}</td>
                      <td>{ar.roleName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button onClick={() => handleEditUser(user.id)} className="edit-btn">Modifier</button>
          <button onClick={() => handleDeleteUser(user.id)} className="delete-btn">Supprimer</button>
        </div>
      ))}
      <button onClick={() => setShowForm((prev) => !prev)} className="add-row-btn">
        {showForm ? 'Annuler' : 'Ajouter un utilisateur'}
      </button>
      {showForm && (
        <div className="add-edit-container">
          <input 
            type="text" 
            placeholder="Nom d'utilisateur" 
            value={newUser.username} 
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} 
            className="input"
          />
          {newUser.applicationRoles.map((ar, index) => (
            <div key={index} className="app-container">
              <input 
                type="text" 
                placeholder="Nom de l'application" 
                value={ar.applicationName} 
                onChange={(e) => handleRoleChange(index, 'applicationName', e.target.value)} 
                className="input"
              />
              <input 
                type="text" 
                placeholder="Nom du rôle" 
                value={ar.roleName} 
                onChange={(e) => handleRoleChange(index, 'roleName', e.target.value)} 
                className="input"
              />
            </div>
          ))}
          <button 
            onClick={editingIndex === null ? handleAddUser : handleSaveEditUser} 
            className={editingIndex === null ? "save-btn" : "edit-btn"}
            disabled={!isValidUser()}
          >
            {editingIndex === null ? 'Ajouter' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
