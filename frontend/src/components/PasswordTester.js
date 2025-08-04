import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PasswordHistory from './PasswordHistory';

export default function PasswordTester() {
    const [password, setPassword] = useState('');
    const [result, setResult] = useState(null);
    const navigate = useNavigate();

    const checkStrength = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/check-strength', { password });
            setResult(response.data);
        } catch (err) {
            alert('Error checking password: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div style={{
            backgroundImage: "url('/images/background1.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
        <div style={{
            maxWidth: '600px',
            width: '100%',
            padding: '30px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h1 style={{
            color: '#2c3e50',
            fontSize: '2.2rem',
            marginBottom: '10px'
        }}>
        Welcome to Password Guardian
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '1rem' }}>
        Test your password's strength and security
        </p>
        </div>

        <h2>Password Strength Tester</h2>
        <form onSubmit={checkStrength}>
        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter a password to test"
        style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px'
        }}
        required
        />
        <button
        type="submit"
        style={{
            width: '100%',
            padding: '12px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background 0.3s'
        }}
        onMouseOver={(e) => e.target.style.background = '#45a049'}
        onMouseOut={(e) => e.target.style.background = '#4CAF50'}
        >
        Check Strength
        </button>
        </form>

        {result && (
            <div style={{ marginTop: '30px' }}>
            <h3>Results</h3>
            {result.isCommon && (
                <div style={{
                    background: '#fff3e0',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    borderLeft: '4px solid #ff9800',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                <span style={{ marginRight: '8px' }}>⚠️</span>
                <div>
                <strong>Security Warning:</strong> {result.feedback}
                </div>
                </div>
            )}

            <div style={{
                height: '20px',
                background: '#ddd',
                borderRadius: '10px',
                margin: '15px 0'
            }}>
            <div
            style={{
                width: `${(result.score + 1) * 20}%`,
                    height: '100%',
                    background:
                    result.score < 2 ? '#ff5252' :
                    result.score < 4 ? '#ffd740' : '#69f0ae',
                    borderRadius: '10px',
                    transition: 'width 0.3s ease'
            }}
            />
            </div>
            <p>Strength: <strong>{result.strength}</strong> ({result.score}/4)</p>
            {!result.isCommon && result.feedback && <p>Feedback: {result.feedback}</p>}
            </div>
        )}

        <PasswordHistory />

        <button
        onClick={() => navigate('/admin')}
        style={{
            width: '100%',
            marginTop: '20px',
            padding: '10px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.3s'
        }}
        onMouseOver={(e) => e.target.style.background = '#0b7dda'}
        onMouseOut={(e) => e.target.style.background = '#2196F3'}
        >
        View Admin Dashboard
        </button>
        </div>
        </div>
    );
}
