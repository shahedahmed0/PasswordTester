import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('adminToken', token);
        navigate('/admin');
    };

    return (
        <div style={{
            maxWidth: '400px',
            margin: '100px auto',
            padding: '20px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
        <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter admin token"
        style={{
            width: '100%',
            padding: '10px',
            margin: '10px 0',
            fontSize: '16px'
        }}
        required
        />
        <button
        type="submit"
        style={{
            width: '100%',
            padding: '10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
        }}
        >
        Login
        </button>
        </form>
        </div>
    );
}
