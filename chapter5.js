(function(){
  const session = PandaApp.requireLogin();
  PandaApp.mountTopbar();
  PandaApp.renderLang();
  document.getElementById("backBtn").addEventListener("click", ()=>location.href="dashboard.html");

  const username = session.username;
  const key="ch5_state_"+username;
  const state = JSON.parse(localStorage.getItem(key)||"null") || {revealed:{}, found:0, relicPos:null};

  function save(){ localStorage.setItem(key, JSON.stringify(state)); }

  // init relic positions once
  if(!state.relicPos){
    const all = Array.from({length:16}, (_,i)=>i);
    all.sort(()=>Math.random()-0.5);
    state.relicPos = all.slice(0,3); // 3 relics
    save();
  }

  function render(){
    const game = document.getElementById("game");
    game.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <div class="pill">⛏️ ${PandaApp.t("已找到","Found")}: <b>${state.found}</b>/3</div>
        <button class="btn" id="resetLocal">${PandaApp.t("重新布置","Reshuffle")}</button>
      </div>
      <div style="margin-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px" id="grid"></div>
      <div id="finish"></div>
    `;

    game.querySelector("#resetLocal").addEventListener("click", ()=>{
      localStorage.removeItem(key);
      location.reload();
    });

    const grid = game.querySelector("#grid");
    for(let i=0;i<16;i++){
      const b = document.createElement("button");
      b.className="btn";
      b.style.height="64px";
      b.style.borderRadius="18px";
      b.style.fontSize="18px";
      const rev = !!state.revealed[i];
      if(!rev){
        b.textContent="🟫";
      }else{
        const isRelic = state.relicPos.includes(i);
        b.textContent = isRelic ? "🏺" : "🪨";
        if(isRelic) b.style.borderColor="rgba(255,213,106,.55)";
      }
      b.addEventListener("click", ()=>dig(i));
      grid.appendChild(b);
    }

    const fin = game.querySelector("#finish");
    if(state.found>=3){
      const code="9";
      PandaApp.markChapterDone(username, 5, {codeDigit:code});
      fin.innerHTML = `
        <div class="notice" style="margin-top:14px">✅ ${PandaApp.t("挖掘成功！","Dig complete!")}</div>
        <div style="margin-top:10px" class="pill">🔢 ${PandaApp.t("密码数字","Code digit")}: <b>${code}</b></div>
        <div style="margin-top:12px">
          <button class="btn gold" id="backDash">← ${PandaApp.t("返回总地图","Back")}</button>
        </div>
      `;
      fin.querySelector("#backDash").addEventListener("click", ()=>location.href="dashboard.html");
    }
  }

  function dig(i){
    if(state.revealed[i]) return;
    state.revealed[i]=true;
    if(state.relicPos.includes(i)){
      state.found += 1;
      PandaApp.toast(PandaApp.t("发现文物！","Relic found!"), "ok");
    }else{
      PandaApp.toast(PandaApp.t("这里没有文物","No relic here"), "info");
    }
    save();
    render();
  }

  render();
})();