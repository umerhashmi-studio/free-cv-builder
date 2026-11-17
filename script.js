// ===== Free CV Builder — vanilla JS, no dependencies =====
(function(){
  "use strict";

  var STORAGE_KEY = "cvpk_resume_v1";

  // ---------- template registry ----------
  // layout: "flat" (header + sections), "sidebar" or "banner".
  // photo: shows the uploaded photo. personal: shows nationality / visa.
  // icons: contact line uses symbols (off for ATS-first templates).
  var TEMPLATES = {
    classic:      {name:"Classic",        layout:"flat",    ats:true,  photo:false, personal:false, icons:false, accent:"#095f44", desc:"Single column, clear headings. The safest choice for online applications."},
    professional: {name:"Professional",   layout:"flat",    ats:true,  photo:false, personal:false, icons:false, accent:"#1f3a68", desc:"Coloured top bar and marked headings. Corporate, finance, operations."},
    executive:    {name:"Executive",      layout:"flat",    ats:true,  photo:false, personal:false, icons:false, accent:"#1f2937", desc:"Serif type, centred header. Senior and management roles."},
    minimal:      {name:"Minimal",        layout:"flat",    ats:true,  photo:false, personal:false, icons:false, accent:"#15202b", desc:"No colour, lots of white space. Lets the content speak."},
    compact:      {name:"Compact",        layout:"flat",    ats:true,  photo:false, personal:false, icons:false, accent:"#0f766e", desc:"Tighter spacing to fit more on one page."},
    elegant:      {name:"Elegant",        layout:"flat",    ats:true,  photo:false, personal:false, icons:false, accent:"#8a6d2f", desc:"Classic serif with centred section titles. Law, consulting, hospitality."},
    tech:         {name:"Developer",      layout:"flat",    ats:true,  photo:false, personal:false, icons:false, accent:"#5b3b8c", desc:"Code-style headings and skill tags. Software and data roles."},
    timeline:     {name:"Timeline",       layout:"flat",    ats:false, photo:false, personal:false, icons:false, accent:"#2563eb", desc:"Experience on a vertical timeline. Easy to scan career progression."},
    creative:     {name:"Creative",       layout:"flat",    ats:false, photo:true,  personal:false, icons:true,  accent:"#8a1c3b", desc:"Colour stripe and optional photo. Design, marketing, media."},
    modern:       {name:"Modern Sidebar", layout:"sidebar", ats:false, photo:true,  personal:false, icons:true,  accent:"#095f44", desc:"Two columns with a coloured sidebar and optional photo."},
    euro:         {name:"Europe",         layout:"flat",    ats:true,  photo:true,  personal:true,  icons:false, accent:"#1d3f8f", desc:"Label column on the left, like European CVs. Photo and nationality optional."},
    gulf:         {name:"Gulf CV",        layout:"banner",  ats:false, photo:true,  personal:true,  icons:true,  accent:"#1a2233", desc:"Photo banner with nationality and visa status. UAE, Saudi Arabia, Qatar."}
  };
  var ACCENTS = ["", "#095f44", "#1f3a68", "#2563eb", "#0f766e", "#8a1c3b", "#5b3b8c", "#c2410c", "#333a45", "#8a6d2f"];

  var state = {
    template: "classic", accent: "", paper: "a4",
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

  // Example CV, used by "Fill with example" and for the template thumbnails.
  var SAMPLE_PHOTO = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#cfd6e2"/>' +
    '<circle cx="60" cy="47" r="22" fill="#8c97ab"/><path d="M18 120c4-26 22-40 42-40s38 14 42 40z" fill="#8c97ab"/></svg>');
  function sampleData(){
    return {
      name:"Sara Malik", role:"Marketing Manager",
      email:"sara.malik@email.com", phone:"+971 50 123 4567", city:"Dubai, UAE", link:"linkedin.com/in/saramalik",
      nationality:"Pakistani", visa:"UAE residence visa (transferable)", photo:SAMPLE_PHOTO,
      summary:"Marketing manager with 7 years of experience in consumer brands across the UAE and Pakistan. Led campaigns that grew online sales 3x and managed annual budgets up to $1.2M.",
      experience:[
        {id:uid(), title:"Marketing Manager", company:"Horizon Retail Group", location:"Dubai, UAE", start:"Mar 2022", end:"Present",
         bullets:"Lead a team of 6 across brand, digital and trade marketing\nGrew e-commerce revenue from $2.1M to $6.4M in two years\nCut paid media cost per acquisition by 28% by moving budget to search and CRM"},
        {id:uid(), title:"Senior Brand Executive", company:"Crescent Foods", location:"Lahore, Pakistan", start:"Jan 2019", end:"Feb 2022",
         bullets:"Launched 4 new product lines, two of which reached category top 3 within a year\nManaged agency relationships and a $400K annual media budget"},
        {id:uid(), title:"Marketing Executive", company:"BrightPath Telecom", location:"Lahore, Pakistan", start:"Jul 2017", end:"Dec 2018",
         bullets:"Ran social media for a 2M-follower brand page\nCoordinated 30+ retail activations per quarter"}
      ],
      education:[
        {id:uid(), degree:"MBA, Marketing", school:"Lahore University of Management Sciences", location:"Lahore", start:"2015", end:"2017"},
        {id:uid(), degree:"BBA (Hons)", school:"University of the Punjab", location:"Lahore", start:"2011", end:"2015"}
      ],
      skills:"Brand strategy, Digital marketing, Google Ads, Meta Ads, CRM, Budget management, Team leadership, Market research",
      languages:"English (Fluent), Urdu (Native), Arabic (Basic)",
      certs:[{id:uid(), name:"Google Ads Search Certification", issuer:"Google", year:"2024"}],
      showRefs:true
    };
  }

  // ---------- persistence ----------
  var noSave = false;
  function save(){
    if(noSave) return;
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
    if(!TEMPLATES[state.template]) state.template = "classic";
    if(!state.experience || !state.experience.length) state.experience = [defaultExp()];
    if(!state.education || !state.education.length) state.education = [defaultEdu()];
    if(!state.certs) state.certs = [];
    // ?template=executive (links from the templates page) and ?sample=1 (thumbnails)
    var q = new URLSearchParams(location.search);
    if(TEMPLATES[q.get("template")]) state.template = q.get("template");
    if(q.get("sample") === "1"){ Object.assign(state, sampleData()); state.accent = ""; noSave = true; }
  }

  function esc(s){
    if(!s) return "";
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
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

  function fillSimpleFields(){
    simpleFields.forEach(function(pair){
      var el = document.getElementById(pair[0]);
      if(el) el.value = state[pair[1]] || "";
    });
    document.getElementById("f-refsToggle").checked = state.showRefs;
    paintPhoto();
  }

  function paintPhoto(){
    var photoPreview = document.getElementById("photoPreview");
    var photoLabel = document.getElementById("photoLabel");
    var removeBtn = document.getElementById("photoRemove");
    photoPreview.style.display = state.photo ? "block" : "none";
    if(state.photo) photoPreview.src = state.photo;
    photoLabel.textContent = state.photo ? "Click to change photo" : "Click to upload a passport-style photo";
    removeBtn.hidden = !state.photo;
  }

  function bindSimpleFields(){
    simpleFields.forEach(function(pair){
      var el = document.getElementById(pair[0]);
      if(!el) return;
      el.addEventListener("input", function(){
        state[pair[1]] = el.value;
        save(); render();
      });
    });

    var refsToggle = document.getElementById("f-refsToggle");
    refsToggle.addEventListener("change", function(){
      state.showRefs = refsToggle.checked;
      save(); render();
    });

    var photoDrop = document.getElementById("photoDrop");
    var photoInput = document.getElementById("f-photo");
    photoDrop.addEventListener("click", function(){ photoInput.click(); });
    photoDrop.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); photoInput.click(); } });
    photoInput.addEventListener("change", function(){
      var file = photoInput.files[0];
      if(!file) return;
      if(file.size > 2*1024*1024){ alert("Please choose an image under 2MB."); return; }
      var reader = new FileReader();
      reader.onload = function(e){
        state.photo = e.target.result;
        save(); paintPhoto(); render();
      };
      reader.readAsDataURL(file);
    });
    document.getElementById("photoRemove").addEventListener("click", function(){
      state.photo = ""; photoInput.value = "";
      save(); paintPhoto(); render();
    });
    fillSimpleFields();
  }

  // ---------- accordion ----------
  function bindAccordion(){
    document.querySelectorAll(".accordion-head").forEach(function(head){
      head.setAttribute("role","button");
      head.setAttribute("tabindex","0");
      function toggle(){
        head.parentElement.classList.toggle("open");
        head.setAttribute("aria-expanded", head.parentElement.classList.contains("open"));
      }
      head.setAttribute("aria-expanded", head.parentElement.classList.contains("open"));
      head.addEventListener("click", toggle);
      head.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); toggle(); } });
    });
  }

  // ---------- design controls: template gallery, accent colour, paper size ----------
  function paintDesign(){
    var t = TEMPLATES[state.template];
    document.getElementById("tplCurrentName").textContent = t.name;
    document.getElementById("tplCurrentThumb").src = "assets/templates/" + state.template + ".jpg";
    document.getElementById("tplCurrentThumb").alt = t.name + " template";
    document.getElementById("tplCurrentTags").innerHTML = tagsHtml(t);
    document.querySelectorAll(".tpl-option").forEach(function(o){
      var on = o.dataset.tpl === state.template;
      o.classList.toggle("active", on);
      o.setAttribute("aria-pressed", on);
    });
    document.querySelectorAll(".swatch-btn").forEach(function(b){
      var on = (b.dataset.accent || "") === (state.accent || "");
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", on);
    });
    document.getElementById("paperSize").value = state.paper;
    document.getElementById("photoNote").textContent = t.photo
      ? "The " + t.name + " template shows your photo."
      : "The " + t.name + " template does not show a photo. Photo templates: Creative, Modern Sidebar, Europe, Gulf CV.";
    document.getElementById("personalNote").textContent = t.personal
      ? "Shown on the " + t.name + " template."
      : "Shown only on the Europe and Gulf CV templates.";
    document.getElementById("pageSizeRule").textContent =
      "@page{size:" + (state.paper === "letter" ? "letter" : "A4") + ";margin:0;}";
    document.getElementById("previewLabel").textContent =
      "Live preview — " + (state.paper === "letter" ? "US Letter" : "A4");
  }

  function tagsHtml(t){
    return (t.ats ? '<span class="tag tag-ats">ATS-friendly</span>' : '<span class="tag">Designed</span>') +
      (t.photo ? '<span class="tag">Photo</span>' : '');
  }

  function buildGallery(){
    var grid = document.getElementById("tplGrid");
    grid.innerHTML = Object.keys(TEMPLATES).map(function(id){
      var t = TEMPLATES[id];
      return '<button type="button" class="tpl-option" data-tpl="'+id+'">' +
        '<img src="assets/templates/'+id+'.jpg" alt="'+esc(t.name)+' resume template" width="397" height="562" loading="lazy">' +
        '<b>'+esc(t.name)+'</b><span class="tpl-tags">'+tagsHtml(t)+'</span>' +
        '<span class="tpl-desc">'+esc(t.desc)+'</span></button>';
    }).join("");

    var modal = document.getElementById("tplModal");
    var lastFocus = null;
    function open(){
      lastFocus = document.activeElement;
      modal.hidden = false;
      var active = grid.querySelector(".tpl-option.active") || grid.querySelector(".tpl-option");
      active.focus();
    }
    function close(){
      modal.hidden = true;
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.getElementById("tplOpen").addEventListener("click", open);
    document.getElementById("tplClose").addEventListener("click", close);
    modal.addEventListener("click", function(e){ if(e.target === modal) close(); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !modal.hidden) close(); });
    grid.querySelectorAll(".tpl-option").forEach(function(o){
      o.addEventListener("click", function(){
        state.template = o.dataset.tpl;
        save(); paintDesign(); render(); close();
      });
    });

    var sw = document.getElementById("swatches");
    sw.innerHTML = ACCENTS.map(function(c){
      return c
        ? '<button type="button" class="swatch-btn" data-accent="'+c+'" style="--sw:'+c+'" aria-label="Colour '+c+'"></button>'
        : '<button type="button" class="swatch-btn swatch-default" data-accent="" aria-label="Template default colour" title="Template default">A</button>';
    }).join("");
    sw.querySelectorAll(".swatch-btn").forEach(function(b){
      b.addEventListener("click", function(){
        state.accent = b.dataset.accent || "";
        save(); paintDesign(); render();
      });
    });

    document.getElementById("paperSize").addEventListener("change", function(e){
      state.paper = e.target.value === "letter" ? "letter" : "a4";
      save(); paintDesign(); render();
    });

    document.getElementById("btnSample").addEventListener("click", function(){
      var hasData = state.name || state.summary || state.experience.some(function(x){ return x.title || x.company; });
      if(hasData && !confirm("Replace what you have typed with an example CV? Export a backup first if you want to keep it.")) return;
      var keep = {template:state.template, accent:state.accent, paper:state.paper};
      Object.assign(state, sampleData(), keep);
      save(); fillSimpleFields(); renderExpList(); renderEduList(); renderCertList(); render();
    });
    document.getElementById("btnClear").addEventListener("click", function(){
      if(!confirm("Clear every field and start a blank CV? This cannot be undone unless you exported a backup.")) return;
      Object.assign(state, {name:"",role:"",email:"",phone:"",city:"",link:"",nationality:"",visa:"",photo:"",summary:"",
        skills:"",languages:"",experience:[defaultExp()],education:[defaultEdu()],certs:[],showRefs:true});
      save(); fillSimpleFields(); renderExpList(); renderEduList(); renderCertList(); render();
    });
    paintDesign();
  }

  // ---------- repeatable: experience ----------
  function renderExpList(){
    var wrap = document.getElementById("expList");
    wrap.innerHTML = "";
    state.experience.forEach(function(exp){
      var item = document.createElement("div");
      item.className = "repeat-item";
      item.innerHTML =
        '<button class="remove-btn" type="button">✕ remove</button>' +
        '<div class="field-row">' +
          '<div class="field"><label>Job Title</label><input type="text" class="exp-title" value="'+esc(exp.title)+'" placeholder="Marketing Officer"></div>' +
          '<div class="field"><label>Company</label><input type="text" class="exp-company" value="'+esc(exp.company)+'" placeholder="ABC Ltd"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>City</label><input type="text" class="exp-location" value="'+esc(exp.location)+'" placeholder="London"></div>' +
          '<div class="field"><label>Dates</label><input type="text" class="exp-dates" value="'+esc(exp.start)+(exp.end? " – "+esc(exp.end):"")+'" placeholder="Jan 2022 – Present"></div>' +
        '</div>' +
        '<div class="field"><label>Key achievements <span class="opt">(one per line)</span></label>' +
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
        var parts = e.target.value.split(/[–-]/);
        exp.start = (parts[0]||"").trim();
        exp.end = parts.slice(1).join("-").trim();
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
        '<button class="remove-btn" type="button">✕ remove</button>' +
        '<div class="field-row">' +
          '<div class="field"><label>Degree / Program</label><input type="text" class="edu-degree" value="'+esc(edu.degree)+'" placeholder="BSc Computer Science"></div>' +
          '<div class="field"><label>Institution</label><input type="text" class="edu-school" value="'+esc(edu.school)+'" placeholder="University of Manchester"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>City</label><input type="text" class="edu-location" value="'+esc(edu.location)+'" placeholder="Manchester"></div>' +
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
        var parts = e.target.value.split(/[–-]/);
        edu.start = (parts[0]||"").trim();
        edu.end = parts.slice(1).join("-").trim();
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
        '<button class="remove-btn" type="button">✕ remove</button>' +
        '<div class="field-row">' +
          '<div class="field"><label>Certification</label><input type="text" class="cert-name" value="'+esc(cert.name)+'" placeholder="PMP"></div>' +
          '<div class="field"><label>Issuer – Year</label><input type="text" class="cert-issuer" value="'+esc(cert.issuer)+(cert.year? " – "+esc(cert.year):"")+'" placeholder="PMI – 2024"></div>' +
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

  function contactHtml(t, vertical){
    var items = [
      ["📍", state.city], ["📱", state.phone], ["✉", state.email], ["🔗", state.link]
    ];
    if(t.personal && t.layout === "banner"){
      items.push(["🌍", state.nationality]); items.push(["🛂", state.visa]);
    }
    items = items.filter(function(i){ return i[1]; });
    if(t.icons){
      return items.map(function(i){ return '<span><i aria-hidden="true">'+i[0]+'</i> '+esc(i[1])+'</span>'; }).join("");
    }
    return items.map(function(i){ return '<span>'+esc(i[1])+'</span>'; }).join(vertical ? "" : '<span class="r-sep">|</span>');
  }

  function nameRole(){
    var placeholder = !state.name;
    return '<div class="r-name">'+esc(state.name || "Your Name")+'</div>' +
      ((state.role || placeholder) ? '<div class="r-role">'+esc(state.role || "Target Role")+'</div>' : '');
  }

  function sec(key, title, inner){
    if(!inner) return "";
    return '<section class="r-section rs-'+key+'"><h2>'+title+'</h2><div class="r-body">'+inner+'</div></section>';
  }

  function summaryHtml(){ return state.summary ? sec("summary","Summary",'<p class="r-summary">'+esc(state.summary)+'</p>') : ""; }

  function experienceHtml(){
    var valid = state.experience.filter(function(e){ return e.title || e.company; });
    if(!valid.length) return "";
    return sec("experience","Work Experience", valid.map(function(e){
      return '<div class="r-item">' +
        '<div class="r-item-head"><span class="r-item-title">'+esc(e.title)+(e.company? '<span class="r-at"> — '+esc(e.company)+'</span>':'')+'</span>' +
        '<span class="r-item-date">'+dateRange(e.start,e.end)+'</span></div>' +
        (e.location? '<div class="r-item-sub">'+esc(e.location)+'</div>':'') +
        nl2li(e.bullets) +
        '</div>';
    }).join(""));
  }

  function educationHtml(){
    var valid = state.education.filter(function(e){ return e.degree || e.school; });
    if(!valid.length) return "";
    return sec("education","Education", valid.map(function(e){
      return '<div class="r-item">' +
        '<div class="r-item-head"><span class="r-item-title">'+esc(e.degree)+'</span>' +
        '<span class="r-item-date">'+dateRange(e.start,e.end)+'</span></div>' +
        '<div class="r-item-sub">'+esc(e.school)+(e.location? ', '+esc(e.location):'')+'</div>' +
        '</div>';
    }).join(""));
  }

  function skillsHtml(){
    var list = (state.skills||"").split(",").map(function(s){return s.trim();}).filter(Boolean);
    if(!list.length) return "";
    return sec("skills","Skills",'<div class="r-skills">' +
      list.map(function(s){return '<span class="r-skill-chip">'+esc(s)+'</span>';}).join("") + '</div>');
  }

  function languagesHtml(){ return state.languages ? sec("languages","Languages",'<p class="r-summary">'+esc(state.languages)+'</p>') : ""; }

  function certsHtml(){
    var valid = state.certs.filter(function(c){ return c.name; });
    if(!valid.length) return "";
    return sec("certs","Certifications", valid.map(function(c){
      return '<div class="r-item"><div class="r-item-head"><span class="r-item-title">'+esc(c.name)+'</span>' +
        '<span class="r-item-date">'+esc(c.year)+'</span></div>' +
        (c.issuer? '<div class="r-item-sub">'+esc(c.issuer)+'</div>':'') + '</div>';
    }).join(""));
  }

  function personalHtml(){
    var rows = [["Nationality", state.nationality], ["Visa status", state.visa]].filter(function(r){ return r[1]; });
    if(!rows.length) return "";
    return sec("personal","Personal Details",'<dl class="r-dl">' +
      rows.map(function(r){ return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>'; }).join("") + '</dl>');
  }

  function refsHtml(){ return state.showRefs ? sec("refs","References",'<p class="r-summary">Available on request.</p>') : ""; }

  function photoHtml(t, cls){
    return (t.photo && state.photo) ? '<img class="'+cls+'" src="'+esc(state.photo)+'" alt="">' : "";
  }

  function render(){
    var t = TEMPLATES[state.template];
    var page = document.getElementById("resumePage");
    page.className = "page tpl-" + state.template + (state.paper === "letter" ? " paper-letter" : "");
    page.style.setProperty("--acc", state.accent || t.accent);

    if(t.layout === "sidebar"){
      page.innerHTML =
        '<aside class="sidebar">' + photoHtml(t, "photo-circle") + nameRole() +
          '<div class="r-contact r-contact-v">'+contactHtml(t, true)+'</div>' +
          skillsHtml() + languagesHtml() + personalHtml() +
        '</aside>' +
        '<div class="main">' + summaryHtml() + experienceHtml() + educationHtml() + certsHtml() + refsHtml() + '</div>';
      return;
    }

    if(t.layout === "banner"){
      page.innerHTML =
        '<header class="banner">' + photoHtml(t, "banner-photo") +
          '<div>' + nameRole() + '<div class="r-contact">'+contactHtml(t)+'</div></div>' +
        '</header>' +
        '<div class="body">' + summaryHtml() + experienceHtml() + educationHtml() + skillsHtml() +
          languagesHtml() + certsHtml() + refsHtml() + '</div>';
      return;
    }

    page.innerHTML =
      '<header class="r-header">' +
        '<div class="r-head-text">' + nameRole() + '<div class="r-contact">'+contactHtml(t)+'</div></div>' +
        photoHtml(t, "r-photo") +
      '</header>' +
      (t.personal ? personalHtml() : "") +
      summaryHtml() + experienceHtml() + educationHtml() + skillsHtml() + languagesHtml() + certsHtml() + refsHtml();
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
    buildGallery();
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
