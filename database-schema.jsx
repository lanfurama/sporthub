import { useState } from "react";

const TABLES = {
  users: {
    label: "users", icon: "👤", color: "#6366F1", x: 60, y: 60,
    cols: [
      { name: "id", type: "UUID", pk: true },
      { name: "name", type: "VARCHAR(100)", nn: true },
      { name: "phone", type: "VARCHAR(15)", unique: true },
      { name: "email", type: "VARCHAR(255)", unique: true },
      { name: "password_hash", type: "VARCHAR(255)" },
      { name: "role", type: "ENUM", nn: true, default: "guest" },
      { name: "created_at", type: "TIMESTAMPTZ", default: "NOW()" },
      { name: "updated_at", type: "TIMESTAMPTZ" },
    ]
  },
  memberships: {
    label: "memberships", icon: "⭐", color: "#F59E0B", x: 420, y: 40,
    cols: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: "users.id", nn: true },
      { name: "plan", type: "ENUM", nn: true, note: "basic|prime|vip" },
      { name: "status", type: "ENUM", default: "active" },
      { name: "started_at", type: "DATE", nn: true },
      { name: "expires_at", type: "DATE", nn: true },
      { name: "credit_balance", type: "INTEGER", default: "0" },
      { name: "guest_passes", type: "INTEGER", default: "0" },
    ]
  },
  courts: {
    label: "courts", icon: "🎾", color: "#10B981", x: 60, y: 360,
    cols: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "name", type: "VARCHAR(100)", nn: true },
      { name: "sport", type: "ENUM", nn: true, note: "Tennis|Pickleball|Badminton" },
      { name: "surface", type: "VARCHAR(50)" },
      { name: "is_indoor", type: "BOOLEAN", default: "false" },
      { name: "price_normal", type: "INTEGER", nn: true },
      { name: "price_peak", type: "INTEGER", nn: true },
      { name: "status", type: "ENUM", default: "active" },
    ]
  },
  bookings: {
    label: "bookings", icon: "📅", color: "#EC4899", x: 420, y: 300,
    cols: [
      { name: "id", type: "UUID", pk: true },
      { name: "ref", type: "VARCHAR(10)", unique: true, nn: true },
      { name: "court_id", type: "INTEGER", fk: "courts.id", nn: true },
      { name: "customer_id", type: "UUID", fk: "users.id" },
      { name: "customer_name", type: "VARCHAR(100)", nn: true },
      { name: "customer_phone", type: "VARCHAR(15)", nn: true },
      { name: "booking_date", type: "DATE", nn: true },
      { name: "start_time", type: "TIME", nn: true },
      { name: "duration_hours", type: "DECIMAL(3,1)", nn: true },
      { name: "base_price", type: "INTEGER", nn: true },
      { name: "discount_amount", type: "INTEGER", default: "0" },
      { name: "credit_used", type: "INTEGER", default: "0" },
      { name: "final_price", type: "INTEGER", nn: true },
      { name: "status", type: "ENUM", default: "pending" },
      { name: "source", type: "ENUM", default: "online" },
      { name: "created_at", type: "TIMESTAMPTZ", default: "NOW()" },
    ]
  },
  products: {
    label: "products", icon: "🛍", color: "#8B5CF6", x: 60, y: 640,
    cols: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "name", type: "VARCHAR(200)", nn: true },
      { name: "category", type: "VARCHAR(100)" },
      { name: "price", type: "INTEGER", nn: true },
      { name: "stock", type: "INTEGER", default: "0" },
      { name: "is_service", type: "BOOLEAN", default: "false" },
      { name: "status", type: "ENUM", default: "active" },
    ]
  },
  orders: {
    label: "orders", icon: "🧾", color: "#14B8A6", x: 420, y: 580,
    cols: [
      { name: "id", type: "UUID", pk: true },
      { name: "customer_id", type: "UUID", fk: "users.id" },
      { name: "subtotal", type: "INTEGER", nn: true },
      { name: "discount_amount", type: "INTEGER", default: "0" },
      { name: "credit_used", type: "INTEGER", default: "0" },
      { name: "total", type: "INTEGER", nn: true },
      { name: "pay_method", type: "VARCHAR(50)" },
      { name: "status", type: "ENUM", default: "paid" },
      { name: "created_at", type: "TIMESTAMPTZ", default: "NOW()" },
    ]
  },
  order_items: {
    label: "order_items", icon: "📦", color: "#64748B", x: 60, y: 860,
    cols: [
      { name: "id", type: "UUID", pk: true },
      { name: "order_id", type: "UUID", fk: "orders.id", nn: true },
      { name: "product_id", type: "INTEGER", fk: "products.id", nn: true },
      { name: "quantity", type: "INTEGER", nn: true },
      { name: "unit_price", type: "INTEGER", nn: true },
      { name: "subtotal", type: "INTEGER", nn: true },
    ]
  },
  credit_transactions: {
    label: "credit_transactions", icon: "💰", color: "#F97316", x: 420, y: 820,
    cols: [
      { name: "id", type: "UUID", pk: true },
      { name: "membership_id", type: "UUID", fk: "memberships.id", nn: true },
      { name: "amount", type: "INTEGER", nn: true, note: "negative = debit" },
      { name: "type", type: "ENUM", nn: true, note: "credit|debit" },
      { name: "reference_type", type: "VARCHAR(50)" },
      { name: "reference_id", type: "UUID" },
      { name: "created_at", type: "TIMESTAMPTZ", default: "NOW()" },
    ]
  }
};

const RELATIONS = [
  { from: "users", to: "memberships", fromCol: "id", toCol: "user_id", label: "1:1", type: "solid" },
  { from: "users", to: "bookings", fromCol: "id", toCol: "customer_id", label: "1:N", type: "solid" },
  { from: "courts", to: "bookings", fromCol: "id", toCol: "court_id", label: "1:N", type: "solid" },
  { from: "users", to: "orders", fromCol: "id", toCol: "customer_id", label: "1:N", type: "solid" },
  { from: "orders", to: "order_items", fromCol: "id", toCol: "order_id", label: "1:N", type: "solid" },
  { from: "products", to: "order_items", fromCol: "id", toCol: "product_id", label: "1:N", type: "solid" },
  { from: "memberships", to: "credit_transactions", fromCol: "id", toCol: "membership_id", label: "1:N", type: "solid" },
];

const TABLE_W = 280;

function TableBox({ id, table, selected, onSelect }) {
  const isSelected = selected === id;
  return (
    <div onClick={() => onSelect(isSelected ? null : id)}
      style={{ position: "absolute", left: table.x, top: table.y, width: TABLE_W, background: "#0a1422", border: `2px solid ${isSelected ? table.color : table.color + "44"}`, borderRadius: 12, cursor: "pointer", boxShadow: isSelected ? `0 0 0 3px ${table.color}33, 0 8px 32px rgba(0,0,0,.5)` : "0 4px 16px rgba(0,0,0,.4)", transition: "all .2s", zIndex: isSelected ? 10 : 1 }}>
      {/* Header */}
      <div style={{ background: table.color + "22", borderRadius: "10px 10px 0 0", padding: "10px 14px", borderBottom: `1px solid ${table.color}33`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{table.icon}</span>
        <span style={{ color: table.color, fontWeight: 700, fontSize: 14, fontFamily: "monospace" }}>{table.label}</span>
        <span style={{ marginLeft: "auto", color: table.color + "88", fontSize: 11 }}>{table.cols.length} cols</span>
      </div>
      {/* Columns */}
      <div style={{ padding: "6px 0" }}>
        {table.cols.map((col, i) => (
          <div key={col.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.01)" }}>
            {col.pk && <span style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700, minWidth: 16 }}>PK</span>}
            {col.fk && <span style={{ fontSize: 9, color: "#6366F1", fontWeight: 700, minWidth: 16 }}>FK</span>}
            {!col.pk && !col.fk && <span style={{ minWidth: 16 }}></span>}
            <span style={{ fontSize: 12, color: col.pk ? "#F59E0B" : col.fk ? "#818CF8" : "#c8d8ea", fontFamily: "monospace", flex: 1 }}>{col.name}</span>
            <span style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>{col.type}</span>
            {col.nn && <span style={{ fontSize: 9, color: "#EF4444", fontWeight: 700 }}>NN</span>}
            {col.unique && <span style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700 }}>UQ</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DatabaseERD() {
  const [selected, setSelected] = useState(null);
  const selTable = selected ? TABLES[selected] : null;

  // total canvas height
  const canvasH = 1020;

  const fkCols = selected && selTable
    ? selTable.cols.filter(c => c.fk)
    : [];

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#060d1a", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ padding: "20px 24px 0", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(236,72,153,.1)", border: "1px solid rgba(236,72,153,.3)", borderRadius: 100, padding: "5px 16px", marginBottom: 10 }}>
          <span style={{ color: "#EC4899", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>DATABASE SCHEMA — ERD</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: "#f1f5f9" }}>SportHub — Entity Relationship Diagram</h1>
        <p style={{ color: "#475569", fontSize: 13, margin: "0 0 16px" }}>Click vào bảng để xem chi tiết. <span style={{ color: "#F59E0B" }}>PK</span> = Primary Key · <span style={{ color: "#6366F1" }}>FK</span> = Foreign Key · <span style={{ color: "#EF4444" }}>NN</span> = Not Null · <span style={{ color: "#F59E0B" }}>UQ</span> = Unique</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 0 }}>
        {/* Canvas */}
        <div style={{ overflow: "auto", padding: 24 }}>
          <div style={{ position: "relative", width: 740, height: canvasH, minWidth: 740 }}>

            {/* SVG relation lines */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#334155" />
                </marker>
              </defs>
              {RELATIONS.map((rel, i) => {
                const from = TABLES[rel.from];
                const to = TABLES[rel.to];
                if (!from || !to) return null;
                const fx = from.x + TABLE_W;
                const fy = from.y + 40;
                const tx = to.x;
                const ty = to.y + 40;
                const mx = (fx + tx) / 2;
                const isHighlighted = selected === rel.from || selected === rel.to;
                return (
                  <g key={i}>
                    <path d={`M${fx},${fy} C${mx},${fy} ${mx},${ty} ${tx},${ty}`}
                      fill="none" stroke={isHighlighted ? "#6366F1" : "#1e2d42"} strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={rel.type === "dashed" ? "5,4" : "none"} markerEnd="url(#arrow)" />
                    <rect x={mx - 12} y={(fy + ty) / 2 - 9} width={24} height={18} rx={4} fill={isHighlighted ? "#1e2d42" : "#0a1422"} />
                    <text x={mx} y={(fy + ty) / 2 + 4} textAnchor="middle" fill={isHighlighted ? "#6366F1" : "#334155"} fontSize={10} fontWeight="700">{rel.label}</text>
                  </g>
                );
              })}
            </svg>

            {/* Table boxes */}
            {Object.entries(TABLES).map(([id, table]) => (
              <TableBox key={id} id={id} table={table} selected={selected} onSelect={setSelected} />
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ borderLeft: "1px solid #1e2d42", padding: 20, background: "#080f1c", minHeight: "100vh" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", letterSpacing: 2, marginBottom: 16 }}>TABLE REFERENCE</div>

          {/* Table list */}
          {!selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {Object.entries(TABLES).map(([id, t]) => (
                <div key={id} onClick={() => setSelected(id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: "1px solid #1e2d42", cursor: "pointer", background: "rgba(255,255,255,.02)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = t.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2d42"}>
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: t.color }}>{t.label}</span>
                  <span style={{ marginLeft: "auto", color: "#334155", fontSize: 11 }}>{t.cols.length}</span>
                </div>
              ))}
            </div>
          )}

          {/* Selected detail */}
          {selTable && (
            <div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12, marginBottom: 14, padding: 0 }}>← Tất cả bảng</button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{selTable.icon}</span>
                <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: selTable.color }}>{selected}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {selTable.cols.map(col => (
                  <div key={col.name} style={{ background: "#0a1422", borderRadius: 6, padding: "7px 10px", border: `1px solid ${col.pk ? "#F59E0B33" : col.fk ? "#6366F133" : "#1e2d42"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {col.pk && <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 700 }}>PK</span>}
                      {col.fk && <span style={{ fontSize: 10, color: "#818CF8", fontWeight: 700 }}>FK</span>}
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: col.pk ? "#F59E0B" : col.fk ? "#818CF8" : "#c8d8ea", fontWeight: col.pk ? 700 : 400 }}>{col.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>{col.type}</span>
                      {col.nn && <span style={{ fontSize: 9, color: "#EF4444", fontWeight: 700 }}>NOT NULL</span>}
                      {col.unique && <span style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700 }}>UNIQUE</span>}
                      {col.default && <span style={{ fontSize: 9, color: "#475569" }}>={col.default}</span>}
                      {col.note && <span style={{ fontSize: 9, color: "#6366F1" }}>{col.note}</span>}
                    </div>
                    {col.fk && <div style={{ fontSize: 10, color: "#6366F1", marginTop: 3 }}>→ {col.fk}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Indexes */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", letterSpacing: 2, marginBottom: 10 }}>INDEXES</div>
            {[
              ["bookings", "court_id, booking_date"],
              ["bookings", "status, created_at"],
              ["memberships", "user_id, status"],
              ["users", "phone"],
              ["courts", "sport, status"],
            ].map(([t, cols]) => (
              <div key={cols} style={{ background: "#0a1422", borderRadius: 6, padding: "7px 10px", marginBottom: 4, border: "1px solid #1e2d42" }}>
                <div style={{ fontSize: 11, color: TABLES[t]?.color, fontFamily: "monospace" }}>{t}</div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{cols}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
