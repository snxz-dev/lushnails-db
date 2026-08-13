import React from 'react';
import '../styles/App.css';

// Props:
// - slots: [{hora, ocupado}],
// - selected, onSelect(hora), readOnly(boolean), cols(number)
export default function SlotsMatrix({ slots = [], selected = '', onSelect = () => {}, readOnly = false, cols = 6 }) {
  if (!slots) return null;

  const rows = [];
  for (let i = 0; i < slots.length; i += cols) {
    rows.push(slots.slice(i, i + cols));
  }

  return (
    <div className="slots-matrix-wrapper">
      <table className="slots-matrix" role="grid">
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map(s => {
                const isSelected = selected === s.hora;
                const cls = s.ocupado ? 'seat-busy' : isSelected ? 'seat-selected' : 'seat-free';
                return (
                  <td key={s.hora} className={`seat-cell ${cls}`}>
                    <button
                      type="button"
                      disabled={s.ocupado || readOnly}
                      onClick={() => !s.ocupado && onSelect(s.hora)}
                      aria-pressed={isSelected}
                      className="seat-btn"
                    >
                      {s.hora}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="slots-matrix-legend">
        <span><span className="legend-dot legend-free"></span> Libre</span>
        <span><span className="legend-dot legend-selected"></span> Seleccionada</span>
        <span><span className="legend-dot legend-busy"></span> Ocupada</span>
      </div>
    </div>
  );
}
