(function(){
  const session = PandaApp.requireLogin();
  PandaApp.mountTopbar();
  PandaApp.renderLang();

  const username = session.username;
  const prog = PandaApp.getProgress(username);
  const rate = PandaApp.completionRate(prog);

  document.getElementById("doneNum").textContent = `${rate.done}/${rate.total}`;
  document.getElementById("doneLabel").textContent = PandaApp.t("已完成章节","chapters completed");
  document.getElementById("bar").style.width = `${rate.pct}%`;

  const chapterMeta = [
    {n:1, title: PandaApp.t("第1章：熊猫侦探 · 找线索","Ch1: Panda Detective · Find clues"),
     desc: PandaApp.t("在地图上找 5 个线索点，拼出“密码数字”。","Find 5 hotspots and collect code digits."),
     href:"chapter1.html"},
    {n:2, title: PandaApp.t("第2章：熊猫营养师 · 配餐挑战","Ch2: Panda Nutritionist · Meal plan"),
     desc: PandaApp.t("为熊猫选择合适的食物组合。","Pick correct food combinations."),
     href:"chapter2.html"},
    {n:3, title: PandaApp.t("第3章：保护行动 · 做选择","Ch3: Conservation · Make choices"),
     desc: PandaApp.t("在不同场景下做出最佳保护决策。","Choose best actions in scenarios."),
     href:"chapter3.html"},
    {n:4, title: PandaApp.t("第4章：三星堆解码轮盘","Ch4: Sanxingdui Code Wheel"),
     desc: PandaApp.t("旋转轮盘，匹配文物，收集 4 个数字。","Spin the wheel, match artifacts, collect digits."),
     href:"chapter4.html"},
    {n:5, title: PandaApp.t("第5章：考古挖掘 · 找宝物","Ch5: Archaeology Dig"),
     desc: PandaApp.t("在网格里挖掘并找到 3 件文物。","Dig tiles and find 3 relics."),
     href:"chapter5.html"},
    {n:6, title: PandaApp.t("第6章：文明礼仪 · 小测验","Ch6: Etiquette Quiz"),
     desc: PandaApp.t("完成礼仪小测验，拿到最后的密码。","Finish the quiz to get the final code."),
     href:"chapter6.html"},
  ];

  const wrap = document.getElementById("chapters");
  wrap.innerHTML = "";
  chapterMeta.forEach(m=>{
    const st = (prog.chapters[m.n]||{});
    const done = !!st.done;
    const badge = done ? `<span class="badge ok">✅ ${PandaApp.t("已完成","Done")}</span>`
                       : `<span class="badge todo">🕒 ${PandaApp.t("未完成","To do")}</span>`;
    const code = done && st.codeDigit ? `<span class="pill">🔢 ${PandaApp.t("密码数字","Code digit")}: <b>${st.codeDigit}</b></span>` : "";
    const btnText = done ? PandaApp.t("回顾","Review") : PandaApp.t("开始","Start");
    const btnClass = done ? "btn" : "btn primary";

    const div = document.createElement("div");
    div.className = "chapter";
    div.innerHTML = `
      <div class="left">
        <div class="title">${m.title}</div>
        <div class="desc">${m.desc}</div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${badge}
          ${code}
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="${btnClass}" data-href="${m.href}">${btnText}</button>
      </div>
    `;
    div.querySelector("button").addEventListener("click", ()=>{ location.href = m.href; });
    wrap.appendChild(div);
  });

  // export progress
  document.getElementById("exportBtn").addEventListener("click", ()=>{
    const data = {
      username,
      exportedAt: new Date().toISOString(),
      progress: PandaApp.getProgress(username)
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url;
    a.download = `panda-progress-${username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    PandaApp.toast(PandaApp.t("已导出 JSON 文件","Exported JSON file"), "ok");
  });

  // reset progress
  document.getElementById("resetBtn").addEventListener("click", ()=>{
    PandaApp.showModal(
      PandaApp.t("确认重置？","Reset?"),
      `<p class="muted">${PandaApp.t("这会清空你在本浏览器的 1-6 章进度。","This clears your local progress in this browser.")}</p>`,
      [
        {text:PandaApp.t("取消","Cancel"), on:()=>PandaApp.hideModal()},
        {text:PandaApp.t("重置","Reset"), kind:"danger", on:()=>{
          PandaApp.resetProgress(username);
          PandaApp.hideModal();
          location.reload();
        }}
      ]
    );
  });

  // admin panel button
  if(PandaApp.isAdmin(session)){
    const btn = document.getElementById("adminPanelBtn");
    btn.style.display = "inline-flex";
    btn.addEventListener("click", ()=> location.href="admin.html");
  }
})();