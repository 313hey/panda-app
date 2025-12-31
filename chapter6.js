(function(){
  const session = PandaApp.requireLogin();
  PandaApp.mountTopbar();
  PandaApp.renderLang();
  document.getElementById("backBtn").addEventListener("click", ()=>location.href="dashboard.html");

  const username = session.username;
  const key="ch6_state_"+username;
  const state = JSON.parse(localStorage.getItem(key)||"null") || {answers:{}};
  function save(){ localStorage.setItem(key, JSON.stringify(state)); }

  const qs = [
    {zh:"参观熊猫基地时，正确做法是？", en:"At the panda base, you should…",
     opts:[[ "保持安静，听从指引","Keep quiet and follow staff" ],
           [ "大声喊叫吸引熊猫","Shout to attract pandas" ],
           [ "翻越围栏靠近","Climb over barriers" ]], correct:0},
    {zh:"拍照时最合适？", en:"For photos, best is…",
     opts:[[ "不使用闪光灯","No flash" ],
           [ "一直开闪光灯","Always use flash" ],
           [ "贴近熊猫自拍","Get very close" ]], correct:0},
    {zh:"在公共场合排队时？", en:"When queuing in public…",
     opts:[[ "按顺序排队","Queue in order" ],
           [ "插队更快","Cut in line" ],
           [ "让别人替你排","Ask others to queue" ]], correct:0},
    {zh:"与工作人员沟通时？", en:"When talking to staff…",
     opts:[[ "礼貌表达需求","Be polite" ],
           [ "提高音量施压","Raise your voice" ],
           [ "不听解释","Refuse to listen" ]], correct:0},
    {zh:"餐厅用餐更合适？", en:"At a restaurant…",
     opts:[[ "适量取餐，避免浪费","Take what you can finish" ],
           [ "多点多剩","Over-order and waste" ],
           [ "把垃圾丢桌下","Throw trash under table" ]], correct:0},
    {zh:"面对文化差异时？", en:"Facing cultural differences…",
     opts:[[ "尊重并保持开放","Respect and stay open-minded" ],
           [ "嘲笑不同习惯","Mock differences" ],
           [ "拒绝了解","Refuse to learn" ]], correct:0},
  ];

  function render(){
    const game = document.getElementById("game");
    game.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <div class="pill">📝 ${PandaApp.t("已作答","Answered")}: ${Object.keys(state.answers).length}/${qs.length}</div>
        <button class="btn" id="submitBtn">✅ ${PandaApp.t("提交","Submit")}</button>
      </div>
      <div style="margin-top:12px" id="list"></div>
    `;
    const list = game.querySelector("#list");
    qs.forEach((q, i)=>{
      const pick = state.answers[i];
      const box = document.createElement("div");
      box.className="card";
      box.style.margin="0 0 12px 0";
      box.style.padding="14px";
      box.innerHTML = `
        <div style="font-weight:900">${PandaApp.t(q.zh, q.en)}</div>
        <div class="row" style="margin-top:10px" id="opts"></div>
      `;
      const opts = box.querySelector("#opts");
      q.opts.forEach((opt, j)=>{
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
    for(let i=0;i<qs.length;i++){
      if(state.answers[i]===qs[i].correct) correct++;
    }
    if(correct<4){
      PandaApp.showModal(
        PandaApp.t("还没通过","Not passed"),
        `<p class="muted">${PandaApp.t("你答对了","You got")} <b>${correct}</b>/${qs.length}。</p>
         <p class="muted">${PandaApp.t("需要至少 4 题正确才能通关。","You need 4 correct to pass.")}</p>`,
        [{text:PandaApp.t("继续","Continue"), kind:"primary", on:()=>PandaApp.hideModal()}]
      );
      return;
    }

    const code="4";
    PandaApp.markChapterDone(username, 6, {score:correct, codeDigit:code});
    PandaApp.showModal(
      PandaApp.t("全部完成！","All done!"),
      `<p class="muted">${PandaApp.t("恭喜你完成 1-6 章！","Congrats! You finished Chapters 1–6!")}</p>
       <div class="pill">🔢 ${PandaApp.t("最后数字","Final digit")}: <b>${code}</b></div>
       <p class="muted" style="margin-top:10px">${PandaApp.t("返回总地图查看你的全部密码。","Back to dashboard to see all codes.")}</p>`,
      [{text:PandaApp.t("返回总地图","Back"), kind:"primary", on:()=>location.href="dashboard.html"}]
    );
  }

  render();
})();