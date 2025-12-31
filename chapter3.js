(function(){
  const session = PandaApp.requireLogin();
  PandaApp.mountTopbar();
  PandaApp.renderLang();
  document.getElementById("backBtn").addEventListener("click", ()=>location.href="dashboard.html");

  const username = session.username;
  const scenarios = [
    {zh:"看到游客想喂熊猫零食，你应该？", en:"A tourist tries to feed a panda snacks. You should…",
     options:[[ "礼貌制止并告知规定","Stop politely and explain rules" ],
              [ "一起投喂","Feed together" ],
              [ "假装没看见","Ignore" ]], correct:0},
    {zh:"发现有人进入保护区禁入区，你应该？", en:"Someone enters a restricted zone. You should…",
     options:[[ "联系工作人员/保安","Contact staff/security" ],
              [ "自己冲上去争吵","Argue aggressively" ],
              [ "拍视频发朋友圈","Record and post online" ]], correct:0},
    {zh:"看到垃圾丢在步道上，最好的做法？", en:"Trash on the trail. Best action?",
     options:[[ "捡起并丢进垃圾桶","Pick up and dispose properly" ],
              [ "把垃圾踢到草丛里","Kick into bushes" ],
              [ "等别人捡","Wait for others" ]], correct:0},
    {zh:"遇到野生动物受伤，你应该？", en:"You see an injured wild animal. You should…",
     options:[[ "保持距离并联系救助机构","Keep distance and call rescue" ],
              [ "直接抱走带回家","Take it home" ],
              [ "喂很多食物","Feed a lot" ]], correct:0},
  ];

  const stateKey="ch3_state_"+username;
  const state = JSON.parse(localStorage.getItem(stateKey)||"null") || {answers:{}};
  function save(){ localStorage.setItem(stateKey, JSON.stringify(state)); }

  function render(){
    const game = document.getElementById("game");
    game.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <div class="pill">🧭 ${PandaApp.t("场景","Scenarios")}: ${Object.keys(state.answers).length}/${scenarios.length}</div>
        <button class="btn" id="submitBtn">✅ ${PandaApp.t("提交","Submit")}</button>
      </div>
      <div style="margin-top:12px" id="list"></div>
    `;
    const list = game.querySelector("#list");
    scenarios.forEach((s, i)=>{
      const pick = state.answers[i];
      const box = document.createElement("div");
      box.className="card";
      box.style.margin="0 0 12px 0";
      box.style.padding="14px";
      box.innerHTML = `
        <div style="font-weight:900">${PandaApp.t(s.zh, s.en)}</div>
        <div class="row" style="margin-top:10px" id="opts"></div>
      `;
      const opts = box.querySelector("#opts");
      s.options.forEach((opt, j)=>{
        const btn = document.createElement("button");
        btn.className="btn";
        btn.textContent = PandaApp.t(opt[0], opt[1]);
        if(pick===j) btn.classList.add("primary");
        btn.addEventListener("click", ()=>{ state.answers[i]=j; save(); render(); });
        opts.appendChild(btn);
      });
      list.appendChild(box);
    });

    game.querySelector("#submitBtn").addEventListener("click", submit);
  }

  function submit(){
    let correct=0;
    for(let i=0;i<scenarios.length;i++){
      if(state.answers[i]===scenarios[i].correct) correct++;
    }
    if(correct<3){
      PandaApp.showModal(
        PandaApp.t("再想想","Try again"),
        `<p class="muted">${PandaApp.t("你答对了","You got")} <b>${correct}</b>/${scenarios.length}。</p>
         <p class="muted">${PandaApp.t("需要至少 3 题正确才能通关。","You need at least 3 correct to pass.")}</p>`,
        [{text:PandaApp.t("继续","Continue"), kind:"primary", on:()=>PandaApp.hideModal()}]
      );
      return;
    }
    const code="0";
    PandaApp.markChapterDone(username, 3, {score:correct, codeDigit:code});
    PandaApp.showModal(
      PandaApp.t("第3章完成！","Chapter 3 complete!"),
      `<p class="muted">${PandaApp.t("得分","Score")}: <b>${correct}</b>/${scenarios.length}</p>
       <div class="pill">🔢 ${PandaApp.t("密码数字","Code digit")}: <b>${code}</b></div>`,
      [{text:PandaApp.t("返回总地图","Back"), kind:"primary", on:()=>location.href="dashboard.html"}]
    );
  }

  render();
})();