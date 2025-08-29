import React, { useState } from 'react';
import axios from 'axios';

const HashSimulation = () => {
  const [password, setPassword] = useState('');
  const [algorithm, setAlgorithm] = useState('sha256');
  const [rounds, setRounds] = useState(5);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const simulateHashing = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setCurrentStep(0);
    
    try {
      const response = await axios.post('http://localhost:5000/api/hash-simulation', {
        password,
        algorithm,
        rounds
      });
      
      setResult(response.data);
      setIsLoading(false);
      
      if (response.data.steps) {
        for (let i = 0; i <= response.data.steps.length; i++) {
          setTimeout(() => {
            setCurrentStep(i);
          }, i * 800);
        }
      }
    } catch (err) {
      alert('Error simulating hash: ' + (err.response?.data?.error || err.message));
      setIsLoading(false);
    }
  };

  const renderStep = (step, index) => {
    const isActive = index <= currentStep;
    const isCurrent = index === currentStep;
    
    return (
      <div
        key={index}
        style={{
          padding: '15px',
          margin: '10px 0',
          border: '1px solid #ddd',
          borderRadius: '5px',
          backgroundColor: isCurrent ? '#e8f5e9' : isActive ? '#f1f8e9' : '#f9f9f9',
          transition: 'all 0.5s ease',
          opacity: isActive ? 1 : 0.6,
          transform: isCurrent ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Step {step.step}: {step.operation}
          {isCurrent && isLoading && <span style={{marginLeft: '10px'}}>⏳</span>}
        </div>
        
        {step.salt && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Salt:</strong> {step.salt}
          </div>
        )}
        
        <div style={{ 
          fontFamily: 'monospace', 
          fontSize: '14px',
          wordBreak: 'break-all',
          backgroundColor: '#263238',
          color: '#eceff1',
          padding: '10px',
          borderRadius: '4px'
        }}>
          {step.valueHex}
        </div>
        
        {step.value !== step.valueHex && (
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            Original: {step.value}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2>Hashing Simulation</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        See how password hashing works step-by-step. This is a simulation for educational purposes only.
      </p>

      <form onSubmit={simulateHashing} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password to Hash:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Algorithm:
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              <option value="sha256">SHA-256</option>
              <option value="sha512">SHA-512</option>
              <option value="md5">MD5 (Insecure - for demonstration only)</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Rounds:
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: isLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Simulating...' : 'Start Hashing Simulation'}
        </button>
      </form>

      {result && (
        <div>
          <h3>Hashing Process</h3>
          <div style={{
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '5px',
            marginBottom: '20px',
            borderLeft: '4px solid #2196f3'
          }}>
            <strong>Security Note:</strong> {result.securityExplanation}
          </div>

          <div style={{ marginBottom: '20px' }}>
            {result.steps.slice(0, currentStep + 1).map((step, index) => 
              renderStep(step, index)
            )}
          </div>

          {currentStep >= result.steps.length - 1 && (
            <div style={{
              padding: '20px',
              backgroundColor: '#4caf50',
              color: 'white',
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <h3>Final Hash</h3>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '14px',
                wordBreak: 'break-all',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: '15px',
                borderRadius: '4px',
                margin: '10px 0'
              }}>
                {result.finalHash}
              </div>
              <p>
                Algorithm: <strong>{result.algorithm.toUpperCase()}</strong> | 
                Rounds: <strong>{result.rounds}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {!result && !isLoading && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          textAlign: 'center',
          color: '#666'
        }}>
          <h3>How Password Hashing Works</h3>
          <p>
            Password hashing converts your password into a fixed-length string of characters
            using a mathematical algorithm. This process is:
          </p>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
            <li><strong>One-way:</strong> You can't reverse the hash to get the original password</li>
            <li><strong>Deterministic:</strong> The same password always produces the same hash</li>
            <li><strong>Unique:</strong> Small changes create completely different hashes</li>
          </ul>
          <p style={{ marginTop: '15px' }}>
            Modern systems add "salt" (random data) to passwords before hashing to prevent
            rainbow table attacks.
          </p>
        </div>
      )}
    </div>
  );
};

export default HashSimulation;
