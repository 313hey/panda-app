(function(){
  const session = PandaApp.requireLogin();
  PandaApp.mountTopbar();
  PandaApp.renderLang();
  document.getElementById("backBtn").addEventListener("click", ()=>location.href="dashboard.html");

  const username = session.username;
  const stateKey="ch4_state_"+username;
  const state = JSON.parse(localStorage.getItem(stateKey)||"null") || {round:0, digits:[]};

  const rounds = [
    {symbolZh:"神树", symbolEn:"Sacred Tree", digit:"5",
     options:[
       {zh:"青铜面具", en:"Bronze Mask", ok:false},
       {zh:"青铜神树", en:"Bronze Sacred Tree", ok:true},
       {zh:"青铜鸟", en:"Bronze Bird", ok:false}
     ]},
    {symbolZh:"面具", symbolEn:"Mask", digit:"8",
     options:[
       {zh:"青铜面具", en:"Bronze Mask", ok:true},
       {zh:"金面罩", en:"Gold Mask", ok:true}, /* accept both */
       {zh:"青铜神树", en:"Bronze Sacred Tree", ok:false}
     ], multiOk:true},
    {symbolZh:"飞鸟", symbolEn:"Bird", digit:"3",
     options:[
       {zh:"青铜鸟", en:"Bronze Bird", ok:true},
       {zh:"青铜神树", en:"Bronze Sacred Tree", ok:false},
       {zh:"青铜人像", en:"Bronze Figure", ok:false}
     ]},
    {symbolZh:"立人", symbolEn:"Standing Figure", digit:"2",
     options:[
       {zh:"青铜立人像", en:"Bronze Standing Figure", ok:true},
       {zh:"青铜面具", en:"Bronze Mask", ok:false},
       {zh:"金杖", en:"Gold Staff", ok:false}
     ]},
  ];

  function save(){ localStorage.setItem(stateKey, JSON.stringify(state)); }

  function render(){
    const game = document.getElementById("game");
    const r = state.round;
    const done = r>=rounds.length;
    const digitsStr = state.digits.join("");

    game.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <div class="pill">🎡 ${PandaApp.t("轮盘回合","Round")}: ${Math.min(r+1, rounds.length)}/${rounds.length}</div>
        <div class="pill">🔢 ${PandaApp.t("已收集","Collected")}: <b>${digitsStr || "-"}</b></div>
      </div>

      <div style="margin-top:14px" class="card" id="wheelCard" style="padding:14px"></div>
    `;
    const wheel = game.querySelector("#wheelCard");

    if(done){
      const code = digitsStr;
      PandaApp.markChapterDone(username, 4, {codeDigit: code});
      wheel.innerHTML = `
        <div class="notice">✅ ${PandaApp.t("你已集齐 4 个数字！","You collected 4 digits!")}</div>
        <div style="margin-top:10px" class="pill">🔢 ${PandaApp.t("本章密码","Chapter code")}: <b>${code}</b></div>
        <div style="margin-top:12px">
          <button class="btn gold" id="backDash">← ${PandaApp.t("返回总地图","Back to dashboard")}</button>
        </div>
      `;
      wheel.querySelector("#backDash").addEventListener("click", ()=>location.href="dashboard.html");
      return;
    }

    const cur = rounds[r];
    wheel.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:900">${PandaApp.t("轮盘指向符号","Wheel symbol")}: <span style="color:var(--accent2)">${PandaApp.t(cur.symbolZh, cur.symbolEn)}</span></div>
          <div class="muted" style="font-size:12px;margin-top:6px">${PandaApp.t("请选择匹配的文物。","Pick the matching artifact.")}</div>
        </div>
        <button class="btn primary" id="spinBtn">🎡 ${PandaApp.t("转动轮盘","Spin")}</button>
      </div>
      <div class="row" style="margin-top:12px" id="opts"></div>
    `;

    wheel.querySelector("#spinBtn").addEventListener("click", ()=>{
      // for fun, randomize current round options order each spin
      cur.options.sort(()=>Math.random()-0.5);
      render();
    });

    const opts = wheel.querySelector("#opts");
    cur.options.forEach((o)=>{
      const btn = document.createElement("button");
      btn.className="btn";
      btn.style.minWidth="220px";
      btn.innerHTML = `<b>${PandaApp.t(o.zh, o.en)}</b>`;
      btn.addEventListener("click", ()=>pick(o));
      opts.appendChild(btn);
    });
  }

  function pick(option){
    const r = state.round;
    const cur = rounds[r];
    const ok = !!option.ok;
    if(!ok){
      PandaApp.toast(PandaApp.t("不匹配，再试试","Not a match. Try again."), "danger");
      return;
    }
    state.digits.push(cur.digit);
    state.round += 1;
    save();
    PandaApp.showModal(
      PandaApp.t("匹配成功！","Matched!"),
      `<p class="muted">${PandaApp.t("你获得一个数字","You earned a digit")}：</p>
       <div class="pill" style="font-size:16px">🔢 <b>${cur.digit}</b></div>`,
      [{text:PandaApp.t("继续下一回合","Next"), kind:"primary", on:()=>{ PandaApp.hideModal(); render(); }}]
    );
  }

  render();
})();