import { useState, useEffect } from "react";

// =====================================================
// ここにGASのWebアプリURLを貼り付けてください
// =====================================================
const GAS_URL = "https://script.google.com/macros/s/AKfycbx0xpRse0dQx-RXZa2edqvwckcxgiiGSQk4QjIITdRyQm6Q18-9xQ8zCAUgky7PgZ0hbw/exec";

const STATUS_CONFIG = {
  available: { label: "空き",   color: "#4ade80", bg: "#052e16", border: "#16a34a" },
  occupied:  { label: "使用中", color: "#f87171", bg: "#2d0a0a", border: "#dc2626" },
  cleaning:  { label: "清掃中", color: "#fbbf24", bg: "#1c1100", border: "#d97706" },
};

// GASからデータ取得
async function fetchSeats() {
  const res = await fetch(GAS_URL);
  return await res.json();
}

// GASへステータス更新を送信
async function postSeatUpdate(id, status) {
  const res = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify({ id, status }),
  });
  return await res.json();
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      borderRadius: 4, padding: "2px 7px",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

function SeatDots({ capacity, status }) {
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {Array.from({ length: capacity }).map((_, i) => (
        <div key={i} style={{
          width: 11, height: 15, borderRadius: 3,
          background: status === "available" ? "transparent" : "#1e1e1e",
          border: `1.5px solid ${status === "available" ? STATUS_CONFIG.available.color : "#2a2a2a"}`,
          opacity: status === "available" ? 0.9 : 0.35,
        }} />
      ))}
      <span style={{ fontSize: 9, color: "#555", alignSelf: "center", marginLeft: 2 }}>{capacity}席</span>
    </div>
  );
}

function TableCard({ seat, isStaff, onStatusChange, loading }) {
  const cfg = STATUS_CONFIG[seat.status];
  const active = seat.status === "available";
  return (
    <div style={{
      background: "#111",
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 12,
      padding: "11px 11px 9px",
      display: "flex", flexDirection: "column", gap: 7,
      boxShadow: active ? "0 0 14px rgba(74,222,128,0.09)" : "none",
      transition: "all 0.2s",
      minHeight: 90,
      position: "relative",
      opacity: loading ? 0.6 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: "0.15em" }}>TABLE</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
            {seat.id.replace("T", "")}
          </div>
        </div>
        <StatusBadge status={seat.status} />
      </div>

      <SeatDots capacity={seat.capacity} status={seat.status} />

      {seat.hasSwitch && (
        <div style={{
          position: "absolute", bottom: 8, right: 9,
          display: "flex", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.05em", color: active ? "#888" : "#333", transition: "color 0.3s" }}>
            Nintendo Switch
          </span>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#e60012" : "#2a2a2a", display: "inline-block", boxShadow: active ? "0 0 4px rgba(230,0,18,0.5)" : "none", transition: "all 0.3s" }} />
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#0ab9e6" : "#2a2a2a", display: "inline-block", boxShadow: active ? "0 0 4px rgba(10,185,230,0.5)" : "none", transition: "all 0.3s" }} />
        </div>
      )}

      {isStaff && (
        <div style={{ display: "flex", gap: 5, marginTop: seat.hasSwitch ? 8 : 1 }}>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <button key={key} onClick={() => onStatusChange(seat.id, key)}
              disabled={loading}
              style={{
                flex: 1, padding: "5px 0", fontSize: 9, fontWeight: 700,
                border: `1px solid ${seat.status === key ? val.color : "#2a2a2a"}`,
                borderRadius: 6, cursor: loading ? "not-allowed" : "pointer",
                background: seat.status === key ? val.bg : "#161616",
                color: seat.status === key ? val.color : "#444",
                transition: "all 0.15s",
              }}>
              {val.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CounterSeat({ seat, isStaff, onStatusChange, loading }) {
  return (
    <div style={{
      background: "#111",
      border: `1.5px solid ${STATUS_CONFIG[seat.status].border}`,
      borderRadius: 10, padding: "10px 10px 9px",
      display: "flex", flexDirection: "column", gap: 6, flex: 1,
      opacity: loading ? 0.6 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#e5e5e5", fontWeight: 600 }}>
          {seat.label.replace("カウンター", "C")}
        </span>
        <StatusBadge status={seat.status} />
      </div>
      {isStaff && (
        <div style={{ display: "flex", gap: 4 }}>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <button key={key} onClick={() => onStatusChange(seat.id, key)}
              disabled={loading}
              style={{
                flex: 1, padding: "4px 0", fontSize: 9, fontWeight: 700,
                border: `1px solid ${seat.status === key ? val.color : "#2a2a2a"}`,
                borderRadius: 5, cursor: loading ? "not-allowed" : "pointer",
                background: seat.status === key ? val.bg : "#161616",
                color: seat.status === key ? val.color : "#444",
              }}>
              {val.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [seats, setSeats] = useState([]);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  // 初回ロード
  useEffect(() => {
    loadSeats();
  }, []);

  const loadSeats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSeats();
      setSeats(data);
      setUpdatedAt(new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (seatId, newStatus) => {
    // 楽観的UI更新（先に画面に反映）
    setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: newStatus } : s));
    try {
      setUpdating(true);
      const data = await postSeatUpdate(seatId, newStatus);
      setSeats(data);
      setUpdatedAt(new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setError("更新に失敗しました");
      loadSeats(); // 失敗したら再取得して戻す
    } finally {
      setUpdating(false);
    }
  };

  const tables  = seats.filter(s => s.type === "table");
  const counters = seats.filter(s => s.type === "counter");
  const byId = Object.fromEntries(tables.map(t => [t.id, t]));

  const availableCount = seats.filter(s => s.status === "available").length;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#444", letterSpacing: "0.15em" }}>LOADING...</div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      fontFamily: "'Noto Sans JP', 'Helvetica Neue', sans-serif",
      color: "#e5e5e5", maxWidth: 420, margin: "0 auto", paddingBottom: 48,
    }}>
      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #181818" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.22em", color: "#3a3a3a", textTransform: "uppercase", marginBottom: 4 }}>
              SEAT AVAILABILITY
            </div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>
              空席情報
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1, color: availableCount > 0 ? "#4ade80" : "#f87171" }}>
              {availableCount}
            </div>
            <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>席 空き</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 14, alignItems: "center" }}>
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: val.color }} />
              <span style={{ fontSize: 10, color: "#555" }}>{val.label}</span>
            </div>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#303030" }}>
            {updating ? "更新中..." : updatedAt ? `${updatedAt} 更新` : ""}
          </span>
        </div>
        {error && (
          <div style={{ marginTop: 8, fontSize: 10, color: "#f87171", background: "#2d0a0a", border: "1px solid #dc2626", borderRadius: 6, padding: "4px 10px" }}>
            ⚠ {error}
          </div>
        )}
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        {/* テーブル席 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#3a3a3a", textTransform: "uppercase", marginBottom: 12 }}>
            ── テーブル席
          </div>
          <div style={{
            display: "grid",
            gridTemplateAreas: `"t3 t2" "t4 t1"`,
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}>
            {[["t3","T3"],["t2","T2"],["t4","T4"],["t1","T1"]].map(([area, id]) => (
              byId[id] ? (
                <div key={id} style={{ gridArea: area }}>
                  <TableCard seat={byId[id]} isStaff={isStaff} onStatusChange={handleStatusChange} loading={updating} />
                </div>
              ) : null
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 2px 0", fontSize: 9, color: "#242424" }}>
            <span>← 入口側</span>
            <span>奥 →</span>
          </div>
        </div>

        {/* カウンター席 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#3a3a3a", textTransform: "uppercase", marginBottom: 12 }}>
            ── カウンター席
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {counters.map(seat => (
              <CounterSeat key={seat.id} seat={seat} isStaff={isStaff} onStatusChange={handleStatusChange} loading={updating} />
            ))}
          </div>
        </div>

        {/* 再読み込みボタン（お客様モードのみ） */}
        {!isStaff && (
          <button onClick={loadSeats} style={{
            width: "100%", padding: "12px 0", marginBottom: 20,
            background: "transparent", border: "1px solid #222",
            borderRadius: 10, color: "#444", fontSize: 12, fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.05em",
          }}>
            ↻ 最新情報に更新
          </button>
        )}

        {/* デモ切り替え */}
        <div style={{
          padding: "14px 16px", border: "1px dashed #1c1c1c", borderRadius: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "#3a3a3a" }}>表示モード（デモ用）</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: isStaff ? "#fbbf24" : "#4ade80" }}>
              {isStaff ? "🔧 スタッフモード" : "👤 お客様モード"}
            </div>
          </div>
          <button onClick={() => setIsStaff(v => !v)} style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            border: "1px solid #222", background: "#141414", color: "#777", cursor: "pointer",
          }}>
            切り替え
          </button>
        </div>
      </div>
    </div>
  );
}
