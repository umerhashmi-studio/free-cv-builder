// ===== Free CV Builder — vanilla JS, no dependencies =====
(function(){
  "use strict";

  var STORAGE_KEY = "cvpk_resume_v1";

  var state = {
    template: "classic",
    name: "", role: "", email: "", phone: "", city: "", link: "",
    nationality: "", visa: "", photo: "",
    summary: "",
    experience: [],
    education: [],
    skills: "", languages: "",
    certs: [],
    showRefs: true
  };

  function uid(){ return Math.random().toString(36).slice(2,9); }

  function defaultExp(){ return {id:uid(), title:"", company:"", location:"", start:"", end:"", current:false, bullets:""}; }
  function defaultEdu(){ return {id:uid(), degree:"", school:"", location:"", start:"", end:""}; }
  function defaultCert(){ return {id:uid(), name:"", issuer:"", year:""}; }

  // ---------- persistence ----------
  function save(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){ /* storage full or blocked - ignore, still works in-session */ }
  }
  function load(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        Object.assign(state, parsed);
      }
    }catch(e){ /* ignore corrupt data */ }
    if(!state.experience || !state.experience.length) state.experience = [defaultExp()];
    if(!state.education || !state.education.length) state.education = [defaultEdu()];
    if(!state.certs) state.certs = [];
  }

  function esc(s){
    if(!s) return "";
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  function nl2li(s){
    if(!s) return "";
    var lines = String(s).split("\n").map(function(l){return l.trim();}).filter(Boolean);
    if(!lines.length) return "";
    return "<ul>" + lines.map(function(l){return "<li>"+esc(l)+"</li>";}).join("") + "</ul>";
  }

  // ---------- form <-> state wiring ----------
  var simpleFields = [
    ["f-name","name"],["f-role","role"],["f-email","email"],["f-phone","phone"],
    ["f-city","city"],["f-link","link"],["f-nationality","nationality"],["f-visa","visa"],
    ["f-summary","summary"],["f-skills","skills"],["f-languages","languages"]
  ];

  function bindSimpleFields(){
    simpleFields.forEach(function(pair){
      var el = document.getElementById(pair[0]);
      if(!el) return;
      el.value = state[pair[1]] || "";
      el.addEventListener("input", function(){
        state[pair[1]] = el.value;
        save(); render();
      });
    });

    var refsToggle = document.getElementById("f-refsToggle");
    refsToggle.checked = state.showRefs;
    refsToggle.addEventListener("change", function(){
      state.showRefs = refsToggle.checked;
      save(); render();
    });

    var photoDrop = document.getElementById("photoDrop");
    var photoInput = document.getElementById("f-photo");
    var photoPreview = document.getElementById("photoPreview");
    var photoLabel = document.getElementById("photoLabel");
    photoDrop.addEventListener("click", function(){ photoInput.click(); });
    photoInput.addEventListener("change", function(){
      var file = photoInput.files[0];
      if(!file) return;
      if(file.size > 2*1024*1024){ alert("Please choose an image under 2MB."); return; }
      var reader = new FileReader();
      reader.onload = function(e){
        state.photo = e.target.result;
        photoPreview.src = state.photo;
        photoPreview.style.display = "block";
        photoLabel.textContent = "Click to change photo";
        save(); render();
      };
      reader.readAsDataURL(file);
    });
    if(state.photo){
      photoPreview.src = state.photo;
      photoPreview.style.display = "block";
      photoLabel.textContent = "Click to change photo";
    }
  }

  // ---------- accordion ----------
  function bindAccordion(){
    document.querySelectorAll(".accordion-head").forEach(function(head){
      head.addEventListener("click", function(){
        head.parentElement.classList.toggle("open");
      });
    });
  }

  // ---------- template switcher ----------
  function bindTplSwitcher(){
    var chips = document.querySelectorAll(".tpl-chip");
    function paint(){
      chips.forEach(function(c){ c.classList.toggle("active", c.dataset.tpl === state.template); });
      document.getElementById("gulfFieldsWrap").style.display =
        (state.template === "gulf" || state.template === "modern") ? "block" : "none";
    }
    chips.forEach(function(chip){
      chip.addEventListener("click", function(){
        state.template = chip.dataset.tpl;
        save(); paint(); render();
      });
    });
    paint();
  }

  // ---------- repeatable: experience ----------
  function renderExpList(){
    var wrap = document.getElementById("expList");
    wrap.innerHTML = "";
    state.experience.forEach(function(exp, idx){
      var item = document.createElement("div");
      item.className = "repeat-item";
      item.innerHTML =
        '<button class="remove-btn" data-id="'+exp.id+'">✕ remove</button>' +
        '<div class="field-row">' +
          '<div class="field"><label>Job Title</label><input type="text" class="exp-title" value="'+esc(exp.title)+'" placeholder="Marketing Officer"></div>' +
          '<div class="field"><label>Company</label><input type="text" class="exp-company" value="'+esc(exp.company)+'" placeholder="ABC Pvt Ltd"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>City</label><input type="text" class="exp-location" value="'+esc(exp.location)+'" placeholder="Karachi"></div>' +
          '<div class="field"><label>Dates</label><input type="text" class="exp-dates" value="'+esc(exp.start)+(exp.end? " – "+esc(exp.end):"")+'" placeholder="Jan 2022 – Present"></div>' +
        '</div>' +
        '<div class="field"><label>Key responsibilities / achievements <span class="opt">(one per line)</span></label>' +
          '<textarea class="exp-bullets" placeholder="Increased sales by 20% through...">'+esc(exp.bullets)+'</textarea></div>';
      wrap.appendChild(item);

      item.querySelector(".remove-btn").addEventListener("click", function(){
        state.experience = state.experience.filter(function(e){ return e.id !== exp.id; });
        save(); renderExpList(); render();
      });
      item.querySelector(".exp-title").addEventListener("input", function(e){ exp.title = e.target.value; save(); render(); });
      item.querySelector(".exp-company").addEventListener("input", function(e){ exp.company = e.target.value; save(); render(); });
      item.querySelector(".exp-location").addEventListener("input", function(e){ exp.location = e.target.value; save(); render(); });
      item.querySelector(".exp-dates").addEventListener("input", function(e){
        var parts = e.target.value.split("–");
        exp.start = (parts[0]||"").trim();
        exp.end = (parts[1]||"").trim();
        save(); render();
      });
      item.querySelector(".exp-bullets").addEventListener("input", function(e){ exp.bullets = e.target.value; save(); render(); });
    });
  }

  function renderEduList(){
    var wrap = document.getElementById("eduList");
    wrap.innerHTML = "";
    state.education.forEach(function(edu){
      var item = document.createElement("div");
      item.className = "repeat-item";
      item.innerHTML =
        '<button class="remove-btn">✕ remove</button>' +
        '<div class="field-row">' +
          '<div class="field"><label>Degree / Program</label><input type="text" class="edu-degree" value="'+esc(edu.degree)+'" placeholder="BSc Computer Science"></div>' +
          '<div class="field"><label>Institute</label><input type="text" class="edu-school" value="'+esc(edu.school)+'" placeholder="LUMS"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>City</label><input type="text" class="edu-location" value="'+esc(edu.location)+'" placeholder="Lahore"></div>' +
          '<div class="field"><label>Dates</label><input type="text" class="edu-dates" value="'+esc(edu.start)+(edu.end? " – "+esc(edu.end):"")+'" placeholder="2019 – 2023"></div>' +
        '</div>';
      wrap.appendChild(item);
      item.querySelector(".remove-btn").addEventListener("click", function(){
        state.education = state.education.filter(function(e){ return e.id !== edu.id; });
        save(); renderEduList(); render();
      });
      item.querySelector(".edu-degree").addEventListener("input", function(e){ edu.degree = e.target.value; save(); render(); });
      item.querySelector(".edu-school").addEventListener("input", function(e){ edu.school = e.target.value; save(); render(); });
      item.querySelector(".edu-location").addEventListener("input", function(e){ edu.location = e.target.value; save(); render(); });
      item.querySelector(".edu-dates").addEventListener("input", function(e){
        var parts = e.target.value.split("–");
        edu.start = (parts[0]||"").trim();
        edu.end = (parts[1]||"").trim();
        save(); render();
      });
    });
  }

  function renderCertList(){
    var wrap = document.getElementById("certList");
    wrap.innerHTML = "";
    state.certs.forEach(function(cert){
      var item = document.createElement("div");
      item.className = "repeat-item";
      item.innerHTML =
        '<button class="remove-btn">✕ remove</button>' +
        '<div class="field-row">' +
          '<div class="field"><label>Certification</label><input type="text" class="cert-name" value="'+esc(cert.name)+'" placeholder="PMP"></div>' +
          '<div class="field"><label>Issuer / Year</label><input type="text" class="cert-issuer" value="'+esc(cert.issuer)+(cert.year? " – "+esc(cert.year):"")+'" placeholder="PMI – 2024"></div>' +
        '</div>';
      wrap.appendChild(item);
      item.querySelector(".remove-btn").addEventListener("click", function(){
        state.certs = state.certs.filter(function(c){ return c.id !== cert.id; });
        save(); renderCertList(); render();
      });
      item.querySelector(".cert-name").addEventListener("input", function(e){ cert.name = e.target.value; save(); render(); });
      item.querySelector(".cert-issuer").addEventListener("input", function(e){
        var parts = e.target.value.split("–");
        cert.issuer = (parts[0]||"").trim();
        cert.year = (parts[1]||"").trim();
        save(); render();
      });
    });
  }

  function bindAddButtons(){
    document.getElementById("addExp").addEventListener("click", function(){
      state.experience.push(defaultExp()); save(); renderExpList(); render();
    });
    document.getElementById("addEdu").addEventListener("click", function(){
      state.education.push(defaultEdu()); save(); renderEduList(); render();
    });
    document.getElementById("addCert").addEventListener("click", function(){
      state.certs.push(defaultCert()); save(); renderCertList(); render();
    });
  }

  // ---------- resume render ----------
  function dateRange(start,end){
    if(!start && !end) return "";
    if(start && !end) return esc(start);
    if(!start && end) return esc(end);
    return esc(start) + " – " + esc(end);
  }

  function buildContactRow(){
    var bits = [];
    if(state.city) bits.push("📍 "+esc(state.city));
    if(state.phone) bits.push("📱 "+esc(state.phone));
    if(state.email) bits.push("✉ "+esc(state.email));
    if(state.link) bits.push("🔗 "+esc(state.link));
    if(state.template === "gulf"){
      if(state.nationality) bits.push("🌍 "+esc(state.nationality));
      if(state.visa) bits.push("🛂 "+esc(state.visa));
    }
    return bits.join(" &nbsp;|&nbsp; ");
  }

  function skillsHtml(){
    var list = (state.skills||"").split(",").map(function(s){return s.trim();}).filter(Boolean);
    if(!list.length) return "";
    return '<div class="r-section"><h2>Skills</h2><div class="r-skills">' +
      list.map(function(s){return '<span class="r-skill-chip">'+esc(s)+'</span>';}).join("") +
      '</div></div>';
  }

  function languagesHtml(){
    if(!state.languages) return "";
    return '<div class="r-section"><h2>Languages</h2><p class="r-summary">'+esc(state.languages)+'</p></div>';
  }

  function experienceHtml(){
    var valid = state.experience.filter(function(e){ return e.title || e.company; });
    if(!valid.length) return "";
    return '<div class="r-section"><h2>Work Experience</h2>' +
      valid.map(function(e){
        return '<div class="r-item">' +
          '<div class="r-item-head"><span class="r-item-title">'+esc(e.title)+(e.company? ' — '+esc(e.company):'')+'</span>' +
          '<span class="r-item-date">'+dateRange(e.start,e.end)+'</span></div>' +
          (e.location? '<div class="r-item-sub">'+esc(e.location)+'</div>':'') +
          nl2li(e.bullets) +
          '</div>';
      }).join("") + '</div>';
  }

  function educationHtml(){
    var valid = state.education.filter(function(e){ return e.degree || e.school; });
    if(!valid.length) return "";
    return '<div class="r-section"><h2>Education</h2>' +
      valid.map(function(e){
        return '<div class="r-item">' +
          '<div class="r-item-head"><span class="r-item-title">'+esc(e.degree)+'</span>' +
          '<span class="r-item-date">'+dateRange(e.start,e.end)+'</span></div>' +
          '<div class="r-item-sub">'+esc(e.school)+(e.location? ', '+esc(e.location):'')+'</div>' +
          '</div>';
      }).join("") + '</div>';
  }

  function certsHtml(){
    var valid = state.certs.filter(function(c){ return c.name; });
    if(!valid.length) return "";
    return '<div class="r-section"><h2>Certifications</h2>' +
      valid.map(function(c){
        return '<div class="r-item"><div class="r-item-head"><span class="r-item-title">'+esc(c.name)+'</span>' +
          '<span class="r-item-date">'+esc(c.year)+'</span></div>' +
          (c.issuer? '<div class="r-item-sub">'+esc(c.issuer)+'</div>':'') + '</div>';
      }).join("") + '</div>';
  }

  function refsHtml(){
    if(!state.showRefs) return "";
    return '<div class="r-section"><h2>References</h2><p class="r-summary">Available on request.</p></div>';
  }

  function summaryHtml(){
    if(!state.summary) return "";
    return '<div class="r-section"><h2>Summary</h2><p class="r-summary">'+esc(state.summary)+'</p></div>';
  }

  function render(){
    var page = document.getElementById("resumePage");
    page.className = "page tpl-" + state.template;

    var contentBlocks = summaryHtml() + experienceHtml() + educationHtml() + skillsHtml() + languagesHtml() + certsHtml() + refsHtml();

    if(state.template === "modern"){
      page.innerHTML =
        '<div class="sidebar">' +
          (state.photo? '<img class="photo-circle" src="'+state.photo+'">':'') +
          '<div class="r-name">'+esc(state.name||"Your Name")+'</div>' +
          '<div class="r-role">'+esc(state.role||"Target Role")+'</div>' +
          '<div class="r-contact">' +
            (state.phone? '<span>📱 '+esc(state.phone)+'</span>':'') +
            (state.email? '<span>✉ '+esc(state.email)+'</span>':'') +
            (state.city? '<span>📍 '+esc(state.city)+'</span>':'') +
            (state.link? '<span>🔗 '+esc(state.link)+'</span>':'') +
          '</div>' +
          skillsHtml() + languagesHtml() +
        '</div>' +
        '<div class="main">' + summaryHtml() + experienceHtml() + educationHtml() + certsHtml() + refsHtml() + '</div>';
      return;
    }

    if(state.template === "gulf"){
      page.innerHTML =
        '<div class="banner">' +
          (state.photo? '<img src="'+state.photo+'">':'') +
          '<div>' +
            '<div class="r-name">'+esc(state.name||"Your Name")+'</div>' +
            '<div class="r-role">'+esc(state.role||"Target Role")+'</div>' +
            '<div class="r-contact">'+buildContactRow()+'</div>' +
          '</div>' +
        '</div>' +
        '<div class="body">' + summaryHtml() + experienceHtml() + educationHtml() + skillsHtml() + languagesHtml() + certsHtml() + refsHtml() + '</div>';
      return;
    }

    // classic & minimal share the same flat structure
    page.innerHTML =
      '<div class="r-name">'+esc(state.name||"Your Name")+'</div>' +
      '<div class="r-role">'+esc(state.role||"Target Role")+'</div>' +
      '<div class="r-contact">'+buildContactRow()+'</div>' +
      contentBlocks;
  }

  // ---------- export / import / print ----------
  function bindActions(){
    document.getElementById("btnPrint").addEventListener("click", function(){
      awaitingPrint = true;
      window.print();
      // Most browsers block inside print() until the dialog closes; the rest fire
      // "afterprint". Whichever comes first shows the panel, once.
      setTimeout(showNextSteps, 400);
    });
    window.addEventListener("afterprint", showNextSteps);
    document.getElementById("btnExport").addEventListener("click", function(){
      var blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = (state.name? state.name.replace(/\s+/g,"_") : "cv") + "_backup.json";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });
    document.getElementById("btnImport").addEventListener("click", function(){
      document.getElementById("fileImport").click();
    });
    document.getElementById("fileImport").addEventListener("change", function(e){
      var file = e.target.files[0];
      if(!file) return;
      var reader = new FileReader();
      reader.onload = function(ev){
        try{
          var parsed = JSON.parse(ev.target.result);
          Object.assign(state, parsed);
          save();
          location.reload();
        }catch(err){
          alert("That file doesn't look like a valid backup from this builder.");
        }
      };
      reader.readAsText(file);
    });
  }

  // ---------- post-download "next steps" panel ----------
  var awaitingPrint = false;
  var lastFocus = null;

  function showNextSteps(){
    if(!awaitingPrint) return;
    awaitingPrint = false;
    var panel = document.getElementById("nextSteps");
    lastFocus = document.activeElement;
    panel.hidden = false;
    document.getElementById("nextStepsClose").focus();
  }
  function hideNextSteps(){
    document.getElementById("nextSteps").hidden = true;
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function bindNextSteps(){
    var panel = document.getElementById("nextSteps");
    var preview = /[?&]preview=1(&|$)/.test(location.search);
    if(preview) document.body.classList.add("preview-mode");

    // Offers still pointing at "#" are placeholders: never shown to real visitors.
    var live = 0;
    Array.prototype.forEach.call(panel.querySelectorAll(".offer-card"), function(card){
      var placeholder = card.getAttribute("href") === "#";
      if(placeholder){
        card.addEventListener("click", function(e){ e.preventDefault(); });
        if(!preview){ card.hidden = true; return; }
      }
      live++;
    });
    if(!live) document.getElementById("offers").hidden = true;

    document.getElementById("nextStepsClose").addEventListener("click", hideNextSteps);
    document.getElementById("nextStepsDone").addEventListener("click", hideNextSteps);
    document.getElementById("nextStepsBackup").addEventListener("click", function(){
      document.getElementById("btnExport").click();
    });
    panel.addEventListener("click", function(e){ if(e.target === panel) hideNextSteps(); });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && !panel.hidden) hideNextSteps();
    });
  }

  // ---------- init ----------
  function init(){
    load();
    bindSimpleFields();
    bindAccordion();
    bindTplSwitcher();
    bindAddButtons();
    bindActions();
    bindNextSteps();
    renderExpList();
    renderEduList();
    renderCertList();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
