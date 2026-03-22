import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModuleActionModal from "../../components/progress/ModuleActionModal";

const modules = [
  { id: "web-dev", name: "Web Development" },
  { id: "se", name: "Software Engineering" },
  { id: "dbms", name: "Database Systems" },
  { id: "oop", name: "Object Oriented Programming" },
];

const moduleTypes = modules.map((module, index) => ({
  id: module.id,
  label: module.name,
  description: 'Choose quiz or self check for this module.',
  icon: module.name.split(" ").map((w) => w[0]).slice(0, 2).join(""),
  color: ['#3b82f6', '#f97316', '#22c55e', '#a855f7'][index],
  available: true,
}))

function ProgressModules() {
  const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();

  const handleTypeSelect = (type) => {
    if (!type.available) return
    setSelectedModule(modules.find(m => m.id === type.id))
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate("/progress-tracker")}
        style={{
          marginBottom: '1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#ffffff',
          color: '#374151',
          border: '1px solid #d1d5db',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          fontSize: 18,
          fontWeight: 500,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#f9fafb'
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#ffffff'
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        ←
      </button>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        borderRadius: 20,
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(249,115,22,0.28)',
      }}>
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', right: 100, bottom: -50,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 18 }}>📊</span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Dashboard
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
          Module Quiz & Self Check
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
          Choose a module to start a quiz or practice with self checks.
        </p>
      </div>

      {/* Module grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
      }}>
        {moduleTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleTypeSelect(type)}
            disabled={!type.available}
            style={{
              background: '#ffffff',
              border: `1.5px solid ${type.available ? '#e8ecf4' : '#f0f2f8'}`,
              borderRadius: 18,
              padding: '1.5rem',
              cursor: type.available ? 'pointer' : 'not-allowed',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              opacity: type.available ? 1 : 0.6,
              transform: 'translateY(0)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (type.available) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
                e.target.style.borderColor = type.color
              }
            }}
            onMouseLeave={(e) => {
              if (type.available) {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                e.target.style.borderColor = '#e8ecf4'
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `linear-gradient(135deg, ${type.color}20, ${type.color}30)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 'bold',
              }}>
                {type.icon}
              </div>
              <span style={{
                padding: '4px 8px',
                fontSize: 10, fontWeight: 700,
                color: '#10b981', background: '#d1fae5',
                borderRadius: 12, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Available
              </span>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#1f2937' }}>
              {type.label}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
              {type.description}
            </p>
          </button>
        ))}
      </div>

      {selectedModule && (
        <ModuleActionModal
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}
      </div>
    </div>
  );
}

export default ProgressModules;