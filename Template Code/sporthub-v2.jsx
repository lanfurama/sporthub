import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   SHARED DATA STORE
═══════════════════════════════════════════════════════════ */
const COURTS = [
  { id:1, name:"Tennis Court A", sport:"Tennis", price:150000, peakPrice:220000, surface:"Hard Court", indoor:false, color:"#10B981" },
  { id:2, name:"Tennis Court B", sport:"Tennis", price:150000, peakPrice:220000, surface:"Clay Court",  indoor:true,  color:"#10B981" },
  { id:3, name:"Tennis Court C", sport:"Tennis", price:160000, peakPrice:230000, surface:"Grass Court", indoor:false, color:"#10B981" },
  { id:4, name:"Pickleball Court 1", sport:"Pickleball", price:120000, peakPrice:180000, surface:"Hard Court", indoor:true,  color:"#6366F1" },
  { id:5, name:"Pickleball Court 2", sport:"Pickleball", price:120000, peakPrice:180000, surface:"Hard Court", indoor:true,  color:"#6366F1" },
  { id:6, name:"Badminton Court 1", sport:"Badminton",  price:80000,  peakPrice:130000, surface:"Wood Floor",  indoor:true,  color:"#F59E0B" },
];

const MEMBERSHIP_PLANS = [
  { id:"basic", name:"Basic", color:"#64748B", price:500000,  duration:30, courtDiscount:10, shopDiscount:5,  priority:false, guests:0, credit:0 },
  { id:"prime", name:"Prime", color:"#10B981", price:1200000, duration:30, courtDiscount:20, shopDiscount:10, priority:true,  guests:2, credit:100000 },
  { id:"vip",   name:"VIP",   color:"#F59E0B", price:2500000, duration:30, courtDiscount:35, shopDiscount:20, priority:true,  guests:5, credit:300000 },
];

const TIME_SLOTS = ["06:00","07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];
const SPORTS = ["Tennis","Pickleball","Badminton"];

const INIT_MEMBERS = [
  { id:1, name:"Nguyễn Văn An",  phone:"0901234567", email:"an@gmail.com",   plan:"vip",   credit:850000,  guestPasses:3, joinDate:"2024-01-15", expiry:"2026-12-15", totalSpent:12500000 },
  { id:2, name:"Trần Thị Bình",  phone:"0912345678", email:"binh@gmail.com", plan:"prime", credit:220000,  guestPasses:1, joinDate:"2024-06-01", expiry:"2026-06-01", totalSpent:4200000 },
  { id:3, name:"Lê Minh Châu",   phone:"0923456789", email:"chau@gmail.com", plan:"basic", credit:0,       guestPasses:0, joinDate:"2024-09-10", expiry:"2026-09-10", totalSpent:1800000 },
];

const INIT_BOOKINGS = [
  { id:101, courtId:1, courtName:"Tennis Court A", date:"2026-03-11", time:"09:00", duration:1, customerName:"Demo User", customerPhone:"0900000001", memberId:null, memberPlan:null, basePrice:150000, finalPrice:150000, creditUsed:0, status:"confirmed", source:"admin", ref:"SH000001" },
];

const todayStr = () => new Date().toISOString().split("T")[0];
const fmtVND = n => new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(n);
const isPeak = h => { const hr=parseInt(h); return hr>=17&&hr<=21; };
const genRef  = () => "SH" + Date.now().toString().slice(-6);

/* ═══════════════════════════════════════════════════════════
   SHARED STORE HOOK
═══════════════════════════════════════════════════════════ */
function useStore() {
  const [bookings,    setBookings]    = useState(INIT_BOOKINGS);
  const [members,     setMembers]     = useState(INIT_MEMBERS);
  const [pending,     setPending]     = useState([]);
  const [sales,       setSales]       = useState([]);

  const addOnlineRequest = (req) =>
    setPending(p => [...p, { ...req, id:Date.now(), status:"pending", ref:genRef(), createdAt:new Date().toLocaleString("vi-VN") }]);

  const approveRequest = (id) => {
    const r = pending.find(p=>p.id===id);
    if (r) {
      setBookings(b => [...b, {...r, status:"confirmed"}]);
      setPending(p => p.map(x=>x.id===id?{...x,status:"confirmed"}:x));
    }
  };
  const rejectRequest = (id) =>
    setPending(p => p.map(x=>x.id===id?{...x,status:"rejected"}:x));

  const addAdminBooking = (b) =>
    setBookings(prev => [...prev, {...b, id:Date.now(), status:"confirmed", source:"admin", ref:genRef()}]);

  const isSlotTaken = (courtId, date, time) =>
    [...bookings, ...pending.filter(p=>p.status==="pending")].some(
      b => b.courtId===courtId && b.date===date && b.time===time && b.status!=="rejected"
    );

  return { bookings, members, setMembers, pending, sales, setSales, addOnlineRequest, approveRequest, rejectRequest, addAdminBooking, isSlotTaken };
}

/* ═══════════════════════════════════════════════════════════
   TINY SHARED UI BITS
═══════════════════════════════════════════════════════════ */
const Chip = ({ plan }) => {
  const p = MEMBERSHIP_PLANS.find(m=>m.id===plan);
  if (!p) return <span style={{background:"#1e293b",color:"#475569",fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:700,letterSpacing:.5}}>GUEST</span>;
  return <span style={{background:p.color+"22",color:p.color,fontSize:10,padding:"2px 9px",borderRadius:4,fontWeight:700,letterSpacing:.5,border:`1px solid ${p.color}44`}}>{p.name.toUpperCase()}</span>;
};

const Dlg = ({ title, onClose, children, maxW=520 }) => (
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
    <div style={{background:"#0f1724",borderRadius:20,width:"100%",maxWidth:maxW,maxHeight:"92vh",overflow:"auto",border:"1px solid #1e2d42",boxShadow:"0 32px 80px rgba(0,0,0,.7)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #1e2d42"}}>
        <h3 style={{color:"#e8f0ff",margin:0,fontSize:17,fontFamily:"'Cormorant Garamond',serif",letterSpacing:.3}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#3d5a7a",cursor:"pointer",fontSize:24,lineHeight:1,padding:"0 4px"}}>×</button>
      </div>
      <div style={{padding:24}}>{children}</div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ██████╗██╗     ██╗███████╗███╗   ██╗████████╗
   CUSTOMER WEBSITE
═══════════════════════════════════════════════════════════ */

/* — AI Chat Assistant — */
function AIChatWidget({ members }) {
  const [open,  setOpen]  = useState(false);
  const [msgs,  setMsgs]  = useState([{ role:"assistant", text:"Xin chào! 👋 Tôi là trợ lý SportHub. Tôi có thể giúp bạn chọn sân, tư vấn gói thành viên, hoặc hỏi về giờ trống. Bạn cần hỗ trợ gì?" }]);
  const [input, setInput] = useState("");
  const [loading,setLoad] = useState(false);
  const endRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMsgs(m => [...m, {role:"user", text:userMsg}]);
    setLoad(true);
    try {
      const systemPrompt = `Bạn là trợ lý AI của SportHub – sân thể thao cao cấp tại TP.HCM. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.

Thông tin sân:
- Tennis: 3 sân (Hard/Clay/Grass), giá 150,000–160,000 VND/h (peak 220,000–230,000)
- Pickleball: 2 sân indoor, 120,000 VND/h (peak 180,000)
- Badminton: 1 sân wood floor indoor, 80,000 VND/h (peak 130,000)
- Giờ peak: 17:00–21:00

Gói thành viên:
- Basic 500K/tháng: giảm 10% sân, 5% shop
- Prime 1.2M/tháng: giảm 20% sân, 10% shop, ưu tiên đặt, 2 guest pass, 100K credit
- VIP 2.5M/tháng: giảm 35% sân, 20% shop, ưu tiên đặt, 5 guest pass, 300K credit

Hãy tư vấn nhiệt tình và khuyến khích đặt sân qua website.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:300,
          system: systemPrompt,
          messages: [...msgs.filter(m=>m.role!=="assistant"||msgs.indexOf(m)>0).map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.text})), {role:"user",content:userMsg}]
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Xin lỗi, tôi không thể trả lời lúc này.";
      setMsgs(m => [...m, {role:"assistant", text:reply}]);
    } catch {
      setMsgs(m => [...m, {role:"assistant", text:"Xin lỗi, đã có lỗi kết nối. Vui lòng thử lại sau."}]);
    }
    setLoad(false);
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={()=>setOpen(o=>!o)}
        style={{position:"fixed",bottom:24,right:24,width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#10B981,#059669)",border:"none",cursor:"pointer",boxShadow:"0 8px 32px rgba(16,185,129,.45)",zIndex:1000,fontSize:24,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform .2s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
        onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
        {open?"×":"💬"}
      </button>

      {open && (
        <div style={{position:"fixed",bottom:92,right:24,width:340,height:480,background:"#0d1a2b",border:"1px solid #1e2d42",borderRadius:20,display:"flex",flexDirection:"column",zIndex:1000,boxShadow:"0 20px 60px rgba(0,0,0,.6)",overflow:"hidden"}}>
          {/* Header */}
          <div style={{background:"linear-gradient(135deg,#0f3d2e,#1a4a38)",padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(16,185,129,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚡</div>
            <div>
              <div style={{color:"#e8f0ff",fontWeight:700,fontSize:14,fontFamily:"'Cormorant Garamond',serif"}}>SportHub AI</div>
              <div style={{color:"#10B981",fontSize:11,display:"flex",alignItems:"center",gap:4}}><span style={{width:6,height:6,borderRadius:"50%",background:"#10B981",display:"inline-block",animation:"pulse 1.5s infinite"}}></span>Trực tuyến 24/7</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map((m,i) => (
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"82%",padding:"10px 13px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  background:m.role==="user"?"linear-gradient(135deg,#10B981,#059669)":"#162235",
                  color:m.role==="user"?"white":"#c8d8ea",fontSize:13,lineHeight:1.5}}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display:"flex",gap:4,padding:"10px 13px",background:"#162235",borderRadius:"16px 16px 16px 4px",width:"fit-content"}}>
                {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#3d5a7a",display:"inline-block",animation:`pulse 1s ${i*.2}s infinite`}}></span>)}
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div style={{padding:"10px 12px",borderTop:"1px solid #1e2d42",display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
              placeholder="Hỏi về sân, giá, ưu đãi..."
              style={{flex:1,background:"#0f1f30",border:"1px solid #1e3a5a",borderRadius:12,padding:"9px 13px",color:"#e8f0ff",fontSize:13,outline:"none"}} />
            <button onClick={send} disabled={loading||!input.trim()}
              style={{width:38,height:38,borderRadius:12,background:input.trim()?"#10B981":"#162235",border:"none",color:"white",cursor:input.trim()?"pointer":"default",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* — Booking Flow — */
function BookingFlow({ isSlotTaken, addOnlineRequest, members }) {
  const [step,     setStep]    = useState(1);
  const [sport,    setSport]   = useState(null);
  const [court,    setCourt]   = useState(null);
  const [date,     setDate]    = useState(todayStr());
  const [time,     setTime]    = useState(null);
  const [duration, setDur]     = useState(1);
  const [form,     setForm]    = useState({ name:"", phone:"", email:"", note:"" });
  const [linkedM,  setLinkedM] = useState(null);
  const [mSearch,  setMSearch] = useState("");
  const [useCredit,setUseCredit] = useState(false);
  const [bookRef,  setBookRef] = useState(null);

  const filteredCourts = sport ? COURTS.filter(c=>c.sport===sport) : COURTS;
  const plan = linkedM ? MEMBERSHIP_PLANS.find(p=>p.id===linkedM.plan) : null;
  const base = court ? (isPeak(time||"09:00") ? court.peakPrice : court.price) * duration : 0;
  const afterDisc = plan ? Math.round(base*(1-plan.courtDiscount/100)) : base;
  const creditAmt  = useCredit&&linkedM ? Math.min(linkedM.credit,afterDisc) : 0;
  const total      = afterDisc - creditAmt;

  const mResults = members.filter(m =>
    mSearch.length>1 && (m.phone.includes(mSearch)||m.email.toLowerCase().includes(mSearch.toLowerCase())||m.name.toLowerCase().includes(mSearch.toLowerCase()))
  );

  const submit = () => {
    const ref = genRef();
    setBookRef(ref);
    addOnlineRequest({
      courtId:court.id, courtName:court.name, date, time, duration,
      customerName: linkedM?.name||form.name,
      customerPhone: linkedM?.phone||form.phone,
      customerEmail: linkedM?.email||form.email,
      note: form.note,
      memberId: linkedM?.id||null,
      memberPlan: linkedM?.plan||null,
      basePrice: base, discountedPrice: afterDisc, creditUsed: creditAmt, finalPrice: total,
      source:"online", ref
    });
    setStep(6);
  };

  const reset = () => { setStep(1);setSport(null);setCourt(null);setTime(null);setLinkedM(null);setForm({name:"",phone:"",email:"",note:""});setUseCredit(false);setMSearch(""); };

  // Step labels
  const steps = ["Môn thể thao","Chọn sân","Khung giờ","Thông tin","Xác nhận"];

  if (step===6) return (
    <div style={{textAlign:"center",padding:"60px 24px"}}>
      <div style={{width:88,height:88,borderRadius:"50%",background:"rgba(16,185,129,.12)",border:"2px solid #10B981",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:36}}>✓</div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:36,margin:"0 0 8px"}}>Đặt sân thành công!</h2>
      <p style={{color:"#4a6a8a",marginBottom:16}}>Mã xác nhận của bạn</p>
      <div style={{display:"inline-block",background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.3)",borderRadius:14,padding:"14px 32px",marginBottom:24}}>
        <span style={{color:"#10B981",fontWeight:800,fontSize:28,letterSpacing:4}}>{bookRef}</span>
      </div>
      <div style={{background:"#0d1a2b",borderRadius:14,padding:18,maxWidth:360,margin:"0 auto 24px",textAlign:"left"}}>
        {[["Sân",court?.name],["Ngày",date],["Giờ",`${time} · ${duration}h`],["Khách",linkedM?.name||form.name],["SĐT",linkedM?.phone||form.phone]].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1e2d4220"}}>
            <span style={{color:"#4a6a8a",fontSize:13}}>{k}</span>
            <span style={{color:"#c8d8ea",fontSize:13,fontWeight:500}}>{v}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0"}}>
          <span style={{color:"#4a6a8a",fontSize:14}}>Tổng thanh toán</span>
          <span style={{color:"#10B981",fontWeight:700,fontSize:18}}>{fmtVND(total)}</span>
        </div>
      </div>
      <p style={{color:"#3d5a7a",fontSize:13,marginBottom:28}}>Chúng tôi sẽ xác nhận qua SĐT <strong style={{color:"#e8f0ff"}}>{linkedM?.phone||form.phone}</strong> trong 5 phút</p>
      <button onClick={reset} style={{padding:"13px 36px",background:"linear-gradient(135deg,#10B981,#059669)",border:"none",borderRadius:100,color:"white",fontWeight:700,cursor:"pointer",fontSize:15}}>
        Đặt sân mới
      </button>
    </div>
  );

  return (
    <div>
      {/* Progress */}
      <div style={{marginBottom:36}}>
        <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:10}}>
          {steps.map((label,i) => {
            const n=i+1; const active=step===n; const done=step>n;
            return (
              <div key={n} style={{display:"flex",alignItems:"center",flex:1}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:"none"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,transition:"all .3s",
                    background:done?"#10B981":active?"rgba(16,185,129,.2)":"rgba(255,255,255,.04)",
                    color:done||active?"#10B981":"#2a4060",
                    border:`2px solid ${done||active?"#10B981":"#1e3a5a"}`}}>
                    {done?"✓":n}
                  </div>
                  <span style={{fontSize:10,color:done||active?"#10B981":"#2a4060",marginTop:4,whiteSpace:"nowrap"}}>{label}</span>
                </div>
                {i<steps.length-1 && <div style={{flex:1,height:2,background:done?"#10B981":"#1e2d42",margin:"0 4px",marginBottom:16,transition:"background .3s"}}></div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step 1: Sport ── */}
      {step===1 && (
        <div>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:26,margin:"0 0 6px"}}>Chọn môn thể thao</h3>
          <p style={{color:"#4a6a8a",margin:"0 0 28px",fontSize:14}}>Bạn muốn chơi môn nào hôm nay?</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[{name:"Tennis",emoji:"🎾",subs:"3 sân · Hard/Clay/Grass",color:"#10B981"},{name:"Pickleball",emoji:"🏓",subs:"2 sân · Indoor cao cấp",color:"#6366F1"},{name:"Badminton",emoji:"🏸",subs:"1 sân · Wood floor",color:"#F59E0B"}].map(s=>(
              <div key={s.name} onClick={()=>{setSport(s.name);setStep(2);}}
                style={{padding:"28px 20px",borderRadius:18,border:`2px solid ${sport===s.name?s.color:"#1e2d42"}`,background:sport===s.name?`${s.color}0d`:"rgba(255,255,255,.02)",cursor:"pointer",textAlign:"center",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=s.color;e.currentTarget.style.background=`${s.color}0a`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=sport===s.name?s.color:"#1e2d42";e.currentTarget.style.background=sport===s.name?`${s.color}0d`:"rgba(255,255,255,.02)";}}>
                <div style={{fontSize:50,marginBottom:12}}>{s.emoji}</div>
                <div style={{color:"#e8f0ff",fontWeight:700,fontSize:18,marginBottom:4}}>{s.name}</div>
                <div style={{color:s.color,fontSize:13}}>{s.subs}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Court + Date ── */}
      {step===2 && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>setStep(1)} style={{background:"rgba(255,255,255,.04)",border:"1px solid #1e2d42",borderRadius:10,padding:"7px 14px",color:"#4a6a8a",cursor:"pointer",fontSize:13}}>← Quay lại</button>
            <div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:26,margin:0}}>Chọn sân & ngày</h3>
              <p style={{color:"#4a6a8a",margin:0,fontSize:13}}>{sport}</p>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <label style={{color:"#4a6a8a",fontSize:13,whiteSpace:"nowrap"}}>Chọn ngày:</label>
            <input type="date" value={date} min={todayStr()} onChange={e=>setDate(e.target.value)}
              style={{background:"#0d1a2b",border:"1px solid #1e3a5a",borderRadius:10,padding:"9px 14px",color:"#e8f0ff",fontSize:14,outline:"none"}} />
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {filteredCourts.map(c=>(
              <div key={c.id} onClick={()=>{setCourt(c);setStep(3);}}
                style={{padding:20,borderRadius:16,border:`2px solid ${court?.id===c.id?c.color:"#1e2d42"}`,background:"rgba(255,255,255,.02)",cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=court?.id===c.id?c.color:"#1e2d42";}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div>
                    <div style={{color:"#e8f0ff",fontWeight:700,fontSize:15}}>{c.name}</div>
                    <div style={{color:"#4a6a8a",fontSize:12,marginTop:2}}>{c.surface} · {c.indoor?"🏠 Indoor":"☀️ Outdoor"}</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:c.color,fontWeight:700,fontSize:16}}>{fmtVND(c.price)}<span style={{color:"#4a6a8a",fontWeight:400,fontSize:12}}>/h</span></span>
                  <span style={{color:"#F59E0B",fontSize:11,background:"rgba(245,158,11,.1)",padding:"2px 8px",borderRadius:6}}>⚡ Peak {fmtVND(c.peakPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 3: Time ── */}
      {step===3 && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>setStep(2)} style={{background:"rgba(255,255,255,.04)",border:"1px solid #1e2d42",borderRadius:10,padding:"7px 14px",color:"#4a6a8a",cursor:"pointer",fontSize:13}}>← Quay lại</button>
            <div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:26,margin:0}}>Chọn khung giờ</h3>
              <p style={{color:"#4a6a8a",margin:0,fontSize:13}}>{court?.name} · {date}</p>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
            <span style={{color:"#4a6a8a",fontSize:13}}>Thời lượng:</span>
            {[1,1.5,2].map(d=>(
              <button key={d} onClick={()=>setDur(d)}
                style={{padding:"7px 18px",borderRadius:100,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all .2s",
                  background:duration===d?"#10B981":"rgba(255,255,255,.04)",color:duration===d?"white":"#4a6a8a"}}>
                {d}h
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",fontSize:12,color:"#4a6a8a"}}>
            {[["#F59E0B","Giờ peak (17–21h)"],["#1e3a5a","Đã đặt"],["#10B981","Đang chọn"]].map(([c,l])=>(
              <span key={l} style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:c,display:"inline-block"}}></span>{l}</span>
            ))}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
            {TIME_SLOTS.map(t=>{
              const taken=isSlotTaken(court?.id,date,t); const sel=time===t; const peak=isPeak(t);
              return (
                <button key={t} disabled={taken} onClick={()=>setTime(t)}
                  style={{padding:"11px 14px",borderRadius:12,border:`1px solid ${taken?"#1e2d42":sel?"#10B981":peak?"rgba(245,158,11,.3)":"#1e3a5a"}`,cursor:taken?"not-allowed":"pointer",fontSize:13,fontWeight:sel?700:400,minWidth:72,transition:"all .15s",
                    background:taken?"rgba(255,255,255,.02)":sel?"#10B981":peak?"rgba(245,158,11,.08)":"rgba(255,255,255,.03)",
                    color:taken?"#1e2d42":sel?"white":peak?"#F59E0B":"#8aabb0"}}>
                  {t}
                  {peak&&!taken&&<div style={{fontSize:9,marginTop:1,opacity:.7}}>PEAK</div>}
                </button>
              );
            })}
          </div>
          {time && (
            <div style={{background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.2)",borderRadius:14,padding:"14px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#c8d8ea",fontSize:14}}>⏰ {time} · {duration}h · {isPeak(time)?"⚡ Giờ peak":"Giờ thường"}</span>
              <span style={{color:"#10B981",fontWeight:700,fontSize:18}}>{fmtVND(isPeak(time)?court.peakPrice*duration:court.price*duration)}</span>
            </div>
          )}
          <button disabled={!time} onClick={()=>setStep(4)}
            style={{width:"100%",padding:"13px",background:time?"linear-gradient(135deg,#10B981,#059669)":"rgba(255,255,255,.04)",border:"none",borderRadius:14,color:time?"white":"#2a4060",fontWeight:700,fontSize:15,cursor:time?"pointer":"not-allowed",transition:"all .2s"}}>
            Tiếp theo →
          </button>
        </div>
      )}

      {/* ── Step 4: Info ── */}
      {step===4 && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>setStep(3)} style={{background:"rgba(255,255,255,.04)",border:"1px solid #1e2d42",borderRadius:10,padding:"7px 14px",color:"#4a6a8a",cursor:"pointer",fontSize:13}}>← Quay lại</button>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:26,margin:0}}>Thông tin của bạn</h3>
          </div>

          {/* Member link box */}
          <div style={{background:"rgba(245,158,11,.05)",border:"1px solid rgba(245,158,11,.2)",borderRadius:14,padding:16,marginBottom:20}}>
            <div style={{color:"#F59E0B",fontWeight:600,fontSize:13,marginBottom:10}}>⭐ Thành viên? Liên kết để nhận ưu đãi giảm giá</div>
            {linkedM ? (
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><span style={{color:"#10B981",fontWeight:700,fontSize:14}}>{linkedM.name}</span><span style={{marginLeft:8}}><Chip plan={linkedM.plan}/></span><div style={{color:"#4a6a8a",fontSize:12,marginTop:3}}>Giảm {plan?.courtDiscount}% · Credit: {fmtVND(linkedM.credit)}</div></div>
                <button onClick={()=>setLinkedM(null)} style={{background:"none",border:"none",color:"#3d5a7a",cursor:"pointer",fontSize:20}}>×</button>
              </div>
            ) : (
              <div>
                <div style={{display:"flex",gap:8}}>
                  <input placeholder="Nhập SĐT, email hoặc tên thành viên..." value={mSearch} onChange={e=>setMSearch(e.target.value)}
                    style={{flex:1,background:"#0a1422",border:"1px solid #1e3a5a",borderRadius:10,padding:"9px 13px",color:"#e8f0ff",fontSize:13,outline:"none"}} />
                </div>
                {mResults.length>0 && (
                  <div style={{background:"#0a1422",border:"1px solid #1e3a5a",borderRadius:10,marginTop:6,overflow:"hidden"}}>
                    {mResults.map(m=>(
                      <div key={m.id} onClick={()=>{setLinkedM(m);setMSearch("");setForm(f=>({...f,name:m.name,phone:m.phone,email:m.email}));}}
                        style={{padding:"9px 13px",cursor:"pointer",borderBottom:"1px solid #1e2d42",display:"flex",justifyContent:"space-between",alignItems:"center"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#0f1f30"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <span style={{color:"#c8d8ea",fontSize:13}}>{m.name} · {m.phone}</span>
                        <Chip plan={m.plan}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            {[["Họ và tên *","name","text"],["Số điện thoại *","phone","tel"]].map(([l,f,t])=>(
              <div key={f}>
                <label style={{color:"#4a6a8a",fontSize:12,display:"block",marginBottom:5}}>{l}</label>
                <input type={t} value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))}
                  style={{width:"100%",boxSizing:"border-box",background:"#0a1422",border:"1px solid #1e3a5a",borderRadius:11,padding:"11px 14px",color:"#e8f0ff",fontSize:14,outline:"none"}} />
              </div>
            ))}
          </div>
          <div style={{marginBottom:12}}>
            <label style={{color:"#4a6a8a",fontSize:12,display:"block",marginBottom:5}}>Email</label>
            <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
              style={{width:"100%",boxSizing:"border-box",background:"#0a1422",border:"1px solid #1e3a5a",borderRadius:11,padding:"11px 14px",color:"#e8f0ff",fontSize:14,outline:"none"}} />
          </div>
          <div style={{marginBottom:16}}>
            <label style={{color:"#4a6a8a",fontSize:12,display:"block",marginBottom:5}}>Ghi chú (thiết bị, yêu cầu đặc biệt...)</label>
            <textarea rows={2} value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))}
              style={{width:"100%",boxSizing:"border-box",background:"#0a1422",border:"1px solid #1e3a5a",borderRadius:11,padding:"11px 14px",color:"#e8f0ff",fontSize:14,outline:"none",resize:"vertical"}} />
          </div>

          {linkedM?.credit>0 && (
            <label style={{display:"flex",gap:10,alignItems:"center",cursor:"pointer",marginBottom:16}}>
              <input type="checkbox" checked={useCredit} onChange={e=>setUseCredit(e.target.checked)} style={{width:16,height:16,accentColor:"#10B981"}}/>
              <span style={{color:"#F59E0B",fontSize:14}}>Dùng credit {fmtVND(Math.min(linkedM.credit,afterDisc))}</span>
            </label>
          )}

          <button disabled={!form.name||!form.phone} onClick={()=>setStep(5)}
            style={{width:"100%",padding:"13px",background:form.name&&form.phone?"linear-gradient(135deg,#10B981,#059669)":"rgba(255,255,255,.04)",border:"none",borderRadius:14,color:form.name&&form.phone?"white":"#2a4060",fontWeight:700,fontSize:15,cursor:form.name&&form.phone?"pointer":"not-allowed"}}>
            Xem xác nhận →
          </button>
        </div>
      )}

      {/* ── Step 5: Confirm ── */}
      {step===5 && (
        <div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>setStep(4)} style={{background:"rgba(255,255,255,.04)",border:"1px solid #1e2d42",borderRadius:10,padding:"7px 14px",color:"#4a6a8a",cursor:"pointer",fontSize:13}}>← Quay lại</button>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:26,margin:0}}>Xác nhận đặt sân</h3>
          </div>
          <div style={{background:"#0d1a2b",borderRadius:16,padding:20,marginBottom:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              {[["Sân",court?.name],["Môn",sport],["Ngày",date],["Giờ bắt đầu",time],["Thời lượng",`${duration} giờ`],["Bề mặt",court?.surface]].map(([k,v])=>(
                <div key={k} style={{background:"rgba(255,255,255,.02)",borderRadius:10,padding:"10px 14px"}}>
                  <div style={{color:"#3d5a7a",fontSize:11,marginBottom:3}}>{k}</div>
                  <div style={{color:"#e8f0ff",fontWeight:600}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{borderTop:"1px solid #1e2d42",paddingTop:12}}>
              {[["Tên",linkedM?.name||form.name],["SĐT",linkedM?.phone||form.phone],["Email",linkedM?.email||form.email||"—"]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                  <span style={{color:"#3d5a7a",fontSize:13}}>{k}</span><span style={{color:"#8aabb0",fontSize:13}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.2)",borderRadius:16,padding:18,marginBottom:16}}>
            {afterDisc<base&&<div style={{display:"flex",justifyContent:"space-between",color:"#10B981",fontSize:14,marginBottom:6}}>
              <span>Giảm thành viên ({plan?.courtDiscount}%)</span><span>−{fmtVND(base-afterDisc)}</span></div>}
            {creditAmt>0&&<div style={{display:"flex",justifyContent:"space-between",color:"#F59E0B",fontSize:14,marginBottom:6}}>
              <span>Credit</span><span>−{fmtVND(creditAmt)}</span></div>}
            <div style={{display:"flex",justifyContent:"space-between",color:"#e8f0ff",fontWeight:800,fontSize:22,borderTop:"1px solid rgba(16,185,129,.15)",paddingTop:12,marginTop:4}}>
              <span>Tổng thanh toán</span><span style={{color:"#10B981"}}>{fmtVND(total)}</span>
            </div>
          </div>
          <p style={{color:"#3d5a7a",fontSize:12,textAlign:"center",marginBottom:14}}>💳 Thanh toán khi đến sân hoặc chuyển khoản sau khi nhận xác nhận</p>
          <button onClick={submit}
            style={{width:"100%",padding:"15px",background:"linear-gradient(135deg,#10B981,#059669)",border:"none",borderRadius:14,color:"white",fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:"0 8px 28px rgba(16,185,129,.3)"}}>
            ✅ Xác nhận đặt sân
          </button>
        </div>
      )}
    </div>
  );
}

/* — Customer Website — */
function CustomerSite({ store }) {
  const [scrolled, setScrolled] = useState(false);
  const bookRef = useRef();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY>60);
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);

  const scrollToBook = () => bookRef.current?.scrollIntoView({behavior:"smooth"});

  return (
    <div style={{minHeight:"100vh",background:"#060d1a",fontFamily:"'Outfit',sans-serif",color:"#e8f0ff"}}>

      {/* ── NAV ── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:500,transition:"all .3s",
        background:scrolled?"rgba(6,13,26,.92)":"transparent",
        backdropFilter:scrolled?"blur(20px)":"none",
        borderBottom:scrolled?"1px solid rgba(30,45,66,.6)":"none",
        padding:"0 clamp(20px,5vw,60px)",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>⚡</span>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:22,color:"#e8f0ff",letterSpacing:.5}}>SportHub</span>
        </div>
        <div style={{display:"flex",gap:28}}>
          {["Sân thể thao","Dịch vụ","Thành viên","Về chúng tôi"].map(l=>(
            <a key={l} href="#" style={{color:"#4a6a8a",textDecoration:"none",fontSize:14,fontWeight:500,transition:"color .2s"}}
              onMouseEnter={e=>e.target.style.color="#e8f0ff"} onMouseLeave={e=>e.target.style.color="#4a6a8a"}>
              {l}
            </a>
          ))}
        </div>
        <button onClick={scrollToBook}
          style={{padding:"9px 24px",background:"linear-gradient(135deg,#10B981,#059669)",border:"none",borderRadius:100,color:"white",fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:.3}}>
          Đặt sân →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{minHeight:"100vh",position:"relative",display:"flex",alignItems:"center",overflow:"hidden"}}>
        {/* BG effects */}
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 60% 50% at 70% 40%, rgba(16,185,129,.1) 0%, transparent 70%)"}}></div>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 40% 40% at 20% 70%, rgba(99,102,241,.07) 0%, transparent 70%)"}}></div>
        {/* grid lines */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.03}} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="g" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M 56 0 L 0 0 0 56" fill="none" stroke="#10B981" strokeWidth=".6"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
        </svg>
        {/* Floating court lines */}
        <div style={{position:"absolute",right:"8%",top:"15%",opacity:.06}}>
          <svg width="320" height="320" viewBox="0 0 320 320">
            <rect x="20" y="20" width="280" height="280" fill="none" stroke="#10B981" strokeWidth="3"/>
            <line x1="20" y1="160" x2="300" y2="160" stroke="#10B981" strokeWidth="2"/>
            <line x1="160" y1="20" x2="160" y2="300" stroke="#10B981" strokeWidth="2"/>
            <circle cx="160" cy="160" r="40" fill="none" stroke="#10B981" strokeWidth="2"/>
            <line x1="80" y1="20" x2="80" y2="300" stroke="#10B981" strokeWidth="1.5"/>
            <line x1="240" y1="20" x2="240" y2="300" stroke="#10B981" strokeWidth="1.5"/>
          </svg>
        </div>

        <div style={{maxWidth:1100,margin:"0 auto",padding:"120px clamp(20px,5vw,60px) 80px",position:"relative",zIndex:1}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.25)",borderRadius:100,padding:"6px 16px",marginBottom:24}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#10B981",display:"inline-block",animation:"blink 1.4s infinite"}}></span>
            <span style={{color:"#10B981",fontSize:12,fontWeight:700,letterSpacing:1.5}}>ĐẶT SÂN ONLINE 24/7 · XÁC NHẬN TỨC THÌ</span>
          </div>

          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(44px,6.5vw,88px)",lineHeight:1.02,margin:"0 0 22px",maxWidth:720,fontWeight:700}}>
            Nơi đam mê<br/>
            <span style={{WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",backgroundImage:"linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)"}}>thể thao</span><br/>
            tỏa sáng
          </h1>

          <p style={{color:"#4a6a8a",fontSize:"clamp(15px,1.4vw,18px)",maxWidth:480,lineHeight:1.75,marginBottom:40}}>
            Đặt sân Tennis, Pickleball, Badminton chỉ trong 60 giây. Không cần gọi điện — chọn sân, chọn giờ, xác nhận ngay.
          </p>

          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:60}}>
            <button onClick={scrollToBook}
              style={{padding:"15px 36px",background:"linear-gradient(135deg,#10B981,#059669)",border:"none",borderRadius:100,color:"white",fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:"0 10px 36px rgba(16,185,129,.4)",letterSpacing:.3}}>
              Đặt sân ngay
            </button>
            <button style={{padding:"15px 36px",background:"transparent",border:"1px solid rgba(255,255,255,.12)",borderRadius:100,color:"#8aabb0",fontWeight:600,fontSize:16,cursor:"pointer"}}>
              Tìm hiểu thêm
            </button>
          </div>

          {/* Sport quick tags */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {[["🎾","Tennis","3 sân"],["🏓","Pickleball","2 sân"],["🏸","Badminton","1 sân"],["⚡","Giờ Peak","17–21h"]].map(([ic,l,sub])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.03)",border:"1px solid #1e2d42",borderRadius:12,padding:"8px 14px"}}>
                <span style={{fontSize:16}}>{ic}</span>
                <div><div style={{color:"#c8d8ea",fontSize:13,fontWeight:600}}>{l}</div><div style={{color:"#3d5a7a",fontSize:11}}>{sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div style={{background:"#0a1422",borderTop:"1px solid #1e2d42",borderBottom:"1px solid #1e2d42",padding:"28px clamp(20px,5vw,60px)"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24,textAlign:"center"}}>
          {[["6+","Sân chuyên nghiệp"],["3","Môn thể thao"],["24/7","Đặt sân online"],["5 min","Xác nhận đơn"]].map(([v,l])=>(
            <div key={l}><div style={{fontFamily:"'Cormorant Garamond',serif",color:"#10B981",fontWeight:700,fontSize:36}}>{v}</div><div style={{color:"#4a6a8a",fontSize:13,marginTop:3}}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* ── COURTS SHOWCASE ── */}
      <section style={{padding:"80px clamp(20px,5vw,60px)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <p style={{color:"#10B981",letterSpacing:3,fontSize:12,fontWeight:700,marginBottom:10}}>CƠ SỞ VẬT CHẤT</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,margin:"0 0 12px"}}>Sân thể thao đẳng cấp</h2>
            <p style={{color:"#4a6a8a",maxWidth:480,margin:"0 auto"}}>Hệ thống chiếu sáng hiện đại, mặt sân chuẩn quốc tế</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {COURTS.map(c=>(
              <div key={c.id} onClick={scrollToBook}
                style={{background:"#0a1422",borderRadius:16,border:"1px solid #1e2d42",overflow:"hidden",cursor:"pointer",transition:"all .25s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color;e.currentTarget.style.transform="translateY(-3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e2d42";e.currentTarget.style.transform="translateY(0)";}}>
                {/* Color band */}
                <div style={{height:4,background:c.color}}></div>
                <div style={{padding:"18px 20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{color:"#e8f0ff",fontWeight:700,fontSize:15}}>{c.name}</div>
                      <div style={{color:"#4a6a8a",fontSize:12,marginTop:2}}>{c.surface}</div>
                    </div>
                    <span style={{background:c.indoor?"rgba(99,102,241,.12)":"rgba(245,158,11,.12)",color:c.indoor?"#818CF8":"#F59E0B",fontSize:10,padding:"3px 8px",borderRadius:6,fontWeight:600}}>
                      {c.indoor?"Indoor":"Outdoor"}
                    </span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:c.color,fontWeight:700,fontSize:16}}>{fmtVND(c.price)}<span style={{color:"#4a6a8a",fontWeight:400,fontSize:12}}>/h</span></span>
                    <span style={{color:"#F59E0B",fontSize:11}}>⚡ {fmtVND(c.peakPrice)}/h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKING SECTION ── */}
      <section ref={bookRef} id="booking" style={{padding:"60px clamp(20px,5vw,60px)",background:"#060d1a"}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <p style={{color:"#10B981",letterSpacing:3,fontSize:12,fontWeight:700,marginBottom:10}}>ĐẶT SÂN ONLINE</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,margin:"0 0 10px"}}>Nhanh · Dễ · Chắc chắn</h2>
            <p style={{color:"#4a6a8a"}}>Hoàn tất đặt sân trong 5 bước đơn giản</p>
          </div>
          <div style={{background:"#0a1628",borderRadius:24,border:"1px solid #1e2d42",padding:"clamp(24px,4vw,40px)",boxShadow:"0 24px 64px rgba(0,0,0,.5)"}}>
            <BookingFlow isSlotTaken={store.isSlotTaken} addOnlineRequest={store.addOnlineRequest} members={store.members}/>
          </div>
        </div>
      </section>

      {/* ── MEMBERSHIP ── */}
      <section style={{padding:"80px clamp(20px,5vw,60px)",background:"#0a1422"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <p style={{color:"#F59E0B",letterSpacing:3,fontSize:12,fontWeight:700,marginBottom:10}}>GÓI THÀNH VIÊN</p>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,margin:"0 0 10px"}}>Chơi nhiều, tiết kiệm nhiều</h2>
            <p style={{color:"#4a6a8a",maxWidth:460,margin:"0 auto"}}>Thành viên nhận giảm giá sân, tặng credit và quyền đặt ưu tiên</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {MEMBERSHIP_PLANS.map((plan,i)=>(
              <div key={plan.id} style={{borderRadius:22,border:`2px solid ${i===1?plan.color:plan.color+"33"}`,background:i===1?`${plan.color}08`:"rgba(255,255,255,.02)",padding:28,position:"relative"}}>
                {i===1&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#10B981",color:"#060d1a",fontSize:10,fontWeight:700,padding:"4px 16px",borderRadius:100,letterSpacing:1.5,whiteSpace:"nowrap"}}>PHỔ BIẾN NHẤT</div>}
                <div style={{color:plan.color,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:6}}>{plan.name.toUpperCase()}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:32,fontWeight:700,marginBottom:4}}>
                  {fmtVND(plan.price)}<span style={{fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:400,color:"#4a6a8a"}}>/tháng</span>
                </div>
                <div style={{color:"#4a6a8a",fontSize:13,marginBottom:22}}>Gói {plan.name} · {plan.duration} ngày</div>
                <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
                  {[`Giảm ${plan.courtDiscount}% giá sân`,`Giảm ${plan.shopDiscount}% tại shop`,plan.priority?"Ưu tiên đặt giờ peak":null,plan.guests>0?`${plan.guests} guest pass/tháng`:null,plan.credit>0?`${fmtVND(plan.credit)} credit/tháng`:null].filter(Boolean).map(b=>(
                    <div key={b} style={{display:"flex",gap:8}}><span style={{color:plan.color}}>✓</span><span style={{color:"#8aabb0",fontSize:13}}>{b}</span></div>
                  ))}
                </div>
                <button style={{width:"100%",padding:"11px",background:i===1?`linear-gradient(135deg,${plan.color},#059669)`:`${plan.color}22`,border:`1px solid ${plan.color}66`,borderRadius:12,color:i===1?"white":plan.color,fontWeight:700,cursor:"pointer",fontSize:14}}>
                  Đăng ký
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:"#060d1a",borderTop:"1px solid #1e2d42",padding:"28px clamp(20px,5vw,60px)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:20,fontWeight:700}}>⚡ SportHub</div>
        <div style={{color:"#3d5a7a",fontSize:13}}>📍 123 Đường Thể Thao, TP.HCM &nbsp;·&nbsp; 📞 1800-SPORT &nbsp;·&nbsp; ✉ hello@sporthub.vn</div>
        <div style={{color:"#1e2d42",fontSize:12}}>© 2026 SportHub</div>
      </footer>

      <AIChatWidget members={store.members}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN PORTAL
═══════════════════════════════════════════════════════════ */
function AdminDash({ store }) {
  const t = todayStr();
  const todayBk = store.bookings.filter(b=>b.date===t);
  const pendingCount = store.pending.filter(p=>p.status==="pending").length;
  const todayRev = todayBk.reduce((s,b)=>s+b.finalPrice,0);
  const stats = [
    {label:"Đặt sân hôm nay",  value:todayBk.length,  icon:"🎾", color:"#10B981"},
    {label:"Chờ duyệt online", value:pendingCount,     icon:"🔔", color:"#F59E0B", highlight:pendingCount>0},
    {label:"Doanh thu hôm nay",value:fmtVND(todayRev), icon:"💰", color:"#6366F1"},
    {label:"Thành viên",       value:store.members.length, icon:"👥", color:"#EC4899"},
  ];
  const onlineCount = store.bookings.filter(b=>b.source==="online").length;
  const adminCount  = store.bookings.filter(b=>b.source==="admin").length;
  return (
    <div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:28,margin:"0 0 6px"}}>Dashboard</h2>
      <p style={{color:"#4a6a8a",fontSize:13,margin:"0 0 24px"}}>{new Date().toLocaleDateString("vi-VN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:"#0f1f30",borderRadius:14,padding:18,border:`1px solid ${s.highlight?"#F59E0B44":"#1e2d42"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:22}}>{s.icon}</span>
              {s.highlight&&<span style={{background:"#F59E0B",color:"#060d1a",fontSize:10,padding:"2px 8px",borderRadius:100,fontWeight:700}}>MỚI</span>}
            </div>
            <div style={{color:"#e8f0ff",fontSize:21,fontWeight:700,marginBottom:3}}>{s.value}</div>
            <div style={{color:"#3d5a7a",fontSize:12}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:"#0f1f30",borderRadius:14,padding:18,border:"1px solid #1e2d42"}}>
          <h4 style={{color:"#e8f0ff",margin:"0 0 12px",fontSize:14}}>Nguồn đặt sân</h4>
          <div style={{display:"flex",gap:3,height:8,borderRadius:4,overflow:"hidden",marginBottom:8}}>
            <div style={{background:"#10B981",flex:onlineCount+1}}></div>
            <div style={{background:"#6366F1",flex:adminCount+1}}></div>
          </div>
          <div style={{display:"flex",gap:16,fontSize:12}}>
            <span style={{color:"#10B981"}}>● Online: {onlineCount}</span>
            <span style={{color:"#6366F1"}}>● Admin: {adminCount}</span>
          </div>
        </div>
        <div style={{background:"#0f1f30",borderRadius:14,padding:18,border:"1px solid #1e2d42"}}>
          <h4 style={{color:"#e8f0ff",margin:"0 0 12px",fontSize:14}}>Sân hôm nay</h4>
          {SPORTS.map(s=>{
            const cnt = todayBk.filter(b=>b.courtName?.toLowerCase().includes(s.toLowerCase())).length;
            return <div key={s} style={{display:"flex",justifyContent:"space-between",padding:"3px 0"}}>
              <span style={{color:"#4a6a8a",fontSize:13}}>{s}</span>
              <span style={{color:"#e8f0ff",fontSize:13,fontWeight:600}}>{cnt} lượt</span>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}

function AdminPending({ store }) {
  const queue = store.pending.filter(p=>p.status==="pending");
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:28,margin:"0 0 4px"}}>Đặt sân Online</h2>
          <p style={{color:"#4a6a8a",fontSize:13,margin:0}}>Yêu cầu từ website — cần xét duyệt</p>
        </div>
        {queue.length>0&&<div style={{background:"#F59E0B",color:"#060d1a",padding:"6px 16px",borderRadius:100,fontSize:13,fontWeight:700}}>{queue.length} chờ duyệt</div>}
      </div>
      {queue.length===0&&(
        <div style={{background:"#0f1f30",borderRadius:14,padding:48,textAlign:"center",border:"1px solid #1e2d42"}}>
          <div style={{fontSize:44,marginBottom:10}}>✅</div>
          <p style={{color:"#3d5a7a",margin:0}}>Không có yêu cầu đang chờ</p>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {queue.map(b=>(
          <div key={b.id} style={{background:"#0f1f30",borderRadius:16,padding:20,border:"1px solid rgba(245,158,11,.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                  <span style={{color:"#e8f0ff",fontWeight:700,fontSize:16}}>{b.courtName}</span>
                  <span style={{background:"rgba(16,185,129,.12)",color:"#10B981",fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:700}}>🌐 ONLINE</span>
                  {b.memberPlan&&<Chip plan={b.memberPlan}/>}
                </div>
                <div style={{color:"#4a6a8a",fontSize:13}}>{b.date} · {b.time} · {b.duration}h</div>
                <div style={{color:"#4a6a8a",fontSize:12}}>Ref: <span style={{color:"#F59E0B",fontWeight:600}}>{b.ref}</span> · {b.createdAt}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:"#10B981",fontWeight:700,fontSize:20}}>{fmtVND(b.finalPrice)}</div>
                {b.creditUsed>0&&<div style={{color:"#F59E0B",fontSize:12}}>Credit: −{fmtVND(b.creditUsed)}</div>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,background:"#080f1c",borderRadius:10,padding:12,marginBottom:12}}>
              {[["Khách",b.customerName],["SĐT",b.customerPhone],["Email",b.customerEmail||"—"]].map(([k,v])=>(
                <div key={k}><div style={{color:"#3d5a7a",fontSize:11}}>{k}</div><div style={{color:"#c8d8ea",fontSize:13,fontWeight:500}}>{v}</div></div>
              ))}
            </div>
            {b.note&&<div style={{background:"#080f1c",borderRadius:8,padding:"8px 12px",marginBottom:12,color:"#8aabb0",fontSize:13}}>📝 {b.note}</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>store.approveRequest(b.id)}
                style={{flex:1,padding:"11px",background:"#10B981",border:"none",borderRadius:10,color:"white",fontWeight:700,cursor:"pointer",fontSize:14}}>
                ✅ Xác nhận
              </button>
              <button onClick={()=>store.rejectRequest(b.id)}
                style={{flex:1,padding:"11px",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,color:"#EF4444",fontWeight:700,cursor:"pointer",fontSize:14}}>
                ✗ Từ chối
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Processed */}
      {store.pending.filter(p=>p.status!=="pending").length>0&&(
        <div style={{marginTop:24}}>
          <h4 style={{color:"#3d5a7a",fontSize:13,marginBottom:10}}>Đã xử lý</h4>
          {store.pending.filter(p=>p.status!=="pending").map(b=>(
            <div key={b.id} style={{background:"#0f1f30",borderRadius:10,padding:12,border:"1px solid #1e2d42",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:.55}}>
              <span style={{color:"#8aabb0",fontSize:14}}>{b.courtName} · {b.date} {b.time} · {b.customerName}</span>
              <span style={{fontSize:12,padding:"3px 10px",borderRadius:6,fontWeight:600,
                background:b.status==="confirmed"?"rgba(16,185,129,.1)":"rgba(239,68,68,.1)",
                color:b.status==="confirmed"?"#10B981":"#EF4444"}}>
                {b.status==="confirmed"?"✓ Đã duyệt":"✗ Từ chối"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminBooking({ store }) {
  const [date,setDate]=useState(todayStr());
  const [court,setCourt]=useState(null);
  const [time,setTime]=useState(null);
  const [dur,setDur]=useState(1);
  const [name,setName]=useState(""); const [phone,setPhone]=useState("");
  const [sm,setSm]=useState(""); const [selM,setSelM]=useState(null);
  const [filterSport,setFilter]=useState("All");

  const fc = filterSport==="All"?COURTS:COURTS.filter(c=>c.sport===filterSport);
  const plan = selM?MEMBERSHIP_PLANS.find(p=>p.id===selM.plan):null;
  const base = court?(isPeak(time||"09:00")?court.peakPrice:court.price)*dur:0;
  const disc = plan?Math.round(base*(1-plan.courtDiscount/100)):base;
  const mr = store.members.filter(m=>sm.length>1&&(m.phone.includes(sm)||m.name.toLowerCase().includes(sm.toLowerCase())));

  const confirm = () => {
    if (!court||!time||((!selM)&&!name)){alert("Thiếu thông tin");return;}
    store.addAdminBooking({courtId:court.id,courtName:court.name,date,time,duration:dur,customerName:selM?.name||name,customerPhone:selM?.phone||phone,memberId:selM?.id||null,memberPlan:selM?.plan||null,basePrice:base,discountedPrice:disc,creditUsed:0,finalPrice:disc,payMethod:"cash"});
    setCourt(null);setTime(null);setSelM(null);setName("");setPhone("");alert("✅ Đã đặt sân!");
  };

  return (
    <div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:28,margin:"0 0 20px"}}>Đặt Sân (Admin)</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 290px",gap:20}}>
        <div>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{background:"#0f1f30",border:"1px solid #1e2d42",borderRadius:8,padding:"8px 12px",color:"#e8f0ff",fontSize:13,outline:"none"}} />
            {["All",...SPORTS].map(s=>(
              <button key={s} onClick={()=>setFilter(s)}
                style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:filterSport===s?"#10B981":"#0f1f30",color:filterSport===s?"white":"#4a6a8a"}}>
                {s}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {fc.map(c=>(
              <div key={c.id} onClick={()=>setCourt(c)}
                style={{background:"#0f1f30",borderRadius:12,padding:14,border:`2px solid ${court?.id===c.id?c.color:"#1e2d42"}`,cursor:"pointer"}}>
                <div style={{color:"#e8f0ff",fontWeight:700,fontSize:13,marginBottom:3}}>{c.name}</div>
                <div style={{color:"#3d5a7a",fontSize:11,marginBottom:8}}>{c.sport} · {c.surface}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                  {TIME_SLOTS.map(t=>{
                    const bk=store.isSlotTaken(c.id,date,t); const sel=court?.id===c.id&&time===t;
                    return <button key={t} disabled={bk} onClick={e=>{e.stopPropagation();setCourt(c);setTime(t);}}
                      style={{padding:"3px 6px",fontSize:10,borderRadius:4,border:"none",cursor:bk?"not-allowed":"pointer",
                        background:bk?"#1e2d42":sel?"#10B981":"#080f1c",color:bk?"#1e2d42":sel?"white":"#4a6a8a"}}>{t}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"#0f1f30",borderRadius:14,padding:18,border:"1px solid #1e2d42",height:"fit-content"}}>
          <h4 style={{color:"#e8f0ff",margin:"0 0 14px",fontSize:14}}>Chi tiết đặt sân</h4>
          {court&&time&&<div style={{background:"#080f1c",borderRadius:8,padding:10,marginBottom:10,fontSize:12}}>
            <div style={{color:court.color,fontWeight:700}}>{court.name}</div>
            <div style={{color:"#4a6a8a"}}>{date} · {time} · {isPeak(time)?"⚡ Peak":"Thường"}</div>
          </div>}
          <select value={dur} onChange={e=>setDur(+e.target.value)}
            style={{width:"100%",background:"#080f1c",border:"1px solid #1e2d42",borderRadius:8,padding:"8px 10px",color:"#e8f0ff",fontSize:13,marginBottom:10,outline:"none"}}>
            {[1,1.5,2,3].map(d=><option key={d} value={d}>{d}h</option>)}
          </select>
          <input placeholder="Tìm thành viên SĐT/tên..." value={sm} onChange={e=>setSm(e.target.value)}
            style={{width:"100%",boxSizing:"border-box",background:"#080f1c",border:"1px solid #1e2d42",borderRadius:8,padding:"8px 10px",color:"#e8f0ff",fontSize:13,marginBottom:4,outline:"none"}} />
          {mr.length>0&&<div style={{background:"#080f1c",border:"1px solid #1e2d42",borderRadius:8,marginBottom:6}}>
            {mr.map(m=><div key={m.id} onClick={()=>{setSelM(m);setSm("");}}
              style={{padding:"6px 10px",cursor:"pointer",borderBottom:"1px solid #1e2d4244",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:"#c8d8ea",fontSize:12}}>{m.name} · {m.phone}</span><Chip plan={m.plan}/>
            </div>)}
          </div>}
          {selM?<div style={{background:"#080f1c",borderRadius:8,padding:"6px 10px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"#10B981",fontSize:12,fontWeight:600}}>{selM.name}</span>
            <button onClick={()=>setSelM(null)} style={{background:"none",border:"none",color:"#3d5a7a",cursor:"pointer",fontSize:16}}>×</button>
          </div>:<>
            <input placeholder="Tên khách" value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",boxSizing:"border-box",background:"#080f1c",border:"1px solid #1e2d42",borderRadius:8,padding:"8px 10px",color:"#e8f0ff",fontSize:13,marginBottom:6,outline:"none"}}/>
            <input placeholder="SĐT" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:"100%",boxSizing:"border-box",background:"#080f1c",border:"1px solid #1e2d42",borderRadius:8,padding:"8px 10px",color:"#e8f0ff",fontSize:13,marginBottom:8,outline:"none"}}/>
          </>}
          {court&&time&&<div style={{background:"#080f1c",borderRadius:8,padding:10,marginBottom:8}}>
            {disc<base&&<div style={{display:"flex",justifyContent:"space-between",color:"#10B981",fontSize:12,marginBottom:4}}>
              <span>Giảm {plan?.courtDiscount}%</span><span>-{fmtVND(base-disc)}</span></div>}
            <div style={{display:"flex",justifyContent:"space-between",color:"#e8f0ff",fontWeight:700}}>
              <span>Tổng</span><span style={{color:"#10B981"}}>{fmtVND(disc)}</span>
            </div>
          </div>}
          <button onClick={confirm} style={{width:"100%",padding:"10px",background:"#10B981",border:"none",borderRadius:10,color:"white",fontWeight:700,cursor:"pointer",fontSize:14}}>Xác nhận đặt sân</button>
        </div>
      </div>
    </div>
  );
}

function AdminMembers({ store }) {
  const [search,setSearch]=useState("");
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",phone:"",email:"",plan:"basic"});
  const filtered = store.members.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())||m.phone.includes(search));
  const addMember = ()=>{
    if(!form.name||!form.phone){alert("Thiếu thông tin");return;}
    const p=MEMBERSHIP_PLANS.find(x=>x.id===form.plan);
    const exp=new Date(); exp.setDate(exp.getDate()+p.duration);
    store.setMembers(prev=>[...prev,{id:Date.now(),...form,joinDate:todayStr(),expiry:exp.toISOString().split("T")[0],credit:p.credit,guestPasses:p.guests,totalSpent:p.price}]);
    setForm({name:"",phone:"",email:"",plan:"basic"}); setShowAdd(false);
  };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:28,margin:0}}>Thành viên <span style={{color:"#4a6a8a",fontSize:18}}>({store.members.length})</span></h2>
        <button onClick={()=>setShowAdd(true)} style={{padding:"9px 18px",background:"#10B981",border:"none",borderRadius:10,color:"white",fontWeight:700,cursor:"pointer",fontSize:13}}>+ Thêm</button>
      </div>
      <input placeholder="Tìm kiếm tên, SĐT..." value={search} onChange={e=>setSearch(e.target.value)}
        style={{background:"#0f1f30",border:"1px solid #1e2d42",borderRadius:10,padding:"9px 14px",color:"#e8f0ff",fontSize:14,width:260,marginBottom:14,outline:"none"}} />
      <div style={{background:"#0f1f30",borderRadius:14,border:"1px solid #1e2d42",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #1e2d42"}}>
            {["Thành viên","Gói","Hết hạn","Credit","Tổng chi"].map(h=><th key={h} style={{padding:"11px 14px",color:"#3d5a7a",fontSize:12,textAlign:"left",fontWeight:600}}>{h}</th>)}
          </tr></thead>
          <tbody>{filtered.map(m=>{
            const p=MEMBERSHIP_PLANS.find(x=>x.id===m.plan);
            return <tr key={m.id} style={{borderBottom:"1px solid #1e2d4244"}}>
              <td style={{padding:"11px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:p?.color||"#374151",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:13}}>{m.name.charAt(0)}</div>
                  <div><div style={{color:"#e8f0ff",fontSize:13,fontWeight:600}}>{m.name}</div><div style={{color:"#3d5a7a",fontSize:11}}>{m.phone}</div></div>
                </div>
              </td>
              <td style={{padding:"11px 14px"}}><Chip plan={m.plan}/></td>
              <td style={{padding:"11px 14px",color:new Date(m.expiry)<new Date()?"#EF4444":"#8aabb0",fontSize:12}}>{m.expiry}</td>
              <td style={{padding:"11px 14px",color:"#F59E0B",fontSize:13,fontWeight:600}}>{fmtVND(m.credit)}</td>
              <td style={{padding:"11px 14px",color:"#10B981",fontSize:13,fontWeight:600}}>{fmtVND(m.totalSpent)}</td>
            </tr>;
          })}</tbody>
        </table>
        {filtered.length===0&&<p style={{color:"#3d5a7a",textAlign:"center",padding:24,fontSize:13}}>Không tìm thấy</p>}
      </div>
      {showAdd&&<Dlg title="Thêm thành viên mới" onClose={()=>setShowAdd(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["Họ tên *","name","text"],["SĐT *","phone","tel"],["Email","email","email"]].map(([l,f,t])=>(
            <div key={f}><label style={{color:"#4a6a8a",fontSize:12,display:"block",marginBottom:4}}>{l}</label>
            <input type={t} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}
              style={{width:"100%",boxSizing:"border-box",background:"#080f1c",border:"1px solid #1e3a5a",borderRadius:10,padding:"10px 12px",color:"#e8f0ff",fontSize:14,outline:"none"}} /></div>
          ))}
          <div>
            <label style={{color:"#4a6a8a",fontSize:12,display:"block",marginBottom:8}}>Gói thành viên</label>
            <div style={{display:"flex",gap:8}}>
              {MEMBERSHIP_PLANS.map(p=><button key={p.id} onClick={()=>setForm({...form,plan:p.id})}
                style={{flex:1,padding:"9px",border:`2px solid ${form.plan===p.id?p.color:"#1e2d42"}`,borderRadius:10,cursor:"pointer",background:"#080f1c",color:form.plan===p.id?p.color:"#4a6a8a",fontSize:13,fontWeight:600}}>
                {p.name}<div style={{fontSize:11,marginTop:2,fontWeight:400}}>{fmtVND(p.price)}</div>
              </button>)}
            </div>
          </div>
          <button onClick={addMember} style={{padding:"12px",background:"#10B981",border:"none",borderRadius:10,color:"white",fontWeight:700,fontSize:15,cursor:"pointer"}}>
            Đăng ký — {fmtVND(MEMBERSHIP_PLANS.find(p=>p.id===form.plan)?.price||0)}
          </button>
        </div>
      </Dlg>}
    </div>
  );
}

function AdminHistory({ bookings }) {
  const [filter,setFilter]=useState("all");
  const shown = filter==="all"?bookings:filter==="online"?bookings.filter(b=>b.source==="online"):bookings.filter(b=>b.date===todayStr());
  return (
    <div>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontSize:28,margin:"0 0 20px"}}>Lịch sử đặt sân</h2>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["all","Tất cả"],["online","🌐 Online"],["today","Hôm nay"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:filter===v?"#10B981":"#0f1f30",color:filter===v?"white":"#4a6a8a"}}>
            {l}
          </button>
        ))}
      </div>
      <div style={{background:"#0f1f30",borderRadius:14,border:"1px solid #1e2d42",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #1e2d42"}}>
            {["Sân","Khách","Ngày · Giờ","Nguồn","Thanh toán"].map(h=><th key={h} style={{padding:"11px 14px",color:"#3d5a7a",fontSize:12,textAlign:"left",fontWeight:600}}>{h}</th>)}
          </tr></thead>
          <tbody>{[...shown].reverse().map(b=>(
            <tr key={b.id} style={{borderBottom:"1px solid #1e2d4244"}}>
              <td style={{padding:"11px 14px",color:"#e8f0ff",fontSize:13,fontWeight:500}}>{b.courtName}</td>
              <td style={{padding:"11px 14px"}}><div style={{color:"#c8d8ea",fontSize:13}}>{b.customerName}</div><Chip plan={b.memberPlan}/></td>
              <td style={{padding:"11px 14px",color:"#8aabb0",fontSize:12}}>{b.date} · {b.time} · {b.duration}h</td>
              <td style={{padding:"11px 14px"}}>
                <span style={{background:b.source==="online"?"rgba(16,185,129,.12)":"rgba(99,102,241,.12)",color:b.source==="online"?"#10B981":"#818CF8",fontSize:11,padding:"2px 8px",borderRadius:4,fontWeight:700}}>
                  {b.source==="online"?"🌐 Online":"🖥 Admin"}
                </span>
              </td>
              <td style={{padding:"11px 14px",color:"#10B981",fontWeight:700,fontSize:14}}>{fmtVND(b.finalPrice)}</td>
            </tr>
          ))}</tbody>
        </table>
        {shown.length===0&&<p style={{color:"#3d5a7a",textAlign:"center",padding:24,fontSize:13}}>Không có dữ liệu</p>}
      </div>
    </div>
  );
}

function AdminPortal({ store }) {
  const [page,setPage]=useState("dash");
  const pendingCnt = store.pending.filter(p=>p.status==="pending").length;

  const NAV=[
    {id:"dash",    icon:"📊", label:"Dashboard"},
    {id:"pending", icon:"🔔", label:"Online",  badge:pendingCnt},
    {id:"booking", icon:"🎾", label:"Đặt Sân"},
    {id:"history", icon:"📋", label:"Lịch Đặt"},
    {id:"members", icon:"👥", label:"Thành Viên"},
  ];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#060d1a",fontFamily:"'Outfit',sans-serif"}}>
      {/* Sidebar */}
      <div style={{width:196,background:"#090f1d",borderRight:"1px solid #1e2d42",display:"flex",flexDirection:"column",padding:"18px 10px",flexShrink:0}}>
        <div style={{padding:"4px 12px",marginBottom:22}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",color:"#e8f0ff",fontWeight:700,fontSize:19}}>⚡ SportHub</div>
          <div style={{color:"#3d5a7a",fontSize:10,marginTop:1,letterSpacing:.5}}>ADMIN PORTAL</div>
        </div>
        <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",width:"100%",position:"relative",transition:"all .15s",
                background:page===n.id?"rgba(16,185,129,.08)":"transparent",
                color:page===n.id?"#10B981":"#4a6a8a",
                borderLeft:`3px solid ${page===n.id?"#10B981":"transparent"}`,
                fontWeight:page===n.id?600:400,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>
              <span style={{fontSize:15}}>{n.icon}</span>{n.label}
              {n.badge>0&&<span style={{position:"absolute",right:10,background:"#F59E0B",color:"#060d1a",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:100,minWidth:18,textAlign:"center"}}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"10px 12px",background:"#0f1f30",borderRadius:10,fontSize:11}}>
          <div style={{color:"#e8f0ff",fontWeight:600}}>SportHub v2.0</div>
          <div style={{color:"#10B981",display:"flex",alignItems:"center",gap:4}}><span style={{width:5,height:5,borderRadius:"50%",background:"#10B981",display:"inline-block",animation:"blink 1.5s infinite"}}></span>Online</div>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,padding:"28px 32px",overflowY:"auto"}}>
        {page==="dash"    && <AdminDash    store={store}/>}
        {page==="pending" && <AdminPending store={store}/>}
        {page==="booking" && <AdminBooking store={store}/>}
        {page==="history" && <AdminHistory bookings={store.bookings}/>}
        {page==="members" && <AdminMembers store={store}/>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState("customer");
  const store = useStore();
  const pendingCnt = store.pending.filter(p=>p.status==="pending").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#060d1a;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#090f1d}
        ::-webkit-scrollbar-thumb{background:#1e2d42;border-radius:3px}
      `}</style>

      {view==="customer" && <CustomerSite store={store}/>}
      {view==="admin"    && <AdminPortal  store={store}/>}

      {/* ── View switcher ── */}
      <div style={{position:"fixed",bottom:view==="customer"?24:24,left:"50%",transform:"translateX(-50%)",zIndex:2000,display:"flex",background:"rgba(9,15,29,.96)",border:"1px solid #1e3a5a",borderRadius:100,padding:"5px 6px",backdropFilter:"blur(16px)",boxShadow:"0 8px 32px rgba(0,0,0,.6)",gap:4}}>
        <button onClick={()=>setView("customer")}
          style={{padding:"7px 20px",borderRadius:100,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Outfit',sans-serif",transition:"all .2s",
            background:view==="customer"?"linear-gradient(135deg,#10B981,#059669)":"transparent",
            color:view==="customer"?"white":"#3d5a7a"}}>
          🌐 Website khách
        </button>
        <button onClick={()=>setView("admin")}
          style={{padding:"7px 20px",borderRadius:100,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Outfit',sans-serif",transition:"all .2s",position:"relative",
            background:view==="admin"?"linear-gradient(135deg,#6366F1,#4F46E5)":"transparent",
            color:view==="admin"?"white":"#3d5a7a"}}>
          🖥 Admin Portal
          {pendingCnt>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#F59E0B",color:"#060d1a",width:16,height:16,borderRadius:"50%",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{pendingCnt}</span>}
        </button>
      </div>
    </>
  );
}
