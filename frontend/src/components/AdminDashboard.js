import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admin/stats', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setStats(response.data);
                setIsAuthenticated(true);
                localStorage.setItem('adminToken', token);
            } catch (err) {
                console.error('Admin stats error:', err);
                if (err.response?.status === 401) {
                    alert('Authentication failed. Please check your token.');
                    setIsAuthenticated(false);
                    localStorage.removeItem('adminToken');
                } else {
                    alert('Failed to load admin data. Check console for details.');
                }
            }
        };

        if (token && isAuthenticated) {
            fetchStats();
        }
    }, [token, isAuthenticated]);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setToken('');
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
        setStats(null);
    };

    const strengthData = {
        labels: ['Very Weak (0)', 'Weak (1)', 'Fair (2)', 'Strong (3)', 'Very Strong (4)'],
        datasets: [{
            label: 'Number of Tests',
            data: stats?.strengthDistribution || [0, 0, 0, 0, 0],
            backgroundColor: [
                '#ff6384',
                '#ff9f40',
                '#ffcd56',
                '#4bc0c0',
                '#36a2eb'
            ],
            borderWidth: 1
        }]
    };

    const rarityData = {
        labels: ['Very Common (0)', 'Common (1)', 'Uncommon (2)', 'Rare (3)', 'Very Rare (4)'],
        datasets: [{
            label: 'Number of Tests',
            data: stats?.rarityDistribution || [0, 0, 0, 0, 0],
            backgroundColor: [
                '#f44336',
                '#ff9800',
                '#ffc107',
                '#8bc34a',
                '#4caf50'
            ],
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Password Distribution'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                backgroundImage: "url('/images/background2.jpg')",
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
                padding: '30px',
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
            }}>
            <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Admin Access</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>Enter admin token to continue:</p>
            <form onSubmit={handleLogin}>
            <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin token"
            style={{
                width: '100%',
                padding: '12px',
                margin: '10px 0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
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
            Enter Dashboard
            </button>
            </form>
            </div>
            </div>
        );
    }

    return (
        <div style={{
            backgroundImage: "url('/images/background2.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            padding: '20px'
        }}>
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '30px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{
            color: '#2c3e50',
            borderBottom: '2px solid #eee',
            paddingBottom: '15px',
            margin: '0',
            fontSize: '2rem'
        }}>
        Admin Dashboard
        </h1>
        <button
        onClick={handleLogout}
        style={{
            padding: '8px 16px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background 0.3s'
        }}
        onMouseOver={(e) => e.target.style.background = '#d32f2f'}
        onMouseOut={(e) => e.target.style.background = '#f44336'}
        >
        Logout
        </button>
        </div>

        {stats ? (
            <>
            {/* Stats Overview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '40px'
            }}>
            <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  textAlign: 'center'
            }}>
            <h3 style={{ color: '#6c757d', marginTop: '0' }}>Total Tests</h3>
            <p style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '10px 0 0'
            }}>
            {stats.totalTests}
            </p>
            </div>

            <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  textAlign: 'center'
            }}>
            <h3 style={{ color: '#6c757d', marginTop: '0' }}>Average Strength</h3>
            <p style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '10px 0 0'
            }}>
            {stats.strengthDistribution && stats.totalTests > 0 ?
                (stats.strengthDistribution.reduce((sum, val, idx) => sum + val * idx, 0) / stats.totalTests).toFixed(2) :
                '0.00'}
                /4
                </p>
                </div>

                <div style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }}>
                <h3 style={{ color: '#6c757d', marginTop: '0' }}>Average Rarity</h3>
                <p style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    margin: '10px 0 0'
                }}>
                {stats.rarityDistribution && stats.totalTests > 0 ?
                    (stats.rarityDistribution.reduce((sum, val, idx) => sum + val * idx, 0) / stats.totalTests).toFixed(2) :
                    '0.00'}
                    /5
                    </p>
                    </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                  gap: '30px',
                  marginBottom: '40px'
                    }}>
                    <div style={{
                        background: '#fff',
                        padding: '25px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  height: '400px'
                    }}>
                    <h3 style={{ color: '#2c3e50', marginTop: '0', marginBottom: '20px' }}>Password Strength Distribution</h3>
                    <Bar data={strengthData} options={chartOptions} />
                    </div>

                    <div style={{
                        background: '#fff',
                        padding: '25px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  height: '400px'
                    }}>
                    <h3 style={{ color: '#2c3e50', marginTop: '0', marginBottom: '20px' }}>Password Rarity Distribution</h3>
                    <Doughnut data={rarityData} options={chartOptions} />
                    </div>
                    </div>

                    <div style={{
                        background: '#fff',
                        padding: '25px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}>
                    <h3 style={{ color: '#2c3e50', marginTop: '0', marginBottom: '20px' }}>Recent Tests</h3>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Time</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Strength</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Rarity</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Common</th>
                    </tr>
                    </thead>
                    <tbody>
                    {stats.lastTests && stats.lastTests.length > 0 ? (
                        stats.lastTests.map((test, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                            {new Date(test.testedAt).toLocaleString()}
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                            {test.strengthLabel} ({test.strengthScore}/4)
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                            {test.rarityLabel} ({test.rarityScore}/5)
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                            {test.isCommon ?
                                <span style={{ color: '#f44336', fontWeight: 'bold' }}>Yes</span> :
                                <span style={{ color: '#4caf50' }}>No</span>}
                                </td>
                                </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan="4" style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>
                        No tests recorded yet
                        </td>
                        </tr>
                    )}
                    </tbody>
                    </table>
                    </div>
                    </div>
                    </>
        ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading statistics...</p>
            </div>
        )}
        </div>
        </div>
    );
}
