import React from 'react';
import '../styles/App.css';

// slots: [{ hora: '09:00', ocupado: false }, ...]
// props:
// - slots, selected (string), onSelect(hora), readOnly (bool), showLegend (bool)
export default function SlotsTable({ slots = [], selected = '', onSelect = () => {}, readOnly = false, showLegend = true }) {
  if (!slots) return null;

  return (
    <div className="slots-table-wrapper">
      <div className="slots-table">
        {slots.length === 0 ? (
          <div className="slots-empty">No hay franjas disponibles</div>
        ) : (
          slots.map(s => {
            const isSelected = selected === s.hora;
            const clazz = s.ocupado ? 'slot-ocupado' : isSelected ? 'slot-selected' : 'slot-libre';
            return (
              <button
                key={s.hora}
                type="button"
                className={`slot-cell ${clazz}`}
                disabled={s.ocupado}
                onClick={() => { if (!s.ocupado && onSelect) onSelect(s.hora); }}
                aria-pressed={isSelected}
              >
                {s.hora}
              </button>
            );
          })
        )}
      </div>
      {showLegend && (
        <div className="slots-legend">
          <span><span className="legend-dot legend-free"></span> Libre</span>
          <span><span className="legend-dot legend-selected"></span> Seleccionada</span>
          <span><span className="legend-dot legend-busy"></span> Ocupada</span>
        </div>
      )}
    </div>
  );
}
