(function(){
  const session = PandaApp.requireLogin();
  if(!PandaApp.isAdmin(session)){ location.href="dashboard.html"; return; }

  PandaApp.mountTopbar();
  PandaApp.renderLang();

  const users = PandaApp.getUsers();
  const rows = Object.entries(users).filter(([u,info])=>info.role!=="admin");

  const tableDiv = document.getElementById("adminTable");
  if(rows.length===0){
    tableDiv.innerHTML = `<p class="muted">${PandaApp.t("本机还没有任何学生账号数据。","No student accounts saved in this browser yet.")}</p>`;
  }else{
    const html = [
      `<table class="table">`,
      `<thead><tr>
        <th>${PandaApp.t("用户名","Username")}</th>
        <th>${PandaApp.t("完成进度","Completion")}</th>
        <th>${PandaApp.t("最后更新","Last updated")}</th>
        <th>${PandaApp.t("操作","Actions")}</th>
      </tr></thead><tbody>`
    ];
    rows.forEach(([u,info])=>{
      const prog = PandaApp.getProgress(u);
      const rate = PandaApp.completionRate(prog);
      html.push(`<tr>
        <td><b>${PandaApp.escapeHtml(u)}</b><div class="muted" style="font-size:12px">${new Date(info.createdAt).toLocaleString()}</div></td>
        <td>${rate.done}/6 (${rate.pct}%)</td>
        <td>${new Date(prog.updatedAt||info.createdAt).toLocaleString()}</td>
        <td>
          <button class="btn" data-act="view" data-u="${PandaApp.escapeHtml(u)}">${PandaApp.t("查看","View")}</button>
          <button class="btn danger" data-act="reset" data-u="${PandaApp.escapeHtml(u)}">${PandaApp.t("重置","Reset")}</button>
        </td>
      </tr>`);
    });
    html.push(`</tbody></table>`);
    tableDiv.innerHTML = html.join("");
  }

  tableDiv.addEventListener("click", (e)=>{
    const btn = e.target.closest("button");
    if(!btn) return;
    const u = btn.getAttribute("data-u");
    const act = btn.getAttribute("data-act");
    if(act==="view"){
      const prog = PandaApp.getProgress(u);
      const parts = [];
      for(let i=1;i<=6;i++){
        const ch = prog.chapters[i]||{};
        parts.push(`<div class="item">Ch${i}: ${ch.done? "✅":"🕒"} ${ch.codeDigit? " · 🔢 "+ch.codeDigit:""}</div>`);
      }
      PandaApp.showModal(
        PandaApp.t("学生进度","Student progress") + ` · ${PandaApp.escapeHtml(u)}`,
        `<div class="kv">${parts.join("")}</div>`,
        [{text:PandaApp.t("关闭","Close"), kind:"primary", on:()=>PandaApp.hideModal()}]
      );
    }else if(act==="reset"){
      PandaApp.showModal(
        PandaApp.t("确认重置？","Reset?"),
        `<p class="muted">${PandaApp.t("将清空该用户在本机浏览器的进度。","This clears the user's progress stored in this browser.")}</p>`,
        [
          {text:PandaApp.t("取消","Cancel"), on:()=>PandaApp.hideModal()},
          {text:PandaApp.t("重置","Reset"), kind:"danger", on:()=>{
            PandaApp.resetProgress(u);
            PandaApp.hideModal();
            location.reload();
          }}
        ]
      );
    }
  });

  document.getElementById("exportAllBtn").addEventListener("click", ()=>{
    const payload = {
      exportedAt: new Date().toISOString(),
      users,
      progress: Object.fromEntries(Object.keys(users).map(u=>[u, PandaApp.getProgress(u)]))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url;
    a.download="panda-admin-export.json";
    a.click();
    URL.revokeObjectURL(url);
    PandaApp.toast(PandaApp.t("已导出","Exported"), "ok");
  });

  document.getElementById("wipeBtn").addEventListener("click", ()=>{
    PandaApp.showModal(
      PandaApp.t("危险操作","Danger"),
      `<p class="muted">${PandaApp.t("这会清空本机浏览器里保存的所有账号与进度数据。","This wipes ALL accounts and progress stored in this browser.")}</p>`,
      [
        {text:PandaApp.t("取消","Cancel"), on:()=>PandaApp.hideModal()},
        {text:PandaApp.t("清空","Wipe"), kind:"danger", on:()=>{
          localStorage.clear();
          PandaApp.hideModal();
          location.href="index.html";
        }}
      ]
    );
  });

  document.getElementById("backBtn").addEventListener("click", ()=> location.href="dashboard.html");
})();