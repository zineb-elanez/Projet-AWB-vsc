import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Photo from '../Attijariegris.jpg'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === '' || password === '') {
      setError('Tous les champs doivent être remplis');
      setSuccess('');
      return;
    }

    if (password !== '123') {
      setError('Mot de passe incorrect');
      setSuccess('');
      return;
    }

    localStorage.setItem('authToken', 'your-auth-token');

    setError('');
    setSuccess('Connexion réussie !');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000); 
  };

  return (
    <div className="login-page">
      <div className="photo-container">
        <img src={Photo} alt="fond" className="photo" />
      </div>
      <div className="login-container">
        <div className="login">
          <form onSubmit={handleSubmit}>
            <label htmlFor="chk" aria-hidden="true">Login</label><br></br><br></br>
            <div className="form-control">
  <input 
    required
    value={email} 
    onChange={(e) => setEmail(e.target.value)}  
    type="email" 
  />
  <label>
    <span style={{ transitionDelay: '0ms' }}>E</span>
    <span style={{ transitionDelay: '50ms' }}>m</span>
    <span style={{ transitionDelay: '100ms' }}>a</span>
    <span style={{ transitionDelay: '150ms' }}>i</span>
    <span style={{ transitionDelay: '200ms' }}>l</span>
  </label>
</div>
<div className="form-control2">
  <input 
    required
    value={password} 
    onChange={(e) => setPassword(e.target.value)}
    type="password" 
  />
  <label>
    <span style={{ transitionDelay: '0ms' }}>P</span>
    <span style={{ transitionDelay: '50ms' }}>a</span>
    <span style={{ transitionDelay: '100ms' }}>s</span>
    <span style={{ transitionDelay: '150ms' }}>s</span>
    <span style={{ transitionDelay: '200ms' }}>w</span>
    <span style={{ transitionDelay: '250ms' }}>o</span>
    <span style={{ transitionDelay: '300ms' }}>r</span>
    <span style={{ transitionDelay: '350ms' }}>d</span>
  </label>
</div>
             {error && <div className="alert alert-danger" role="alert">{error}</div>}
             {success && <div className="alert alert-success" role="alert">{success}</div>}
            
             <div><p><a href="/password-rest"> mot de passe oublier ?</a></p></div>
            <button type="submit">Se Connecter</button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default Login;