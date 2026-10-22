
const STORAGE_KEY = "smartHospitalData_v1"; // Preserve records from the original project
const SESSION_KEY = "smartHospitalSession_v1";

const doctors = {
  "General Medicine": ["Dr. Mehta", "Dr. Kulkarni"],
  "Cardiology": ["Dr. Shah"],
  "Orthopedics": ["Dr. Patil"],
  "Dermatology": ["Dr. Deshmukh"],
  "Pediatrics": ["Dr. Joshi"],
  "ENT": ["Dr. More"]
};

const $ = id => document.getElementById(id);
const all = sel => [...document.querySelectorAll(sel)];

function todayKey(d = new Date()){
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
}
function nowISO(){ return new Date().toISOString(); }
function dateOffset(days, hour=9, minute=0){
  const d = new Date(); d.setDate(d.getDate() - days); d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
function initials(name="") { return String(name).trim().split(/\s+/).slice(0,2).map(s=>s[0]||"").join("").toUpperCase(); }
function fromDay(date){ return todayKey(date) === todayKey(); }
function downloadFile(name, content, mime){
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}
function csvEsc(v) { return '"' + String(v ?? '').replace(/"/g, '""') + '"'; }

function money(n){ return "₹" + Number(n || 0).toLocaleString("en-IN"); }
function esc(v=""){ return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
function fmt(v){ return new Date(v).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); }
function badgeClass(v){ return String(v).toLowerCase().replace(/\s+/g,"-"); }
function nextId(prefix, arr, digits=4){
  let max = 0;
  arr.forEach(x => {
    const n = parseInt(String(x.id).replace(/\D/g,""),10);
    if(!isNaN(n)) max = Math.max(max,n);
  });
  return prefix + String(max+1).padStart(digits,"0");
}

function seed(){
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const existing=JSON.parse(saved);
      if(existing && ["patients","tokens","labs","bills"].every(k=>Array.isArray(existing[k]))) return existing;
    } catch(err) { console.warn("Existing demo data could not be read.",err); }
  }
  // Entirely fictional seed data; deterministic IDs, dates relative to visitor's local day.
  const people = [
    ["Aarav Sharma","9876543210",34,"Male","B+","Pune","Wakad, Pune"],
    ["Neha Patil","9898989898",28,"Female","O+","Pimpri","Pimpri, Pune"],
    ["Rohan Kulkarni","9765432109",46,"Male","A+","Chinchwad","Chinchwad, Pune"],
    ["Riya Deshpande","9850011122",31,"Female","AB+","Pune","Baner, Pune"],
    ["Ishaan Joshi","9833400200",22,"Male","O+","Aundh","Aundh, Pune"],
    ["Sana Khan","9800300300",39,"Female","B-","Pune","Kothrud, Pune"],
    ["Vikram Nair","9890202020",55,"Male","A-","Hinjewadi","Hinjewadi, Pune"],
    ["Diya Shah","9840404040",7,"Female","O-","Pune","Deccan, Pune"],
    ["Tanvi Rao","9820203030",41,"Female","B+","Pimpri","Pimpri, Pune"]
  ];
  const patients=people.map((a,i)=>({id:"P"+String(i+1).padStart(4,"0"),name:a[0],mobile:a[1],age:a[2],gender:a[3],blood:a[4],city:a[5],address:a[6],createdAt:dateOffset(Math.min(9,i+1),9+(i%3),15)}));
  const visits=[
    [1,"General Medicine","Dr. Mehta","Normal","Waiting",0,9,10],
    [2,"Dermatology","Dr. Deshmukh","Normal","In Consultation",0,9,40],
    [3,"Cardiology","Dr. Shah","Urgent","Completed",0,10,2],
    [4,"General Medicine","Dr. Kulkarni","Normal","Waiting",0,10,15],
    [5,"Orthopedics","Dr. Patil","Normal","Completed",0,10,35],
    [6,"General Medicine","Dr. Mehta","Normal","Completed",1,10,14],
    [7,"Cardiology","Dr. Shah","Normal","Completed",1,12,20],
    [8,"Pediatrics","Dr. Joshi","Normal","Completed",2,9,30],
    [1,"General Medicine","Dr. Kulkarni","Normal","Completed",2,11,10],
    [3,"Cardiology","Dr. Shah","Normal","Completed",3,10,35],
    [4,"Dermatology","Dr. Deshmukh","Normal","Completed",3,14,20],
    [9,"ENT","Dr. More","Normal","Completed",4,10,40],
    [5,"Orthopedics","Dr. Patil","Normal","Completed",4,12,15],
    [2,"Dermatology","Dr. Deshmukh","Normal","Completed",5,11,0],
    [6,"General Medicine","Dr. Mehta","Normal","Completed",6,9,30],
    [7,"Cardiology","Dr. Shah","Normal","Completed",6,11,45]
  ];
  const tokens=visits.map((v,i)=>({id:"T"+String(i+1).padStart(3,"0"),patientId:patients[v[0]-1].id,patientName:patients[v[0]-1].name,department:v[1],doctor:v[2],visitType:i%4===0?"Follow-up":"New Consultation",priority:v[3],status:v[4],createdAt:dateOffset(v[5],v[6],v[7])}));
  const tests=[
    [1,"Complete Blood Count (CBC)",500,"Dr. Mehta","Requested","",0],
    [3,"Lipid Profile",800,"Dr. Shah","Sample Collected","",0],
    [5,"Blood Sugar",250,"Dr. Patil","Completed","Fasting blood glucose: 92 mg/dL",0],
    [6,"Thyroid Profile",750,"Dr. Mehta","Requested","",1],
    [7,"Liver Function Test",900,"Dr. Shah","Completed","Illustrative result: within reference range.",1],
    [8,"Urine Routine",300,"Dr. Joshi","Completed","Illustrative result: no significant abnormalities.",2],
    [2,"Kidney Function Test",850,"Dr. Deshmukh","Completed","Illustrative result: within reference range.",3]
  ];
  const labs=tests.map((x,i)=>({id:"L"+String(i+1).padStart(4,"0"),patientId:patients[x[0]-1].id,patientName:patients[x[0]-1].name,test:x[1],charge:x[2],doctor:x[3],notes:"Sample demonstration order",status:x[4],result:x[5],createdAt:dateOffset(x[6],9+i%5,10),...(x[4]==="Completed"?{completedAt:dateOffset(x[6],13,20)}:{})}));
  const invoices=[[2,500,0,0,"Paid",0],[3,500,800,0,"Pending",0],[5,500,250,0,"Paid",0],[6,500,750,0,"Paid",1],[7,650,900,0,"Paid",1],[8,400,300,0,"Paid",2],[4,500,0,0,"Pending",3]];
  const bills=invoices.map((x,i)=>({id:"B"+String(i+1).padStart(4,"0"),patientId:patients[x[0]-1].id,patientName:patients[x[0]-1].name,mobile:patients[x[0]-1].mobile,consultation:x[1],lab:x[2],other:x[3],total:x[1]+x[2]+x[3],status:x[4],createdAt:dateOffset(x[5],11+i%4,30)}));
  const data={patients,tokens,labs,bills};
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
  return data;
}

let db = seed();

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  renderAll();
}

function toast(msg){
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  setTimeout(()=>$("toast").classList.remove("show"),2000);
}

function openModal(id){
  const modal=$(id); modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  const focus=modal.querySelector("form select:not([type=hidden]), form input:not([type=hidden]), form textarea");
  if(focus) setTimeout(()=>focus.focus(),0);
}
function closeModal(id){
  $(id).classList.add("hidden");
  if(!document.querySelector(".modal-wrap:not(.hidden)"))document.body.classList.remove("modal-open");
}
function closeSidebar(){ $("sidebar").classList.remove("open"); $("sidebarBackdrop").classList.add("hidden"); }
function setUser(role){
  $("userRoleText").textContent=role;
  const names={Administrator:"Demo Administrator",Receptionist:"Demo Receptionist",Doctor:"Demo Doctor","Lab Technician":"Demo Lab Technician"};
  $("userNameText").textContent=names[role]||"Demo User";
  const title=role==="Administrator"?"Administrator":role;
  $("welcomeTitle").innerHTML=`${greeting()}, ${esc(title)} <span class="wave">✦</span>`;
}
function greeting(){const h=new Date().getHours();return h<12?"Good morning":h<17?"Good afternoon":"Good evening";}


function showPage(page){
  all(".page").forEach(p=>p.classList.remove("active"));
  all(".nav-btn").forEach(b=>b.classList.remove("active"));
  $("page-"+page).classList.add("active");
  const btn = document.querySelector(`.nav-btn[data-page="${page}"]`);
  if(btn) btn.classList.add("active");
  const titleMap = {dashboard:"Overview",patients:"Patients",opd:"OPD & Consultations",lab:"Laboratory",billing:"Billing & Payments",reports:"Reports & Analytics"};
  $("pageTitle").textContent = titleMap[page];
  closeSidebar();
  renderAll();
}

function populatePatients(){
  const opts = `<option value="">Select Patient</option>` + db.patients.map(p=>`<option value="${p.id}">${esc(p.name)} (${p.id})</option>`).join("");
  $("tokenPatient").innerHTML = opts;
  $("labPatient").innerHTML = opts;
  $("billPatient").innerHTML = opts;
}

function renderDashboard(){
  const t = todayKey();
  const todayTokens = db.tokens.filter(x=>todayKey(x.createdAt)===t);
  const pending = db.labs.filter(x=>x.status!=="Completed");
  const revenue = db.bills.filter(x=>x.status==="Paid" && todayKey(x.createdAt)===t).reduce((s,x)=>s+Number(x.total),0);

  $("statPatients").textContent = db.patients.length;
  $("statOpd").textContent = todayTokens.length;
  $("statLab").textContent = pending.length;
  $("statRevenue").textContent = money(revenue);
  $("notificationCount").textContent = pending.length;
  $("notificationCount").classList.toggle("hidden",pending.length===0);
  renderTraffic();
  renderOverview();

  const q = [...todayTokens].reverse().slice(0,5);
  $("dashboardQueue").innerHTML = q.length ? `
    <div class="table-wrap"><table class="table">
      <thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Status</th></tr></thead>
      <tbody>${q.map(x=>`<tr><td><b>${x.id}</b></td><td>${esc(x.patientName)}</td><td>${esc(x.doctor)}</td><td><span class="badge ${badgeClass(x.status)}">${x.status}</span></td></tr>`).join("")}</tbody>
    </table></div>` : `<div class="empty">No OPD tokens today.</div>`;

  const labs = [...db.labs].reverse().slice(0,5);
  $("dashboardLabs").innerHTML = labs.length ? labs.map(x=>`
    <div class="activity">
      <div><strong>${esc(x.test)}</strong><small>${esc(x.patientName)} • ${x.id}</small></div>
      <div class="activity-right"><span class="badge ${badgeClass(x.status)}">${x.status}</span><small>${money(x.charge)}</small></div>
    </div>`).join("") : `<div class="empty">No lab requests.</div>`;
}

function renderTraffic(){
  const days=Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    return {key:todayKey(d),label:d.toLocaleDateString("en-IN",{weekday:"short"})};
  });
  const counts=days.map(d=>db.tokens.filter(x=>todayKey(x.createdAt)===d.key).length);
  const max=Math.max(1,...counts);
  $("trafficChart").setAttribute("aria-label",`OPD visits, last seven days: ${counts.map((n,i)=>`${days[i].label} ${n}`).join(", ")}`);
  $("trafficChart").innerHTML=days.map((d,i)=>`<div class="traffic-column" title="${d.label}: ${counts[i]} visits"><span class="traffic-value">${counts[i]||""}</span><div class="traffic-bar ${i===6?"current":""}" style="height:${Math.max(6,Math.round(counts[i]/max*112))}px"></div><span class="traffic-label">${d.label}</span></div>`).join("");
}
function renderOverview(){
  const today=db.tokens.filter(x=>fromDay(x.createdAt));
  const items=[
    {icon:"i-clock",tone:"si-amber",name:"Patients waiting",detail:"In today's OPD queue",count:today.filter(x=>x.status==="Waiting").length},
    {icon:"i-stethoscope",tone:"si-blue",name:"In consultation",detail:"Currently with a doctor",count:today.filter(x=>x.status==="In Consultation").length},
    {icon:"i-flask",tone:"si-violet",name:"Lab orders open",detail:"Awaiting results or samples",count:db.labs.filter(x=>x.status!=="Completed").length},
    {icon:"i-check",tone:"si-teal",name:"Completed consultations",detail:"Today's completed OPD visits",count:today.filter(x=>x.status==="Completed").length}
  ];
  $("dashboardOverview").innerHTML=items.map(x=>`<div class="overview-item"><div class="overview-symbol ${x.tone}"><svg class="ic"><use href="#${x.icon}"/></svg></div><div><strong>${x.name}</strong><small>${x.detail}</small></div><span class="overview-number">${x.count}</span></div>`).join("");
}

function patientRows(list){
  if(!list.length) return `<div class="empty">No matching patients found. Try a different search or add a patient.</div>`;
  return `<table class="table"><thead><tr><th>Patient ID</th><th>Patient Name</th><th>Mobile</th><th>Age / Gender</th><th>Blood</th><th>City</th><th>Actions</th></tr></thead><tbody>${list.map(p=>`<tr>
    <td><b>${esc(p.id)}</b></td><td><div class="cell-name"><span class="cell-avatar">${esc(initials(p.name))}</span><span><b>${esc(p.name)}</b><span class="cell-meta">Registered patient</span></span></div></td>
    <td>${esc(p.mobile)}</td><td>${esc(p.age)} / ${esc(p.gender)}</td><td>${esc(p.blood||"—")}</td><td>${esc(p.city||"—")}</td>
    <td><button class="action edit-patient" data-id="${esc(p.id)}">Edit</button><button class="action danger delete-patient" data-id="${esc(p.id)}">Delete</button></td>
  </tr>`).join("")}</tbody></table>`;
}

function renderPatients(){
  const q = $("patientSearch").value.trim().toLowerCase();
  const list = db.patients.filter(p=>[p.id,p.name,p.mobile,p.city,p.address].join(" ").toLowerCase().includes(q));
  $("patientsTable").innerHTML = patientRows(list);
  $("patientCount").textContent = `${list.length} records`;
}

function renderTokens(){
  const q = $("tokenSearch").value.trim().toLowerCase();
  const f = $("tokenFilter").value;
  const list = db.tokens.filter(x=>{
    const matches = [x.id,x.patientName,x.doctor,x.department].join(" ").toLowerCase().includes(q);
    return matches && (!f || x.status===f);
  });

  $("tokensTable").innerHTML = list.length ? `<table class="table"><thead><tr><th>Token</th><th>Patient</th><th>Department</th><th>Doctor</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
  <tbody>${[...list].reverse().map(x=>`<tr>
    <td><b>${x.id}</b><br><small>${fmt(x.createdAt)}</small></td>
    <td>${esc(x.patientName)}</td><td>${esc(x.department)}</td><td>${esc(x.doctor)}</td>
    <td><span class="badge ${x.priority==="Urgent"?"urgent":""}">${x.priority}</span></td>
    <td><span class="badge ${badgeClass(x.status)}">${x.status}</span></td>
    <td>
      ${x.status==="Waiting"?`<button class="action token-status" data-id="${x.id}" data-status="In Consultation">Start</button>`:""}
      ${x.status==="In Consultation"?`<button class="action token-status" data-id="${x.id}" data-status="Completed">Complete</button>`:""}
      <button class="action danger delete-token" data-id="${x.id}">Delete</button>
    </td>
  </tr>`).join("")}</tbody></table>` : `<div class="empty">No OPD tokens found.</div>`;

  const t = todayKey();
  $("opdWaiting").textContent = db.tokens.filter(x=>x.status==="Waiting" && fromDay(x.createdAt)).length;
  $("opdConsulting").textContent = db.tokens.filter(x=>x.status==="In Consultation" && fromDay(x.createdAt)).length;
  $("opdCompleted").textContent = db.tokens.filter(x=>x.status==="Completed" && fromDay(x.createdAt)).length;
  $("opdToday").textContent = db.tokens.filter(x=>todayKey(x.createdAt)===t).length;
}

function renderLabs(){
  const q = $("labSearch").value.trim().toLowerCase();
  const f = $("labFilter").value;
  const list = db.labs.filter(x=>{
    const matches = [x.id,x.patientName,x.test,x.doctor].join(" ").toLowerCase().includes(q);
    return matches && (!f || x.status===f);
  });

  $("labsTable").innerHTML = list.length ? `<table class="table"><thead><tr><th>Order</th><th>Patient</th><th>Test</th><th>Doctor</th><th>Charge</th><th>Status</th><th>Actions</th></tr></thead>
  <tbody>${[...list].reverse().map(x=>`<tr>
    <td><b>${x.id}</b><br><small>${fmt(x.createdAt)}</small></td>
    <td>${esc(x.patientName)}</td><td>${esc(x.test)}</td><td>${esc(x.doctor)}</td><td>${money(x.charge)}</td>
    <td><span class="badge ${badgeClass(x.status)}">${x.status}</span></td>
    <td>
      ${x.status==="Requested"?`<button class="action lab-collect" data-id="${x.id}">Collect Sample</button>`:""}
      ${x.status==="Sample Collected"?`<button class="action lab-result" data-id="${x.id}">Enter Result</button>`:""}
      ${x.status==="Completed"?`<button class="action lab-view-result" data-id="${x.id}">View Result</button>`:""}
      <button class="action danger delete-lab" data-id="${x.id}">Delete</button>
    </td>
  </tr>`).join("")}</tbody></table>` : `<div class="empty">No lab requests found.</div>`;

  $("labRequested").textContent = db.labs.filter(x=>x.status==="Requested").length;
  $("labCollected").textContent = db.labs.filter(x=>x.status==="Sample Collected").length;
  $("labCompleted").textContent = db.labs.filter(x=>x.status==="Completed").length;
  $("labTotal").textContent = db.labs.length;
}

function renderBills(){
  const q = $("billSearch").value.trim().toLowerCase();
  const f = $("billFilter").value;
  const list = db.bills.filter(x=>{
    const matches = [x.id,x.patientName,x.mobile].join(" ").toLowerCase().includes(q);
    return matches && (!f || x.status===f);
  });

  $("billsTable").innerHTML = list.length ? `<table class="table"><thead><tr><th>Bill</th><th>Patient</th><th>Consultation</th><th>Lab</th><th>Other</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
  <tbody>${[...list].reverse().map(x=>`<tr>
    <td><b>${x.id}</b><br><small>${fmt(x.createdAt)}</small></td>
    <td>${esc(x.patientName)}<br><small>${esc(x.mobile)}</small></td>
    <td>${money(x.consultation)}</td><td>${money(x.lab)}</td><td>${money(x.other)}</td><td><b>${money(x.total)}</b></td>
    <td><span class="badge ${badgeClass(x.status)}">${x.status}</span></td>
    <td>
      ${x.status==="Pending"?`<button class="action bill-paid" data-id="${x.id}">Mark Paid</button>`:""}
      <button class="action bill-print" data-id="${x.id}">Receipt</button>
      <button class="action danger delete-bill" data-id="${x.id}">Delete</button>
    </td>
  </tr>`).join("")}</tbody></table>` : `<div class="empty">No bills found.</div>`;

  const paid = db.bills.filter(x=>x.status==="Paid").reduce((s,x)=>s+Number(x.total),0);
  const pending = db.bills.filter(x=>x.status==="Pending").reduce((s,x)=>s+Number(x.total),0);
  $("billCount").textContent = db.bills.length;
  $("billPaid").textContent = money(paid);
  $("billPending").textContent = money(pending);
  $("billRevenue").textContent = money(paid);
}

function renderReports(){
  const paid = db.bills.filter(x=>x.status==="Paid").reduce((s,x)=>s+Number(x.total),0);
  $("reportPatients").textContent = db.patients.length;
  $("reportTokens").textContent = db.tokens.length;
  $("reportLabs").textContent = db.labs.length;
  $("reportRevenue").textContent = money(paid);

  const counts = {};
  db.tokens.forEach(x=>counts[x.department]=(counts[x.department]||0)+1);
  const max = Math.max(1,...Object.values(counts));
  $("departmentReport").innerHTML = Object.keys(counts).length ? Object.entries(counts).map(([d,c])=>`
    <div class="bar-row"><span>${esc(d)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/max*100)}%"></div></div><b>${c}</b></div>`).join("") : `<div class="empty">No department data.</div>`;

  const snapshots = [
    ["Waiting OPD",db.tokens.filter(x=>x.status==="Waiting").length],
    ["In Consultation",db.tokens.filter(x=>x.status==="In Consultation").length],
    ["Pending Lab",db.labs.filter(x=>x.status!=="Completed").length],
    ["Completed Lab",db.labs.filter(x=>x.status==="Completed").length],
    ["Pending Bills",db.bills.filter(x=>x.status==="Pending").length]
  ];
  $("snapshotReport").innerHTML = snapshots.map(x=>`<div class="snapshot"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join("");

  const t=todayKey();
  const todayEvents = [
    ...db.patients.filter(x=>todayKey(x.createdAt)===t).map(x=>({time:x.createdAt,type:"Patient",detail:`${x.name} registered`})),
    ...db.tokens.filter(x=>todayKey(x.createdAt)===t).map(x=>({time:x.createdAt,type:"OPD",detail:`${x.id} - ${x.patientName}`})),
    ...db.labs.filter(x=>todayKey(x.createdAt)===t).map(x=>({time:x.createdAt,type:"Lab",detail:`${x.id} - ${x.test}`})),
    ...db.bills.filter(x=>todayKey(x.createdAt)===t).map(x=>({time:x.createdAt,type:"Billing",detail:`${x.id} - ${x.patientName} - ${money(x.total)}`}))
  ].sort((a,b)=>new Date(b.time)-new Date(a.time));

  $("todayReport").innerHTML = todayEvents.length ? `<table class="table"><thead><tr><th>Time</th><th>Type</th><th>Activity</th></tr></thead><tbody>${todayEvents.map(x=>`<tr><td>${fmt(x.time)}</td><td>${x.type}</td><td>${esc(x.detail)}</td></tr>`).join("")}</tbody></table>` : `<div class="empty">No activity today.</div>`;
}

function renderAll(){
  populatePatients();
  renderDashboard();
  renderPatients();
  renderTokens();
  renderLabs();
  renderBills();
  renderReports();
}

function printReceipt(id){
  const b = db.bills.find(x=>x.id===id);
  if(!b) return;
  const w = window.open("","_blank","width=650,height=700");
  if(!w){toast("Allow pop-ups to print receipts");return;}
  w.document.write(`<!DOCTYPE html><html><head><title>${b.id}</title><style>body{font-family:Arial;padding:35px;color:#222}.box{border:1px solid #ccc;padding:25px;border-radius:12px}h1{margin-top:0}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}.total{font-size:20px;font-weight:bold}.muted{color:#666}</style></head><body>
  <div class="box"><h1>Smart Hospital</h1><p class="muted">OPD & Lab Management System</p><hr>
  <p><b>Receipt:</b> ${b.id}</p><p><b>Patient:</b> ${esc(b.patientName)}</p><p><b>Mobile:</b> ${esc(b.mobile)}</p><p><b>Date:</b> ${fmt(b.createdAt)}</p>
  <div class="row"><span>Consultation</span><span>${money(b.consultation)}</span></div>
  <div class="row"><span>Lab Charges</span><span>${money(b.lab)}</span></div>
  <div class="row"><span>Other Charges</span><span>${money(b.other)}</span></div>
  <div class="row total"><span>Total</span><span>${money(b.total)}</span></div>
  <p><b>Status:</b> ${esc(b.status)}</p><p class="muted">Smart Hospital · Demonstration receipt only · Not a valid medical invoice</p>
  </div><script>window.print()<\/script></body></html>`);
  w.document.close();
}

function loginInit(){
  const session = sessionStorage.getItem(SESSION_KEY);
  if(session){
    let role="Administrator"; try { role=JSON.parse(session).role || role; } catch(e) { sessionStorage.removeItem(SESSION_KEY); return; }
    $("loginScreen").classList.add("hidden");
    $("app").classList.remove("hidden");
    setUser(role);
    renderAll();
  }
}

$("loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  const u=$("loginUsername").value.trim(), p=$("loginPassword").value.trim(), role=$("loginRole").value;
  if(u==="admin" && p==="admin123"){
    sessionStorage.setItem(SESSION_KEY,JSON.stringify({role}));
    $("loginScreen").classList.add("hidden");
    $("app").classList.remove("hidden");
    setUser(role);
    $("loginError").textContent="";
    renderAll();
  } else {
    $("loginError").textContent="Invalid login. Use admin / admin123.";
  }
});

$("logoutBtn").addEventListener("click",()=>{
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
});

all(".nav-btn").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
all(".quick").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
all("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
all(".modal-wrap").forEach(m=>m.addEventListener("click",e=>{ if(e.target===m) closeModal(m.id); }));

$("addPatientBtn").addEventListener("click",()=>{
  $("patientForm").reset(); $("patientEditId").value=""; $("patientModalTitle").textContent="Add Patient"; $("patientMsg").textContent=""; openModal("patientModal");
});

$("patientForm").addEventListener("submit",e=>{
  e.preventDefault();
  const mobile=$("patientMobile").value.trim();
  if(!/^[0-9]{10}$/.test(mobile)){ $("patientMsg").textContent="Mobile number must be exactly 10 digits."; return; }
  const editId=$("patientEditId").value;
  const duplicate = db.patients.some(p=>p.mobile===mobile && p.id!==editId);
  if(duplicate){ $("patientMsg").textContent="A patient with this mobile number already exists."; return; }
  const obj={
    name:$("patientName").value.trim(),mobile,age:Number($("patientAge").value),gender:$("patientGender").value,
    blood:$("patientBlood").value,city:$("patientCity").value.trim(),address:$("patientAddress").value.trim()
  };
  if(!obj.name || obj.name.length < 2){ $("patientMsg").textContent="Enter a valid patient name."; return; }
  if(editId){
    const p=db.patients.find(x=>x.id===editId); if(!p) return;
    Object.assign(p,obj);
    [db.tokens,db.labs,db.bills].forEach(arr=>arr.forEach(r=>{if(r.patientId===editId){r.patientName=obj.name;if("mobile" in r)r.mobile=obj.mobile;}}));
    toast("Patient updated");
  }else{
    db.patients.push({id:nextId("P",db.patients,4),...obj,createdAt:nowISO()}); toast("Patient registered");
  }
  closeModal("patientModal"); save();
});

$("addTokenBtn").addEventListener("click",()=>{
  if(!db.patients.length){ alert("Please register a patient first."); return; }
  $("tokenForm").reset(); $("tokenDoctor").innerHTML=`<option value="">Select department first</option>`; openModal("tokenModal");
});
$("tokenDepartment").addEventListener("change",()=>{
  const arr=doctors[$("tokenDepartment").value]||[];
  $("tokenDoctor").innerHTML=arr.length?arr.map(x=>`<option>${x}</option>`).join(""):`<option value="">No doctor</option>`;
});
$("tokenForm").addEventListener("submit",e=>{
  e.preventDefault();
  const p=db.patients.find(x=>x.id===$("tokenPatient").value);
  if(!p)return;
  db.tokens.push({
    id:nextId("T",db.tokens,3),patientId:p.id,patientName:p.name,department:$("tokenDepartment").value,
    doctor:$("tokenDoctor").value,visitType:$("tokenVisitType").value,priority:$("tokenPriority").value,status:"Waiting",createdAt:nowISO()
  });
  closeModal("tokenModal"); save(); toast("OPD token generated");
});

$("addLabBtn").addEventListener("click",()=>{
  if(!db.patients.length){ alert("Please register a patient first."); return; }
  $("labForm").reset(); openModal("labModal");
});
$("labForm").addEventListener("submit",e=>{
  e.preventDefault();
  const p=db.patients.find(x=>x.id===$("labPatient").value);
  const [test,charge]=$("labTest").value.split("|");
  if(!p||!test)return;
  db.labs.push({
    id:nextId("L",db.labs,4),patientId:p.id,patientName:p.name,test,charge:Number(charge),
    doctor:$("labDoctor").value,notes:$("labNotes").value.trim(),status:"Requested",result:"",createdAt:nowISO()
  });
  closeModal("labModal"); save(); toast("Lab request created");
});

$("resultForm").addEventListener("submit",e=>{
  e.preventDefault();
  const x=db.labs.find(v=>v.id===$("resultOrderId").value);
  if(!x)return;
  x.result=$("resultValue").value.trim(); x.status="Completed"; x.completedAt=nowISO();
  closeModal("resultModal"); save(); toast("Lab result saved");
});

function billPreview(){
  $("billTotalPreview").textContent=money(Number($("consultationFee").value||0)+Number($("labFee").value||0)+Number($("otherFee").value||0));
}
["consultationFee","labFee","otherFee"].forEach(id=>$(id).addEventListener("input",billPreview));

$("addBillBtn").addEventListener("click",()=>{
  if(!db.patients.length){ alert("Please register a patient first."); return; }
  $("billForm").reset(); $("consultationFee").value=500; $("labFee").value=0; $("otherFee").value=0; $("billStatus").value="Paid"; billPreview(); openModal("billModal");
});
$("billPatient").addEventListener("change",()=>{
  const pid=$("billPatient").value;
  const charge=db.labs.filter(x=>x.patientId===pid).reduce((s,x)=>s+Number(x.charge),0);
  $("labFee").value=charge; billPreview();
});
$("billForm").addEventListener("submit",e=>{
  e.preventDefault();
  const p=db.patients.find(x=>x.id===$("billPatient").value);
  if(!p)return;
  const consultation=Number($("consultationFee").value||0), lab=Number($("labFee").value||0), other=Number($("otherFee").value||0);
  if([consultation,lab,other].some(n=>!Number.isFinite(n)||n<0)||consultation+lab+other<=0){toast("Enter a positive invoice total");return;}
  db.bills.push({
    id:nextId("B",db.bills,4),patientId:p.id,patientName:p.name,mobile:p.mobile,consultation,lab,other,total:consultation+lab+other,status:$("billStatus").value,createdAt:nowISO()
  });
  closeModal("billModal"); save(); toast("Bill created");
});

$("patientSearch").addEventListener("input",renderPatients);
$("tokenSearch").addEventListener("input",renderTokens);
$("tokenFilter").addEventListener("change",renderTokens);
$("labSearch").addEventListener("input",renderLabs);
$("labFilter").addEventListener("change",renderLabs);
$("billSearch").addEventListener("input",renderBills);
$("billFilter").addEventListener("change",renderBills);

document.addEventListener("click",e=>{
  const id=e.target.dataset.id;
  if(e.target.classList.contains("edit-patient")){
    const p=db.patients.find(x=>x.id===id); if(!p)return;
    $("patientEditId").value=p.id; $("patientName").value=p.name; $("patientMobile").value=p.mobile; $("patientAge").value=p.age;
    $("patientGender").value=p.gender; $("patientBlood").value=p.blood||""; $("patientCity").value=p.city||""; $("patientAddress").value=p.address||"";
    $("patientModalTitle").textContent="Edit Patient"; $("patientMsg").textContent=""; openModal("patientModal");
  }
  if(e.target.classList.contains("delete-patient")){
    if(confirm("Delete this patient?")){
      const hasLinked=[...db.tokens,...db.labs,...db.bills].some(x=>x.patientId===id);
      if(hasLinked){toast("Cannot delete a patient with existing visits, labs or invoices");return;}
      db.patients=db.patients.filter(x=>x.id!==id); save(); toast("Patient deleted");
    }
  }
  if(e.target.classList.contains("token-status")){
    const x=db.tokens.find(v=>v.id===id); if(x){x.status=e.target.dataset.status; save(); toast("OPD status updated");}
  }
  if(e.target.classList.contains("delete-token")){
    if(confirm("Delete this token?")){db.tokens=db.tokens.filter(x=>x.id!==id);save();toast("Token deleted");}
  }
  if(e.target.classList.contains("lab-collect")){
    const x=db.labs.find(v=>v.id===id); if(x){x.status="Sample Collected";x.sampleCollectedAt=nowISO();save();toast("Sample marked as collected");}
  }
  if(e.target.classList.contains("lab-result")){
    const x=db.labs.find(v=>v.id===id); if(!x)return;
    $("resultOrderId").value=x.id; $("resultTextInfo").textContent=`${x.patientName} • ${x.test}`; $("resultValue").value=x.result||""; openModal("resultModal");
  }
  if(e.target.classList.contains("lab-view-result")){
    const x=db.labs.find(v=>v.id===id); if(x) alert(`${x.test}\nPatient: ${x.patientName}\nResult: ${x.result||"No result entered"}`);
  }
  if(e.target.classList.contains("delete-lab")){
    if(confirm("Delete this lab order?")){db.labs=db.labs.filter(x=>x.id!==id);save();toast("Lab order deleted");}
  }
  if(e.target.classList.contains("bill-paid")){
    const x=db.bills.find(v=>v.id===id); if(x){x.status="Paid";save();toast("Bill marked as paid");}
  }
  if(e.target.classList.contains("bill-print")) printReceipt(id);
  if(e.target.classList.contains("delete-bill")){
    if(confirm("Delete this bill?")){db.bills=db.bills.filter(x=>x.id!==id);save();toast("Bill deleted");}
  }
});

// Product shell interactions: navigation, global lookup, export and reset.
$("menuToggle").addEventListener("click",()=>{
  $("sidebar").classList.add("open"); $("sidebarBackdrop").classList.remove("hidden");
});
$("sidebarBackdrop").addEventListener("click",closeSidebar);
$("notificationBtn").addEventListener("click",()=>{showPage("lab");$("labFilter").value="";renderLabs();});
$("globalSearch").addEventListener("keydown",e=>{
  if(e.key!=="Enter")return;
  e.preventDefault();$("patientSearch").value=e.target.value;showPage("patients");renderPatients();
});
$("globalSearch").addEventListener("focus",()=>{$("globalSearch").parentElement.classList.add("search-open");});
$("globalSearch").addEventListener("blur",()=>{$("globalSearch").parentElement.classList.remove("search-open");});
$("printReportBtn").addEventListener("click",()=>window.print());
$("exportCsvBtn").addEventListener("click",()=>{
  const rows=[["Type","Record ID","Patient","Status","Department / Test","Amount (INR)","Recorded at"]];
  db.patients.forEach(x=>rows.push(["Patient",x.id,x.name,"Registered","", "",x.createdAt]));
  db.tokens.forEach(x=>rows.push(["OPD",x.id,x.patientName,x.status,x.department,"",x.createdAt]));
  db.labs.forEach(x=>rows.push(["Lab",x.id,x.patientName,x.status,x.test,x.charge,x.createdAt]));
  db.bills.forEach(x=>rows.push(["Billing",x.id,x.patientName,x.status,"Invoice",x.total,x.createdAt]));
  downloadFile(`smart-hospital-report-${todayKey()}.csv`,"\ufeff"+rows.map(r=>r.map(csvEsc).join(",")).join("\r\n"),"text/csv;charset=utf-8");
  toast("Report CSV downloaded");
});
$("backupJsonBtn").addEventListener("click",()=>{
  downloadFile(`smart-hospital-demo-backup-${todayKey()}.json`,JSON.stringify(db,null,2),"application/json");
  toast("Demo backup downloaded");
});
$("resetDemoBtn").addEventListener("click",()=>{
  if(!confirm("Reset all local demo records? Existing changes will be lost. You can download a backup JSON first."))return;
  localStorage.removeItem(STORAGE_KEY);db=seed();renderAll();toast("Sample demonstration data restored");
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    const open=document.querySelector(".modal-wrap:not(.hidden)");if(open)closeModal(open.id);
    closeSidebar();
  }
});
const fullDate=new Date();
$("dashboardDate").textContent=fullDate.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
$("dateText").textContent=fullDate.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
loginInit();
renderAll();
