import { useState } from "react";

const LAYERS = [
  {
    id: "client", label: "CLIENT LAYER", y: 0, color: "#6366F1", bg: "#1e1b4b",
    nodes: [
      { id: "web", label: "Customer Website", sub: "React 18 + Vite", icon: "🌐", x: 0 },
      { id: "admin", label: "Admin Portal", sub: "React 18 + Vite", icon: "🖥", x: 1 },
      { id: "mobile", label: "Mobile Web", sub: "Responsive PWA", icon: "📱", x: 2 },
    ]
  },
  {
    id: "gateway", label: "API GATEWAY", y: 1, color: "#F59E0B", bg: "#1c1400",
    nodes: [
      { id: "cdn", label: "CloudFront CDN", sub: "Static assets", icon: "⚡", x: 0 },
      { id: "alb", label: "Load Balancer", sub: "AWS ALB", icon: "⚖️", x: 1 },
      { id: "nginx", label: "Nginx Proxy", sub: "Rate limit / SSL", icon: "🔒", x: 2 },
    ]
  },
  {
    id: "app", label: "APPLICATION LAYER", y: 2, color: "#10B981", bg: "#022c22",
    nodes: [
      { id: "api1", label: "API Server 1", sub: "Node.js / Express", icon: "🚀", x: 0 },
      { id: "api2", label: "API Server 2", sub: "Node.js / Express", icon: "🚀", x: 1 },
      { id: "ws", label: "WebSocket", sub: "Socket.io real-time", icon: "🔌", x: 2 },
    ]
  },
  {
    id: "data", label: "DATA LAYER", y: 3, color: "#EC4899", bg: "#1a0010",
    nodes: [
      { id: "pg", label: "PostgreSQL 15", sub: "AWS RDS Multi-AZ", icon: "🗄️", x: 0 },
      { id: "redis", label: "Redis 7", sub: "ElastiCache cache", icon: "⚡", x: 1 },
      { id: "s3", label: "S3 + Backup", sub: "Assets & snapshots", icon: "☁️", x: 2 },
    ]
  },
];

const EXTERNAL = [
  { id: "claude", label: "Claude AI", sub: "Chat Assistant", icon: "🤖", color: "#8B5CF6" },
  { id: "vnpay", label: "VNPay", sub: "Payment gateway", icon: "💳", color: "#10B981" },
  { id: "sms", label: "ESMS", sub: "SMS/OTP notify", icon: "📨", color: "#F59E0B" },
  { id: "sendgrid", label: "SendGrid", sub: "Email service", icon: "✉️", color: "#6366F1" },
];

const DETAIL = {
  web: { title: "Customer Website", desc: "Single-page app cho khách đặt sân, xem lịch, đăng ký thành viên.", tech: ["React 18", "TypeScript", "Vite", "Tailwind CSS", "TanStack Query", "Socket.io-client"], color: "#6366F1" },
  admin: { title: "Admin Portal", desc: "Dashboard quản lý sân, duyệt đơn online, quản lý thành viên.", tech: ["React 18", "TypeScript", "Recharts", "Zustand"], color: "#6366F1" },
  mobile: { title: "Mobile Web (PWA)", desc: "Responsive design tự động cho điện thoại. Service Worker offline support.", tech: ["PWA", "Responsive CSS", "Web Push"], color: "#6366F1" },
  cdn: { title: "CloudFront CDN", desc: "Phân phối static assets toàn cầu. Cache React builds tại edge nodes.", tech: ["AWS CloudFront", "S3 origin", "Cache-Control"], color: "#F59E0B" },
  alb: { title: "AWS Load Balancer", desc: "Phân phối traffic đều giữa các EC2 instances. Health check tự động.", tech: ["AWS ALB", "Target Groups", "Health Checks"], color: "#F59E0B" },
  nginx: { title: "Nginx Reverse Proxy", desc: "SSL termination, rate limiting, gzip compression, security headers.", tech: ["Nginx", "SSL/TLS", "Rate Limit", "Gzip"], color: "#F59E0B" },
  api1: { title: "API Server 1 (EC2 AZ-a)", desc: "REST API cho tất cả business logic — booking, members, auth, shop.", tech: ["Node.js 20", "Express 4", "Prisma ORM", "JWT", "Zod"], color: "#10B981" },
  api2: { title: "API Server 2 (EC2 AZ-b)", desc: "Redundant instance cho high availability. Auto-failover khi AZ-a down.", tech: ["Node.js 20", "Express 4", "Prisma ORM", "JWT", "Zod"], color: "#10B981" },
  ws: { title: "WebSocket Server", desc: "Real-time events: booking.created, slot.locked, booking.confirmed. Admin nhận thông báo tức thì.", tech: ["Socket.io 4", "Redis pub/sub", "JWT auth"], color: "#10B981" },
  pg: { title: "PostgreSQL 15", desc: "Primary database. Lưu users, bookings, memberships, orders. Multi-AZ cho High Availability.", tech: ["AWS RDS", "Multi-AZ", "r6g.large", "Daily snapshots"], color: "#EC4899" },
  redis: { title: "Redis 7 (ElastiCache)", desc: "Cache API responses, session store, rate limit counters, job queue, pub/sub cho WebSocket.", tech: ["AWS ElastiCache", "cache.r6g.large", "Bull queue"], color: "#EC4899" },
  s3: { title: "AWS S3", desc: "Lưu React builds, database backups, uploaded files. Versioning bật để rollback.", tech: ["AWS S3", "CloudFront origin", "Lifecycle rules"], color: "#EC4899" },
  claude: { title: "Anthropic Claude API", desc: "AI Chat Assistant tư vấn khách. Biết giá sân, lịch, gói thành viên. Trả lời tiếng Việt.", tech: ["claude-sonnet-4", "REST API", "System prompt"], color: "#8B5CF6" },
  vnpay: { title: "VNPay Gateway", desc: "Thanh toán thẻ nội địa ATM, Visa, Master. Redirect flow với webhook xác nhận.", tech: ["VNPay API", "HMAC-SHA512", "IPN webhook"], color: "#10B981" },
  sms: { title: "ESMS (SMS Gateway)", desc: "Gửi OTP đăng nhập, thông báo xác nhận booking, cảnh báo hết hạn membership.", tech: ["ESMS API", "Template SMS", "Delivery report"], color: "#F59E0B" },
  sendgrid: { title: "SendGrid", desc: "Email transactional — xác nhận đăng ký, booking confirmation, invoice.", tech: ["SendGrid API", "Dynamic templates", "Webhooks"], color: "#6366F1" },
};

export default function ArchitectureDiagram() {
  const [selected, setSelected] = useState(null);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const info = selected ? DETAIL[selected] : null;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#060d1a", minHeight: "100vh", color: "#e2e8f0", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .node-card { transition: all 0.2s; cursor: pointer; }
        .node-card:hover { transform: translateY(-2px); }
        .layer-row { transition: all 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)", borderRadius: 100, padding: "6px 18px", marginBottom: 12 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block" }}></span>
          <span style={{ color: "#10B981", fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>ARCHITECTURE DIAGRAM</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 6px", color: "#f1f5f9" }}>SportHub — System Architecture</h1>
        <p style={{ color: "#475569", fontSize: 14 }}>Click vào bất kỳ component để xem chi tiết kỹ thuật</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
        {/* Main diagram */}
        <div>
          {LAYERS.map((layer) => (
            <div key={layer.id} className="layer-row"
              style={{ marginBottom: 12, background: hoveredLayer === layer.id ? layer.bg + "cc" : layer.bg + "88", borderRadius: 16, border: `1px solid ${layer.color}33`, padding: "14px 16px", transition: "all .2s" }}
              onMouseEnter={() => setHoveredLayer(layer.id)} onMouseLeave={() => setHoveredLayer(null)}>
              {/* Layer label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 4, height: 18, background: layer.color, borderRadius: 2 }}></div>
                <span style={{ color: layer.color, fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>{layer.label}</span>
              </div>
              {/* Nodes */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {layer.nodes.map((node) => (
                  <div key={node.id} className="node-card"
                    onClick={() => setSelected(selected === node.id ? null : node.id)}
                    style={{ background: selected === node.id ? layer.color + "22" : "rgba(255,255,255,.04)", border: `1.5px solid ${selected === node.id ? layer.color : layer.color + "33"}`, borderRadius: 12, padding: "12px 14px", boxShadow: selected === node.id ? `0 0 0 2px ${layer.color}44` : "none" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{node.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", marginBottom: 3 }}>{node.label}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{node.sub}</div>
                  </div>
                ))}
              </div>
              {/* Connector arrow down */}
              {layer.y < 3 && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ width: 1, height: 10, background: "#1e293b" }}></div>
                    <div style={{ color: "#1e3a5a", fontSize: 16, lineHeight: 1 }}>▼</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* External services */}
          <div style={{ background: "#0d0d1a", borderRadius: 16, border: "1px dashed #1e2d42", padding: "14px 16px", marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 4, height: 18, background: "#475569", borderRadius: 2 }}></div>
              <span style={{ color: "#475569", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>EXTERNAL SERVICES</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
              {EXTERNAL.map(ext => (
                <div key={ext.id} className="node-card"
                  onClick={() => setSelected(selected === ext.id ? null : ext.id)}
                  style={{ background: selected === ext.id ? ext.color + "15" : "rgba(255,255,255,.02)", border: `1.5px dashed ${selected === ext.id ? ext.color : "#2a3a50"}`, borderRadius: 12, padding: "11px 13px", boxShadow: selected === ext.id ? `0 0 0 2px ${ext.color}33` : "none" }}>
                  <div style={{ fontSize: 20, marginBottom: 5 }}>{ext.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 2 }}>{ext.label}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{ext.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {/* Legend */}
          <div style={{ background: "#0a1422", borderRadius: 14, border: "1px solid #1e2d42", padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 12, letterSpacing: 1 }}>LEGEND</div>
            {LAYERS.map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }}></div>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{l.label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, border: "1.5px dashed #475569" }}></div>
              <span style={{ fontSize: 12, color: "#475569" }}>EXTERNAL</span>
            </div>
          </div>

          {/* Component detail */}
          {info ? (
            <div style={{ background: "#0a1422", borderRadius: 14, border: `1px solid ${info.color}44`, padding: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: info.color, letterSpacing: 2, marginBottom: 8 }}>COMPONENT DETAIL</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>{info.title}</div>
              <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 14 }}>{info.desc}</p>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8, letterSpacing: 1 }}>TECHNOLOGIES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {info.tech.map(t => (
                  <span key={t} style={{ background: info.color + "15", border: `1px solid ${info.color}44`, color: info.color, fontSize: 11, padding: "3px 9px", borderRadius: 6, fontWeight: 600 }}>{t}</span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ background: "#0a1422", borderRadius: 14, border: "1px solid #1e2d42", padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>👆</div>
              <div style={{ fontSize: 14, color: "#475569" }}>Click vào một component để xem chi tiết</div>
            </div>
          )}

          {/* Data flow */}
          <div style={{ background: "#0a1422", borderRadius: 14, border: "1px solid #1e2d42", padding: 16, marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 12, letterSpacing: 1 }}>BOOKING FLOW</div>
            {[
              ["1", "Khách submit form đặt sân", "#6366F1"],
              ["2", "API tạo booking pending", "#10B981"],
              ["3", "Redis lock slot tạm thời", "#F59E0B"],
              ["4", "WebSocket notify admin", "#EC4899"],
              ["5", "Admin approve → confirmed", "#10B981"],
              ["6", "SMS/Email xác nhận khách", "#8B5CF6"],
            ].map(([n, label, color]) => (
              <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 9 }}>
                <span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: color + "22", border: `1px solid ${color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color, flexShrink: 0 }}>{n}</span>
                <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.4 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
