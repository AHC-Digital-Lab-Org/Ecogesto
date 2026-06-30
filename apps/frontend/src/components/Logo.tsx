export function Logo() {
  return (
    <div className="logo-mark" aria-label="Asociación Huella de Carbono">
      <svg width="44" height="44" viewBox="0 0 46 46" role="img" aria-hidden="true">
        <rect x="1" y="1" width="44" height="44" rx="11" fill="#EAF1E6" stroke="#4F9447" strokeWidth="1.5" />
        <path d="M14.5 27c-2.8 0-4.8-1.9-4.8-4.3s2-4.3 4.6-4.3c.6-2.8 2.9-4.7 5.8-4.7s5.2 1.9 5.8 4.7c2.4 0 3.9 1.7 3.9 3.9 0 2.4-2 4.7-4.9 4.7z" fill="#fff" stroke="#537358" strokeWidth="1.3" />
        <text x="22.5" y="23.5" textAnchor="middle" fontFamily="Source Sans 3, sans-serif" fontSize="7.5" fontWeight="700" fill="#537358">CO2</text>
        <path d="M22.5 28.5 L22.5 34 M19.6 31.3 L22.5 34 L25.4 31.3" stroke="#4F9447" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="logo-copy">
        <div className="logo-ahc">AHC</div>
        <div className="logo-subtitle">ASOCIACIÓN HUELLA DE CARBONO</div>
      </div>
      <div className="logo-divider" />
      <div className="logo-product">EcoGestos</div>
    </div>
  );
}
