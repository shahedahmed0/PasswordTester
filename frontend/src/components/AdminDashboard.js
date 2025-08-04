import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
// eslint-disable-next-line
import { Chart as ChartJS } from 'chart.js/auto';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admin/stats', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });
                setStats(response.data);
            } catch (err) {
                alert('Failed to load admin data. Check console for details.');
                console.error('Admin stats error:', err);
            }
        };
        fetchStats();
    }, []);

    if (!stats) return (
        <div style={{
            backgroundImage: "url('/images/background2.jpg')",
                        backgroundSize: 'cover',
                        minHeight: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white'
        }}>
        Loading admin dashboard...
        </div>
    );

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
            maxWidth: '800px',
            margin: '0 auto',
            padding: '30px',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}>
        <h1 style={{
            color: '#2c3e50',
            borderBottom: '2px solid #eee',
            paddingBottom: '15px',
            marginBottom: '25px',
            fontSize: '2rem'
        }}>
        Admin Dashboard
        </h1>

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
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
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
        </div>

        <div style={{
            background: '#fff',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
        <h3 style={{ color: '#2c3e50', marginTop: '0' }}>Password Strength Distribution</h3>
        <Bar
        data={{
            labels: ['Very Weak (0)', 'Weak (1)', 'Fair (2)', 'Strong (3)', 'Very Strong (4)'],
            datasets: [{
                label: 'Number of Tests',
            data: stats.strengthDistribution,
            backgroundColor: [
                '#ff6384',
            '#ff9f40',
            '#ffcd56',
            '#4bc0c0',
            '#36a2eb'
            ],
            borderWidth: 1
            }]
        }}
        options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
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
        }}
        />
        </div>
        </div>
        </div>
    );
}
