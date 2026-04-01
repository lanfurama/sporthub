import { useState } from "react";

const SCREENS = [
  { id: "home", label: "🏠 Homepage", group: "customer" },
  { id: "booking1", label: "🎾 Chọn Môn", group: "customer" },
  { id: "booking2", label: "📅 Chọn Sân & Giờ", group: "customer" },
  { id: "booking3", label: "👤 Nhập Thông Tin", group: "customer" },
  { id: "booking4", label: "✅ Xác Nhận", group: "customer" },
  { id: "success", label: "🎉 Đặt Thành Công", group: "customer" },
  { id: "dash", label: "📊 Dashboard", group: "admin" },
  { id: "pending", label: "🔔 Đơn Online", group: "admin" },
  { id: "admin_book", label: "🎾 Đặt Sân (Admin)", group: "admin" },
  { id: "members", label: "👥 Thành Viên", group: "admin" },
];

/* ── Wireframe Screens ── */

function WireNav({ active, onBook }) {
  return (
    <div style={{ background: "#0d1520", borderBottom: "1px solid #1e2d42", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: "#10B981" }}></div>
        <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15 }}>SportHub</span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        {["Sân thể thao", "Dịch vụ", "Thành viên"].map(l => <div key={l} style={{ width: 70, height: 8, background: "#1e2d42", borderRadius: 4 }}></div>)}
      </div>
      <div onClick={onBook} style={{ background: "#10B981", color: "white", fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 100, cursor: "pointer" }}>Đặt sân →</div>
    </div>
  );
}

const WF = {
  home: () => (
    <div style={{ background: "#060d1a", minHeight: 520 }}>
      <WireNav onBook={() => {}} />
      {/* Hero */}
      <div style={{ padding: "48px 40px 32px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 60% at 70% 40%, rgba(16,185,129,.08) 0%, transparent 70%)" }}></div>
        <div style={{ position: "relative" }}>
          <div style={{ width: 180, height: 10, background: "rgba(16,185,129,.3)", borderRadius: 4, marginBottom: 16 }}></div>
          <div style={{ width: 340, height: 20, background: "#1e2d42", borderRadius: 4, marginBottom: 10 }}></div>
          <div style={{ width: 260, height: 20, background: "#10B981", borderRadius: 4, marginBottom: 10 }}></div>
          <div style={{ width: 300, height: 20, background: "#1e2d42", borderRadius: 4, marginBottom: 24 }}></div>
          <div style={{ width: 220, height: 8, background: "#1e2d42", borderRadius: 4, marginBottom: 8 }}></div>
          <div style={{ width: 200, height: 8, background: "#1e2d42", borderRadius: 4, marginBottom: 28 }}></div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ background: "#10B981", borderRadius: 100, padding: "10px 24px", color: "white", fontSize: 13, fontWeight: 700 }}>Đặt sân ngay</div>
            <div style={{ border: "1px solid #1e2d42", borderRadius: 100, padding: "10px 24px", color: "#475569", fontSize: 13 }}>Tìm hiểu thêm</div>
          </div>
          {/* Sport tags */}
          <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
            {[["🎾", "Tennis", "3 sân"], ["🏓", "Pickleball", "2 sân"], ["🏸", "Badminton", "1 sân"]].map(([ic, l, s]) => (
              <div key={l} style={{ display: "flex", gap: 8, padding: "8px 14px", background: "#0a1422", border: "1px solid #1e2d42", borderRadius: 10 }}>
                <span>{ic}</span>
                <div><div style={{ width: 50, height: 7, background: "#e2e8f0", borderRadius: 3, marginBottom: 3 }}></div><div style={{ width: 30, height: 6, background: "#334155", borderRadius: 3 }}></div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Stats bar */}
      <div style={{ background: "#0a1422", borderTop: "1px solid #1e2d42", padding: "16px 40px", display: "flex", gap: 40 }}>
        {["6+ Sân", "3 Môn", "24/7 Online", "5 phút xác nhận"].map(s => (
          <div key={s}><div style={{ width: 40, height: 12, background: "#10B981", borderRadius: 3, marginBottom: 5 }}></div><div style={{ width: 70, height: 7, background: "#1e2d42", borderRadius: 3 }}></div></div>
        ))}
      </div>
    </div>
  ),

  booking1: () => (
    <div style={{ background: "#060d1a", minHeight: 520 }}>
      <WireNav onBook={() => {}} />
      <div style={{ padding: "32px 40px" }}>
        {/* Steps */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 28 }}>
          {["Môn thể thao", "Chọn sân", "Khung giờ", "Thông tin", "Xác nhận"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#10B981" : "#1e2d42", border: `2px solid ${i === 0 ? "#10B981" : "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: i === 0 ? "white" : "#334155", fontWeight: 700 }}>{i === 0 ? "✓" : i + 1}</div>
              <span style={{ fontSize: 11, color: i === 0 ? "#10B981" : "#334155", whiteSpace: "nowrap" }}>{s}</span>
              {i < 4 && <div style={{ width: 20, height: 2, background: "#1e2d42", margin: "0 2px" }}></div>}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ width: 180, height: 10, background: "#e2e8f0", borderRadius: 4, marginBottom: 6 }}></div>
          <div style={{ width: 240, height: 7, background: "#334155", borderRadius: 3 }}></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[["🎾", "#10B981", true], ["🏓", "#6366F1", false], ["🏸", "#F59E0B", false]].map(([ic, c, sel]) => (
            <div key={ic} style={{ padding: 24, borderRadius: 16, border: `2px solid ${sel ? c : "#1e2d42"}`, background: sel ? c + "0d" : "rgba(255,255,255,.02)", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{ic}</div>
              <div style={{ width: 60, height: 8, background: sel ? c : "#1e2d42", borderRadius: 4, margin: "0 auto 6px" }}></div>
              <div style={{ width: 80, height: 6, background: "#1e2d42", borderRadius: 3, margin: "0 auto" }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),

  booking2: () => (
    <div style={{ background: "#060d1a", minHeight: 520 }}>
      <WireNav onBook={() => {}} />
      <div style={{ padding: "28px 40px" }}>
        {/* Steps condensed */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ width: i<=2 ? 28 : 28, height: 28, borderRadius: "50%", background: i <= 2 ? "#10B981" : "#1e2d42", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 700 }}>{i <= 2 ? "✓" : i}</div>)}
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#0a1422", border: "1px solid #1e3a5a", borderRadius: 8, padding: "8px 14px" }}>
            <div style={{ width: 100, height: 7, background: "#1e2d42", borderRadius: 3 }}></div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Tất cả", "Tennis", "Pickleball", "Badminton"].map((l, i) => <div key={l} style={{ background: i === 1 ? "#10B981" : "#0a1422", borderRadius: 6, padding: "7px 12px", color: i === 1 ? "white" : "#475569", fontSize: 12, fontWeight: i === 1 ? 700 : 400 }}>{l}</div>)}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[["#10B981", true], ["#10B981", false], ["#6366F1", false], ["#F59E0B", false]].map(([c, sel], i) => (
            <div key={i} style={{ padding: 14, borderRadius: 12, border: `2px solid ${sel ? c : "#1e2d42"}`, background: sel ? c + "0a" : "rgba(255,255,255,.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div><div style={{ width: 100, height: 8, background: "#e2e8f0", borderRadius: 3, marginBottom: 4 }}></div><div style={{ width: 70, height: 6, background: "#334155", borderRadius: 3 }}></div></div>
                <div style={{ background: "#1e2d42", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#475569" }}>Indoor</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: 80, height: 8, background: c, borderRadius: 3, opacity: .7 }}></div>
                <div style={{ width: 80, height: 8, background: "#F59E0B", borderRadius: 3, opacity: .5 }}></div>
              </div>
            </div>
          ))}
        </div>
        {/* Time slots */}
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Chọn khung giờ (Tennis Court A)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["06:00","07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map((t, i) => (
            <div key={t} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${i === 3 ? "#10B981" : i >= 10 ? "rgba(245,158,11,.3)" : "#1e3a5a"}`, background: i === 3 ? "#10B981" : i >= 10 ? "rgba(245,158,11,.05)" : "#0a1422", color: i === 3 ? "white" : i >= 10 ? "#F59E0B" : "#8aabb0", fontSize: 12 }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  ),

  booking3: () => (
    <div style={{ background: "#060d1a", minHeight: 520 }}>
      <WireNav onBook={() => {}} />
      <div style={{ padding: "28px 40px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: i <= 3 ? "#10B981" : "#1e2d42", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 700 }}>{i <= 3 ? "✓" : i}</div>)}
        </div>
        {/* Member link */}
        <div style={{ background: "rgba(245,158,11,.05)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span>⭐</span>
            <div style={{ width: 200, height: 8, background: "#F59E0B", borderRadius: 3, opacity: .6 }}></div>
          </div>
          <div style={{ background: "#0a1422", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ width: 220, height: 8, background: "#1e2d42", borderRadius: 3 }}></div>
          </div>
        </div>
        {/* Form fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {["Họ và tên *", "Số điện thoại *"].map(l => (
            <div key={l}>
              <div style={{ width: 80, height: 7, background: "#475569", borderRadius: 3, marginBottom: 6 }}></div>
              <div style={{ background: "#0a1422", border: "1px solid #1e3a5a", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ width: 100, height: 7, background: "#1e2d42", borderRadius: 3 }}></div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ width: 40, height: 7, background: "#475569", borderRadius: 3, marginBottom: 6 }}></div>
          <div style={{ background: "#0a1422", border: "1px solid #1e3a5a", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ width: 150, height: 7, background: "#1e2d42", borderRadius: 3 }}></div>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ width: 60, height: 7, background: "#475569", borderRadius: 3, marginBottom: 6 }}></div>
          <div style={{ background: "#0a1422", border: "1px solid #1e3a5a", borderRadius: 10, padding: "10px 14px", height: 52 }}></div>
        </div>
        <div style={{ background: "#10B981", borderRadius: 12, padding: 13, textAlign: "center", color: "white", fontWeight: 700, fontSize: 14 }}>Xem xác nhận →</div>
      </div>
    </div>
  ),

  booking4: () => (
    <div style={{ background: "#060d1a", minHeight: 520 }}>
      <WireNav onBook={() => {}} />
      <div style={{ padding: "28px 40px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: i <= 4 ? "#10B981" : "#1e2d42", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 700 }}>{i <= 4 ? "✓" : i}</div>)}
        </div>
        {/* Summary card */}
        <div style={{ background: "#0a1422", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
            {["Sân", "Môn", "Ngày", "Giờ", "Thời lượng", "Bề mặt"].map(k => (
              <div key={k} style={{ background: "#060d1a", borderRadius: 8, padding: "9px 12px" }}>
                <div style={{ width: 40, height: 6, background: "#334155", borderRadius: 2, marginBottom: 5 }}></div>
                <div style={{ width: 80, height: 8, background: "#1e2d42", borderRadius: 3 }}></div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1e2d42", paddingTop: 12 }}>
            {["Tên", "SĐT", "Email"].map(k => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ width: 30, height: 7, background: "#334155", borderRadius: 3 }}></div>
                <div style={{ width: 120, height: 7, background: "#1e2d42", borderRadius: 3 }}></div>
              </div>
            ))}
          </div>
        </div>
        {/* Price summary */}
        <div style={{ background: "rgba(16,185,129,.05)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          {["Giảm thành viên 20%", "Credit"].map(k => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ width: 100, height: 7, background: "#10B981", borderRadius: 3, opacity: .5 }}></div>
              <div style={{ width: 60, height: 7, background: "#10B981", borderRadius: 3, opacity: .5 }}></div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(16,185,129,.2)", paddingTop: 12, marginTop: 4 }}>
            <div style={{ width: 80, height: 9, background: "#e2e8f0", borderRadius: 3 }}></div>
            <div style={{ width: 80, height: 12, background: "#10B981", borderRadius: 3 }}></div>
          </div>
        </div>
        <div style={{ background: "#10B981", borderRadius: 12, padding: 14, textAlign: "center", color: "white", fontWeight: 700, fontSize: 15, boxShadow: "0 6px 20px rgba(16,185,129,.3)" }}>✅ Xác nhận đặt sân</div>
      </div>
    </div>
  ),

  success: () => (
    <div style={{ background: "#060d1a", minHeight: 520 }}>
      <WireNav onBook={() => {}} />
      <div style={{ padding: "60px 40px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,.12)", border: "2px solid #10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>✓</div>
        <div style={{ width: 220, height: 14, background: "#e2e8f0", borderRadius: 4, margin: "0 auto 8px" }}></div>
        <div style={{ width: 140, height: 8, background: "#334155", borderRadius: 3, margin: "0 auto 18px" }}></div>
        <div style={{ display: "inline-block", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.3)", borderRadius: 12, padding: "12px 28px", marginBottom: 20 }}>
          <div style={{ width: 100, height: 18, background: "#10B981", borderRadius: 4, opacity: .7 }}></div>
        </div>
        {/* Mini summary */}
        <div style={{ background: "#0a1422", borderRadius: 12, padding: 16, maxWidth: 300, margin: "0 auto 20px", textAlign: "left" }}>
          {["Sân", "Ngày", "Giờ", "Khách", "Tổng"].map(k => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #1e2d4220" }}>
              <div style={{ width: 40, height: 7, background: "#334155", borderRadius: 3 }}></div>
              <div style={{ width: 80, height: 7, background: "#1e2d42", borderRadius: 3 }}></div>
            </div>
          ))}
        </div>
        <div style={{ width: 160, height: 7, background: "#334155", borderRadius: 3, margin: "0 auto 20px" }}></div>
        <div style={{ display: "inline-block", background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", borderRadius: 100, padding: "11px 28px", color: "#10B981", fontWeight: 700, fontSize: 14 }}>Đặt sân mới</div>
      </div>
    </div>
  ),

  dash: () => (
    <div style={{ display: "flex", minHeight: 520, background: "#060d1a" }}>
      {/* Sidebar */}
      <div style={{ width: 160, background: "#090f1d", borderRight: "1px solid #1e2d42", padding: "14px 10px" }}>
        <div style={{ marginBottom: 20, padding: "0 8px" }}>
          <div style={{ width: 80, height: 10, background: "#10B981", borderRadius: 3, marginBottom: 3 }}></div>
          <div style={{ width: 60, height: 6, background: "#1e2d42", borderRadius: 2 }}></div>
        </div>
        {["📊 Dashboard", "🔔 Online (3)", "🎾 Đặt Sân", "📋 Lịch Đặt", "👥 Thành Viên"].map((l, i) => (
          <div key={l} style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 2, background: i === 0 ? "rgba(16,185,129,.08)" : "transparent", borderLeft: `3px solid ${i === 0 ? "#10B981" : "transparent"}` }}>
            <span style={{ fontSize: 12, color: i === 0 ? "#10B981" : "#475569" }}>{l}</span>
          </div>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ width: 100, height: 10, background: "#e2e8f0", borderRadius: 4, marginBottom: 4 }}></div>
        <div style={{ width: 140, height: 7, background: "#334155", borderRadius: 3, marginBottom: 18 }}></div>
        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
          {[["#10B981", "12", "Đặt sân hôm nay"], ["#F59E0B", "3 MỚI", "Chờ duyệt online"], ["#6366F1", "1.8M", "Doanh thu hôm nay"], ["#EC4899", "156", "Thành viên"]].map(([c, v, l]) => (
            <div key={l} style={{ background: "#0f1f30", borderRadius: 12, padding: "14px 14px", border: `1px solid ${l === "Chờ duyệt online" ? "#F59E0B44" : "#1e2d42"}` }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: c + "22", marginBottom: 10 }}></div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{v}</div>
              <div style={{ width: 70, height: 6, background: "#1e2d42", borderRadius: 3 }}></div>
            </div>
          ))}
        </div>
        {/* Charts area */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "#0f1f30", borderRadius: 12, padding: 14, border: "1px solid #1e2d42" }}>
            <div style={{ width: 80, height: 7, background: "#e2e8f0", borderRadius: 3, marginBottom: 10 }}></div>
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}>
              {[40, 65, 55, 80, 90, 70, 85].map((h, i) => (
                <div key={i} style={{ flex: 1, borderRadius: "3px 3px 0 0", background: i === 4 ? "#10B981" : "#1e2d42", height: h + "%" }}></div>
              ))}
            </div>
          </div>
          <div style={{ background: "#0f1f30", borderRadius: 12, padding: 14, border: "1px solid #1e2d42" }}>
            <div style={{ width: 80, height: 7, background: "#e2e8f0", borderRadius: 3, marginBottom: 10 }}></div>
            <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ background: "#10B981", flex: 8 }}></div>
              <div style={{ background: "#6366F1", flex: 4 }}></div>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#475569" }}>
              <span style={{ color: "#10B981" }}>● Online: 8</span>
              <span style={{ color: "#6366F1" }}>● Admin: 4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),

  pending: () => (
    <div style={{ display: "flex", minHeight: 520, background: "#060d1a" }}>
      {/* Sidebar mini */}
      <div style={{ width: 160, background: "#090f1d", borderRight: "1px solid #1e2d42", padding: "14px 10px" }}>
        {["📊", "🔔", "🎾", "📋", "👥"].map((ic, i) => (
          <div key={ic} style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 2, background: i === 1 ? "rgba(245,158,11,.08)" : "transparent", borderLeft: `3px solid ${i === 1 ? "#F59E0B" : "transparent"}` }}>
            <span style={{ fontSize: 16 }}>{ic}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div><div style={{ width: 100, height: 10, background: "#e2e8f0", borderRadius: 4, marginBottom: 5 }}></div><div style={{ width: 160, height: 7, background: "#334155", borderRadius: 3 }}></div></div>
          <div style={{ background: "#F59E0B", borderRadius: 100, padding: "6px 14px", fontSize: 12, color: "#060d1a", fontWeight: 700 }}>3 chờ duyệt</div>
        </div>
        {/* Pending cards */}
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: "#0f1f30", borderRadius: 14, padding: 16, border: "1px solid rgba(245,158,11,.2)", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 110, height: 8, background: "#e2e8f0", borderRadius: 3 }}></div>
                  <div style={{ background: "rgba(16,185,129,.12)", borderRadius: 4, padding: "2px 7px", fontSize: 10, color: "#10B981", fontWeight: 700 }}>ONLINE</div>
                </div>
                <div style={{ width: 140, height: 6, background: "#334155", borderRadius: 3 }}></div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ width: 70, height: 10, background: "#10B981", borderRadius: 3, opacity: .7 }}></div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, background: "#080f1c", borderRadius: 8, padding: 10, marginBottom: 10 }}>
              {["Khách", "SĐT", "Email"].map(k => (
                <div key={k}><div style={{ width: 30, height: 6, background: "#334155", borderRadius: 2, marginBottom: 4 }}></div><div style={{ width: 60, height: 7, background: "#1e2d42", borderRadius: 3 }}></div></div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, background: "#10B981", borderRadius: 8, padding: 9, textAlign: "center", color: "white", fontWeight: 700, fontSize: 13 }}>✅ Xác nhận</div>
              <div style={{ flex: 1, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: 9, textAlign: "center", color: "#EF4444", fontWeight: 700, fontSize: 13 }}>✗ Từ chối</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  admin_book: () => (
    <div style={{ display: "flex", minHeight: 520, background: "#060d1a" }}>
      <div style={{ width: 160, background: "#090f1d", borderRight: "1px solid #1e2d42", padding: "14px 10px" }}>
        {["📊","🔔","🎾","📋","👥"].map((ic, i) => <div key={ic} style={{ padding: "9px 10px", borderRadius: 8, marginBottom: 2, background: i === 2 ? "rgba(16,185,129,.08)" : "transparent", borderLeft: `3px solid ${i === 2 ? "#10B981" : "transparent"}` }}><span style={{ fontSize: 16 }}>{ic}</span></div>)}
      </div>
      <div style={{ flex: 1, padding: 20, display: "grid", gridTemplateColumns: "1fr 240px", gap: 16 }}>
        <div>
          <div style={{ width: 80, height: 10, background: "#e2e8f0", borderRadius: 4, marginBottom: 14 }}></div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ background: "#0a1422", border: "1px solid #1e2d42", borderRadius: 8, padding: "7px 12px" }}><div style={{ width: 70, height: 6, background: "#1e2d42", borderRadius: 3 }}></div></div>
            {["Tất cả","Tennis","Pickleball","Badminton"].map((l, i) => <div key={l} style={{ background: i===1?"#10B981":"#0a1422", borderRadius: 6, padding: "7px 12px", fontSize: 11, color: i===1?"white":"#475569", fontWeight: i===1?700:400 }}>{l}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["#10B981",true],["#10B981",false],["#6366F1",false],["#F59E0B",false]].map(([c,sel],i) => (
              <div key={i} style={{ background: "#0f1f30", borderRadius: 12, padding: 12, border: `2px solid ${sel?c:"#1e2d42"}` }}>
                <div style={{ width: 100, height: 7, background: "#e2e8f0", borderRadius: 3, marginBottom: 4 }}></div>
                <div style={{ width: 70, height: 6, background: "#334155", borderRadius: 3, marginBottom: 8 }}></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {Array.from({length:10},(_,j)=>j).map(j => <div key={j} style={{ width: 30, height: 18, borderRadius: 3, background: j===3?"#10B981":j>=7?"#1e2d42":"#080f1c", fontSize: 8, display:"flex",alignItems:"center",justifyContent:"center",color:j===3?"white":"#334155" }}>{["07","09","10","✓","14","15","16","❌","18","19"][j]}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Right panel */}
        <div style={{ background: "#0f1f30", borderRadius: 12, padding: 14, border: "1px solid #1e2d42", height: "fit-content" }}>
          <div style={{ width: 100, height: 7, background: "#e2e8f0", borderRadius: 3, marginBottom: 12 }}></div>
          {["Tìm thành viên...","Tên khách","SĐT"].map(l => (
            <div key={l} style={{ background: "#080f1c", border: "1px solid #1e2d42", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
              <div style={{ width: 80, height: 6, background: "#1e2d42", borderRadius: 3 }}></div>
            </div>
          ))}
          <div style={{ background: "#080f1c", borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ width: 40, height: 7, background: "#334155", borderRadius: 3 }}></div>
              <div style={{ width: 60, height: 7, background: "#10B981", borderRadius: 3, opacity: .7 }}></div>
            </div>
          </div>
          <div style={{ background: "#10B981", borderRadius: 8, padding: 10, textAlign: "center", color: "white", fontWeight: 700, fontSize: 13 }}>Xác nhận đặt sân</div>
        </div>
      </div>
    </div>
  ),

  members: () => (
    <div style={{ display: "flex", minHeight: 520, background: "#060d1a" }}>
      <div style={{ width: 160, background: "#090f1d", borderRight: "1px solid #1e2d42", padding: "14px 10px" }}>
        {["📊","🔔","🎾","📋","👥"].map((ic, i) => <div key={ic} style={{ padding: "9px 10px", borderRadius: 8, marginBottom: 2, background: i===4?"rgba(16,185,129,.08)":"transparent", borderLeft: `3px solid ${i===4?"#10B981":"transparent"}` }}><span style={{ fontSize: 16 }}>{ic}</span></div>)}
      </div>
      <div style={{ flex: 1, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ width: 100, height: 10, background: "#e2e8f0", borderRadius: 4 }}></div>
          <div style={{ background: "#10B981", borderRadius: 8, padding: "8px 16px", fontSize: 12, color: "white", fontWeight: 700 }}>+ Thêm</div>
        </div>
        <div style={{ background: "#0a1422", border: "1px solid #1e2d42", borderRadius: 8, padding: "8px 14px", width: 220, marginBottom: 12 }}>
          <div style={{ width: 120, height: 6, background: "#1e2d42", borderRadius: 3 }}></div>
        </div>
        {/* Table */}
        <div style={{ background: "#0f1f30", borderRadius: 12, border: "1px solid #1e2d42", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1fr", padding: "10px 14px", borderBottom: "1px solid #1e2d42" }}>
            {["Thành viên","Gói","Hết hạn","Credit","Tổng chi"].map(h => <div key={h} style={{ width: 50, height: 6, background: "#334155", borderRadius: 3 }}></div>)}
          </div>
          {[["#F59E0B","VIP"],["#10B981","Prime"],["#64748B","Basic"]].map(([c, g], ri) => (
            <div key={g} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr 1fr 1fr", padding: "11px 14px", borderBottom: "1px solid #1e2d4240", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,.01)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: c }}></div>
                <div><div style={{ width: 80, height: 7, background: "#e2e8f0", borderRadius: 3, marginBottom: 4 }}></div><div style={{ width: 60, height: 5, background: "#334155", borderRadius: 2 }}></div></div>
              </div>
              <div style={{ background: c + "22", border: `1px solid ${c}44`, borderRadius: 4, padding: "3px 8px", alignSelf: "center", fontSize: 10, color: c, fontWeight: 700, width: "fit-content" }}>{g}</div>
              <div style={{ width: 60, height: 7, background: "#1e2d42", borderRadius: 3, alignSelf: "center" }}></div>
              <div style={{ width: 50, height: 7, background: "#F59E0B", borderRadius: 3, opacity: .5, alignSelf: "center" }}></div>
              <div style={{ width: 50, height: 7, background: "#10B981", borderRadius: 3, opacity: .5, alignSelf: "center" }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export default function UIWireframe() {
  const [activeScreen, setActiveScreen] = useState("home");
  const [zoom, setZoom] = useState(1);
  const Screen = WF[activeScreen] || WF.home;

  const customerScreens = SCREENS.filter(s => s.group === "customer");
  const adminScreens = SCREENS.filter(s => s.group === "admin");

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#030812", minHeight: "100vh", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div style={{ padding: "14px 24px", borderBottom: "1px solid #1e2d42", display: "flex", alignItems: "center", gap: 20, background: "#060d1a" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.3)", borderRadius: 100, padding: "4px 14px", marginBottom: 4 }}>
            <span style={{ color: "#818CF8", fontSize: 11, fontWeight: 700, letterSpacing: 2 }}>UI WIREFRAME</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#f1f5f9" }}>SportHub — Mockup Giao Diện</h1>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[0.75, 1, 1.25].map(z => (
            <button key={z} onClick={() => setZoom(z)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: zoom === z ? "#6366F1" : "#0f1f30", color: zoom === z ? "white" : "#475569" }}>
              {Math.round(z * 100)}%
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar nav */}
        <div style={{ width: 200, background: "#060d1a", borderRight: "1px solid #1e2d42", padding: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, marginBottom: 8 }}>🌐 CUSTOMER</div>
          {customerScreens.map(s => (
            <div key={s.id} onClick={() => setActiveScreen(s.id)}
              style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 2, cursor: "pointer", fontSize: 12, background: activeScreen === s.id ? "rgba(99,102,241,.12)" : "transparent", color: activeScreen === s.id ? "#818CF8" : "#475569", borderLeft: `3px solid ${activeScreen === s.id ? "#6366F1" : "transparent"}`, fontWeight: activeScreen === s.id ? 600 : 400 }}>
              {s.label}
            </div>
          ))}
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", letterSpacing: 2, marginTop: 16, marginBottom: 8 }}>🖥 ADMIN</div>
          {adminScreens.map(s => (
            <div key={s.id} onClick={() => setActiveScreen(s.id)}
              style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 2, cursor: "pointer", fontSize: 12, background: activeScreen === s.id ? "rgba(16,185,129,.1)" : "transparent", color: activeScreen === s.id ? "#10B981" : "#475569", borderLeft: `3px solid ${activeScreen === s.id ? "#10B981" : "transparent"}`, fontWeight: activeScreen === s.id ? 600 : 400 }}>
              {s.label}
            </div>
          ))}

          {/* Annotations */}
          <div style={{ marginTop: 24, background: "#0a1422", borderRadius: 10, padding: 12, border: "1px solid #1e2d42" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", marginBottom: 8, letterSpacing: 1 }}>CHÚ THÍCH</div>
            {[["#10B981", "CTA / Action"], ["#F59E0B", "Warning / Peak"], ["#6366F1", "Info / Link"], ["#EC4899", "Price / Highlight"], ["#1e2d42", "Inactive / BG"]].map(([c, l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }}></div>
                <span style={{ fontSize: 10, color: "#475569" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preview area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: 24, background: "#030812", overflow: "auto" }}>
          {/* Screen label */}
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>{SCREENS.find(s => s.id === activeScreen)?.label}</span>
            <span style={{ fontSize: 11, color: "#334155", background: "#0a1422", padding: "3px 10px", borderRadius: 100, border: "1px solid #1e2d42" }}>
              {SCREENS.find(s => s.id === activeScreen)?.group === "customer" ? "🌐 Customer" : "🖥 Admin"}
            </span>
          </div>

          {/* Browser chrome */}
          <div style={{ width: 760, background: "#0a1422", borderRadius: 14, border: "1px solid #1e2d42", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.6)", transform: `scale(${zoom})`, transformOrigin: "top center" }}>
            {/* Browser bar */}
            <div style={{ background: "#0f1f30", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1e2d42" }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#EF4444","#F59E0B","#10B981"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}></div>)}
              </div>
              <div style={{ flex: 1, background: "#080f1c", borderRadius: 6, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "#10B981" }}>🔒</span>
                <span style={{ fontSize: 11, color: "#334155" }}>
                  {SCREENS.find(s => s.id === activeScreen)?.group === "admin" ? "admin.sporthub.vn" : "sporthub.vn"}
                </span>
              </div>
            </div>
            {/* Screen content */}
            <div style={{ overflow: "hidden" }}>
              <Screen />
            </div>
          </div>

          {/* Navigation hint */}
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            {SCREENS.map(s => (
              <div key={s.id} onClick={() => setActiveScreen(s.id)}
                style={{ width: 8, height: 8, borderRadius: "50%", cursor: "pointer", background: activeScreen === s.id ? (s.group === "admin" ? "#10B981" : "#6366F1") : "#1e2d42", transition: "all .2s" }}>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#334155" }}>{SCREENS.findIndex(s => s.id === activeScreen) + 1} / {SCREENS.length} — Click dots hoặc sidebar để chuyển màn hình</div>
        </div>
      </div>
    </div>
  );
}
