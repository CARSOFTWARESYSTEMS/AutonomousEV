import React from 'react';

const DiagramContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="diagram-container glass-panel" style={{ margin: '32px 0', padding: '24px', textAlign: 'center' }}>
    <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '1px' }}>
      {title}
    </p>
    <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      {children}
    </div>
  </div>
);

const Box: React.FC<{ label: string; color?: string; sublabel?: string }> = ({ label, color = 'var(--accent-primary)', sublabel }) => (
  <div style={{ 
    padding: '12px 20px', 
    border: `1px solid ${color}`, 
    background: 'rgba(255,255,255,0.03)', 
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    minWidth: '120px'
  }}>
    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>{label}</span>
    {sublabel && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{sublabel}</span>}
  </div>
);

const Arrow: React.FC<{ horizontal?: boolean; label?: string }> = ({ horizontal, label }) => (
  <div style={{ 
    display: 'flex', 
    flexDirection: horizontal ? 'row' : 'column', 
    alignItems: 'center', 
    gap: '8px',
    padding: horizontal ? '0 12px' : '12px 0'
  }}>
    <div style={{ 
      width: horizontal ? '40px' : '2px', 
      height: horizontal ? '2px' : '40px', 
      background: 'rgba(255,255,255,0.2)',
      position: 'relative'
    }}>
      <div style={{ 
        position: 'absolute', 
        right: horizontal ? '-2px' : 'auto', 
        bottom: horizontal ? 'auto' : '-2px', 
        border: '6px solid transparent',
        borderLeftColor: horizontal ? 'rgba(255,255,255,0.2)' : 'transparent',
        borderTopColor: horizontal ? 'transparent' : 'rgba(255,255,255,0.2)',
        top: horizontal ? '-5px' : 'auto',
        left: horizontal ? 'auto' : '-5px'
      }} />
    </div>
    {label && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{label}</span>}
  </div>
);

export const ThermalGraph = () => (
  <DiagramContainer title="Figure 9.1: Coupled Thermal Graph">
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
      <Box label="Battery Pack" sublabel="NMC/LFP cells" />
      <Arrow horizontal label="Coolant" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Box label="Central Thermal Module" color="var(--accent-secondary)" />
        <Arrow label="Refrigerant" />
        <Box label="Cabin HVAC" sublabel="Heat Pump" />
      </div>
      <Arrow horizontal label="Coolant" />
      <Box label="Motor/Inverter" sublabel="SiC Inverter" />
    </div>
  </DiagramContainer>
);

export const SIEMSStack = () => (
  <DiagramContainer title="Figure 14.1: Hybrid AI Architecture">
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '40px' }}>
        <Box label="DRL (SAC)" sublabel="Strategy Learner" color="#6366f1" />
        <Box label="PINN Surrogates" sublabel="Physics Learner" color="#ec4899" />
      </div>
      <Arrow />
      <Box label="MPC (OSQP)" sublabel="Constraint Enforcer" />
      <Arrow />
      <Box label="CBF Safety Filter" sublabel="Safety Invariant" color="var(--success)" />
      <Arrow label="Control Output" />
      <div style={{ display: 'flex', gap: '20px' }}>
        <Box label="BMS" />
        <Box label="Motor" />
        <Box label="Thermal" />
      </div>
    </div>
  </DiagramContainer>
);

export const BMSHierarchy = () => (
  <DiagramContainer title="Figure 7.1: BMS Functional Tiers">
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <Box label="BMS Master ECU (Tier 3)" sublabel="ASIL-D Integration" />
      <Arrow />
      <Box label="Module Management (Tier 2)" sublabel="Data Aggregator" />
      <Arrow />
      <div style={{ display: 'flex', gap: '12px' }}>
        <Box label="Cell Supervisor (Tier 1)" />
        <Box label="Cell Supervisor" />
        <Box label="Cell Supervisor" />
      </div>
    </div>
  </DiagramContainer>
);
