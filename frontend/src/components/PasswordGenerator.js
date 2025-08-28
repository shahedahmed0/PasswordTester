import React, { useState } from 'react';
import axios from 'axios';

export default function PasswordGenerator({ onPasswordGenerated }) {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordInfo, setPasswordInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    length: 16,
    useNumbers: true,
    useSymbols: true
  });

  const generatePassword = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/generate-password', {
        params: options
      });
      setGeneratedPassword(response.data.password);
      setPasswordInfo(response.data);
      if (onPasswordGenerated) {
        onPasswordGenerated(response.data.password);
      }
    } catch (err) {
      alert('Error generating password: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      alert('Password copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = generatedPassword;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Password copied to clipboard!');
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        🔐 Password Generator
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Password Length: {options.length}
        </label>
        <input
          type="range"
          min="8"
          max="32"
          value={options.length}
          onChange={(e) => setOptions({...options, length: parseInt(e.target.value)})}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span>8</span>
          <span>32</span>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={options.useNumbers}
            onChange={(e) => setOptions({...options, useNumbers: e.target.checked})}
            style={{ marginRight: '8px' }}
          />
          Include Numbers (0-9)
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <input
            type="checkbox"
            checked={options.useSymbols}
            onChange={(e) => setOptions({...options, useSymbols: e.target.checked})}
            style={{ marginRight: '8px' }}
          />
          Include Symbols (!@#$%^&*)
        </label>
      </div>

      <button
        onClick={generatePassword}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: loading ? '#ccc' : '#9C27B0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}
      >
        {loading ? 'Generating...' : '✨ Generate Password'}
      </button>

      {generatedPassword && (
        <div>
          <div style={{
            background: '#f8f9fa',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '15px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <strong>Generated Password:</strong>
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '4px 8px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                📋 Copy
              </button>
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '18px',
              padding: '10px',
              background: '#fff',
              borderRadius: '3px',
              border: '1px solid #ddd',
              wordBreak: 'break-all'
            }}>
              {generatedPassword}
            </div>
          </div>

          {passwordInfo && (
            <div style={{
              padding: '10px',
              background: '#e8f5e8',
              borderRadius: '4px',
              borderLeft: '4px solid #4CAF50'
            }}>
              <p style={{ margin: '0' }}>
                <strong>Strength:</strong> {passwordInfo.strength} ({passwordInfo.score}/4)
              </p>
              {passwordInfo.feedback && (
                <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                  {passwordInfo.feedback}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
