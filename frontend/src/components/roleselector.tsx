// RoleSelector.tsx
import React from 'react';

interface RoleSelectorProps {
  isElder: boolean;
  setIsElder: (value: boolean) => void;
}

const styles = {
  roleCard: {
    cursor: 'pointer',
    border: '2px solid transparent',
    borderRadius: '1rem',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
    width: '180px',
    textAlign: 'center' as const,
  },
  iconContainer: {
    backgroundColor: '#e0f2fe',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    margin: '0 auto',
  },
};

const RoleSelector: React.FC<RoleSelectorProps> = ({ isElder, setIsElder }) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <div
          style={{
            ...styles.roleCard,
            borderColor: isElder ? '#4f46e5' : 'transparent',
            backgroundColor: isElder ? '#e0e7ff' : '#f8fafc',
          }}
          onClick={() => setIsElder(true)}
        >
          <div style={styles.iconContainer}>👴</div>
          <h3 style={{ margin: '1rem 0 0', color: '#1e293b' }}>Elder</h3>
        </div>

        <div
          style={{
            ...styles.roleCard,
            borderColor: !isElder ? '#4f46e5' : 'transparent',
            backgroundColor: !isElder ? '#e0e7ff' : '#f8fafc',
          }}
          onClick={() => setIsElder(false)}
        >
          <div style={styles.iconContainer}>👨👧</div>
          <h3 style={{ margin: '1rem 0 0', color: '#1e293b' }}>Grandkid</h3>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;