import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function HashSimulation({ password }) {
  const [hashData, setHashData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (password && password.length > 0) {
      simulateHashing();
    }
  }, [password]);

  const simulateHashing = async () => {
    setLoading(true);
    setHashData(null);
    setCurrentStep(0);
    
    try {
      const response = await axios.get('http://localhost:5000/api/hash-simulation', {
        params: { password }
      });
      setHashData(response.data);
      
      
      if (response.data.hashResult.steps.length > 0) {
        let step = 0;
        const interval = setInterval(() => {
          setCurrentStep(step);
          step++;
          if (step > response.data.hashResult.steps.length) {
            clearInterval(interval);
          }
        }, 800);
      }
    } catch (err) {
      console.error('Hash simulation error:', err);
    }
    setLoading(false);
  };

  if (!password) return null;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '20px',
      borderRadius: '10px',
      marginTop: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <h4 style={{ 
        borderBottom: '2px solid #2196F3', 
        paddingBottom: '8px',
        color: '#2c3e50'
      }}>
        🔒 Hashing Simulation
      </h4>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ 
            fontSize: '24px', 
            marginBottom: '10px' 
          }}>
            ⏳
          </div>
          <p>Simulating secure hashing...</p>
        </div>
      ) : hashData && (
        <div>
          <div style={{ 
            background: '#e8f5e8', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            borderLeft: '4px solid #4CAF50'
          }}>
            <strong>Original Password:</strong> 
            <span style={{ 
              fontFamily: 'monospace', 
              background: '#fff', 
              padding: '2px 6px', 
              borderRadius: '3px', 
              marginLeft: '8px',
              border: '1px solid #ddd'
            }}>
              {hashData.originalPassword}
            </span>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Hashing Process:</strong>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px', 
              marginTop: '8px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {hashData.hashResult.steps.slice(0, currentStep).map((step, index) => (
                <div key={index} style={{ 
                  marginBottom: '10px', 
                  padding: '8px',
                  background: index === currentStep - 1 ? '#e3f2fd' : 'transparent',
                  borderRadius: '3px',
                  borderLeft: index === currentStep - 1 ? '3px solid #2196F3' : 'none'
                }}>
                  <div style={{ color: '#666', fontSize: '11px' }}>
                    Round {step.round}: {step.operation}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{ color: '#e91e63' }}>Input:</span> {step.input}
                  </div>
                  <div>
                    <span style={{ color: '#4CAF50' }}>Output:</span> {step.output}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentStep > hashData.hashResult.steps.length && (
            <div style={{ 
              background: '#4CAF50', 
              color: 'white', 
              padding: '12px', 
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', marginBottom: '5px' }}>✅</div>
              <strong>Final Hash:</strong>
              <div style={{ 
                fontFamily: 'monospace', 
                background: 'rgba(255,255,255,0.2)', 
                padding: '8px', 
                borderRadius: '3px', 
                marginTop: '8px',
                wordBreak: 'break-all',
                fontSize: '11px'
              }}>
                {hashData.hashResult.finalHash}
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                This simulated hash would be stored instead of your actual password
              </p>
            </div>
          )}

          <button
            onClick={simulateHashing}
            style={{
              width: '100%',
              padding: '8px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔁 Re-run Simulation
          </button>
        </div>
      )}
    </div>
  );
}
