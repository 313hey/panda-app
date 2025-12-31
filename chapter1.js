(function(){
  const session = PandaApp.requireLogin();
  PandaApp.mountTopbar();
  PandaApp.renderLang();

  document.getElementById("backBtn").addEventListener("click", ()=>location.href="dashboard.html");

  const username = session.username;
  const prog = PandaApp.getProgress(username);
  const stateKey = "ch1_state_"+username;
  const saved = JSON.parse(localStorage.getItem(stateKey) || "null") || {found:{}};

  const clues = [
    {id:"bamboo", x:18, y:28, zh:"竹子堆里有新鲜咬痕。", en:"Fresh bite marks on the bamboo.", digit:"2"},
    {id:"footprint", x:58, y:22, zh:"泥地脚印指向水边。", en:"Footprints lead toward water.", digit:"9"},
    {id:"fur", x:72, y:56, zh:"树枝上挂着一撮黑白毛。", en:"A tuft of black-and-white fur on a branch.", digit:"4"},
    {id:"camera", x:34, y:68, zh:"红外相机拍到夜间活动。", en:"An infrared camera caught night movement.", digit:"7"},
    {id:"snack", x:52, y:44, zh:"闻到苹果味：有人投喂？", en:"Apple smell… someone fed the panda?", digit:"1"},
  ];

  function foundCount(){ return Object.keys(saved.found).length; }
  function save(){ localStorage.setItem(stateKey, JSON.stringify(saved)); }

  function render(){
    const done = (prog.chapters[1]||{}).done;
    const game = document.getElementById("game");
    const title = PandaApp.t("线索地图","Clue Map");
    const desc = PandaApp.t("点击地图上的圆点，收集 5 个数字。","Click the dots to collect 5 digits.");
    const status = PandaApp.t("已收集","Collected") + `: ${foundCount()}/5`;
    game.innerHTML = `
      <div class="row" style="justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:900">${title}</div>
          <div class="muted" style="font-size:13px">${desc}</div>
        </div>
        <div class="pill">${status}</div>
      </div>

      <div style="margin-top:14px;border:1px solid var(--border);border-radius:22px;overflow:hidden;background:rgba(255,255,255,.03)">
        <div style="position:relative; width:100%; padding-top:56%">
          <svg viewBox="0 0 100 56" style="position:absolute; inset:0; width:100%; height:100%">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stop-color="rgba(122,162,255,.28)"/>
                <stop offset="1" stop-color="rgba(255,213,106,.18)"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="56" fill="url(#g)"/>
            <path d="M0,44 C12,34 18,36 30,28 C42,20 52,22 62,18 C76,12 84,14 100,8 L100,56 L0,56 Z"
                  fill="rgba(11,16,32,.55)"/>
            <text x="4" y="10" fill="rgba(233,239,255,.85)" font-size="4">🐼 Panda Reserve Map</text>
          </svg>

          <div id="hotspots"></div>
        </div>
      </div>

      <div style="margin-top:14px" id="result"></div>
    `;

    const hs = game.querySelector("#hotspots");
    hs.style.position="absolute";
    hs.style.inset="0";

    clues.forEach(c=>{
      const btn = document.createElement("button");
      const isFound = !!saved.found[c.id];
      btn.className = "btn";
      btn.style.position="absolute";
      btn.style.left = c.x+"%";
      btn.style.top  = c.y+"%";
      btn.style.transform="translate(-50%,-50%)";
      btn.style.width="42px"; btn.style.height="42px";
      btn.style.borderRadius="999px";
      btn.style.display="grid"; btn.style.placeItems="center";
      btn.style.borderColor = isFound ? "rgba(43,213,118,.55)" : "rgba(255,255,255,.18)";
      btn.innerHTML = isFound ? "✅" : "🔍";
      btn.addEventListener("click", ()=>{
        PandaApp.showModal(
          PandaApp.t("发现线索","Clue found"),
          `<p>${PandaApp.t(c.zh, c.en)}</p>
           <div class="pill">🔢 ${PandaApp.t("数字","Digit")}: <b>${c.digit}</b></div>`,
          [{text:PandaApp.t("收下","Collect"), kind:"primary", on:()=>{
            saved.found[c.id] = c.digit;
            save();
            PandaApp.hideModal();
            render();
            if(foundCount()===5){ finish(); }
          }}]
        );
      });
      hs.appendChild(btn);
    });

    const result = game.querySelector("#result");
    if(done){
      const st = prog.chapters[1]||{};
      result.innerHTML = `
        <div class="notice">
          ✅ ${PandaApp.t("你已完成本章","You finished this chapter")} · 🔢 ${PandaApp.t("密码数字","Code")}: <b>${st.codeDigit||""}</b>
        </div>
      `;
    }else if(foundCount()===5){
      result.innerHTML = `
        <div class="notice">
          ${PandaApp.t("线索集齐！点击下方按钮通关。","All clues collected! Click below to finish.")}
        </div>
        <div style="margin-top:10px">
          <button class="btn gold" id="finishBtn">🏁 ${PandaApp.t("通关本章","Finish chapter")}</button>
        </div>
      `;
      result.querySelector("#finishBtn").addEventListener("click", finish);
    }
  }

  function finish(){
    const digits = clues.map(c=>saved.found[c.id]).join("");
    PandaApp.markChapterDone(username, 1, { codeDigit: digits });
    PandaApp.showModal(
      PandaApp.t("第1章完成！","Chapter 1 complete!"),
      `<p class="muted">${PandaApp.t("你收集到的数字是","Your collected digits are")}：</p>
       <div class="pill" style="font-size:16px">🔢 <b>${digits}</b></div>
       <p class="muted" style="margin-top:10px">${PandaApp.t("返回总地图继续下一章。","Go back to dashboard for the next chapter.")}</p>`,
      [
        {text:PandaApp.t("返回总地图","Back"), kind:"primary", on:()=>location.href="dashboard.html"}
      ]
    );
  }

  render();
})();