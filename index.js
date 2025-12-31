(function(){
  PandaApp.mountTopbar();
  PandaApp.renderLang();

  const regCard = document.getElementById("registerCard");
  document.getElementById("goRegister").addEventListener("click", ()=>{ regCard.style.display="block"; });
  document.getElementById("goLogin").addEventListener("click", ()=>{ regCard.style.display="none"; });

  function normalize(u){ return (u||"").trim(); }

  document.getElementById("registerBtn").addEventListener("click", async ()=>{
    const username = normalize(document.getElementById("regUser").value);
    const pass = document.getElementById("regPass").value || "";
    if(username.length < 2){ PandaApp.toast(PandaApp.t("用户名太短","Username too short"), "danger"); return; }
    if(pass.length < 6){ PandaApp.toast(PandaApp.t("密码至少 6 位","Password must be 6+ chars"), "danger"); return; }
    const users = PandaApp.getUsers();
    if(users[username]){ PandaApp.toast(PandaApp.t("用户名已存在","Username already exists"), "danger"); return; }
    const hash = await PandaApp.sha256(pass);
    users[username] = { pwHash: hash, role:"student", createdAt: new Date().toISOString() };
    PandaApp.setUsers(users);
    PandaApp.toast(PandaApp.t("注册成功，可以登录了","Registered! You can log in now."), "ok");
    regCard.style.display="none";
  });

  document.getElementById("loginBtn").addEventListener("click", async ()=>{
    const username = normalize(document.getElementById("loginUser").value);
    const pass = document.getElementById("loginPass").value || "";
    const users = PandaApp.getUsers();

    // admin shortcut: validate against config
    const cfg = (window.PANDA_APP_CONFIG||{});
    if(username === (cfg.ADMIN_USERNAME||"admin")){
      const hash = await PandaApp.sha256(pass);
      if(hash === cfg.ADMIN_PASSWORD_SHA256){
        PandaApp.setSession({username, role:"admin", loginAt: new Date().toISOString()});
        location.href = "dashboard.html";
        return;
      }
      PandaApp.toast(PandaApp.t("管理员账号或密码错误","Invalid admin credentials"), "danger");
      return;
    }

    if(!users[username]){ PandaApp.toast(PandaApp.t("账号不存在，请先注册","No such user. Please register."), "danger"); return; }
    const hash = await PandaApp.sha256(pass);
    if(hash !== users[username].pwHash){ PandaApp.toast(PandaApp.t("密码错误","Wrong password"), "danger"); return; }
    PandaApp.setSession({username, role:"student", loginAt: new Date().toISOString()});
    location.href = "dashboard.html";
  });

  document.getElementById("adminBtn").addEventListener("click", ()=>{
    PandaApp.showModal(
      PandaApp.t("管理员登录","Admin login"),
      `<p class="muted">${PandaApp.t("请输入管理员账号密码。默认账号：admin；默认密码：ChangeMe-2025!（建议你在 config.js 里改掉）",
                                    "Enter admin credentials. Default user: admin; default password: ChangeMe-2025! (change it in config.js)")}</p>`,
      [{text:PandaApp.t("知道了","OK"), kind:"primary", on:()=>PandaApp.hideModal()}]
    );
  });

  // auto redirect if already logged in
  const s = PandaApp.getSession();
  if(s){ location.href = "dashboard.html"; }
})();