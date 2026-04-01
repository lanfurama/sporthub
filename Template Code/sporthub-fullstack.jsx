import { useState, useEffect, useRef } from "react";

// ============================================================
// SHARED DATA STORE (simulates backend/shared DB)
// ============================================================
const COURTS = [
  { id:1, name:"Tennis Court 1", sport:"Tennis", price:150000, peakPrice:220000, surface:"Hard Court", indoor:false },
  { id:2, name:"Tennis Court 2", sport:"Tennis", price:150000, peakPrice:220000, surface:"Clay Court", indoor:true },
  { id:3, name:"Tennis Court 3", sport:"Tennis", price:160000, peakPrice:230000, surface:"Grass Court", indoor:false },
  { id:4, name:"Pickleball Court 1", sport:"Pickleball", price:120000, peakPrice:180000, surface:"Hard Court", indoor:true },
  { id:5, name:"Pickleball Court 2", sport:"Pickleball", price:120000, peakPrice:180000, surface:"Hard Court", indoor:true },
  { id:6, name:"Badminton Court 1", sport:"Badminton", price:80000, peakPrice:130000, surface:"Wood", indoor:true },
];
const MEMBERSHIP_PLANS = [
  { id:"basic",  name:"Basic",  color:"#6B7280", price:500000,  duration:30, benefits:{ courtDiscount:10, shopDiscount:5,  priorityBooking:false, guestPasses:0, creditPerMonth:0 }, description:"Dành cho người chơi thỉnh thoảng" },
  { id:"prime",  name:"Prime",  color:"#059669", price:1200000, duration:30, benefits:{ courtDiscount:20, shopDiscount:10, priorityBooking:true,  guestPasses:2, creditPerMonth:100000 }, description:"Dành cho người chơi thường xuyên" },
  { id:"vip",    name:"VIP",    color:"#D97706", price:2500000, duration:30, benefits:{ courtDiscount:35, shopDiscount:20, priorityBooking:true,  guestPasses:5, creditPerMonth:300000 }, description:"Trải nghiệm đẳng cấp cao nhất" },
];
const PRODUCTS = [
  { id:1, name:"Vợt Tennis Wilson Pro", price:2800000, category:"Equipment", stock:15, img:"🎾" },
  { id:2, name:"Vợt Pickleball ONIX",   price:1500000, category:"Equipment", stock:8,  img:"🏓" },
  { id:3, name:"Bóng Tennis (hộp 3)",   price:120000,  category:"Balls",     stock:50, img:"🟡" },
  { id:4, name:"Giày Tennis Nike",       price:2200000, category:"Footwear",  stock:20, img:"👟" },
  { id:5, name:"Túi thể thao",           price:450000,  category:"Accessories",stock:30,img:"🎒" },
  { id:6, name:"Nước điện giải",         price:35000,   category:"Drinks",    stock:100,img:"💧" },
];
const SERVICES_LIST = [
  { id:1, name:"Huấn luyện cá nhân 1h", price:350000, type:"coaching", icon:"🎓" },
  { id:2, name:"Lớp nhóm Tennis",        price:120000, type:"group",    icon:"👥" },
  { id:3, name:"Phân tích kỹ thuật",     price:200000, type:"analysis", icon:"📹" },
  { id:4, name:"Căng vợt",               price:150000, type:"stringing",icon:"🔧" },
];
const TIME_SLOTS = ["06:00","07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];
const SPORTS_LIST = ["Tennis","Pickleball","Badminton"];

const INIT_MEMBERS = [
  { id:1, name:"Nguyễn Văn An",  phone:"0901234567", email:"an@email.com",   plan:"vip",   joinDate:"2024-01-15", expiry:"2025-12-15", credit:850000,  guestPasses:3, totalSpent:12500000 },
  { id:2, name:"Trần Thị Bình",  phone:"0912345678", email:"binh@email.com", plan:"prime", joinDate:"2024-06-01", expiry:"2025-06-01", credit:220000,  guestPasses:1, totalSpent:4200000 },
  { id:3, name:"Lê Minh Châu",   phone:"0923456789", email:"chau@email.com", plan:"basic", joinDate:"2024-09-10", expiry:"2025-09-10", credit:0,       guestPasses:0, totalSpent:1800000 },
];

const fmtVND = n => new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(n);
const todayStr = () => new Date().toISOString().split("T")[0];
const isPeak = h => { const hr=parseInt(h); return hr>=17&&hr<=21; };

// ============================================================
// SHARED STATE CONTEXT
// ============================================================
function useSharedStore() {
  const [bookings, setBookings] = useState([
    { id:101, courtId:1, courtName:"Tennis Court 1", date:todayStr(), time:"09:00", duration:1, customerName:"Demo Customer", customerPhone:"0900000001", memberId:null, memberPlan:null, basePrice:150000, discountedPrice:150000, creditUsed:0, finalPrice:150000, payMethod:"cash", status:"confirmed", source:"admin" },
  ]);
  const [members, setMembers] = useState(INIT_MEMBERS);
  const [sales, setSales] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);

  const addBooking = (b) => setBookings(prev => [...prev, { ...b, id: Date.now(), source: b.source || "online" }]);
  const addPending = (b) => setPendingBookings(prev => [...prev, { ...b, id: Date.now(), status:"pending", source:"online", createdAt: new Date().toLocaleString("vi-VN") }]);
  const approvePending = (id) => {
    const b = pendingBookings.find(p=>p.id===id);
    if (b) {
      setBookings(prev => [...prev, {...b, status:"confirmed"}]);
      setPendingBookings(prev => prev.filter(p=>p.id!==id));
    }
  };
  const rejectPending = (id) => setPendingBookings(prev => prev.map(p=>p.id===id?{...p,status:"rejected"}:p));

  return { bookings, members, setMembers, sales, setSales, pendingBookings, addBooking, addPending, approvePending, rejectPending };
}

// ============================================================
// SMALL SHARED UI COMPONENTS
// ============================================================
function Badge({ plan }) {
  const p = MEMBERSHIP_PLANS.find(m=>m.id===plan);
  if (!plan||!p) return <span style={{background:"#374151",color:"#9CA3AF",fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:700}}>GUEST</span>;
  return <span style={{background:p.color,color:"white",fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:700}}>{p.name.toUpperCase()}</span>;
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#0e1117",borderRadius:20,width:"100%",maxWidth:wide?700:540,maxHeight:"92vh",overflow:"auto",border:"1px solid #1e2a3a",boxShadow:"0 25px 80px rgba(0,0,0,0.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 28px",borderBottom:"1px solid #1e2a3a"}}>
          <h3 style={{color:"#f0f6ff",margin:0,fontSize:18,fontFamily:"'Playfair Display',serif"}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#4a6080",cursor:"pointer",fontSize:26,lineHeight:1}}>×</button>
        </div>
        <div style={{padding:28}}>{children}</div>
      </div>
    </div>
  );
}

// ============================================================
//  ██████╗██╗     ██╗███████╗███╗   ██╗████████╗
// ██╔════╝██║     ██║██╔════╝████╗  ██║╚══██╔══╝
// ██║     ██║     ██║█████╗  ██╔██╗ ██║   ██║
// ██║     ██║     ██║██╔══╝  ██║╚██╗██║   ██║
// ╚██████╗███████╗██║███████╗██║ ╚████║   ██║
//  ╚═════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝
//  CUSTOMER WEBSITE
// ============================================================

function CustomerHero({ onBook }) {
  const [activeTab, setActiveTab] = useState(0);
  const sports = [
    { name:"Tennis", emoji:"🎾", desc:"6 sân chuyên nghiệp" },
    { name:"Pickleball", emoji:"🏓", desc:"Xu hướng mới nhất" },
    { name:"Badminton", emoji:"🏸", desc:"Sân trong nhà cao cấp" },
  ];
  return (
    <section style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",overflow:"hidden",background:"#020810"}}>
      {/* Animated background */}
      <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
        <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",top:"-10%",right:"-5%",animation:"pulse 4s ease-in-out infinite"}}></div>
        <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",bottom:"10%",left:"-5%",animation:"pulse 4s ease-in-out infinite 2s"}}></div>
        {/* Grid lines */}
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.04}} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="#10B981" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <div style={{position:"relative",maxWidth:1200,margin:"0 auto",padding:"100px 48px 80px",width:"100%"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:100,padding:"6px 16px",marginBottom:24}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#10B981",display:"inline-block",animation:"pulse 1.5s infinite"}}></span>
          <span style={{color:"#10B981",fontSize:13,fontWeight:600,letterSpacing:1}}>ĐẶT SÂN ONLINE 24/7</span>
        </div>

        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(42px,6vw,80px)",color:"#f0f6ff",lineHeight:1.05,margin:"0 0 20px",maxWidth:700}}>
          Trải nghiệm<br/>
          <span style={{color:"transparent",WebkitBackgroundClip:"text",backgroundClip:"text",backgroundImage:"linear-gradient(135deg, #10B981, #34D399)"}}>đẳng cấp</span><br/>
          thể thao
        </h1>
        <p style={{color:"#4a6080",fontSize:18,maxWidth:500,lineHeight:1.7,marginBottom:40}}>
          Đặt sân Tennis, Pickleball, Badminton chỉ trong 60 giây. Xác nhận tức thì, không cần gọi điện.
        </p>

        <div style={{display:"flex",gap:12,marginBottom:60,flexWrap:"wrap"}}>
          <button onClick={onBook} style={{padding:"16px 36px",background:"linear-gradient(135deg,#10B981,#059669)",border:"none",borderRadius:100,color:"white",fontWeight:700,fontSize:16,cursor:"pointer",boxShadow:"0 8px 32px rgba(16,185,129,0.4)",fontFamily:"'Outfit',sans-serif",letterSpacing:0.5}}>
            Đặt sân ngay →
          </button>
          <button style={{padding:"16px 36px",background:"transparent",border:"1px solid #1e3a5a",borderRadius:100,color:"#6b8cae",fontWeight:600,fontSize:16,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
            Xem gói thành viên
          </button>
        </div>

        {/* Sport cards */}
        <div style={{display:"flex",gap:12}}>
          {sports.map((s,i) => (
            <div key={s.name} onClick={()=>setActiveTab(i)}
              style={{padding:"16px 24px",borderRadius:16,border:`1px solid ${activeTab===i?"rgba(16,185,129,0.5)":"#1e2a3a"}`,background:activeTab===i?"rgba(16,185,129,0.08)":"rgba(255,255,255,0.02)",cursor:"pointer",transition:"all 0.2s"}}>
              <div style={{fontSize:28,marginBottom:6}}>{s.emoji}</div>
              <div style={{color:"#f0f6ff",fontWeight:700,fontSize:15}}>{s.name}</div>
              <div style={{color:"#4a6080",fontSize:12,marginTop:2}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CustomerBookingFlow({ bookings, members, addPending }) {
  const [step, setStep] = useState(1); // 1=sport, 2=court+date, 3=timeslot, 4=info, 5=confirm, 6=success
  const [sport, setSport] = useState(null);
  const [court, setCourt] = useState(null);
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState(null);
  const [duration, setDuration] = useState(1);
  const [form, setForm] = useState({ name:"", phone:"", email:"", note:"" });
  const [memberCheck, setMemberCheck] = useState("");
  const [linkedMember, setLinkedMember] = useState(null);
  const [useCredit, setUseCredit] = useState(false);
  const [bookingRef, setBookingRef] = useState(null);

  const filteredCourts = sport ? COURTS.filter(c=>c.sport===sport) : COURTS;
  const isSlotTaken = (courtId, t) => bookings.some(b=>b.courtId===courtId&&b.date===date&&b.time===t&&b.status!=="rejected");

  const plan = linkedMember ? MEMBERSHIP_PLANS.find(p=>p.id===linkedMember.plan) : null;
  const basePrice = court ? (isPeak(time||"09:00") ? court.peakPrice : court.price) * duration : 0;
  const discounted = plan ? Math.round(basePrice * (1-plan.benefits.courtDiscount/100)) : basePrice;
  const creditUsed = useCredit&&linkedMember ? Math.min(linkedMember.credit, discounted) : 0;
  const finalPrice = discounted - creditUsed;

  const checkMember = () => {
    const m = members.find(m=>m.phone===memberCheck||m.email===memberCheck);
    if (m) { setLinkedMember(m); setForm(f=>({...f,name:m.name,phone:m.phone,email:m.email})); }
    else alert("Không tìm thấy tài khoản thành viên");
  };

  const submitBooking = () => {
    const ref = "SH" + Date.now().toString().slice(-6);
    setBookingRef(ref);
    addPending({
      courtId:court.id, courtName:court.name, date, time, duration,
      customerName:form.name, customerPhone:form.phone, customerEmail:form.email,
      note:form.note, memberId:linkedMember?.id||null, memberPlan:linkedMember?.plan||null,
      basePrice, discountedPrice:discounted, creditUsed, finalPrice,
      payMethod:"pending", ref, status:"pending"
    });
    setStep(6);
  };

  const stepLabels = ["","Môn thể thao","Chọn sân","Khung giờ","Thông tin","Xác nhận",""];
  const progressW = step <= 5 ? `${(step/5)*100}%` : "100%";

  if (step === 6) return (
    <section style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",padding:48}}>
      <div style={{textAlign:"center",maxWidth:480}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:"rgba(16,185,129,0.15)",border:"2px solid #10B981",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 24px"}}>✓</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:"#f0f6ff",fontSize:32,margin:"0 0 12px"}}>Đặt sân thành công!</h2>
        <p style={{color:"#4a6080",marginBottom:8}}>Mã đặt sân của bạn:</p>
        <div style={{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:12,padding:"12px 24px",display:"inline-block",marginBottom:24}}>
          <span style={{color:"#10B981",fontWeight:800,fontSize:24,letterSpacing:3}}>{bookingRef}</span>
        </div>
        <p style={{color:"#4a6080",fontSize:14,marginBottom:8}}>📋 {court?.name} · {date} · {time} · {duration}h</p>
        <p style={{color:"#10B981",fontWeight:700,fontSize:18,marginBottom:24}}>{fmtVND(finalPrice)}</p>
        <p style={{color:"#6b8cae",fontSize:13,marginBottom:32}}>Chúng tôi sẽ xác nhận đặt sân qua số điện thoại <strong style={{color:"#f0f6ff"}}>{form.phone}</strong> trong vòng 5 phút.</p>
        <button onClick={()=>{setStep(1);setCourt(null);setTime(null);setLinkedMember(null);setForm({name:"",phone:"",email:"",note:""});setUseCredit(false);}}
          style={{padding:"14px 32px",background:"linear-gradient(135deg,#10B981,#059669)",border:"none",borderRadius:100,color:"white",fontWeight:700,cursor:"pointer",fontSize:15}}>
          Đặt sân mới
        </button>
      </div>
    </section>
  );

  return (
    <section id="booking" style={{minHeight:"100vh",background:"#020810",padding:"80px 0"}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",color:"#f0f6ff",fontSize:40,margin:"0 0 8px"}}>Đặt sân online</h2>
          <p style={{color:"#4a6080",fontSize:16}}>Nhanh chóng · Chính xác · Xác nhận tức thì</p>
        </div>

        {/* Progress bar */}
        {step <= 5 && <div style={{marginBottom:40}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            {[1,2,3,4,5].map(s => (
              <div key={s} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,marginBottom:6,
                  background:step>s?"#10B981":step===s?"rgba(16,185,129,0.2)":"#0e1820",
                  color:step>=s?"#10B981":"#2a4060",
                  border:`2px solid ${step>=s?"#10B981":"#1e2a3a"}`}}>
                  {step>s?"✓":s}
                </div>
                <span style={{fontSize:11,color:step>=s?"#10B981":"#2a4060",textAlign:"center"}}>{stepLabels[s]}</span>
              </div>
            ))}
          </div>
          <div style={{height:2,background:"#1e2a3a",borderRadius:1,overflow:"hidden"}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,#10B981,#34D399)",width:progressW,transition:"width 0.4s ease",borderRadius:1}}></div>
          </div>
        </div>}

        <div style={{background:"#0a1628",borderRadius:24,border:"1px solid #1e2a3a",padding:36,boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>

          {/* STEP 1: Sport */}
          {step===1 && <div>
            <h3 style={{color:"#f0f6ff",fontFamily:"'Playfair Display',serif",fontSize:24,margin:"0 0 8px"}}>Chọn môn thể thao</h3>
            <p style={{color:"#4a6080",margin:"0 0 28px",fontSize:14}}>Bạn muốn chơi môn nào hôm nay?</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {[
                {name:"Tennis",emoji:"🎾",courts:3,desc:"Sân clay, hard & grass"},
                {name:"Pickleball",emoji:"🏓",courts:2,desc:"Sân trong nhà cao cấp"},
                {name:"Badminton",emoji:"🏸",courts:1,desc:"Cầu lông chuyên nghiệp"},
              ].map(s => (
                <div key={s.name} onClick={()=>{setSport(s.name);setStep(2);}}
                  style={{padding:28,borderRadius:20,border:`2px solid ${sport===s.name?"#10B981":"#1e2a3a"}`,background:"rgba(255,255,255,0.02)",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#10B981";e.currentTarget.style.background="rgba(16,185,129,0.05)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=sport===s.name?"#10B981":"#1e2a3a";e.currentTarget.style.background="rgba(255,255,255,0.02)"}}>
                  <div style={{fontSize:52,marginBottom:12}}>{s.emoji}</div>
                  <div style={{color:"#f0f6ff",fontWeight:700,fontSize:18,marginBottom:4}}>{s.name}</div>
                  <div style={{color:"#10B981",fontSize:13,marginBottom:4}}>{s.courts} sân</div>
                  <div style={{color:"#4a6080",fontSize:12}}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>}

          {/* STEP 2: Court + Date */}
          {step===2 && <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:"#4a6080",cursor:"pointer",fontSize:20}}>←</button>
              <div>
                <h3 style={{color:"#f0f6ff",fontFamily:"'Playfair Display',serif",fontSize:24,margin:0}}>Chọn sân & ngày</h3>
                <p style={{color:"#4a6080",margin:0,fontSize:14}}>{sport}</p>
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{color:"#6b8cae",fontSize:13,display:"block",marginBottom:6}}>Ngày đặt sân</label>
              <input type="date" value={date} min={todayStr()} onChange={e=>setDate(e.target.value)}
                style={{background:"#0e1820",border:"1px solid #1e2a3a",borderRadius:12,padding:"12px 16px",color:"#f0f6ff",fontSize:15,outline:"none",width:220}} />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {filteredCourts.map(c => (
                <div key={c.id} onClick={()=>{setCourt(c);setStep(3);}}
                  style={{padding:20,borderRadius:16,border:`2px solid ${court?.id===c.id?"#10B981":"#1e2a3a"}`,background:"rgba(255,255,255,0.02)",cursor:"pointer",transition:"all 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#10B981"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=court?.id===c.id?"#10B981":"#1e2a3a"}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{color:"#f0f6ff",fontWeight:700,fontSize:16}}>{c.name}</div>
                      <div style={{color:"#4a6080",fontSize:12,marginTop:2}}>{c.surface} · {c.indoor?"Trong nhà":"Ngoài trời"}</div>
                    </div>
                    <span style={{background:c.indoor?"rgba(99,102,241,0.15)":"rgba(245,158,11,0.15)",color:c.indoor?"#818CF8":"#F59E0B",fontSize:10,padding:"3px 8px",borderRadius:6,fontWeight:600}}>
                      {c.indoor?"🏠 Indoor":"☀️ Outdoor"}
                    </span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:"#10B981",fontWeight:700}}>{fmtVND(c.price)}<span style={{color:"#4a6080",fontWeight:400,fontSize:12}}>/h</span></span>
                    <span style={{color:"#F59E0B",fontSize:12}}>Peak: {fmtVND(c.peakPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>}

          {/* STEP 3: Time */}
          {step===3 && <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <button onClick={()=>setStep(2)} style={{background:"none",border:"none",color:"#4a6080",cursor:"pointer",fontSize:20}}>←</button>
              <div>
                <h3 style={{color:"#f0f6ff",fontFamily:"'Playfair Display',serif",fontSize:24,margin:0}}>Chọn khung giờ</h3>
                <p style={{color:"#4a6080",margin:0,fontSize:14}}>{court?.name} · {date}</p>
              </div>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{color:"#6b8cae",fontSize:13}}>Thời lượng:</span>
              {[1,1.5,2].map(d => (
                <button key={d} onClick={()=>setDuration(d)}
                  style={{padding:"8px 18px",borderRadius:100,border:"none",cursor:"pointer",fontSize:14,fontWeight:600,
                    background:duration===d?"#10B981":"#0e1820",color:duration===d?"white":"#4a6080"}}>
                  {d}h
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
              <div style={{display:"flex",gap:12,marginBottom:12,width:"100%"}}>
                <span style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"#4a6080"}}><span style={{width:10,height:10,borderRadius:2,background:"#F59E0B",display:"inline-block"}}></span>Giờ cao điểm</span>
                <span style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"#4a6080"}}><span style={{width:10,height:10,borderRadius:2,background:"#374151",display:"inline-block"}}></span>Đã đặt</span>
                <span style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"#4a6080"}}><span style={{width:10,height:10,borderRadius:2,background:"#10B981",display:"inline-block"}}></span>Đã chọn</span>
              </div>
              {TIME_SLOTS.map(t => {
                const taken = isSlotTaken(court?.id, t);
                const sel = time === t;
                const peak = isPeak(t);
                return (
                  <button key={t} disabled={taken} onClick={()=>setTime(t)}
                    style={{padding:"12px 16px",borderRadius:12,border:"none",cursor:taken?"not-allowed":"pointer",fontSize:14,fontWeight:sel?700:500,minWidth:75,
                      background:taken?"#0e1820":sel?"#10B981":peak?"rgba(245,158,11,0.1)":"#0e1820",
                      color:taken?"#1e2a3a":sel?"white":peak?"#F59E0B":"#6b8cae",
                      border:`1px solid ${taken?"#1e2a3a":sel?"#10B981":peak?"rgba(245,158,11,0.3)":"#1e2a3a"}`}}>
                    {t}{peak&&!taken&&!sel&&<div style={{fontSize:9,color:"#F59E0B",marginTop:2}}>PEAK</div>}
                  </button>
                );
              })}
            </div>
            {time && (
              <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:12,padding:16,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:"#f0f6ff",fontSize:15}}>⏰ {time} · {duration}h · {isPeak(time)?"⚡ Giờ cao điểm":"Giờ thường"}</span>
                  <span style={{color:"#10B981",fontWeight:700,fontSize:18}}>{fmtVND(isPeak(time)?court.peakPrice*duration:court.price*duration)}</span>
                </div>
              </div>
            )}
            <button disabled={!time} onClick={()=>setStep(4)}
              style={{width:"100%",padding:"14px",background:time?"linear-gradient(135deg,#10B981,#059669)":"#0e1820",border:"none",borderRadius:14,color:time?"white":"#2a4060",fontWeight:700,fontSize:16,cursor:time?"pointer":"not-allowed"}}>
              Tiếp theo →
            </button>
          </div>}

          {/* STEP 4: Info */}
          {step===4 && <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <button onClick={()=>setStep(3)} style={{background:"none",border:"none",color:"#4a6080",cursor:"pointer",fontSize:20}}>←</button>
              <div>
                <h3 style={{color:"#f0f6ff",fontFamily:"'Playfair Display',serif",fontSize:24,margin:0}}>Thông tin đặt sân</h3>
                <p style={{color:"#4a6080",margin:0,fontSize:14}}>Nhập thông tin liên hệ của bạn</p>
              </div>
            </div>

            {/* Member link */}
            <div style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:14,padding:16,marginBottom:20}}>
              <div style={{color:"#F59E0B",fontWeight:600,marginBottom:8,fontSize:14}}>⭐ Bạn là thành viên? Liên kết để nhận ưu đãi</div>
              {linkedMember ? (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{color:"#10B981",fontWeight:700}}>{linkedMember.name}</span>
                    <span style={{marginLeft:8}}><Badge plan={linkedMember.plan}/></span>
                    <div style={{color:"#6b8cae",fontSize:12,marginTop:2}}>Giảm {plan?.benefits.courtDiscount}% · Credit: {fmtVND(linkedMember.credit)}</div>
                  </div>
                  <button onClick={()=>setLinkedMember(null)} style={{background:"none",border:"none",color:"#4a6080",cursor:"pointer",fontSize:18}}>×</button>
                </div>
              ) : (
                <div style={{display:"flex",gap:8}}>
                  <input placeholder="SĐT hoặc email thành viên" value={memberCheck} onChange={e=>setMemberCheck(e.target.value)}
                    style={{flex:1,background:"#0a1628",border:"1px solid #1e2a3a",borderRadius:10,padding:"10px 14px",color:"#f0f6ff",fontSize:14,outline:"none"}} />
                  <button onClick={checkMember} style={{padding:"10px 18px",background:"#F59E0B",border:"none",borderRadius:10,color:"#0e1117",fontWeight:700,cursor:"pointer",fontSize:13}}>
                    Kiểm tra
                  </button>
                </div>
              )}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              {[["Họ và tên *","name","text"],["Số điện thoại *","phone","tel"]].map(([l,f,t]) => (
                <div key={f}>
                  <label style={{color:"#6b8cae",fontSize:12,display:"block",marginBottom:6}}>{l}</label>
                  <input type={t} value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))}
                    style={{width:"100%",boxSizing:"border-box",background:"#0e1820",border:"1px solid #1e2a3a",borderRadius:12,padding:"12px 16px",color:"#f0f6ff",fontSize:14,outline:"none"}} />
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <label style={{color:"#6b8cae",fontSize:12,display:"block",marginBottom:6}}>Email</label>
              <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}
                style={{width:"100%",boxSizing:"border-box",background:"#0e1820",border:"1px solid #1e2a3a",borderRadius:12,padding:"12px 16px",color:"#f0f6ff",fontSize:14,outline:"none"}} />
            </div>
            <div style={{marginBottom:20}}>
              <label style={{color:"#6b8cae",fontSize:12,display:"block",marginBottom:6}}>Ghi chú (thiết bị, yêu cầu đặc biệt...)</label>
              <textarea value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} rows={3}
                style={{width:"100%",boxSizing:"border-box",background:"#0e1820",border:"1px solid #1e2a3a",borderRadius:12,padding:"12px 16px",color:"#f0f6ff",fontSize:14,outline:"none",resize:"vertical"}} />
            </div>
            {linkedMember && linkedMember.credit > 0 && (
              <label style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,cursor:"pointer"}}>
                <input type="checkbox" checked={useCredit} onChange={e=>setUseCredit(e.target.checked)} style={{width:16,height:16}} />
                <span style={{color:"#F59E0B",fontSize:14}}>Sử dụng credit ({fmtVND(Math.min(linkedMember.credit,discounted))})</span>
              </label>
            )}
            <button disabled={!form.name||!form.phone} onClick={()=>setStep(5)}
              style={{width:"100%",padding:"14px",background:form.name&&form.phone?"linear-gradient(135deg,#10B981,#059669)":"#0e1820",border:"none",borderRadius:14,color:form.name&&form.phone?"white":"#2a4060",fontWeight:700,fontSize:16,cursor:form.name&&form.phone?"pointer":"not-allowed"}}>
              Xem xác nhận →
            </button>
          </div>}

          {/* STEP 5: Confirm */}
          {step===5 && <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
              <button onClick={()=>setStep(4)} style={{background:"none",border:"none",color:"#4a6080",cursor:"pointer",fontSize:20}}>←</button>
              <h3 style={{color:"#f0f6ff",fontFamily:"'Playfair Display',serif",fontSize:24,margin:0}}>Xác nhận đặt sân</h3>
            </div>
            <div style={{background:"#0e1820",borderRadius:16,padding:24,marginBottom:20}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[["Sân",court?.name],["Môn",sport],["Ngày",date],["Giờ",time],["Thời lượng",`${duration} giờ`],["Bề mặt",court?.surface]].map(([k,v])=>(
                  <div key={k}>
                    <div style={{color:"#4a6080",fontSize:12,marginBottom:3}}>{k}</div>
                    <div style={{color:"#f0f6ff",fontWeight:600,fontSize:15}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{borderTop:"1px solid #1e2a3a",marginTop:16,paddingTop:16}}>
                {[["Họ tên",form.name],["SĐT",form.phone],["Email",form.email||"—"]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{color:"#4a6080",fontSize:13}}>{k}</span>
                    <span style={{color:"#94A3B8",fontSize:13}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"rgba(16,185,129,0.06)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:16,padding:20,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",color:"#6b8cae",fontSize:14,marginBottom:8}}>
                <span>Giá gốc</span><span>{fmtVND(basePrice)}</span>
              </div>
              {discounted < basePrice && <div style={{display:"flex",justifyContent:"space-between",color:"#10B981",fontSize:14,marginBottom:8}}>
                <span>Giảm thành viên ({plan?.benefits.courtDiscount}%)</span>
                <span>-{fmtVND(basePrice-discounted)}</span>
              </div>}
              {creditUsed > 0 && <div style={{display:"flex",justifyContent:"space-between",color:"#F59E0B",fontSize:14,marginBottom:8}}>
                <span>Credit sử dụng</span><span>-{fmtVND(creditUsed)}</span>
              </div>}
              <div style={{display:"flex",justifyContent:"space-between",color:"#f0f6ff",fontWeight:800,fontSize:22,borderTop:"1px solid #1e2a3a",paddingTop:12,marginTop:8}}>
                <span>Tổng thanh toán</span>
                <span style={{color:"#10B981"}}>{fmtVND(finalPrice)}</span>
              </div>
            </div>
            <p style={{color:"#4a6080",fontSize:13,textAlign:"center",marginBottom:16}}>💳 Thanh toán khi đến sân hoặc chuyển khoản sau khi nhận xác nhận</p>
            <button onClick={submitBooking}
              style={{width:"100%",padding:"16px",background:"linear-gradient(135deg,#10B981,#059669)",border:"none",borderRadius:14,color:"white",fontWeight:700,fontSize:17,cursor:"pointer",boxShadow:"0 8px 24px rgba(16,185,129,0.3)"}}>
              ✅ Xác nhận đặt sân
            </button>
          </div>}

        </div>
      </div>
    </section>
  );
}

function CustomerMembershipSection() {
  return (
    <section style={{background:"#020810",padding:"80px 24px"}}>
      <div style={{maxWidth:1000,margin:"0 auto",textAlign:"center"}}>
        <p style={{color:"#10B981",fontWeight:700,letterSpacing:3,fontSize:13,marginBottom:12}}>GÓI THÀNH VIÊN</p>
        <h2 style={{fontFamily:"'Playfair Display',serif",color:"#f0f6ff",fontSize:42,margin:"0 0 12px"}}>Tiết kiệm hơn mỗi ngày</h2>
        <p style={{color:"#4a6080",fontSize:16,maxWidth:500,margin:"0 auto 48px"}}>Thành viên được giảm giá, tặng credit và ưu tiên đặt sân giờ vàng</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
          {MEMBERSHIP_PLANS.map((plan,i) => (
            <div key={plan.id} style={{padding:28,borderRadius:24,border:`2px solid ${i===2?"#D97706":plan.color+"40"}`,background:i===2?"rgba(217,119,6,0.05)":"rgba(255,255,255,0.02)",position:"relative"}}>
              {i===1 && <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"#059669",color:"white",fontSize:11,fontWeight:700,padding:"4px 16px",borderRadius:100,letterSpacing:1}}>PHỔ BIẾN NHẤT</div>}
              <div style={{color:plan.color,fontSize:11,fontWeight:700,letterSpacing:2,marginBottom:8}}>{plan.name.toUpperCase()}</div>
              <div style={{color:"#f0f6ff",fontSize:30,fontWeight:800,marginBottom:4}}>{fmtVND(plan.price)}<span style={{fontSize:14,fontWeight:400,color:"#4a6080"}}>/tháng</span></div>
              <div style={{color:"#4a6080",fontSize:13,marginBottom:20}}>{plan.description}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24,textAlign:"left"}}>
                {[`Giảm ${plan.benefits.courtDiscount}% giá sân`,`Giảm ${plan.benefits.shopDiscount}% tại shop`,plan.benefits.priorityBooking?"Ưu tiên đặt giờ Peak":null,plan.benefits.guestPasses>0?`${plan.benefits.guestPasses} guest pass/tháng`:null,plan.benefits.creditPerMonth>0?`${fmtVND(plan.benefits.creditPerMonth)} credit/tháng`:null].filter(Boolean).map(b=>(
                  <div key={b} style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{color:plan.color,fontWeight:700}}>✓</span>
                    <span style={{color:"#94A3B8",fontSize:13}}>{b}</span>
                  </div>
                ))}
              </div>
              <button style={{width:"100%",padding:"12px",background:i===2?`linear-gradient(135deg,${plan.color},#F59E0B)`:`linear-gradient(135deg,${plan.color},${plan.color}cc)`,border:"none",borderRadius:12,color:"white",fontWeight:700,cursor:"pointer"}}>
                Đăng ký ngay
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CustomerWebsite({ bookings, members, addPending }) {
  const scrollToBooking = () => document.getElementById("booking")?.scrollIntoView({behavior:"smooth"});
  return (
    <div style={{minHeight:"100vh",background:"#020810"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
        * { box-sizing:border-box; }
      `}</style>
      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(2,8,16,0.9)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(30,42,58,0.6)",padding:"0 48px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{color:"#10B981",fontWeight:800,fontSize:20,fontFamily:"'Playfair Display',serif"}}>⚡ SportHub</div>
        <div style={{display:"flex",gap:32}}>
          {["Sân thể thao","Dịch vụ","Thành viên","Về chúng tôi"].map(l=>(
            <a key={l} href="#" style={{color:"#4a6080",textDecoration:"none",fontSize:14,fontWeight:500,fontFamily:"'Outfit',sans-serif"}}>{l}</a>
          ))}
        </div>
        <button onClick={scrollToBooking} style={{padding:"10px 24px",background:"linear-gradient(135deg,#10B981,#059669)",border:"none",borderRadius:100,color:"white",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
          Đặt sân →
        </button>
      </nav>
      <CustomerHero onBook={scrollToBooking} />
      {/* Stats */}
      <section style={{background:"#0a1628",padding:"40px 48px",borderTop:"1px solid #1e2a3a",borderBottom:"1px solid #1e2a3a"}}>
        <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:32,textAlign:"center"}}>
          {[["6+","Sân thể thao"],["3","Môn thể thao"],["24/7","Đặt sân online"],["5 phút","Xác nhận"]].map(([v,l])=>(
            <div key={l}>
              <div style={{color:"#10B981",fontWeight:800,fontSize:36,fontFamily:"'Playfair Display',serif"}}>{v}</div>
              <div style={{color:"#4a6080",fontSize:14,marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
      </section>
      <CustomerBookingFlow bookings={bookings} members={members} addPending={addPending} />
      <CustomerMembershipSection />
      {/* Footer */}
      <footer style={{background:"#0a1628",borderTop:"1px solid #1e2a3a",padding:"32px 48px",textAlign:"center"}}>
        <div style={{color:"#10B981",fontWeight:800,fontSize:18,fontFamily:"'Playfair Display',serif",marginBottom:8}}>⚡ SportHub</div>
        <p style={{color:"#4a6080",fontSize:13}}>📍 123 Đường Thể Thao, Quận 1, TP.HCM &nbsp;|&nbsp; 📞 1800-SPORT &nbsp;|&nbsp; ✉️ hello@sporthub.vn</p>
      </footer>
    </div>
  );
}

// ============================================================
//  █████╗ ██████╗ ███╗   ███╗██╗███╗   ██╗
// ██╔══██╗██╔══██╗████╗ ████║██║████╗  ██║
// ███████║██║  ██║██╔████╔██║██║██╔██╗ ██║
// ██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║
// ██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║
// ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝
// ADMIN PORTAL
// ============================================================

function AdminDashboard({ bookings, pendingBookings, members, sales }) {
  const today_ = todayStr();
  const todayB = bookings.filter(b=>b.date===today_);
  const todayRev = todayB.reduce((s,b)=>s+b.finalPrice,0);
  const onlineB = bookings.filter(b=>b.source==="online");
  const stats = [
    {label:"Đặt sân hôm nay",value:todayB.length,icon:"🎾",color:"#10B981"},
    {label:"Chờ duyệt online",value:pendingBookings.filter(b=>b.status==="pending").length,icon:"🔔",color:"#F59E0B",alert:pendingBookings.filter(b=>b.status==="pending").length>0},
    {label:"Doanh thu hôm nay",value:fmtVND(todayRev),icon:"💰",color:"#6366F1"},
    {label:"Thành viên",value:members.length,icon:"👥",color:"#EC4899"},
  ];
  return (
    <div>
      <div style={{marginBottom:28}}>
        <h2 style={{color:"#F1F5F9",fontFamily:"'Playfair Display',serif",fontSize:26,margin:"0 0 4px"}}>Dashboard</h2>
        <p style={{color:"#64748B",margin:0,fontSize:13}}>{new Date().toLocaleDateString("vi-VN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:"#1E2433",borderRadius:12,padding:18,border:`1px solid ${s.alert?"#F59E0B40":"#2D3748"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:24}}>{s.icon}</span>
              {s.alert&&<span style={{background:"#F59E0B",color:"#0F172A",fontSize:10,padding:"2px 8px",borderRadius:100,fontWeight:700}}>MỚI</span>}
            </div>
            <div style={{color:"#F1F5F9",fontSize:20,fontWeight:700,marginBottom:3}}>{s.value}</div>
            <div style={{color:"#64748B",fontSize:12}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#1E2433",borderRadius:12,padding:16,border:"1px solid #2D3748",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h4 style={{color:"#F1F5F9",margin:0,fontSize:14}}>📊 Tỷ lệ đặt online vs Admin</h4>
        </div>
        <div style={{display:"flex",gap:3,height:8,borderRadius:4,overflow:"hidden",marginBottom:8}}>
          <div style={{background:"#10B981",flex:onlineB.length||1,borderRadius:"4px 0 0 4px"}}></div>
          <div style={{background:"#6366F1",flex:bookings.length-onlineB.length+1,borderRadius:"0 4px 4px 0"}}></div>
        </div>
        <div style={{display:"flex",gap:16}}>
          <span style={{color:"#10B981",fontSize:12}}>● Online: {onlineB.length}</span>
          <span style={{color:"#6366F1",fontSize:12}}>● Admin: {bookings.length-onlineB.length}</span>
        </div>
      </div>
    </div>
  );
}

function PendingBookings({ pendingBookings, approvePending, rejectPending }) {
  const pending = pendingBookings.filter(b=>b.status==="pending");
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h2 style={{color:"#F1F5F9",fontFamily:"'Playfair Display',serif",fontSize:26,margin:"0 0 4px"}}>Đặt sân Online</h2>
          <p style={{color:"#64748B",margin:0,fontSize:13}}>Yêu cầu từ website — cần xác nhận</p>
        </div>
        {pending.length > 0 && (
          <div style={{background:"#F59E0B",color:"#0F172A",padding:"6px 16px",borderRadius:100,fontSize:13,fontWeight:700}}>
            {pending.length} chờ duyệt
          </div>
        )}
      </div>

      {pending.length === 0 && (
        <div style={{background:"#1E2433",borderRadius:12,padding:48,textAlign:"center",border:"1px solid #2D3748"}}>
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <p style={{color:"#64748B",margin:0}}>Không có yêu cầu nào đang chờ</p>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {pending.map(b => {
          const plan = b.memberPlan ? MEMBERSHIP_PLANS.find(p=>p.id===b.memberPlan) : null;
          return (
            <div key={b.id} style={{background:"#1E2433",borderRadius:14,padding:20,border:"1px solid #F59E0B30"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:4}}>
                    <span style={{color:"#F1F5F9",fontWeight:700,fontSize:16}}>{b.courtName}</span>
                    <span style={{background:"rgba(16,185,129,0.15)",color:"#10B981",fontSize:10,padding:"2px 8px",borderRadius:4,fontWeight:700}}>🌐 ONLINE</span>
                    {plan && <Badge plan={b.memberPlan}/>}
                  </div>
                  <div style={{color:"#94A3B8",fontSize:13}}>{b.date} · {b.time} · {b.duration}h</div>
                  <div style={{color:"#94A3B8",fontSize:13}}>Ref: <span style={{color:"#F59E0B",fontWeight:600}}>{b.ref}</span> · Gửi lúc: {b.createdAt}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#10B981",fontWeight:700,fontSize:20}}>{fmtVND(b.finalPrice)}</div>
                  {b.creditUsed>0&&<div style={{color:"#F59E0B",fontSize:12}}>Credit: -{fmtVND(b.creditUsed)}</div>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,background:"#0F172A",borderRadius:8,padding:12,marginBottom:14}}>
                {[["Khách",b.customerName],["SĐT",b.customerPhone],["Email",b.customerEmail||"—"]].map(([k,v])=>(
                  <div key={k}><div style={{color:"#4B5563",fontSize:11}}>{k}</div><div style={{color:"#E2E8F0",fontSize:13}}>{v}</div></div>
                ))}
              </div>
              {b.note && <div style={{background:"#0F172A",borderRadius:8,padding:"8px 12px",marginBottom:14,color:"#94A3B8",fontSize:13}}>📝 {b.note}</div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>approvePending(b.id)}
                  style={{flex:1,padding:"10px",background:"#10B981",border:"none",borderRadius:10,color:"white",fontWeight:700,cursor:"pointer",fontSize:14}}>
                  ✅ Xác nhận
                </button>
                <button onClick={()=>rejectPending(b.id)}
                  style={{flex:1,padding:"10px",background:"#EF444420",border:"1px solid #EF4444",borderRadius:10,color:"#EF4444",fontWeight:700,cursor:"pointer",fontSize:14}}>
                  ✗ Từ chối
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Approved/Rejected history */}
      {pendingBookings.filter(b=>b.status!=="pending").length > 0 && (
        <div style={{marginTop:24}}>
          <h4 style={{color:"#64748B",marginBottom:12,fontSize:13}}>Đã xử lý</h4>
          {pendingBookings.filter(b=>b.status!=="pending").map(b=>(
            <div key={b.id} style={{background:"#1E2433",borderRadius:10,padding:14,border:"1px solid #2D3748",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",opacity:0.6}}>
              <div>
                <span style={{color:"#E2E8F0",fontSize:14}}>{b.courtName} · {b.date} {b.time}</span>
                <span style={{color:"#64748B",fontSize:12,marginLeft:8}}>{b.customerName}</span>
              </div>
              <span style={{background:b.status==="confirmed"?"#10B98120":"#EF444420",color:b.status==="confirmed"?"#10B981":"#EF4444",fontSize:12,padding:"3px 10px",borderRadius:6,fontWeight:600}}>
                {b.status==="confirmed"?"✓ Đã duyệt":"✗ Từ chối"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminBookingPage({ bookings, setBookings, members }) {
  const [date,setDate]=useState(todayStr());
  const [court,setCourt]=useState(null);
  const [time,setTime]=useState(null);
  const [duration,setDuration]=useState(1);
  const [name,setName]=useState(""); const [phone,setPhone]=useState("");
  const [searchM,setSearchM]=useState(""); const [selMember,setSelMember]=useState(null);
  const [useCredit,setUseCredit]=useState(false);
  const [filterSport,setFilterSport]=useState("All");

  const filtered = filterSport==="All"?COURTS:COURTS.filter(c=>c.sport===filterSport);
  const isBooked = (cId,t) => bookings.some(b=>b.courtId===cId&&b.date===date&&b.time===t&&b.status!=="rejected");
  const memberSearch = members.filter(m=>m.name.toLowerCase().includes(searchM.toLowerCase())||m.phone.includes(searchM));
  const plan = selMember?MEMBERSHIP_PLANS.find(p=>p.id===selMember.plan):null;
  const base = court?(isPeak(time||"09:00")?court.peakPrice:court.price)*duration:0;
  const discounted = plan?Math.round(base*(1-plan.benefits.courtDiscount/100)):base;
  const creditUsed = useCredit&&selMember?Math.min(selMember.credit,discounted):0;
  const final_ = discounted-creditUsed;

  const confirm = () => {
    if (!court||!time||((!selMember)&&!name)){alert("Thiếu thông tin");return;}
    setBookings(prev=>[...prev,{id:Date.now(),courtId:court.id,courtName:court.name,date,time,duration,
      customerName:selMember?.name||name,customerPhone:selMember?.phone||phone,
      memberId:selMember?.id||null,memberPlan:selMember?.plan||null,
      basePrice:base,discountedPrice:discounted,creditUsed,finalPrice:final_,
      payMethod:"cash",status:"confirmed",source:"admin"}]);
    setCourt(null);setTime(null);setSelMember(null);setName("");setPhone("");setUseCredit(false);
    alert("✅ Đặt sân thành công!");
  };

  return (
    <div>
      <h2 style={{color:"#F1F5F9",fontFamily:"'Playfair Display',serif",fontSize:26,margin:"0 0 20px"}}>Đặt Sân (Admin)</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
        <div>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{background:"#1E2433",border:"1px solid #2D3748",borderRadius:8,padding:"8px 12px",color:"#E2E8F0",fontSize:13}} />
            {["All",...SPORTS_LIST].map(s=>(
              <button key={s} onClick={()=>setFilterSport(s)}
                style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
                  background:filterSport===s?"#10B981":"#1E2433",color:filterSport===s?"white":"#64748B"}}>
                {s}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {filtered.map(c=>(
              <div key={c.id} onClick={()=>setCourt(c)}
                style={{background:"#1E2433",borderRadius:12,padding:14,border:`2px solid ${court?.id===c.id?"#10B981":"#2D3748"}`,cursor:"pointer"}}>
                <div style={{color:"#F1F5F9",fontWeight:700,fontSize:14,marginBottom:4}}>{c.name}</div>
                <div style={{color:"#64748B",fontSize:12,marginBottom:10}}>{c.sport} · {c.surface}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                  {TIME_SLOTS.map(t=>{
                    const bk=isBooked(c.id,t); const sel=court?.id===c.id&&time===t;
                    return <button key={t} disabled={bk} onClick={e=>{e.stopPropagation();setCourt(c);setTime(t);}}
                      style={{padding:"3px 6px",fontSize:10,borderRadius:4,border:"none",cursor:bk?"not-allowed":"pointer",
                        background:bk?"#374151":sel?"#10B981":"#0F172A",
                        color:bk?"#4B5563":sel?"white":"#94A3B8"}}>{t}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"#1E2433",borderRadius:12,padding:18,border:"1px solid #2D3748",height:"fit-content"}}>
          <h4 style={{color:"#F1F5F9",margin:"0 0 14px",fontSize:14}}>Chi tiết đặt sân</h4>
          {court&&time&&<div style={{background:"#0F172A",borderRadius:8,padding:10,marginBottom:12,fontSize:12}}>
            <div style={{color:"#10B981",fontWeight:700}}>{court.name}</div>
            <div style={{color:"#94A3B8"}}>{date} · {time} · {isPeak(time)?"⚡Peak":"Thường"}</div>
          </div>}
          <select value={duration} onChange={e=>setDuration(+e.target.value)}
            style={{width:"100%",background:"#0F172A",border:"1px solid #2D3748",borderRadius:8,padding:"8px 12px",color:"#E2E8F0",fontSize:13,marginBottom:10}}>
            {[1,1.5,2,3].map(d=><option key={d} value={d}>{d}h</option>)}
          </select>
          <input placeholder="Tìm thành viên..." value={searchM} onChange={e=>setSearchM(e.target.value)}
            style={{width:"100%",boxSizing:"border-box",background:"#0F172A",border:"1px solid #2D3748",borderRadius:8,padding:"8px 12px",color:"#E2E8F0",fontSize:13,marginBottom:4}} />
          {searchM&&memberSearch.length>0&&<div style={{background:"#0F172A",border:"1px solid #2D3748",borderRadius:8,marginBottom:8}}>
            {memberSearch.map(m=><div key={m.id} onClick={()=>{setSelMember(m);setSearchM("");}}
              style={{padding:"7px 10px",cursor:"pointer",borderBottom:"1px solid #2D374830"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#E2E8F0",fontSize:12}}>{m.name}</span><Badge plan={m.plan}/></div>
            </div>)}
          </div>}
          {selMember?<div style={{background:"#0F172A",borderRadius:8,padding:8,marginBottom:8,display:"flex",justifyContent:"space-between"}}>
            <div><span style={{color:"#10B981",fontSize:12,fontWeight:600}}>{selMember.name}</span></div>
            <button onClick={()=>setSelMember(null)} style={{background:"none",border:"none",color:"#64748B",cursor:"pointer"}}>×</button>
          </div>:<>
            <input placeholder="Tên khách" value={name} onChange={e=>setName(e.target.value)}
              style={{width:"100%",boxSizing:"border-box",background:"#0F172A",border:"1px solid #2D3748",borderRadius:8,padding:"8px 12px",color:"#E2E8F0",fontSize:13,marginBottom:6}} />
            <input placeholder="SĐT" value={phone} onChange={e=>setPhone(e.target.value)}
              style={{width:"100%",boxSizing:"border-box",background:"#0F172A",border:"1px solid #2D3748",borderRadius:8,padding:"8px 12px",color:"#E2E8F0",fontSize:13,marginBottom:8}} />
          </>}
          {court&&time&&<div style={{background:"#0F172A",borderRadius:8,padding:10,marginBottom:8}}>
            {discounted<base&&<div style={{display:"flex",justifyContent:"space-between",color:"#10B981",fontSize:12,marginBottom:4}}>
              <span>Giảm {plan?.benefits.courtDiscount}%</span><span>-{fmtVND(base-discounted)}</span>
            </div>}
            <div style={{display:"flex",justifyContent:"space-between",color:"#F1F5F9",fontWeight:700}}>
              <span>Tổng</span><span style={{color:"#10B981"}}>{fmtVND(final_)}</span>
            </div>
          </div>}
          <button onClick={confirm} style={{width:"100%",padding:"10px",background:"#10B981",border:"none",borderRadius:10,color:"white",fontWeight:700,cursor:"pointer",fontSize:14}}>
            Xác nhận đặt sân
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminMembersPage({ members, setMembers }) {
  const [showAdd,setShowAdd]=useState(false);
  const [search,setSearch]=useState("");
  const [form,setForm]=useState({name:"",phone:"",email:"",plan:"basic"});
  const filtered = members.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())||m.phone.includes(search));
  const addMember = () => {
    if (!form.name||!form.phone){alert("Thiếu thông tin");return;}
    const plan=MEMBERSHIP_PLANS.find(p=>p.id===form.plan);
    const expiry=new Date(); expiry.setDate(expiry.getDate()+plan.duration);
    setMembers(prev=>[...prev,{id:Date.now(),...form,joinDate:todayStr(),expiry:expiry.toISOString().split("T")[0],credit:plan.benefits.creditPerMonth,guestPasses:plan.benefits.guestPasses,totalSpent:plan.price}]);
    setForm({name:"",phone:"",email:"",plan:"basic"}); setShowAdd(false);
  };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{color:"#F1F5F9",fontFamily:"'Playfair Display',serif",fontSize:26,margin:0}}>Thành viên ({members.length})</h2>
        <button onClick={()=>setShowAdd(true)} style={{padding:"9px 18px",background:"#10B981",border:"none",borderRadius:10,color:"white",fontWeight:700,cursor:"pointer",fontSize:13}}>+ Thêm</button>
      </div>
      <input placeholder="Tìm kiếm..." value={search} onChange={e=>setSearch(e.target.value)}
        style={{background:"#1E2433",border:"1px solid #2D3748",borderRadius:8,padding:"9px 14px",color:"#E2E8F0",fontSize:14,width:260,marginBottom:14}} />
      <div style={{background:"#1E2433",borderRadius:12,border:"1px solid #2D3748",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #2D3748"}}>
            {["Thành viên","Gói","Hết hạn","Credit","Tổng chi"].map(h=><th key={h} style={{padding:"11px 14px",color:"#64748B",fontSize:12,textAlign:"left"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(m=>{
              const plan=MEMBERSHIP_PLANS.find(p=>p.id===m.plan);
              return <tr key={m.id} style={{borderBottom:"1px solid #2D374830"}}>
                <td style={{padding:"11px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:plan?.color||"#374151",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:12}}>{m.name.charAt(0)}</div>
                    <div><div style={{color:"#F1F5F9",fontSize:13,fontWeight:600}}>{m.name}</div><div style={{color:"#64748B",fontSize:11}}>{m.phone}</div></div>
                  </div>
                </td>
                <td style={{padding:"11px 14px"}}><Badge plan={m.plan}/></td>
                <td style={{padding:"11px 14px",color: new Date(m.expiry)<new Date()?"#EF4444":"#94A3B8",fontSize:12}}>{m.expiry}</td>
                <td style={{padding:"11px 14px",color:"#F59E0B",fontSize:13,fontWeight:600}}>{fmtVND(m.credit)}</td>
                <td style={{padding:"11px 14px",color:"#10B981",fontSize:13,fontWeight:600}}>{fmtVND(m.totalSpent)}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {showAdd&&<Modal title="Thêm thành viên" onClose={()=>setShowAdd(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[["Họ tên *","name","text"],["SĐT *","phone","tel"],["Email","email","email"]].map(([l,f,t])=>(
            <div key={f}><label style={{color:"#94A3B8",fontSize:12,display:"block",marginBottom:4}}>{l}</label>
            <input type={t} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}
              style={{width:"100%",boxSizing:"border-box",background:"#0F172A",border:"1px solid #2D3748",borderRadius:8,padding:"10px 12px",color:"#E2E8F0",fontSize:14}} /></div>
          ))}
          <div>
            <label style={{color:"#94A3B8",fontSize:12,display:"block",marginBottom:6}}>Gói thành viên</label>
            <div style={{display:"flex",gap:8}}>
              {MEMBERSHIP_PLANS.map(p=><button key={p.id} onClick={()=>setForm({...form,plan:p.id})}
                style={{flex:1,padding:"8px",border:`2px solid ${form.plan===p.id?p.color:"#2D3748"}`,borderRadius:8,cursor:"pointer",background:"#0F172A",color:form.plan===p.id?p.color:"#64748B",fontSize:13,fontWeight:600}}>
                {p.name}</button>)}
            </div>
          </div>
          <button onClick={addMember} style={{padding:"12px",background:"#10B981",border:"none",borderRadius:10,color:"white",fontWeight:700,fontSize:15,cursor:"pointer"}}>
            Đăng ký — {fmtVND(MEMBERSHIP_PLANS.find(p=>p.id===form.plan)?.price||0)}
          </button>
        </div>
      </Modal>}
    </div>
  );
}

function AdminShopPage({ members, setSales }) {
  const [cart,setCart]=useState([]);
  const [searchM,setSearchM]=useState(""); const [selM,setSelM]=useState(null);
  const memberSearch=members.filter(m=>m.name.toLowerCase().includes(searchM.toLowerCase())||m.phone.includes(searchM));
  const addCart = p => setCart(prev=>{const e=prev.find(i=>i.id===p.id); return e?prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...prev,{...p,qty:1}];});
  const plan = selM?MEMBERSHIP_PLANS.find(p=>p.id===selM.plan):null;
  const sub = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const disc = plan?Math.round(sub*plan.benefits.shopDiscount/100):0;
  const total = sub-disc;
  const checkout = () => {
    setSales(prev=>[...prev,{id:Date.now(),date:todayStr(),items:cart,subtotal:sub,discAmount:disc,creditUsed:0,total,memberId:selM?.id,customerName:selM?.name||"Khách lẻ",payMethod:"cash"}]);
    setCart([]); setSelM(null); alert("✅ Thanh toán thành công!");
  };
  return (
    <div>
      <h2 style={{color:"#F1F5F9",fontFamily:"'Playfair Display',serif",fontSize:26,margin:"0 0 20px"}}>Cửa hàng</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20}}>
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10,marginBottom:20}}>
            {[...PRODUCTS,...SERVICES_LIST.map(s=>({...s,img:s.icon,category:"Service",stock:99}))].map(p=>(
              <div key={p.id+p.category} onClick={()=>addCart(p)}
                style={{background:"#1E2433",borderRadius:10,padding:14,border:"1px solid #2D3748",cursor:"pointer",textAlign:"center"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="#10B981"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="#2D3748"}>
                <div style={{fontSize:28,marginBottom:6}}>{p.img}</div>
                <div style={{color:"#F1F5F9",fontSize:12,fontWeight:600,marginBottom:2}}>{p.name}</div>
                <div style={{color:"#10B981",fontWeight:700,fontSize:13}}>{fmtVND(p.price)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"#1E2433",borderRadius:12,padding:16,border:"1px solid #2D3748",height:"fit-content"}}>
          <h4 style={{color:"#F1F5F9",margin:"0 0 12px",fontSize:14}}>🛒 Giỏ hàng</h4>
          <input placeholder="Tìm thành viên..." value={searchM} onChange={e=>setSearchM(e.target.value)}
            style={{width:"100%",boxSizing:"border-box",background:"#0F172A",border:"1px solid #2D3748",borderRadius:8,padding:"7px 10px",color:"#E2E8F0",fontSize:13,marginBottom:6}} />
          {searchM&&memberSearch.length>0&&<div style={{background:"#0F172A",border:"1px solid #2D3748",borderRadius:8,marginBottom:6}}>
            {memberSearch.map(m=><div key={m.id} onClick={()=>{setSelM(m);setSearchM("");}}
              style={{padding:"7px 10px",cursor:"pointer",borderBottom:"1px solid #2D374830",color:"#E2E8F0",fontSize:12}}>{m.name} <Badge plan={m.plan}/></div>)}
          </div>}
          {selM&&<div style={{background:"#0F172A",borderRadius:8,padding:"6px 10px",marginBottom:8,display:"flex",justifyContent:"space-between"}}>
            <span style={{color:"#10B981",fontSize:12,fontWeight:600}}>{selM.name} (-{plan?.benefits.shopDiscount}%)</span>
            <button onClick={()=>setSelM(null)} style={{background:"none",border:"none",color:"#64748B",cursor:"pointer"}}>×</button>
          </div>}
          {cart.length===0?<p style={{color:"#4B5563",textAlign:"center",fontSize:12,padding:"16px 0"}}>Chưa có sản phẩm</p>:
          <>
            {cart.map(i=>(
              <div key={i.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #2D374830"}}>
                <div style={{flex:1}}><div style={{color:"#E2E8F0",fontSize:12}}>{i.name}</div><div style={{color:"#10B981",fontSize:12}}>{fmtVND(i.price)}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <button onClick={()=>setCart(prev=>prev.map(x=>x.id===i.id&&x.qty>1?{...x,qty:x.qty-1}:x).filter(x=>x.qty>0))}
                    style={{width:18,height:18,background:"#0F172A",border:"1px solid #2D3748",borderRadius:3,color:"#94A3B8",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
                  <span style={{color:"#F1F5F9",fontSize:12,minWidth:14,textAlign:"center"}}>{i.qty}</span>
                  <button onClick={()=>setCart(prev=>prev.map(x=>x.id===i.id?{...x,qty:x.qty+1}:x))}
                    style={{width:18,height:18,background:"#0F172A",border:"1px solid #2D3748",borderRadius:3,color:"#94A3B8",cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                </div>
              </div>
            ))}
            <div style={{background:"#0F172A",borderRadius:8,padding:10,marginTop:8,marginBottom:8}}>
              {disc>0&&<div style={{display:"flex",justifyContent:"space-between",color:"#10B981",fontSize:12,marginBottom:4}}>
                <span>Giảm {plan?.benefits.shopDiscount}%</span><span>-{fmtVND(disc)}</span>
              </div>}
              <div style={{display:"flex",justifyContent:"space-between",color:"#F1F5F9",fontWeight:700}}>
                <span>Tổng</span><span style={{color:"#10B981"}}>{fmtVND(total)}</span>
              </div>
            </div>
            <button onClick={checkout} style={{width:"100%",padding:"10px",background:"#10B981",border:"none",borderRadius:10,color:"white",fontWeight:700,cursor:"pointer",fontSize:13}}>
              Thanh toán
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}

function AdminBookingList({ bookings }) {
  const [filter,setFilter]=useState("all");
  const filtered = filter==="all"?bookings:filter==="online"?bookings.filter(b=>b.source==="online"):bookings.filter(b=>b.date===todayStr());
  return (
    <div>
      <h2 style={{color:"#F1F5F9",fontFamily:"'Playfair Display',serif",fontSize:26,margin:"0 0 20px"}}>Lịch sử đặt sân</h2>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["all","Tất cả"],["online","🌐 Online"],["today","Hôm nay"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,background:filter===v?"#10B981":"#1E2433",color:filter===v?"white":"#64748B"}}>
            {l}
          </button>
        ))}
      </div>
      <div style={{background:"#1E2433",borderRadius:12,border:"1px solid #2D3748",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #2D3748"}}>
            {["Sân","Khách","Ngày/Giờ","Nguồn","Thanh toán","TT"].map(h=><th key={h} style={{padding:"11px 14px",color:"#64748B",fontSize:12,textAlign:"left"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {[...filtered].reverse().map(b=>(
              <tr key={b.id} style={{borderBottom:"1px solid #2D374830"}}>
                <td style={{padding:"11px 14px",color:"#F1F5F9",fontSize:13}}>{b.courtName}</td>
                <td style={{padding:"11px 14px"}}><div style={{color:"#E2E8F0",fontSize:13}}>{b.customerName}</div><Badge plan={b.memberPlan}/></td>
                <td style={{padding:"11px 14px",color:"#94A3B8",fontSize:12}}>{b.date}<br/>{b.time}·{b.duration}h</td>
                <td style={{padding:"11px 14px"}}>
                  <span style={{background:b.source==="online"?"rgba(16,185,129,0.15)":"rgba(99,102,241,0.15)",color:b.source==="online"?"#10B981":"#818CF8",fontSize:11,padding:"2px 8px",borderRadius:4,fontWeight:700}}>
                    {b.source==="online"?"🌐 Online":"🖥 Admin"}
                  </span>
                </td>
                <td style={{padding:"11px 14px",color:"#10B981",fontWeight:700,fontSize:14}}>{fmtVND(b.finalPrice)}</td>
                <td style={{padding:"11px 14px"}}><span style={{background:"#10B98120",color:"#10B981",fontSize:11,padding:"2px 8px",borderRadius:4}}>✓ Xác nhận</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0&&<p style={{color:"#4B5563",textAlign:"center",padding:24,fontSize:13}}>Không có dữ liệu</p>}
      </div>
    </div>
  );
}

function AdminPortal({ store }) {
  const [page, setPage] = useState("dashboard");
  const { bookings, setBookings, members, setMembers, sales, setSales, pendingBookings, approvePending, rejectPending } = store;
  const pending = pendingBookings.filter(b=>b.status==="pending").length;

  const NAV = [
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"pending",icon:"🔔",label:"Online",badge:pending},
    {id:"booking",icon:"🎾",label:"Đặt Sân"},
    {id:"bookings",icon:"📋",label:"Lịch Đặt"},
    {id:"members",icon:"👥",label:"Thành viên"},
    {id:"shop",icon:"🛒",label:"Cửa hàng"},
  ];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#0F172A",fontFamily:"'Outfit',sans-serif"}}>
      <div style={{width:200,background:"#141824",borderRight:"1px solid #1E2433",display:"flex",flexDirection:"column",padding:"20px 10px"}}>
        <div style={{padding:"6px 12px",marginBottom:20}}>
          <div style={{color:"#10B981",fontWeight:800,fontSize:17,fontFamily:"'Playfair Display',serif"}}>⚡ SportHub</div>
          <div style={{color:"#4B5563",fontSize:10,marginTop:1}}>Admin Portal</div>
        </div>
        <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setPage(n.id)}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",width:"100%",position:"relative",
                background:page===n.id?"#10B98115":"transparent",
                color:page===n.id?"#10B981":"#64748B",
                borderLeft:page===n.id?"3px solid #10B981":"3px solid transparent",
                fontWeight:page===n.id?600:400,fontSize:13}}>
              <span style={{fontSize:16}}>{n.icon}</span>{n.label}
              {n.badge>0&&<span style={{position:"absolute",right:10,background:"#F59E0B",color:"#0F172A",fontSize:10,fontWeight:700,padding:"1px 6px",borderRadius:100}}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"10px 12px",background:"#1E2433",borderRadius:8,fontSize:11}}>
          <div style={{color:"#F1F5F9",fontWeight:600}}>SportHub v1.0</div>
          <div style={{color:"#10B981"}}>● Online</div>
        </div>
      </div>
      <div style={{flex:1,padding:28,overflowY:"auto"}}>
        {page==="dashboard"&&<AdminDashboard bookings={bookings} pendingBookings={pendingBookings} members={members} sales={sales}/>}
        {page==="pending"&&<PendingBookings pendingBookings={pendingBookings} approvePending={approvePending} rejectPending={rejectPending}/>}
        {page==="booking"&&<AdminBookingPage bookings={bookings} setBookings={setBookings} members={members}/>}
        {page==="bookings"&&<AdminBookingList bookings={bookings}/>}
        {page==="members"&&<AdminMembersPage members={members} setMembers={setMembers}/>}
        {page==="shop"&&<AdminShopPage members={members} setSales={setSales}/>}
      </div>
    </div>
  );
}

// ============================================================
// ROOT APP — Toggle between Customer Website & Admin
// ============================================================
export default function App() {
  const [view, setView] = useState("customer"); // "customer" | "admin"
  const store = useSharedStore();

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#1E2433} ::-webkit-scrollbar-thumb{background:#2D3748;border-radius:2px}
      `}</style>

      {/* Switcher tab — simulates "two separate URLs" */}
      <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,display:"flex",gap:6,background:"rgba(14,24,40,0.95)",border:"1px solid #1e3a5a",borderRadius:100,padding:"6px 8px",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
        <button onClick={()=>setView("customer")}
          style={{padding:"8px 18px",borderRadius:100,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Outfit',sans-serif",
            background:view==="customer"?"linear-gradient(135deg,#10B981,#059669)":"transparent",
            color:view==="customer"?"white":"#4a6080"}}>
          🌐 Website khách
        </button>
        <button onClick={()=>setView("admin")}
          style={{padding:"8px 18px",borderRadius:100,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Outfit',sans-serif",
            background:view==="admin"?"linear-gradient(135deg,#6366F1,#4F46E5)":"transparent",
            color:view==="admin"?"white":"#4a6080"}}>
          🖥 Admin Portal {store.pendingBookings.filter(b=>b.status==="pending").length>0&&<span style={{background:"#F59E0B",color:"#0F172A",borderRadius:"50%",padding:"0 5px",marginLeft:4,fontSize:10}}>{store.pendingBookings.filter(b=>b.status==="pending").length}</span>}
        </button>
      </div>

      {view === "customer" && (
        <CustomerWebsite
          bookings={store.bookings}
          members={store.members}
          addPending={store.addPending}
        />
      )}
      {view === "admin" && <AdminPortal store={store} />}
    </div>
  );
}
