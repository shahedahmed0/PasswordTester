import React, { useEffect, useState } from 'react';
import axios from 'axios';
// eslint-disable-next-line
const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['#ff5252', '#ff9f40', '#ffcd56', '#4bc0c0', '#36a2eb'];

export default function PasswordHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/history');
                setHistory(response.data);
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '20px',
            borderRadius: '10px',
            marginTop: '30px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
        <h3 style={{
            borderBottom: '1px solid #eee',
            paddingBottom: '10px',
            color: '#2c3e50'
        }}>
        Recent Password Tests
        </h3>

        {loading ? (
            <p>Loading history...</p>
        ) : history.length === 0 ? (
            <p>No test history found</p>
        ) : (
            <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                marginTop: '15px'
            }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
            }}>
            <thead>
            <tr style={{
                borderBottom: '2px solid #eee',
                textAlign: 'left'
            }}>
            <th style={{ padding: '8px 12px' }}>Time</th>
            <th style={{ padding: '8px 12px' }}>Strength</th>
            <th style={{ padding: '8px 12px' }}>Status</th>
            </tr>
            </thead>
            <tbody>
            {history.map((test, index) => (
                <tr
                key={index}
                style={{
                    borderBottom: '1px solid #f5f5f5',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                }}
                >
                <td style={{ padding: '12px' }}>
                {new Date(test.testedAt).toLocaleTimeString()}
                </td>
                <td style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: strengthColors[test.strengthScore],
                    marginRight: '8px'
                }} />
                {test.strengthLabel}
                </div>
                </td>
                <td style={{
                    padding: '12px',
                    color: test.isCommon ? '#ff9800' : '#4CAF50',
                    fontWeight: test.isCommon ? 'bold' : 'normal'
                }}>
                {test.isCommon ? 'Common' : 'Unique'}
                </td>
                </tr>
            ))}
            </tbody>
            </table>
            </div>
        )}
        </div>
    );
}
