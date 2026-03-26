import { useState, useEffect, useCallback } from "react";

// Precios de referencia ANTES del decreto (19 marzo 2026, según Ministerio de Hacienda)
const PRECIOS_ANTES = {
  "Precio Gasolina 95 E5": 1.80,
  "Precio Gasoleo A": 1.90,
  "Precio Gasolina 98 E5": 1.94,
};

// Ahorro teórico según BOE (RDL 7/2026)
const AHORRO_TEORICO = {
  "Precio Gasolina 95 E5": 0.29,
  "Precio Gasoleo A": 0.23,
  "Precio Gasolina 98 E5": 0.34,
};

const PRECIO_ESPERADO = {
  "Precio Gasolina 95 E5": 1.51,
  "Precio Gasoleo A": 1.67,
  "Precio Gasolina 98 E5": 1.60,
};

const PROVINCIAS = [
  { id: "46", name: "Valencia" }, { id: "08", name: "Barcelona" },
  { id: "28", name: "Madrid" }, { id: "41", name: "Sevilla" },
  { id: "29", name: "Málaga" }, { id: "03", name: "Alicante" },
  { id: "30", name: "Murcia" }, { id: "12", name: "Castellón" },
  { id: "43", name: "Tarragona" }, { id: "17", name: "Girona" },
  { id: "25", name: "Lleida" }, { id: "50", name: "Zaragoza" },
  { id: "11", name: "Cádiz" }, { id: "14", name: "Córdoba" },
  { id: "18", name: "Granada" }, { id: "04", name: "Almería" },
  { id: "21", name: "Huelva" }, { id: "23", name: "Jaén" },
  { id: "15", name: "A Coruña" }, { id: "33", name: "Asturias" },
  { id: "48", name: "Bizkaia" }, { id: "20", name: "Gipuzkoa" },
  { id: "01", name: "Álava" }, { id: "31", name: "Navarra" },
  { id: "26", name: "La Rioja" }, { id: "24", name: "León" },
  { id: "47", name: "Valladolid" }, { id: "37", name: "Salamanca" },
  { id: "49", name: "Zamora" }, { id: "09", name: "Burgos" },
  { id: "45", name: "Toledo" }, { id: "13", name: "Ciudad Real" },
  { id: "02", name: "Albacete" }, { id: "16", name: "Cuenca" },
  { id: "19", name: "Guadalajara" }, { id: "05", name: "Ávila" },
  { id: "40", name: "Segovia" }, { id: "34", name: "Palencia" },
  { id: "42", name: "Soria" }, { id: "44", name: "Teruel" },
  { id: "10", name: "Cáceres" }, { id: "06", name: "Badajoz" },
  { id: "27", name: "Lugo" }, { id: "32", name: "Ourense" },
  { id: "36", name: "Pontevedra" }, { id: "39", name: "Cantabria" },
  { id: "22", name: "Huesca" }, { id: "07", name: "Baleares" },
  { id: "35", name: "Las Palmas" }, { id: "38", name: "Tenerife" },
  { id: "51", name: "Ceuta" }, { id: "52", name: "Melilla" },
].sort((a, b) => a.name.localeCompare(b.name));

const COMBUSTIBLES = [
  { key: "Precio Gasolina 95 E5", label: "Gasolina 95", color: "#22c55e", emoji: "⛽" },
  { key: "Precio Gasoleo A", label: "Diésel", color: "#3b82f6", emoji: "🚛" },
  { key: "Precio Gasolina 98 E5", label: "Gasolina 98", color: "#f59e0b", emoji: "🏎️" },
];

function parsePrice(str) {
  if (!str || str.trim() === "") return null;
  const parsed = parseFloat(str.replace(",", "."));
  return isNaN(parsed) ? null : parsed;
}

function DescuentoMeter({ precio, fuelKey }) {
  const antes = PRECIOS_ANTES[fuelKey];
  const teorico = AHORRO_TEORICO[fuelKey];
  const ahorro_real = antes - precio;
  const pct = Math.min(100, Math.max(0, (ahorro_real / teorico) * 100));

  let color, badge, msg;
  if (ahorro_real >= teorico * 0.9) {
    color = "#22c55e"; 
    badge = "✅ Completo"; 
    msg = `Aplica los ~${(teorico*100).toFixed(0)}ct`;
  } else if (ahorro_real >= teorico * 0.6) {
    color = "#f59e0b"; 
    badge = "⚠️ Parcial"; 
    msg = `Solo ${(ahorro_real*100).toFixed(0)}ct de ${(teorico*100).toFixed(0)}ct`;
  } else if (ahorro_real > 0) {
    color = "#ef4444"; 
    badge = "❌ Insuficiente"; 
    msg = `Apenas ${(ahorro_real*100).toFixed(0)}ct de ${(teorico*100).toFixed(0)}ct`;
  } else {
    color = "#7c3aed"; 
    badge = "🚨 No aplica"; 
    msg = "Precio superior al pre-decreto";
  }

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color, background: color + "20", padding: "1px 6px", borderRadius: 10 }}>
          {badge}
        </span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{msg}</span>
      </div>
      <div style={{ height: 5, background: "#1f2937", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function StationCard({ station, rank, fuelKey, fuelLabel }) {
  const precio = parsePrice(station[fuelKey]);
  const antes = PRECIOS_ANTES[fuelKey];
  
  if (!precio) return null;
  
  const ahorro = antes - precio;

  return (
    <div style={{
      background: rank === 1 ? "linear-gradient(135deg, #064e3b, #065f46)" : "#111827",
      border: `1px solid ${rank === 1 ? "#10b981" : "#1f2937"}`,
      borderRadius: 12, 
      padding: "12px 14px", 
      marginBottom: 8,
      position: "relative", 
      overflow: "hidden"
    }}>
      {rank === 1 && (
        <div style={{ position: "absolute", top: 8, right: 10, fontSize: 18 }}>🏆</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{
              background: "#374151", 
              color: "#9ca3af", 
              borderRadius: "50%",
              width: 20, 
              height: 20, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: 10, 
              fontWeight: 700, 
              flexShrink: 0
            }}>
              {rank}
            </span>
            <span style={{ 
              fontSize: 13, 
              fontWeight: 700, 
              color: "#f9fafb", 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis" 
            }}>
              {station["Rótulo"] || "Sin nombre"}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", paddingLeft: 26 }}>
            {station["Dirección"]}, {station["Localidad"]}
          </div>
        </div>
        <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: rank === 1 ? "#34d399" : "#f9fafb" }}>
            {precio.toFixed(3)}€
          </div>
          <div style={{ fontSize: 10, color: ahorro > 0 ? "#34d399" : "#ef4444" }}>
            {ahorro > 0 ? `−${(ahorro*100).toFixed(1)}ct` : `+${(Math.abs(ahorro)*100).toFixed(1)}ct`} vs pre-decreto
          </div>
        </div>
      </div>
      <div style={{ paddingLeft: 26, marginTop: 4 }}>
        <DescuentoMeter precio={precio} fuelKey={fuelKey} />
      </div>
    </div>
  );
}

function InfoBOE() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#1e1b4b", border: "1px solid #4338ca", borderRadius: 12, padding: 14, marginBottom: 16 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>
          📋 RDL 7/2026 — ¿Qué dice el BOE?
        </span>
        <span style={{ color: "#818cf8", fontSize: 14 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#c7d2fe", lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 8px" }}>
            <strong>Publicado:</strong> 21 marzo 2026 · <strong>En vigor:</strong> desde el 22 marzo 2026
          </p>
          <p style={{ margin: "0 0 8px" }}>
            Bajada del <strong>IVA del 21% al 10%</strong> en carburantes + eliminación del <strong>impuesto especial de hidrocarburos</strong> hasta el mínimo UE.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #4338ca" }}>
                <th style={{ textAlign: "left", padding: "4px 8px", color: "#818cf8" }}>Combustible</th>
                <th style={{ textAlign: "right", padding: "4px 8px", color: "#818cf8" }}>Antes</th>
                <th style={{ textAlign: "right", padding: "4px 8px", color: "#818cf8" }}>Esperado</th>
                <th style={{ textAlign: "right", padding: "4px 8px", color: "#818cf8" }}>Ahorro</th>
              </tr>
            </thead>
            <tbody>
              {COMBUSTIBLES.map(c => (
                <tr key={c.key} style={{ borderBottom: "1px solid #312e81" }}>
                  <td style={{ padding: "4px 8px" }}>{c.label}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>{PRECIOS_ANTES[c.key].toFixed(2)}€</td>
                  <td style={{ textAlign: "right", padding: "4px 8px", color: "#34d399" }}>{PRECIO_ESPERADO[c.key].toFixed(2)}€</td>
                  <td style={{ textAlign: "right", padding: "4px 8px", color: "#fbbf24" }}>−{(AHORRO_TEORICO[c.key]*100).toFixed(0)}ct</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: "8px 0 0", color: "#a5b4fc", fontSize: 11 }}>
            ⚠️ Las petroleras deben trasladar la rebaja al precio final. Esta app verifica si lo están haciendo.
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [provincia, setProvincia] = useState("46");
  const [fuelKey, setFuelKey] = useState("Precio Gasolina 95 E5");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStations([]);
    setStats(null);
    try {
      const url = `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHoraAcceso/FiltroProvincia/${provincia}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const data = await res.json();
      if (data.ResultadoConsulta !== "OK") throw new Error("La API no devolvió datos válidos");

      setFecha(data.Fecha);
      const lista = (data.ListaEESSPrecio || [])
        .filter(s => {
          const p = parsePrice(s[fuelKey]);
          return p !== null && p > 0;
        })
        .sort((a, b) => parsePrice(a[fuelKey]) - parsePrice(b[fuelKey]));

      setStations(lista);

      // Estadísticas del descuento
      const precios = lista.map(s => parsePrice(s[fuelKey]));
      const antes = PRECIOS_ANTES[fuelKey];
      const teorico = AHORRO_TEORICO[fuelKey];
      const media = precios.reduce((a, b) => a + b, 0) / precios.length;
      const ahorroMedio = antes - media;
      const completos = lista.filter(s => (antes - parsePrice(s[fuelKey])) >= teorico * 0.9).length;
      const parciales = lista.filter(s => {
        const a = antes - parsePrice(s[fuelKey]);
        return a >= teorico * 0.6 && a < teorico * 0.9;
      }).length;
      const insuficientes = lista.length - completos - parciales;

      setStats({ media, ahorroMedio, completos, parciales, insuficientes, total: lista.length, teorico });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [provincia, fuelKey]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const fuelInfo = COMBUSTIBLES.find(c => c.key === fuelKey);
  const top20 = stations.slice(0, 20);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030712",
      color: "#f9fafb",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "0 0 40px"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
        borderBottom: "1px solid #1f2937",
        padding: "20px 16px 16px"
      }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>
          ⛽ Gasolineras España
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
          ¿Se aplica realmente el descuento del BOE?
        </p>
      </div>

      <div style={{ padding: "16px" }}>
        <InfoBOE />

        {/* Filtros */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 10, color: "#6b7280", display: "block", marginBottom: 4 }}>PROVINCIA</label>
            <select
              value={provincia}
              onChange={e => setProvincia(e.target.value)}
              style={{
                width: "100%", 
                background: "#111827", 
                color: "#f9fafb",
                border: "1px solid #374151", 
                borderRadius: 8, 
                padding: "8px 10px",
                fontSize: 13, 
                cursor: "pointer"
              }}
            >
              {PROVINCIAS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 10, color: "#6b7280", display: "block", marginBottom: 4 }}>COMBUSTIBLE</label>
            <select
              value={fuelKey}
              onChange={e => setFuelKey(e.target.value)}
              style={{
                width: "100%", 
                background: "#111827", 
                color: "#f9fafb",
                border: "1px solid #374151", 
                borderRadius: 8, 
                padding: "8px 10px",
                fontSize: 13, 
                cursor: "pointer"
              }}
            >
              {COMBUSTIBLES.map(c => (
                <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats del descuento */}
        {stats && (
          <div style={{
            background: "#111827", 
            border: "1px solid #1f2937",
            borderRadius: 12, 
            padding: 14, 
            marginBottom: 16
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 10 }}>
              📊 ANÁLISIS DESCUENTO BOE — {PROVINCIAS.find(p=>p.id===provincia)?.name} · {fuelInfo?.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#6b7280" }}>Precio medio actual</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: fuelInfo?.color }}>{stats.media.toFixed(3)}€</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>Esperado: {PRECIO_ESPERADO[fuelKey].toFixed(3)}€</div>
              </div>
              <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#6b7280" }}>Ahorro medio aplicado</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: stats.ahorroMedio > 0 ? "#34d399" : "#ef4444" }}>
                  {stats.ahorroMedio > 0 ? "−" : "+"}{Math.abs(stats.ahorroMedio * 100).toFixed(1)}ct
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>Teórico: −{(stats.teorico*100).toFixed(0)}ct</div>
              </div>
            </div>

            {/* Barra de cumplimiento */}
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 6 }}>
              Cumplimiento del descuento en {stats.total} gasolineras:
            </div>
            <div style={{ height: 20, background: "#1f2937", borderRadius: 10, overflow: "hidden", display: "flex" }}>
              {stats.total > 0 && (
                <>
                  <div style={{ width: `${(stats.completos/stats.total)*100}%`, background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", minWidth: stats.completos > 0 ? 20 : 0 }}>
                    {stats.completos > 0 && stats.completos}
                  </div>
                  <div style={{ width: `${(stats.parciales/stats.total)*100}%`, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", minWidth: stats.parciales > 0 ? 20 : 0 }}>
                    {stats.parciales > 0 && stats.parciales}
                  </div>
                  <div style={{ flex: 1, background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white" }}>
                    {stats.insuficientes > 0 && stats.insuficientes}
                  </div>
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: "#9ca3af" }}>
              <span>🟢 Completo: {stats.completos}</span>
              <span>🟡 Parcial: {stats.parciales}</span>
              <span>🔴 Insuficiente: {stats.insuficientes}</span>
            </div>

            {fecha && (
              <div style={{ fontSize: 10, color: "#4b5563", marginTop: 8 }}>
                📡 Datos MINETUR · Actualizado: {fecha}
              </div>
            )}
          </div>
        )}

        {/* Lista de gasolineras */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10 }}>
          🏅 TOP 20 MÁS BARATAS — {fuelInfo?.emoji} {fuelInfo?.label}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#4b5563" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>⛽</div>
            <div>Cargando precios en tiempo real...</div>
          </div>
        )}

        {error && (
          <div style={{
            background: "#1c0a0a", 
            border: "1px solid #7f1d1d",
            borderRadius: 12, 
            padding: 16, 
            textAlign: "center", 
            color: "#fca5a5"
          }}>
            <div style={{ fontSize: 24 }}>⚠️</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Error al cargar datos</div>
            <div style={{ fontSize: 12 }}>{error}</div>
            <button
              onClick={fetchData}
              style={{
                marginTop: 12, 
                background: "#7f1d1d", 
                color: "white",
                border: "none", 
                borderRadius: 8, 
                padding: "8px 16px",
                cursor: "pointer", 
                fontSize: 13
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && top20.length > 0 && top20.map((s, i) => (
          <StationCard 
            key={s.IDEESS || i} 
            station={s} 
            rank={i + 1} 
            fuelKey={fuelKey} 
            fuelLabel={fuelInfo?.label} 
          />
        ))}

        {!loading && !error && top20.length === 0 && (
          <div style={{ textAlign: "center", padding: 30, color: "#4b5563" }}>
            No hay datos disponibles para esta selección.
          </div>
        )}
      </div>
    </div>
  );
    }  { id: "45", name: "Toledo" }, { id: "13", name: "Ciudad Real" },
  { id: "02", name: "Albacete" }, { id: "16", name: "Cuenca" },
  { id: "19", name: "Guadalajara" }, { id: "05", name: "Ávila" },
  { id: "40", name: "Segovia" }, { id: "34", name: "Palencia" },
  { id: "42", name: "Soria" }, { id: "44", name: "Teruel" },
  { id: "10", name: "Cáceres" }, { id: "06", name: "Badajoz" },
  { id: "27", name: "Lugo" }, { id: "32", name: "Ourense" },
  { id: "36", name: "Pontevedra" }, { id: "39", name: "Cantabria" },
  { id: "22", name: "Huesca" }, { id: "07", name: "Baleares" },
  { id: "35", name: "Las Palmas" }, { id: "38", name: "Tenerife" },
  { id: "51", name: "Ceuta" }, { id: "52", name: "Melilla" },
].sort((a, b) => a.name.localeCompare(b.name));

const COMBUSTIBLES = [
  { key: "Precio Gasolina 95 E5", label: "Gasolina 95", color: "#22c55e", emoji: "⛽" },
  { key: "Precio Gasoleo A", label: "Diésel", color: "#3b82f6", emoji: "🚛" },
  { key: "Precio Gasolina 98 E5", label: "Gasolina 98", color: "#f59e0b", emoji: "🏎️" },
];

function parsePrice(str) {
  if (!str || str.trim() === "") return null;
  return parseFloat(str.replace(",", "."));
}

function DescuentoMeter({ precio, fuelKey }) {
  const antes = PRECIOS_ANTES[fuelKey];
  const esperado = PRECIO_ESPERADO[fuelKey];
  const teorico = AHORRO_TEORICO[fuelKey];
  const ahorro_real = antes - precio;
  const pct = Math.min(100, Math.max(0, (ahorro_real / teorico) * 100));

  let color, badge, msg;
  if (ahorro_real >= teorico * 0.9) {
    color = "#22c55e"; badge = "✅ Completo"; msg = `Aplica los ~${(teorico*100).toFixed(0)}ct`;
  } else if (ahorro_real >= teorico * 0.6) {
    color = "#f59e0b"; badge = "⚠️ Parcial"; msg = `Solo ${(ahorro_real*100).toFixed(0)}ct de ${(teorico*100).toFixed(0)}ct`;
  } else if (ahorro_real > 0) {
    color = "#ef4444"; badge = "❌ Insuficiente"; msg = `Apenas ${(ahorro_real*100).toFixed(0)}ct de ${(teorico*100).toFixed(0)}ct`;
  } else {
    color = "#7c3aed"; badge = "🚨 No aplica"; msg = "Precio superior al pre-decreto";
  }

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color, background: color + "20", padding: "1px 6px", borderRadius: 10 }}>{badge}</span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>{msg}</span>
      </div>
      <div style={{ height: 5, background: "#1f2937", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function StationCard({ station, rank, fuelKey, fuelLabel }) {
  const precio = parsePrice(station[fuelKey]);
  const antes = PRECIOS_ANTES[fuelKey];
  const ahorro = antes - precio;

  return (
    <div style={{
      background: rank === 1 ? "linear-gradient(135deg, #064e3b, #065f46)" : "#111827",
      border: `1px solid ${rank === 1 ? "#10b981" : "#1f2937"}`,
      borderRadius: 12, padding: "12px 14px", marginBottom: 8,
      position: "relative", overflow: "hidden"
    }}>
      {rank === 1 && (
        <div style={{ position: "absolute", top: 8, right: 10, fontSize: 18 }}>🏆</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{
              background: "#374151", color: "#9ca3af", borderRadius: "50%",
              width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, flexShrink: 0
            }}>{rank}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {station["Rótulo"] || "Sin nombre"}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", paddingLeft: 26 }}>
            {station["Dirección"]}, {station["Localidad"]}
          </div>
        </div>
        <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: rank === 1 ? "#34d399" : "#f9fafb" }}>
            {precio.toFixed(3)}€
          </div>
          <div style={{ fontSize: 10, color: ahorro > 0 ? "#34d399" : "#ef4444" }}>
            {ahorro > 0 ? `−${(ahorro*100).toFixed(1)}ct` : `+${(Math.abs(ahorro)*100).toFixed(1)}ct`} vs pre-decreto
          </div>
        </div>
      </div>
      <div style={{ paddingLeft: 26, marginTop: 4 }}>
        <DescuentoMeter precio={precio} fuelKey={fuelKey} />
      </div>
    </div>
  );
}

function InfoBOE() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#1e1b4b", border: "1px solid #4338ca", borderRadius: 12, padding: 14, marginBottom: 16 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>
          📋 RDL 7/2026 — ¿Qué dice el BOE?
        </span>
        <span style={{ color: "#818cf8", fontSize: 14 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ marginTop: 10, fontSize: 12, color: "#c7d2fe", lineHeight: 1.6 }}>
          <p style={{ margin: "0 0 8px" }}>
            <strong>Publicado:</strong> 21 marzo 2026 · <strong>En vigor:</strong> desde el 22 marzo 2026
          </p>
          <p style={{ margin: "0 0 8px" }}>
            Bajada del <strong>IVA del 21% al 10%</strong> en carburantes + eliminación del <strong>impuesto especial de hidrocarburos</strong> hasta el mínimo UE.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #4338ca" }}>
                <th style={{ textAlign: "left", padding: "4px 8px", color: "#818cf8" }}>Combustible</th>
                <th style={{ textAlign: "right", padding: "4px 8px", color: "#818cf8" }}>Antes</th>
                <th style={{ textAlign: "right", padding: "4px 8px", color: "#818cf8" }}>Esperado</th>
                <th style={{ textAlign: "right", padding: "4px 8px", color: "#818cf8" }}>Ahorro</th>
              </tr>
            </thead>
            <tbody>
              {COMBUSTIBLES.map(c => (
                <tr key={c.key} style={{ borderBottom: "1px solid #312e81" }}>
                  <td style={{ padding: "4px 8px" }}>{c.label}</td>
                  <td style={{ textAlign: "right", padding: "4px 8px" }}>{PRECIOS_ANTES[c.key].toFixed(2)}€</td>
                  <td style={{ textAlign: "right", padding: "4px 8px", color: "#34d399" }}>{PRECIO_ESPERADO[c.key].toFixed(2)}€</td>
                  <td style={{ textAlign: "right", padding: "4px 8px", color: "#fbbf24" }}>−{(AHORRO_TEORICO[c.key]*100).toFixed(0)}ct</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ margin: "8px 0 0", color: "#a5b4fc", fontSize: 11 }}>
            ⚠️ Las petroleras deben trasladar la rebaja al precio final. Esta app verifica si lo están haciendo.
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [provincia, setProvincia] = useState("46");
  const [fuelKey, setFuelKey] = useState("Precio Gasolina 95 E5");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStations([]);
    setStats(null);
    try {
      const url = `https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestresHoraAcceso/FiltroProvincia/${provincia}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      const data = await res.json();
      if (data.ResultadoConsulta !== "OK") throw new Error("La API no devolvió datos válidos");

      setFecha(data.Fecha);
      const lista = (data.ListaEESSPrecio || [])
        .filter(s => {
          const p = parsePrice(s[fuelKey]);
          return p !== null && p > 0;
        })
        .sort((a, b) => parsePrice(a[fuelKey]) - parsePrice(b[fuelKey]));

      setStations(lista);

      // Estadísticas del descuento
      const precios = lista.map(s => parsePrice(s[fuelKey]));
      const antes = PRECIOS_ANTES[fuelKey];
      const teorico = AHORRO_TEORICO[fuelKey];
      const media = precios.reduce((a, b) => a + b, 0) / precios.length;
      const ahorroMedio = antes - media;
      const completos = lista.filter(s => (antes - parsePrice(s[fuelKey])) >= teorico * 0.9).length;
      const parciales = lista.filter(s => {
        const a = antes - parsePrice(s[fuelKey]);
        return a >= teorico * 0.6 && a < teorico * 0.9;
      }).length;
      const insuficientes = lista.length - completos - parciales;

      setStats({ media, ahorroMedio, completos, parciales, insuficientes, total: lista.length, teorico });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [provincia, fuelKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fuelInfo = COMBUSTIBLES.find(c => c.key === fuelKey);
  const top20 = stations.slice(0, 20);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030712",
      color: "#f9fafb",
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: "0 0 40px"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
        borderBottom: "1px solid #1f2937",
        padding: "20px 16px 16px"
      }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, letterSpacing: -0.5 }}>
          ⛽ Gasolineras España
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>
          ¿Se aplica realmente el descuento del BOE?
        </p>
      </div>

      <div style={{ padding: "16px" }}>
        <InfoBOE />

        {/* Filtros */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 10, color: "#6b7280", display: "block", marginBottom: 4 }}>PROVINCIA</label>
            <select
              value={provincia}
              onChange={e => setProvincia(e.target.value)}
              style={{
                width: "100%", background: "#111827", color: "#f9fafb",
                border: "1px solid #374151", borderRadius: 8, padding: "8px 10px",
                fontSize: 13, cursor: "pointer"
              }}
            >
              {PROVINCIAS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 10, color: "#6b7280", display: "block", marginBottom: 4 }}>COMBUSTIBLE</label>
            <select
              value={fuelKey}
              onChange={e => setFuelKey(e.target.value)}
              style={{
                width: "100%", background: "#111827", color: "#f9fafb",
                border: "1px solid #374151", borderRadius: 8, padding: "8px 10px",
                fontSize: 13, cursor: "pointer"
              }}
            >
              {COMBUSTIBLES.map(c => (
                <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats del descuento */}
        {stats && (
          <div style={{
            background: "#111827", border: "1px solid #1f2937",
            borderRadius: 12, padding: 14, marginBottom: 16
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 10 }}>
              📊 ANÁLISIS DESCUENTO BOE — {PROVINCIAS.find(p=>p.id===provincia)?.name} · {fuelInfo.label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#6b7280" }}>Precio medio actual</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: fuelInfo.color }}>{stats.media.toFixed(3)}€</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>Esperado: {PRECIO_ESPERADO[fuelKey].toFixed(3)}€</div>
              </div>
              <div style={{ background: "#0f172a", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#6b7280" }}>Ahorro medio aplicado</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: stats.ahorroMedio > 0 ? "#34d399" : "#ef4444" }}>
                  {stats.ahorroMedio > 0 ? "−" : "+"}{Math.abs(stats.ahorroMedio * 100).toFixed(1)}ct
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>Teórico: −{(stats.teorico*100).toFixed(0)}ct</div>
              </div>
            </div>

            {/* Barra de cumplimiento */}
            <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 6 }}>
              Cumplimiento del descuento en {stats.total} gasolineras:
            </div>
            <div style={{ height: 20, background: "#1f2937", borderRadius: 10, overflow: "hidden", display: "flex" }}>
              {stats.total > 0 && <>
                <div style={{ width: `${(stats.completos/stats.total)*100}%`, background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", minWidth: stats.completos > 0 ? 20 : 0 }}>
                  {stats.completos > 0 && stats.completos}
                </div>
                <div style={{ width: `${(stats.parciales/stats.total)*100}%`, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", minWidth: stats.parciales > 0 ? 20 : 0 }}>
                  {stats.parciales > 0 && stats.parciales}
                </div>
                <div style={{ flex: 1, background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white" }}>
                  {stats.insuficientes > 0 && stats.insuficientes}
                </div>
              </>}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 10, color: "#9ca3af" }}>
              <span>🟢 Completo: {stats.completos}</span>
              <span>🟡 Parcial: {stats.parciales}</span>
              <span>🔴 Insuficiente: {stats.insuficientes}</span>
            </div>

            {fecha && (
              <div style={{ fontSize: 10, color: "#4b5563", marginTop: 8 }}>
                📡 Datos MINETUR · Actualizado: {fecha}
              </div>
            )}
          </div>
        )}

        {/* Lista de gasolineras */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10 }}>
          🏅 TOP 20 MÁS BARATAS — {fuelInfo.emoji} {fuelInfo.label}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: "#4b5563" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>⛽</div>
            <div>Cargando precios en tiempo real...</div>
          </div>
        )}

        {error && (
          <div style={{
            background: "#1c0a0a", border: "1px solid #7f1d1d",
            borderRadius: 12, padding: 16, textAlign: "center", color: "#fca5a5"
          }}>
            <div style={{ fontSize: 24 }}>⚠️</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Error al cargar datos</div>
            <div style={{ fontSize: 12 }}>{error}</div>
            <button
              onClick={fetchData}
              style={{
                marginTop: 12, background: "#7f1d1d", color: "white",
                border: "none", borderRadius: 8, padding: "8px 16px",
                cursor: "pointer", fontSize: 13
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && top20.map((s, i) => (
          <StationCard key={s.IDEESS || i} station={s} rank={i + 1} fuelKey={fuelKey} fuelLabel={fuelInfo.label} />
        ))}

        {!loading && !error && top20.length === 0 && (
          <div style={{ textAlign: "center", padding: 30, color: "#4b5563" }}>
            No hay datos disponibles para esta selección.
          </div>
        )}
      </div>
    </div>
  );
}
