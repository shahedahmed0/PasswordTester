import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PasswordHistory from './PasswordHistory';
import PasswordGenerator from './PasswordGenerator';
import HashSimulation from './HashSimulation';

export default function PasswordTester() {
    const [password, setPassword] = useState('');
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('tester');
    const navigate = useNavigate();

    const checkStrength = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/check-strength', { password });
            setResult(response.data);
            setCopied(false);
        } catch (err) {
            alert('Error checking password: ' + (err.response?.data?.error || err.message));
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = password;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const renderRarityMeter = (score) => {
        const segments = [];
        for (let i = 0; i < 5; i++) {
            segments.push(
                <div
                key={i}
                style={{
                    width: '18%',
                    height: '10px',
                    backgroundColor: i < score ?
                    (score >= 4 ? '#4caf50' :
                    score >= 3 ? '#8bc34a' :
                    score >= 2 ? '#ffc107' :
                    score >= 1 ? '#ff9800' : '#f44336') : '#e0e0e0',
                    borderRadius: '2px',
                    margin: '0 1%',
                    display: 'inline-block'
                }}
                />
            );
        }
        return segments;
    };

    return (
        <div style={{
            backgroundImage: "url('/images/background1.gif')",
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
                maxWidth: '800px',
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

                {/* Tab Navigation */}
                <div style={{ 
                    display: 'flex', 
                    marginBottom: '20px', 
                    borderBottom: '2px solid #eee',
                    borderRadius: '4px 4px 0 0',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => setActiveTab('tester')}
                        style={{
                            padding: '12px 24px',
                            background: activeTab === 'tester' ? '#4CAF50' : 'transparent',
                            color: activeTab === 'tester' ? 'white' : '#666',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px 4px 0 0',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🛡️ Test Password
                    </button>
                    <button
                        onClick={() => setActiveTab('generator')}
                        style={{
                            padding: '12px 24px',
                            background: activeTab === 'generator' ? '#9C27B0' : 'transparent',
                            color: activeTab === 'generator' ? 'white' : '#666',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px 4px 0 0',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        ✨ Generate Password
                    </button>
                    <button
                        onClick={() => setActiveTab('simulation')}
                        style={{
                            padding: '12px 24px',
                            background: activeTab === 'simulation' ? '#FF9800' : 'transparent',
                            color: activeTab === 'simulation' ? 'white' : '#666',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px 4px 0 0',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🔐 Hashing Simulation
                    </button>
                </div>

                {activeTab === 'tester' ? (
                    <div>
                        <h2>Password Strength Tester</h2>
                        <form onSubmit={checkStrength}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter a password to test"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        paddingRight: '120px',
                                        fontSize: '16px',
                                        marginBottom: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                                {password && (
                                    <button
                                        type="button"
                                        onClick={copyToClipboard}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '8px',
                                            padding: '6px 12px',
                                            background: copied ? '#4CAF50' : '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s ease',
                                            zIndex: 10
                                        }}
                                        onMouseOver={(e) => !copied && (e.target.style.background = '#1976D2')}
                                        onMouseOut={(e) => !copied && (e.target.style.background = '#2196F3')}
                                    >
                                        {copied ? '✓ Copied!' : '📋 Copy'}
                                    </button>
                                )}
                            </div>
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

                                {result.meme && (
                                    <div style={{
                                        textAlign: 'center',
                                        marginBottom: '20px',
                                        padding: '15px',
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <img
                                            src={result.meme}
                                            alt="Password strength meme"
                                            style={{
                                                maxWidth: '100%',
                                                height: '200px',
                                                borderRadius: '8px',
                                                marginBottom: '10px',
                                                border: '2px solid #dee2e6'
                                            }}
                                        />
                                        <p style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#2c3e50',
                                            margin: '0',
                                            fontStyle: 'italic'
                                        }}>
                                            {result.memeText}
                                        </p>
                                    </div>
                                )}

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

                                <div style={{ marginBottom: '20px' }}>
                                    <h4>Strength Analysis</h4>
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

                                <div style={{ marginBottom: '20px' }}>
                                    <h4>Rarity Analysis</h4>
                                    <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                        {renderRarityMeter(result.rarity.score)}
                                    </div>
                                    <p>Rarity: <strong>{result.rarity.label}</strong> ({result.rarity.score}/5)</p>

                                    {result.rarity.feedback && result.rarity.feedback.length > 0 && (
                                        <div style={{
                                            background: '#e3f2fd',
                                            padding: '10px',
                                            borderRadius: '4px',
                                            marginTop: '10px',
                                            borderLeft: '4px solid #2196f3'
                                        }}>
                                            <strong>Rarity Insights:</strong>
                                            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                                                {result.rarity.feedback.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'generator' ? (
                    <PasswordGenerator onPasswordGenerated={(password) => setPassword(password)} />
                ) : (
                    <HashSimulation />
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
