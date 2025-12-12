/* OSIX Typing Tutor — Shared script (localStorage mode)
   Files using this script: index.html, home.html, choose.html, profile.html
   Keys: osix_users_v3, osix_current_v3
*/
const LS_USERS = 'osix_users_v3';
const LS_CUR = 'osix_current_v3';

/* ---------- localStorage helpers ---------- */
function readUsers(){ try{ return JSON.parse(localStorage.getItem(LS_USERS))||[] }catch(e){return[]}}
function writeUsers(u){ localStorage.setItem(LS_USERS, JSON.stringify(u))}
function setCurrent(uid){ localStorage.setItem(LS_CUR, uid)}
function getCurrent(){ return localStorage.getItem(LS_CUR)}

/* ---------- Simple Auth (index.html) ---------- */
function signupLocal(name,mobile,email,pass){
  const users = readUsers();
  if(users.find(u=>u.mobile===mobile)) return {ok:false,msg:'Mobile already registered'};
  const id = 'u'+Date.now();
  const user = { id, name, mobile, email, pass, district:'', state:'', joined:new Date().toISOString(), avatar:'', results:[] };
  users.push(user); writeUsers(users); setCurrent(id);
  return {ok:true,user};
}
function loginLocal(mobile,pass){
  const users = readUsers();
  const u = users.find(x=>x.mobile===mobile && x.pass===pass);
  return u? {ok:true,u}:{ok:false,msg:'Invalid credentials'};
}
function resetPasswordLocal(mobile,newPass){
  const users = readUsers();
  const u = users.find(x=>x.mobile===mobile);
  if(!u) return {ok:false,msg:'User not found'};
  u.pass = newPass; writeUsers(users); return {ok:true};
}

/* ---------- On index.html: bind UI ---------- */
function bindIndex(){
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');

  if(loginBtn){
    loginBtn.addEventListener('click', ()=>{
      const m = document.getElementById('loginMobile').value.trim();
      const p = document.getElementById('loginPass').value;
      if(!m||!p){ alert('Enter mobile & password'); return; }
      const res = loginLocal(m,p);
      if(!res.ok){ alert(res.msg); return; }
      // set current and redirect to home
      setCurrent(res.u.id);
      location.href = 'home.html';
    });
  }
  if(signupBtn){
    signupBtn.addEventListener('click', ()=>{
      const n = document.getElementById('suName').value.trim();
      const m = document.getElementById('suMobile').value.trim();
      const e = document.getElementById('suEmail').value.trim();
      const p = document.getElementById('suPass').value;
      if(!n||!m||!p){ alert('Fill required'); return; }
      const r = signupLocal(n,m,e,p);
      if(!r.ok){ alert(r.msg); return; }
      alert('Account created');
      location.href = 'home.html';
    });
  }
  // forgot password demo flow
  const fpSend = document.getElementById('fpSend');
  if(fpSend){
    fpSend.addEventListener('click', ()=>{
      const m = document.getElementById('fpMobile').value.trim();
      if(!m){ alert('Enter mobile'); return; }
      const users = readUsers(); const u = users.find(x=>x.mobile===m);
      if(!u){ alert('No such mobile'); return; }
      // demo OTP: 1234
      document.getElementById('fpOtpWrap').classList.remove('hidden');
      alert('Demo OTP sent: 1234 (production: integrate Firebase)');
      document.getElementById('fpResetBtn').addEventListener('click', ()=>{
        const otp = document.getElementById('fpOtp').value.trim();
        if(otp !== '1234'){ alert('Wrong OTP'); return; }
        const np = document.getElementById('fpNewPass').value;
        if(!np){ alert('Enter new password'); return; }
        resetPasswordLocal(m,np);
        alert('Password reset. Login now.');
        document.getElementById('fpOtpWrap').classList.add('hidden');
        document.getElementById('forgotForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
      }, {once:true});
    });
  }
}

/* ---------- Home & navigation (home.html) ---------- */
function bindHome(){
  // setup sidebar clicks
  document.querySelectorAll('.side-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
      if(b.dataset.page==='logout'){ doLogout(); return; }
      document.querySelectorAll('.side-btn').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      navigateTo(b.dataset.page);
    });
  });
  // profile clicks
  document.getElementById('topAvatar')?.addEventListener('click', ()=> location.href='profile.html');
  document.getElementById('sideAvatar')?.addEventListener('click', ()=> location.href='profile.html');

  // load user
  const cur = getCurrent();
  if(!cur){ location.href='index.html'; return; }
  const u = readUsers().find(x=>x.id===cur);
  if(!u){ location.href='index.html'; return; }
  // render header avatars & name
  document.getElementById('sideAvatar').querySelector('img').src = u.avatar || (`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7c3aed&color=fff`);
  document.getElementById('topAvatar').src = u.avatar || (`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7c3aed&color=fff`);
  document.getElementById('sideName').innerText = u.name;
  document.getElementById('topUserName').innerText = u.name;
  // small brand logo
  document.getElementById('brandLogoSmall').src = ''; // leave blank or set path if you upload
  // load tests and UI
  renderTestsList();
  renderMyResults();
  renderLeaderBoard();
}

/* navigate pages inside app (home.html contains elements for multiple subpages) */
function navigateTo(page){
  // in home.html we may have sections (home, choose, leader, results, learn)
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  const el = document.getElementById('page'+capitalize(page));
  if(el) el.classList.remove('hidden');
}
function capitalize(s){ if(!s) return ''; return s.charAt(0).toUpperCase()+s.slice(1); }

/* logout */
function doLogout(){ localStorage.removeItem(LS_CUR); location.href='index.html'; }

/* ---------- Profile (profile.html) ---------- */
function bindProfile(){
  const cur = getCurrent();
  if(!cur){ location.href='index.html'; return; }
  const users = readUsers();
  const u = users.find(x=>x.id===cur);
  if(!u) { location.href='index.html'; return; }

  // fill fields
  document.getElementById('profileBig').src = u.avatar || (`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=7c3aed&color=fff`);
  document.getElementById('pfName').value = u.name || '';
  document.getElementById('pfMobile').value = u.mobile || '';
  document.getElementById('pfEmail').value = u.email || '';
  document.getElementById('pfDistrict').value = u.district || '';
  document.getElementById('pfState').value = u.state || '';
  // avatar upload
  document.getElementById('choosePicBtn').addEventListener('click', ()=> document.getElementById('filePic').click());
  document.getElementById('filePic').addEventListener('change', (ev)=> {
    const f = ev.target.files[0];
    if(!f) return;
    const r = new FileReader(); r.onload = e=> {
      document.getElementById('profileBig').src = e.target.result;
      u.avatar = e.target.result; writeUsers(users); alert('Profile photo updated');
    }; r.readAsDataURL(f);
  });
  document.getElementById('editDetails').addEventListener('click', ()=> toggleProfile(true));
  document.getElementById('saveDetails').addEventListener('click', ()=> {
    u.name = document.getElementById('pfName').value.trim();
    u.mobile = document.getElementById('pfMobile').value.trim();
    u.email = document.getElementById('pfEmail').value.trim();
    u.district = document.getElementById('pfDistrict').value.trim();
    u.state = document.getElementById('pfState').value.trim();
    writeUsers(users);
    alert('Saved'); toggleProfile(false); location.href='home.html';
  });
}
function toggleProfile(on){
  ['pfName','pfMobile','pfEmail','pfDistrict','pfState'].forEach(id=>{
    document.getElementById(id).disabled = !on;
  });
}

/* ---------- Tests (shared) ---------- */
/* generate 50 tests (placeholder passages ~200 words each) */
const TESTS = (function(){
  const topics = ['CGL - Governance','CHSL - Basic Maths','Delhi Police - Comprehension','Bank PO - Economy','RRB - Technical','TGT History','UPSSSC - GK','Current Affairs','Science & Tech','Environment'];
  const arr=[];
  for(let i=1;i<=50;i++){
    const topic = topics[i % topics.length];
    const sample = (`Test ${i} — ${topic}. ` + "This is a sample paragraph intended for typing practice. ".repeat(20)).slice(0,1200);
    arr.push({ id:'t'+i, title:`Test ${i} — ${topic}`, passage: sample, words: 200, difficulty: (i%3===0?'high': (i%3===1?'medium':'low'))});
  }
  return arr;
})();

function renderTestsList(){
  const container = document.getElementById('testsList');
  if(!container) return;
  container.innerHTML = '';
  TESTS.forEach(t=>{
    const d = document.createElement('div'); d.className='test-card';
    d.innerHTML = `<strong>${t.title}</strong><p class="small">${t.passage.slice(0,120)}...</p><div style="margin-top:8px"><button class="btn" onclick="beginTestById('${t.id}')">Start</button></div>`;
    container.appendChild(d);
  });
}
window.beginTestById = function(id){
  // find test and open choose.html with passage preloaded
  const t = TESTS.find(x=>x.id===id);
  if(!t) return alert('Test not found');
  // store preloaded test and redirect
  localStorage.setItem('osix_preload', JSON.stringify({passage:t.passage, title:t.title}));
  location.href = 'choose.html';
};

/* choose.html bindings */
function bindChoose(){
  // load preloaded if exists
  const pre = JSON.parse(localStorage.getItem('osix_preload')||'null');
  if(pre){
    document.getElementById('passagePreview').innerText = pre.passage.slice(0,400);
    document.getElementById('chooseTitle').innerText = pre.title;
  } else {
    // random preview
    const t = TESTS[Math.floor(Math.random()*TESTS.length)];
    document.getElementById('passagePreview').innerText = t.passage.slice(0,400);
    document.getElementById('chooseTitle').innerText = t.title;
  }
  document.getElementById('startChosen').addEventListener('click', ()=> {
    const time = parseInt(document.getElementById('chooseTime').value,10) || 60;
    const passage = (pre && pre.passage) || TESTS[Math.floor(Math.random()*TESTS.length)].passage;
    beginTest(passage, time);
  });
}

/* ---------- Test runner core (used by choose & test) ---------- */
let runner = { original:'', typed:'', timeLeft:0, interval:null, startTs:0 };

function beginTest(passage, seconds){
  // store runner in sessionStorage and open choose.html as test view
  sessionStorage.setItem('osix_runner', JSON.stringify({passage, seconds}));
  // if on choose.html we swap to test view; else redirect to choose.html
  if(location.pathname.endsWith('choose.html')){
    openTestView();
  } else {
    location.href = 'choose.html';
    setTimeout(()=> openTestView(), 200);
  }
}
function openTestView(){
  const r = JSON.parse(sessionStorage.getItem('osix_runner')||'null');
  if(!r) return;
  runner.original = r.passage;
  runner.timeLeft = r.seconds;
  runner.typed = '';
  runner.startTs = Date.now();
  document.getElementById('testPass').innerHTML = renderPassageHtml(runner.original,'');
  document.getElementById('testInput').value = '';
  document.getElementById('tLeft').innerText = runner.timeLeft;
  document.getElementById('tWpm').innerText = 0;
  document.getElementById('tAcc').innerText = 0;
  // start timer
  if(runner.interval) clearInterval(runner.interval);
  runner.interval = setInterval(()=> {
    runner.timeLeft--;
    document.getElementById('tLeft').innerText = runner.timeLeft;
    computeLiveRunner();
    if(runner.timeLeft<=0){ finishTestRunner(); }
  },1000);
  // ensure test page visible
  document.getElementById('testInput').focus();
}

function renderPassageHtml(text, typed){
  const out=[];
  for(let i=0;i<text.length;i++){
    const ch = text[i] === ' ' ? '\u00A0' : text[i];
    const cls = (typed[i]==null)?'': (typed[i]===text[i]? 'correct':'wrong');
    out.push(`<span class="${cls}">${escapeHtml(ch)}</span>`);
  }
  return out.join('');
}
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function onTypingInput(){
  const val = document.getElementById('testInput').value;
  runner.typed = val;
  document.getElementById('testPass').innerHTML = renderPassageHtml(runner.original, val);
  computeLiveRunner();
}
window.onTyping = onTypingInput;

function computeLiveRunner(){
  const typed = runner.typed||'';
  let correct=0;
  for(let i=0;i<typed.length;i++) if(typed[i]===runner.original[i]) correct++;
  const total = typed.length;
  const accuracy = total? Math.round((correct/total)*10000)/100 : 0;
  const elapsed = Math.max(1, Math.floor((Date.now()-runner.startTs)/1000));
  const mins = Math.max(elapsed/60, 1/60);
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm = Math.round(words/mins);
  document.getElementById('tWpm').innerText = isFinite(wpm)?wpm:0;
  document.getElementById('tAcc').innerText = accuracy;
}

function finishTestRunner(){
  if(runner.interval) clearInterval(runner.interval);
  const typed = runner.typed||'';
  let correct=0;
  for(let i=0;i<typed.length;i++) if(typed[i]===runner.original[i]) correct++;
  const total = typed.length;
  const accuracy = total? Math.round((correct/total)*10000)/100 : 0;
  const elapsed = Math.max(1, Math.floor((Date.now()-runner.startTs)/1000));
  const mins = Math.max(elapsed/60, 1/60);
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm = Math.round(words/mins);

  // save into user
  const uid = getCurrent();
  if(uid){
    const users = readUsers(); const u = users.find(x=>x.id===uid);
    if(u){
      const rec = { id:'r'+Date.now(), wpm, accuracy, elapsed, date:new Date().toISOString(), passage: runner.original.slice(0,300) };
      u.results = u.results||[]; u.results.unshift(rec); writeUsers(users);
      alert(`Test saved — WPM: ${wpm} • Acc: ${accuracy}%`);
    }
  } else {
    alert(`Test ended — WPM: ${wpm} • Acc: ${accuracy}% (Login to save)`);
  }
  // cleanup
  sessionStorage.removeItem('osix_runner');
  // navigate to home or results
  location.href = 'home.html';
}

/* ---------- Results & Leaderboard ---------- */
function renderMyResults(){
  const container = document.getElementById('myResultsList');
  if(!container) return;
  container.innerHTML = '';
  const uid = getCurrent();
  if(!uid) { container.innerHTML = '<p class="small">Login to see results</p>'; return; }
  const users = readUsers(); const u = users.find(x=>x.id===uid);
  if(!u || !u.results || u.results.length===0){ container.innerHTML = '<p class="small">No attempts yet</p>'; return; }
  u.results.forEach(r=>{
    const d = document.createElement('div'); d.className='test-card';
    d.innerHTML = `<strong>${r.wpm} WPM</strong><div class="small">${r.accuracy}% • ${(new Date(r.date)).toLocaleString()}</div><div class="small muted">${r.passage.slice(0,120)}...</div>`;
    container.appendChild(d);
  });
}
function renderLeaderBoard(){
  const container = document.getElementById('leaderboardList');
  if(!container) return;
  container.innerHTML = '';
  const users = readUsers(); let all = [];
  users.forEach(u=> (u.results||[]).forEach(r=> all.push({user:u.name||u.mobile,wpm:r.wpm,acc:r.accuracy,date:r.date})));
  all.sort((a,b)=>b.wpm - a.wpm);
  if(all.length===0){ container.innerHTML = '<p class="small">No results yet</p>'; return; }
  all.slice(0,50).forEach(r=>{
    const el = document.createElement('div'); el.className='test-card';
    el.innerHTML = `<strong>${r.user}</strong><div class="small muted">${r.wpm} WPM • ${r.acc}%</div><div class="small">${(new Date(r.date)).toLocaleDateString()}</div>`;
    container.appendChild(el);
  });
}

/* ---------- init helpers to call from pages ---------- */
function initIndexPage(){ bindIndex(); }
function initHomePage(){ bindHome(); }
function initChoosePage(){ bindHome(); bindChoose(); openTestViewIfPresent(); }
function initProfilePage(){ bindProfile(); }

/* If choose page loaded and session contains runner, open test view */
function openTestViewIfPresent(){
  const runnerS = sessionStorage.getItem('osix_runner');
  if(runnerS) openTestView();
}
