/* Simple localStorage-based user & typing system
   - Users saved under key: 'osix_users' (array of user objects)
   - Current user id saved under: 'osix_current'
   - Results saved inside each user.results (array)
*/
const LS_USERS = 'osix_users_v1';
const LS_CUR = 'osix_current_v1';

// sample passages (you can add many more or load from JSON)
const PASSAGES = {
  english:{
    low:[
      "Practice daily to improve your typing speed and accuracy.",
      "The quick brown fox jumps over the lazy dog."
    ],
    medium:[
      "Time management and regular practice help students achieve better performance in competitive exams.",
      "A balanced study plan with short daily tests increases retention and confidence."
    ],
    high:[
      "Macroeconomic indicators such as inflation and fiscal deficit influence central bank policy decisions.",
      "Advances in machine learning enable large-scale pattern recognition in unstructured datasets."
    ]
  },
  hindi:{
    low:[
      "रोज़ाना अभ्यास करने से टाइपिंग तेज होती है।",
      "अच्छी टाइपिंग हर छात्र के लिए जरूरी है।"
    ],
    medium:[
      "समय प्रबंधन और नियमित अभ्यास से परीक्षार्थियों का प्रदर्शन बेहतर होता है।",
      "नियमित छोटे परीक्षण याददाश्त बढ़ाने में मदद करते हैं।"
    ],
    high:[
      "मुद्रास्फीति और वित्तीय नीतियाँ अर्थव्यवस्था पर गंभीर प्रभाव डालती हैं।",
      "वैज्ञानिक शोध में कठोर प्रयोग और पुनरावृत्ति आवश्यक है।"
    ]
  }
};

/* ---------- Utilities for localStorage ---------- */
function readUsers(){ try { return JSON.parse(localStorage.getItem(LS_USERS))||[] } catch(e){return[]} }
function writeUsers(u){ localStorage.setItem(LS_USERS, JSON.stringify(u)) }
function setCurrent(uid){ localStorage.setItem(LS_CUR, uid) }
function getCurrent(){ return localStorage.getItem(LS_CUR) }

/* ---------- UI references ---------- */
const pageTitle = document.getElementById('pageTitle');
const pages = {
  login: document.getElementById('page-login'),
  signup: document.getElementById('page-signup'),
  home: document.getElementById('page-home'),
  choose: document.getElementById('page-choose'),
  test: document.getElementById('page-test'),
  leader: document.getElementById('page-leader'),
  results: document.getElementById('page-results'),
  learn: document.getElementById('page-learn'),
  refer: document.getElementById('page-refer'),
  allexams: document.getElementById('page-allexams'),
};

const profileWrap = document.getElementById('profileWrap');
const avatar = document.getElementById('avatar');
const dropdown = document.getElementById('profileDropdown');
const pdName = document.getElementById('pdName');
const pdMobile = document.getElementById('pdMobile');
const pdEmail = document.getElementById('pdEmail');
const pdId = document.getElementById('pdId');
const pdJoined = document.getElementById('pdJoined');
const logoutBtn = document.getElementById('logoutBtn');

const shareLink = document.getElementById('shareLink');

/* ---------- Navigation & auth UI ---------- */
document.querySelectorAll('.menu-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    document.querySelectorAll('.menu-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const p = btn.dataset.page;
    showPage(p);
  });
});
document.querySelectorAll('[data-page-open]').forEach(b=>{
  b.addEventListener('click', ()=> showPage(b.dataset.pageOpen || b.dataset.pageOpen));
});

/* show signup/login */
document.getElementById('showSignup').addEventListener('click', (e)=>{ e.preventDefault(); showPage('signup'); });
document.getElementById('showLogin').addEventListener('click', (e)=>{ e.preventDefault(); showPage('login'); });

/* login/signup handlers */
document.getElementById('loginBtn').addEventListener('click', attemptLogin);
document.getElementById('signupBtn').addEventListener('click', createAccount);

/* profile dropdown toggle */
document.getElementById('avatar').addEventListener('click', ()=> {
  dropdown.classList.toggle('hidden');
});
logoutBtn.addEventListener('click', ()=> {
  localStorage.removeItem(LS_CUR);
  location.reload();
});

/* start test */
document.getElementById('startTestBtn').addEventListener('click', ()=> {
  startSelectedTest();
});
document.getElementById('startTestBtn').addEventListener('touchstart', ()=> {
  startSelectedTest();
});

/* quick test */
function quickTest(){ 
  showPage('choose'); 
  document.getElementById('selTime').value = '60';
  document.getElementById('selDiff').value = 'low';
  document.getElementById('selLang').value = 'english';
}

/* update share link */
function refreshShareLink(){
  const u = location.href;
  shareLink.textContent = u;
}

/* ---------- Page switching ---------- */
function hideAllPages(){
  Object.values(pages).forEach(p=>p.classList.add('hidden'));
}
function showPage(name){
  hideAllPages();
  if(name==='home') pages.home.classList.remove('hidden');
  else if(name==='choose') pages.choose.classList.remove('hidden');
  else if(name==='allexams') pages.allexams.classList.remove('hidden');
  else if(name==='daily') pages.daily?.classList.remove('hidden');
  else if(name==='leader') pages.leader.classList.remove('hidden');
  else if(name==='results') pages.results.classList.remove('hidden');
  else if(name==='learn') pages.learn.classList.remove('hidden');
  else if(name==='refer') pages.refer.classList.remove('hidden');
  else if(name==='login') pages.login.classList.remove('hidden');
  else if(name==='signup') pages.signup.classList.remove('hidden');
  else if(name==='test') pages.test.classList.remove('hidden');
  pageTitle.innerText = "Osix Typing Tutor — " + (name.charAt(0).toUpperCase()+name.slice(1));
  refreshShareLink();
}

/* ---------- Auth logic (local) ---------- */
function createAccount(){
  const name = document.getElementById('suName').value.trim();
  const mobile = document.getElementById('suMobile').value.trim();
  const email = document.getElementById('suEmail').value.trim();
  const pass = document.getElementById('suPass').value;
  if(!name || !mobile || !pass){ alert('Please fill required fields'); return; }
  const users = readUsers();
  if(users.find(u=>u.mobile===mobile)){ alert('Mobile already registered. Use login.'); return; }
  const id = 'u'+Date.now();
  const user = { id, name, mobile, email, pass, joined: new Date().toISOString(), results: [] , avatar: '' };
  users.push(user); writeUsers(users);
  setCurrent(id);
  renderProfile(user);
  showPage('home');
  profileWrap.style.display = 'block';
  alert('Account created. Welcome, '+name);
}

function attemptLogin(){
  const m = document.getElementById('loginMobile').value.trim();
  const p = document.getElementById('loginPass').value;
  if(!m || !p){ alert('Enter mobile and password'); return; }
  const users = readUsers();
  const u = users.find(x=>x.mobile===m && x.pass===p);
  if(!u){ alert('Invalid credentials'); return; }
  setCurrent(u.id);
  renderProfile(u);
  profileWrap.style.display = 'block';
  showPage('home');
}

/* on load, check current user */
window.addEventListener('load', ()=>{
  const cur = getCurrent();
  if(cur){
    const u = readUsers().find(x=>x.id===cur);
    if(u){ renderProfile(u); profileWrap.style.display='block'; showPage('home'); return; }
  }
  showPage('login');
  profileWrap.style.display='none';
  populatePassagePreview();
  refreshShareLink();
});

/* render profile info */
function renderProfile(u){
  pdName.innerText = u.name;
  pdMobile.innerText = u.mobile;
  pdEmail.innerText = u.email || '—';
  pdId.innerText = u.id;
  pdJoined.innerText = (new Date(u.joined)).toLocaleDateString();
  avatar.src = u.avatar || ('https://ui-avatars.com/api/?name='+encodeURIComponent(u.name)+'&background=7c3aed&color=fff');
  dropdown.classList.add('hidden');
}

/* ---------- Typing test logic ---------- */
let testState = { running:false, interval:null, timeLeft:60, startTs:0, original:'', typed:'' };

function populatePassagePreview(){
  const lang = document.getElementById('selLang').value || 'english';
  const diff = document.getElementById('selDiff').value || 'low';
  const arr = PASSAGES[lang][diff];
  document.getElementById('passagePreview').textContent = arr[Math.floor(Math.random()*arr.length)];
}

/* update preview when selects change */
['selLang','selDiff'].forEach(id=> {
  const el = document.getElementById(id);
  if(el) el.addEventListener('change', populatePassagePreview);
});

/* start selected test */
function startSelectedTest(){
  const lang = document.getElementById('selLang').value;
  const diff = document.getElementById('selDiff').value;
  const time = parseInt(document.getElementById('selTime').value,10);
  const arr = PASSAGES[lang][diff];
  const text = arr[Math.floor(Math.random()*arr.length)];
  beginTest(text,time,lang,diff);
}

/* begin test */
function beginTest(text, seconds, lang, diff){
  testState.original = text;
  testState.timeLeft = seconds;
  testState.startTs = Date.now();
  testState.typed = '';
  document.getElementById('testPassage').innerHTML = renderPassageHtml(text,'');
  document.getElementById('testInput').value = '';
  document.getElementById('timeLeft').innerText = testState.timeLeft;
  document.getElementById('liveWpm').innerText = 0;
  document.getElementById('liveAcc').innerText = '0';
  document.getElementById('liveCpm').innerText = 0;
  showPage('test');
  // start timer
  if(testState.interval) clearInterval(testState.interval);
  testState.interval = setInterval(()=> {
    testState.timeLeft--;
    document.getElementById('timeLeft').innerText = testState.timeLeft;
    computeLiveStats();
    if(testState.timeLeft<=0){ finishTest(); }
  },1000);
}

/* render passage into spans */
function renderPassageHtml(text, typed){
  const spans = [];
  for(let i=0;i<text.length;i++){
    const ch = text[i] === ' ' ? '\u00A0' : text[i];
    const cls = (typed[i]==null) ? '' : (typed[i]===text[i] ? 'correct' : 'wrong');
    spans.push(`<span class="${cls}">${escapeHtml(ch)}</span>`);
  }
  return spans.join('');
}
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* on typing */
function onTyping(){
  const val = document.getElementById('testInput').value;
  testState.typed = val;
  document.getElementById('testPassage').innerHTML = renderPassageHtml(testState.original, val);
  computeLiveStats();
}

/* compute live stats */
function computeLiveStats(){
  const typed = testState.typed || '';
  const target = testState.original || '';
  let correctChars = 0;
  for(let i=0;i<typed.length;i++){
    if(typed[i] === target[i]) correctChars++;
  }
  const totalChars = typed.length;
  const accuracy = totalChars ? Math.round((correctChars/totalChars)*10000)/100 : 0;
  const elapsed = Math.max(1, ( (testState.startTs ? Math.floor((Date.now()-testState.startTs)/1000) : 0) ));
  const mins = Math.max(elapsed/60, 1/60);
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm = Math.round(words / mins);
  const cpm = Math.round(totalChars / mins);
  document.getElementById('liveWpm').innerText = isFinite(wpm)?wpm:0;
  document.getElementById('liveAcc').innerText = accuracy;
  document.getElementById('liveCpm').innerText = isFinite(cpm)?cpm:0;
}

/* finish test & save result */
function finishTest(){
  if(testState.interval) clearInterval(testState.interval);
  const typed = testState.typed || '';
  const target = testState.original || '';
  let correctChars = 0;
  for(let i=0;i<typed.length;i++) if(typed[i] === target[i]) correctChars++;
  const totalChars = typed.length;
  const accuracy = totalChars ? Math.round((correctChars/totalChars)*10000)/100 : 0;
  const elapsed = Math.max(1, ( (testState.startTs ? Math.floor((Date.now()-testState.startTs)/1000) : 0) ));
  const mins = Math.max(elapsed/60, 1/60);
  const words = typed.trim().split(/\s+/).filter(Boolean).length;
  const wpm = Math.round(words / mins);
  const cpm = Math.round(totalChars / mins);

  // save to user
  const uid = getCurrent();
  if(uid){
    const users = readUsers();
    const u = users.find(x=>x.id===uid);
    if(u){
      const rec = {
        id: 'r'+Date.now(),
        passage: testState.original.slice(0,200),
        wpm, cpm, accuracy, elapsed, date: new Date().toISOString()
      };
      u.results = u.results || [];
      u.results.unshift(rec);
      writeUsers(users);
      alert(`Test complete — WPM: ${wpm} • Accuracy: ${accuracy}%`);
    }
  } else {
    alert(`Test complete — WPM: ${wpm} • Accuracy: ${accuracy}% (Login to save results)`);
  }
  // update UI lists
  renderMyResults();
  renderLeaderBoard();
  showPage('results');
}

/* abort */
function abortToDashboard(){
  if(testState.interval) clearInterval(testState.interval);
  showPage('home');
}

/* render my results */
function renderMyResults(){
  const uid = getCurrent();
  const container = document.getElementById('myResultsList');
  container.innerHTML = '';
  if(!uid){ container.innerHTML = '<p class="muted">Login to see saved results.</p>'; return; }
  const users = readUsers();
  const u = users.find(x=>x.id===uid);
  if(!u || !u.results || u.results.length===0){ container.innerHTML = '<p class="muted">No results yet. Take a test!</p>'; return; }
  u.results.forEach(r=>{
    const el = document.createElement('div');
    el.className='leader-item';
    el.innerHTML = `<div><strong>${r.wpm} WPM</strong><div class="small muted">${r.passage}</div></div><div class="small muted">${(new Date(r.date)).toLocaleString()}</div>`;
    container.appendChild(el);
  });
}

/* render leaderboard (local top scores from all users) */
function renderLeaderBoard(){
  const container = document.getElementById('leaderboardList');
  container.innerHTML = '';
  const users = readUsers();
  const all = [];
  users.forEach(u=>{
    (u.results||[]).forEach(r=>{
      all.push({user:u.name||u.mobile, wpm:r.wpm, acc:r.accuracy, date:r.date});
    });
  });
  all.sort((a,b)=>b.wpm - a.wpm);
  if(all.length===0) { container.innerHTML = '<p class="muted">No results yet.</p>'; return; }
  all.slice(0,50).forEach(r=>{
    const el = document.createElement('div'); el.className='leader-item';
    el.innerHTML = `<div><strong>${r.user}</strong><div class="small muted">${r.wpm} WPM • ${r.acc}%</div></div><div class="small muted">${(new Date(r.date)).toLocaleDateString()}</div>`;
    container.appendChild(el);
  });
}

/* initial renders for results & leaderboard */
renderMyResults();
renderLeaderBoard();

/* ensure share link filled */
document.addEventListener('DOMContentLoaded', ()=> refreshShareLink());
