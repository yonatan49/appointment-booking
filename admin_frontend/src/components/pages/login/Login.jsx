import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { AuthContext } from '../../../context/AuthContext';
import api from '../../../lib/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setUserFromToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/admin/login', { email, password });

            localStorage.setItem('token', data.token);
            setUserFromToken(data.token);
            navigate('/admin');
        } catch (err) {
            const message = err?.response?.data?.message || (err?.message === 'Network Error' ? 'Unable to reach server. Please ensure the backend is running.' : err?.message) || 'Login failed';
            setError(message);
        }
    };

    return (
        <div className="app-container">
            <div className="login-page">
                <form onSubmit={handleSubmit} className="login-box" autoComplete="off">
                    <h1><span>Yon's</span> Beauty Salon</h1>
                    <p>Admin Dashboard Login</p>

                    {error && <div className="input-error">{error}</div>}

                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="off"
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="off"
                    />

                    <button type="submit">Sign In ➜</button>
                    <a className="back-link" href="/">← Return to Website</a>
                </form>
            </div>
        </div>
    );
};

export default Login;
