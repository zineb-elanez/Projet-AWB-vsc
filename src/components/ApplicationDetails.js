import React, { useState, useEffect } from 'react';
import './Details.css';

const ApplicationDetails = () => {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newApplication, setNewApplication] = useState({ name: '', userRoles: [{ username: '', roleName: '' }] });
  const [editingApplicationId, setEditingApplicationId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des applications', error);
    }
  };

  const handleAddApplication = async () => {
    if (isValidApplication()) {
      try {
        // Ajouter l'application
        const appResponse = await fetch('http://localhost:8081/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newApplication.name }),
        });
        const appData = await appResponse.json();

        // Traiter les userRoles
        for (const ur of newApplication.userRoles) {
          // Vérifier si l'utilisateur existe
          let userResponse = await fetch(`http://localhost:8081/api/users?username=${ur.username}`);
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
              body: JSON.stringify({ username: ur.username }),
            });
            user = await createUserResponse.json();
          }

          // Vérifier si le rôle existe
          let roleResponse = await fetch(`http://localhost:8081/api/roles?name=${ur.roleName}`);
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
              body: JSON.stringify({ name: ur.roleName }),
            });
            role = await createRoleResponse.json();
          }

          // Associer l'utilisateur, le rôle et l'application
          await fetch(`http://localhost:8081/api/users/${user.id}/roles/${role.id}/applications/${appData.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }

        // Mettre à jour l'état local avec la nouvelle application
        setApplications([...applications, appData]);
        setNewApplication({ name: '', userRoles: [{ username: '', roleName: '' }] });
        setShowForm(false);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'application', error);
      }
    }
  };

  const handleDeleteApplication = async (id) => {
    try {
      await fetch(`http://localhost:8081/api/applications/${id}`, {
        method: 'DELETE',
      });
      setApplications(applications.filter(app => app.id !== id));
      if (selectedApplication === id) setSelectedApplication(null);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'application', error);
    }
  };

  const handleEditApplication = (id) => {
    const app = applications.find(a => a.id === id);
    if (app) {
      setNewApplication({ ...app });
      setEditingApplicationId(id);
      setShowForm(true);
    }
  };

  const handleSaveEditApplication = async () => {
    if (isValidApplication()) {
      try {
        const response = await fetch(`http://localhost:8081/api/applications/${editingApplicationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newApplication),
        });
        const data = await response.json();
        setApplications(applications.map(app => app.id === editingApplicationId ? data : app));
        setNewApplication({ name: '', userRoles: [{ username: '', roleName: '' }] });
        setEditingApplicationId(null);
        setShowForm(false);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'application', error);
      }
    }
  };

  const handleUserRoleChange = (userRoleIndex, field, value) => {
    const updatedUserRoles = [...newApplication.userRoles];
    updatedUserRoles[userRoleIndex][field] = value;
    setNewApplication((prev) => ({
      ...prev,
      userRoles: updatedUserRoles
    }));
  };

  const isValidApplication = () => {
    return newApplication.name.trim() !== '' && newApplication.userRoles.length > 0 && newApplication.userRoles.every(ur => ur.username.trim() !== '' && ur.roleName.trim() !== '');
  };

  const filteredApplications = applications.filter(app => app.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="details-container">
      <div>
        <p className="Titre">LA LISTE DES APPLICATIONS</p>
      </div>
      <div className="form-control3">
        <input
          type="text"
          placeholder="Rechercher par application..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-alt"
        />
        <span className="input-border input-border-alt"></span>
      </div>
      {filteredApplications.map((app) => (
        <div key={app.id} className="detail-item">
          <div className="detail-name" onClick={() => setSelectedApplication(app.id)}>
            {app.name}
          </div>
          {selectedApplication === app.id && (
            <div className="details-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {app.userRoles && app.userRoles.map((ur, index) => (
                    <tr key={index}>
                      <td>{ur.username}</td>
                      <td>{ur.roleName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button onClick={() => handleEditApplication(app.id)} className="edit-btn">Modifier</button>
          <button onClick={() => handleDeleteApplication(app.id)} className="delete-btn">Supprimer</button>
        </div>
      ))}
      <button onClick={() => setShowForm((prev) => !prev)} className="add-row-btn">
        {showForm ? 'Annuler' : 'Ajouter une application'}
      </button>
      {showForm && (
        <div className="add-edit-container">
          <input 
            type="text" 
            placeholder="Nom de l'application" 
            value={newApplication.name} 
            onChange={(e) => setNewApplication({ ...newApplication, name: e.target.value })} 
            className="input"
          />
          {newApplication.userRoles.map((ur, index) => (
            <div key={index} className="user-role-container">
              <input 
                type="text" 
                placeholder="Nom de l'utilisateur" 
                value={ur.username} 
                onChange={(e) => handleUserRoleChange(index, 'username', e.target.value)} 
                className="input"
              />
              <input 
                type="text" 
                placeholder="Nom du rôle" 
                value={ur.roleName} 
                onChange={(e) => handleUserRoleChange(index, 'roleName', e.target.value)} 
                className="input"
              />
            </div>
          ))}
          <button 
            onClick={editingApplicationId === null ? handleAddApplication : handleSaveEditApplication} 
            className={editingApplicationId === null ? "save-btn" : "edit-btn"}
            disabled={!isValidApplication()}
          >
            {editingApplicationId === null ? 'Ajouter' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetails;