(function(){
  const session = PandaApp.requireLogin();
  PandaApp.mountTopbar();
  PandaApp.renderLang();
  document.getElementById("backBtn").addEventListener("click", ()=>location.href="dashboard.html");

  const username = session.username;

  const questions = [
    {qZh:"主食应该是什么？", qEn:"What should be the main food?",
     options:[["竹子","Bamboo"],["面包","Bread"],["巧克力","Chocolate"]], correct:0},
    {qZh:"以下哪种辅食更合适（少量）？", qEn:"Which supplement is OK (small amount)?",
     options:[["苹果","Apple"],["薯片","Chips"],["可乐","Soda"]], correct:0},
    {qZh:"熊猫需要大量肉类吗？", qEn:"Do pandas need lots of meat?",
     options:[["不需要","No"],["需要","Yes"],["越多越好","The more the better"]], correct:0},
    {qZh:"正确做法是？", qEn:"Best practice is…",
     options:[["定时喂食，保持清洁","Scheduled feeding & hygiene"],["随时投喂零食","Snack anytime"],["只喂甜食","Only sweets"]], correct:0},
  ];

  const stateKey = "ch2_state_"+username;
  const state = JSON.parse(localStorage.getItem(stateKey)||"null") || {answers:{}};

  function save(){ localStorage.setItem(stateKey, JSON.stringify(state)); }

  function render(){
    const game = document.getElementById("game");
    const answered = Object.keys(state.answers).length;
    game.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <div class="pill">🧠 ${PandaApp.t("已作答","Answered")}: ${answered}/${questions.length}</div>
        <button class="btn" id="submitBtn">✅ ${PandaApp.t("提交","Submit")}</button>
      </div>
      <div style="margin-top:12px" id="qs"></div>
    `;
    const qs = game.querySelector("#qs");
    questions.forEach((qq, idx)=>{
      const pick = state.answers[idx];
      const box = document.createElement("div");
      box.className = "card";
      box.style.margin="0 0 12px 0";
      box.style.padding="14px";
      box.innerHTML = `
        <div style="font-weight:900">${PandaApp.t(qq.qZh, qq.qEn)}</div>
        <div class="muted" style="font-size:12px;margin-top:6px">${PandaApp.t("请选择一个答案","Pick one answer")}</div>
        <div class="row" style="margin-top:10px" id="opts"></div>
      `;
      const opts = box.querySelector("#opts");
      qq.options.forEach((opt, j)=>{
        const btn = document.createElement("button");
        btn.className = "btn";
        btn.textContent = PandaApp.t(opt[0], opt[1]);
        if(pick===j){ btn.classList.add("primary"); }
        btn.addEventListener("click", ()=>{
          state.answers[idx]=j; save(); render();
        });
        opts.appendChild(btn);
      });
      qs.appendChild(box);
    });

    game.querySelector("#submitBtn").addEventListener("click", submit);
  }

  function submit(){
    let correct=0;
    for(let i=0;i<questions.length;i++){
      if(state.answers[i]===questions[i].correct) correct++;
    }
    const pass = correct>=3;
    if(!pass){
      PandaApp.showModal(
        PandaApp.t("还差一点","Almost"),
        `<p class="muted">${PandaApp.t("你答对了","You got")} <b>${correct}</b>/${questions.length}。</p>
         <p class="muted">${PandaApp.t("需要至少答对 3 题才能通关。再试一次！","You need 3 correct to pass. Try again!")}</p>`,
        [{text:PandaApp.t("继续","Continue"), kind:"primary", on:()=>PandaApp.hideModal()}]
      );
      return;
    }

    const code = "6";
    PandaApp.markChapterDone(username, 2, {score:correct, codeDigit:code});
    PandaApp.showModal(
      PandaApp.t("第2章完成！","Chapter 2 complete!"),
      `<p class="muted">${PandaApp.t("你的得分","Your score")}: <b>${correct}</b>/${questions.length}</p>
       <div class="pill">🔢 ${PandaApp.t("密码数字","Code digit")}: <b>${code}</b></div>`,
      [{text:PandaApp.t("返回总地图","Back"), kind:"primary", on:()=>location.href="dashboard.html"}]
    );
  }

  render();
})();