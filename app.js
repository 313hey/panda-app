(function(){
  const CFG = (window.PANDA_APP_CONFIG || {});
  const APP_KEY = "pandaapp_v1";
  const LS = window.localStorage;

  function nowISO(){ return new Date().toISOString(); }
  function getJSON(key, fallback){
    try{ const v = LS.getItem(key); return v? JSON.parse(v): fallback; }catch(e){ return fallback; }
  }
  function setJSON(key, val){ LS.setItem(key, JSON.stringify(val)); }
  function toast(msg, type="info"){
    const el = document.getElementById("toast");
    if(!el){ alert(msg); return; }
    el.textContent = msg;
    el.style.borderColor = type==="danger" ? "rgba(255,107,107,.45)" : type==="ok" ? "rgba(43,213,118,.45)" : "rgba(122,162,255,.45)";
    el.style.background = type==="danger" ? "rgba(255,107,107,.10)" : type==="ok" ? "rgba(43,213,118,.10)" : "rgba(122,162,255,.10)";
    el.style.display = "block";
    clearTimeout(toast._t);
    toast._t = setTimeout(()=>{ el.style.display="none"; }, 2600);
  }

  // language
  function getLang(){ return getJSON(APP_KEY+"_prefs", {lang:"zh"}).lang || "zh"; }
  function setLang(lang){
    const p = getJSON(APP_KEY+"_prefs", {lang:"zh"});
    p.lang = lang;
    setJSON(APP_KEY+"_prefs", p);
  }
  function t(zh, en){ return getLang()==="zh" ? zh : en; }
  function renderLang(){
    document.querySelectorAll("[data-i18n-zh]").forEach(el=>{
      el.textContent = getLang()==="zh" ? el.getAttribute("data-i18n-zh") : el.getAttribute("data-i18n-en");
    });
  }

  // crypto
  async function sha256(str){
    const enc = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
  }

  // users / auth
  function usersKey(){ return APP_KEY+"_users"; }
  function sessionKey(){ return APP_KEY+"_session"; }
  function progressKey(username){ return APP_KEY+"_progress_"+username; }

  function getUsers(){ return getJSON(usersKey(), {}); }
  function setUsers(u){ setJSON(usersKey(), u); }

  function getSession(){ return getJSON(sessionKey(), null); }
  function setSession(s){ setJSON(sessionKey(), s); }
  function clearSession(){ LS.removeItem(sessionKey()); }

  function isAdmin(session){
    if(!session) return false;
    return session.role==="admin" && session.username === (CFG.ADMIN_USERNAME||"admin");
  }

  function requireLogin(){
    const s = getSession();
    if(!s){ location.href = "index.html"; return null; }
    return s;
  }

  function getProgress(username){
    return getJSON(progressKey(username), {
      chapters: {1:{done:false},2:{done:false},3:{done:false},4:{done:false},5:{done:false},6:{done:false}},
      updatedAt: nowISO()
    });
  }
  function setProgress(username, prog){
    prog.updatedAt = nowISO();
    setJSON(progressKey(username), prog);
  }
  function markChapterDone(username, n, details={}){
    const p = getProgress(username);
    p.chapters[n] = {done:true, ...details, doneAt: nowISO()};
    setProgress(username, p);
  }
  function resetProgress(username){
    LS.removeItem(progressKey(username));
  }
  function completionRate(prog){
    const ch = prog.chapters || {};
    let done=0,total=6;
    for(let i=1;i<=6;i++){ if(ch[i] && ch[i].done) done++; }
    return {done,total, pct: Math.round(done/total*100)};
  }

  function mountTopbar(){
    const s = getSession();
    const lang = getLang();
    const appName = CFG.APP_NAME || "Panda Mission";
    const el = document.getElementById("topbar");
    if(!el) return;

    const right = [];
    right.push(`<button class="btn" id="langBtn">${lang==="zh"?"EN":"中文"}</button>`);
    if(s){
      right.push(`<span class="pill">👤 ${escapeHtml(s.username)}${isAdmin(s)?" · Admin":""}</span>`);
      right.push(`<button class="btn danger" id="logoutBtn">${t("退出","Log out")}</button>`);
    }
    el.innerHTML = `
      <div class="brand">
        <div class="logo">🐼</div>
        <div>
          <h1>${escapeHtml(appName)}</h1>
          <div class="sub">${t("GitHub Pages 版 · 可离线保存进度","GitHub Pages edition · saves progress locally")}</div>
        </div>
      </div>
      <div class="row">${right.join("")}</div>
    `;
    document.getElementById("langBtn")?.addEventListener("click", ()=>{
      setLang(lang==="zh"?"en":"zh");
      location.reload();
    });
    document.getElementById("logoutBtn")?.addEventListener("click", ()=>{
      clearSession();
      location.href = "index.html";
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
  }

  // modal helper
  function showModal(title, bodyHtml, actions=[{text:"OK",kind:"primary",on:()=>hideModal()}]){
    const back = document.getElementById("modalBackdrop");
    const box = document.getElementById("modalBox");
    if(!back||!box) return;
    box.innerHTML = `
      <div class="modal">
        <h3>${escapeHtml(title)}</h3>
        <div>${bodyHtml}</div>
        <div class="actions" id="modalActions"></div>
      </div>
    `;
    const act = box.querySelector("#modalActions");
    actions.forEach((a, idx)=>{
      const btn = document.createElement("button");
      btn.className = "btn " + (a.kind||"");
      btn.textContent = a.text;
      btn.addEventListener("click", ()=>{ try{ a.on && a.on(); }catch(e){ console.error(e); } });
      act.appendChild(btn);
    });
    back.style.display = "flex";
    back.addEventListener("click", (e)=>{ if(e.target===back) hideModal(); }, {once:true});
  }
  function hideModal(){
    const back = document.getElementById("modalBackdrop");
    if(back) back.style.display = "none";
  }

  window.PandaApp = {
    // basics
    t, getLang, setLang, renderLang, toast,
    // crypto
    sha256,
    // auth
    getUsers, setUsers, getSession, setSession, clearSession, isAdmin, requireLogin,
    // progress
    getProgress, setProgress, markChapterDone, resetProgress, completionRate,
    // ui
    mountTopbar, showModal, hideModal,
    // misc
    escapeHtml,
  };
})();