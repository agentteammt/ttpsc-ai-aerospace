/* TT PSC KI Framework — Choreografie (Blueprint §0) */
(function(){
"use strict";
const $=(s,c)=>(c||document).querySelector(s), $$=(s,c)=>Array.from((c||document).querySelectorAll(s));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const seg=(p,a,b)=>clamp((p-a)/(b-a),0,1);
const easeOut=t=>1-Math.pow(1-t,3);
const t0=performance.now();
/* ---- QA flags & modes ---- */
const flags=(sessionStorage.getItem("ttpsc_ki_qa_flags")||"").split(",").map(s=>s.trim()).filter(Boolean);
const has=f=>flags.includes(f);
const mqReduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const reduced=mqReduced||has("reduced");
const finePointer=matchMedia("(pointer: fine)").matches&&!has("touch");
const wide=()=>innerWidth>=900;
const scrubOn=finePointer&&!reduced&&wide();
document.body.classList.add(scrubOn?"scrub":"static");
if(reduced)document.body.classList.add("nofx");
if(has("weak"))document.body.classList.add("weak");
/* ---- Perf report ---- */
const perf={};
try{new PerformanceObserver(l=>l.getEntries().forEach(e=>{perf[e.name]=Math.round(e.startTime);console.log("[perf] "+e.name+": "+Math.round(e.startTime)+"ms")})).observe({type:"paint",buffered:true});}catch(e){}
addEventListener("DOMContentLoaded",()=>{perf.dcl=Math.round(performance.now());console.log("[perf] DOMContentLoaded: "+perf.dcl+"ms")});
/* ---- Placeholder links ---- */
document.addEventListener("click",e=>{const a=e.target.closest('a[href="#"]');if(a)e.preventDefault();});
/* ---- Reveal (das eine Muster) ---- */
function initReveal(){
  const els=$$("[data-reveal]").filter(el=>!(scrubOn&&el.closest("[data-scrub-inner]")));
  if(reduced){return;}
  els.forEach(el=>{el.classList.add("pre");const d=el.getAttribute("data-reveal-delay");if(d)el.style.transitionDelay=d+"ms";});
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{if(!en.isIntersecting)return;const el=en.target;io.unobserve(el);
      el.classList.add("in");
      el.addEventListener("transitionend",function h(ev){if(ev.propertyName!=="opacity")return;el.removeEventListener("transitionend",h);el.classList.remove("pre","in");el.style.transitionDelay="";el.style.willChange="";});
      setTimeout(()=>{el.classList.remove("pre","in");el.style.transitionDelay="";},1400);
    });
  },{threshold:.12,rootMargin:"0px 0px -8% 0px"});
  els.forEach(el=>io.observe(el));
}
initReveal();
/* ---- SmoothWheel (Lerp 0.14) ---- */
let swTarget=scrollY,swCur=scrollY,swActive=false;
const smoothOK=scrubOn&&!has("nosmooth");
if(smoothOK){
  addEventListener("wheel",e=>{
    if(e.ctrlKey||e.shiftKey)return;
    if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    if(e.target.closest("iframe,video,[data-native-scroll]"))return;
    e.preventDefault();
    const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
    if(!swActive){swTarget=swCur=scrollY;}
    swTarget=clamp(swTarget+d,0,document.documentElement.scrollHeight-innerHeight);
    swActive=true;
  },{passive:false});
  addEventListener("scroll",()=>{if(!swActive){swTarget=swCur=scrollY;}else if(Math.abs(scrollY-swCur)>2){swTarget=swCur=scrollY;}},{passive:true});
}
/* ---- Scrub controllers ---- */
const ctrls=[];
function addCtrl(wrapSel,fn){const w=$(wrapSel);if(w)ctrls.push({w,fn});}
function progressOf(w){const r=w.getBoundingClientRect();const len=r.height-innerHeight;if(len<=0)return 0;return clamp(-r.top/len,0,1);}
/* Hero: 120vh Scrub — Badge-Auflösung + Schwebe-Loop */
const badge=$(".hero-badge");
let heroP=0;
if(scrubOn)addCtrl(".hero-wrap",p=>{heroP=p;});
/* S2: 3 Phasen — Head → Tabelle → Banner */
const s2Probs=$$(".s2-cell.prob"),s2Sols=$$(".s2-cell.sol"),s2Banner=$(".s2-banner"),s2Head=$(".s2-head"),s2Cols=$(".s2-cols");
function setFT(el,o,y){el.style.opacity=o;el.style.transform=y?`translateY(${y}px)`:"none";}
if(scrubOn){
  [...s2Probs,...s2Sols].forEach(el=>setFT(el,0,16));
  s2Cols.style.opacity=0;setFT(s2Banner,0,24);
  const s2W=$(".s2-wrap");
  addCtrl(".s2-wrap",p=>{
    const rt=s2W.getBoundingClientRect().top;
    const hIn=easeOut(clamp((innerHeight-140-rt)/260,0,1)),hOut=1-easeOut(seg(p,.06,.14));
    s2Head.style.opacity=Math.min(hIn,hOut);
    s2Head.style.transform=`translateY(${-24*easeOut(seg(p,.06,.14))}px)`;
    const cIn=easeOut(seg(p,.12,.20)),cOut=1-easeOut(seg(p,.60,.70));
    s2Cols.style.opacity=Math.min(cIn,cOut);
    for(let i=0;i<4;i++){
      const b0=.16+i*.085,b1=b0+.085,bp=seg(p,b0,b1);
      const eo=easeOut(seg(bp,0,.5));setFT(s2Probs[i],eo,16*(1-eo));
      const es=easeOut(seg(bp,.3,.85));setFT(s2Sols[i],es,16*(1-es));
    }
    const eb=easeOut(seg(p,.78,.90));setFT(s2Banner,eb,24*(1-eb));
  });
}
/* S4: 460vh — Beat0 70 / Fahrt 330 (Ruhezonen 20vh) / Abschluss 60 */
const s4Track=$(".s4-track"),s4Intro=$(".s4-intro"),s4Final=$(".s4-final");
const s4Pts=$$(".scene-humans .s4-list li"),s4Chips=$$(".phase-chip"),s4Docks=$$(".dock"),s4Eco=$$(".eco-chips span"),s4CHead=$(".scene-circle .scenehead"),s4CImg=$(".s4-circle>img");
if(scrubOn){
  [...s4Pts,...s4Docks,...s4Eco].forEach(el=>setFT(el,0,14));
  s4Chips.forEach(el=>{el.style.opacity=0;});
  setFT(s4CHead,0,40);s4CImg.style.opacity=0;
  setFT(s4Final,0,24);
  addCtrl(".s4-wrap",p=>{
    const B0=70/460,F1=400/460;
    /* Intro */
    const iIn=easeOut(seg(p,0,.04)),iOut=1-easeOut(seg(p,B0*.75,B0*1.05));
    s4Intro.style.opacity=Math.min(iIn,iOut);
    s4Intro.style.transform=`translateY(${-30*easeOut(seg(p,B0*.75,B0*1.05))}px)`;
    s4Intro.style.pointerEvents=p>B0?"none":"";
    /* Fahrt: dwell/move-Fenster */
    const f=seg(p,B0,F1);
    let x;
    if(f<.28)x=0;else if(f<.42)x=easeOut(seg(f,.28,.42))*-100;
    else if(f<.62)x=-100;else if(f<.74)x=-100-easeOut(seg(f,.62,.74))*100;else x=-200;
    s4Track.style.transform=`translateX(${x}vw)`;
    const tIn=easeOut(seg(p,B0*.8,B0*1.15));
    s4Track.style.opacity=tIn;
    /* Szene 1: 5 Punkte in dwell1 */
    s4Pts.forEach((el,i)=>{const e=easeOut(seg(f,.02+i*.035,.10+i*.035));setFT(el,e,14*(1-e));});
    /* Szene 2: Head startet in Bildschirmmitte, Kreis + Phasen blenden gemeinsam ein */
    const eh=easeOut(seg(f,.30,.42));setFT(s4CHead,eh,innerHeight*.28*(1-eh));
    s4CImg.style.opacity=easeOut(seg(f,.38,.50));
    s4Chips.forEach((el,i)=>{const e=easeOut(seg(f,.40+i*.012,.46+i*.012));el.style.opacity=e;});
    s4Docks.forEach((el,i)=>{const e=easeOut(seg(f,.46+i*.012,.51+i*.012));setFT(el,e,10*(1-e));});
    /* Szene 3 */
    s4Eco.forEach((el,i)=>{const e=easeOut(seg(f,.75+i*.02,.81+i*.02));setFT(el,e,10*(1-e));});
    /* Abschluss */
    const fe=easeOut(seg(p,F1,.97));setFT(s4Final,fe,24*(1-fe));
  });
}
/* S5: 230vh — Counter / Boxen / Datenleiste */
const kpiNum=$(".kpi .num"),kpiBox=$(".kpi"),ucB=$(".uc-box.before"),ucA=$(".uc-box.after"),s5Data=$(".s5-data p");
if(scrubOn&&kpiNum){
  ucB.style.opacity=0;ucA.style.opacity=0;s5Data.style.opacity=0;
  addCtrl(".s5-wrap",p=>{
    const cnt=Math.round(1000*seg(p,0,.12));
    kpiNum.textContent=cnt.toLocaleString("de-DE")+"+";
    const sc=1.5-.5*easeOut(seg(p,.14,.26));
    kpiBox.style.transform=`scale(${sc})`;
    const eB=easeOut(seg(p,.18,.40));
    ucB.style.opacity=eB;ucB.style.transform=`translateX(${-40*(1-eB)}px)`;
    ucA.style.opacity=eB;ucA.style.transform=`translateX(${40*(1-eB)}px)`;
    const eD=easeOut(seg(p,.50,.70));
    s5Data.style.opacity=eD;s5Data.style.transform=`translateY(${24*(1-eD)}px)`;
  });
}
/* S7: Stacked Cards — Vorgänger scale .96 */
const roleCards=$$(".role-card");
if(scrubOn)roleCards.forEach((c,i)=>{c.style.top=`calc(clamp(72px,10vh,116px) + ${i*24}px)`;});
function stackUpdate(){
  if(!scrubOn)return;
  for(let i=0;i<roleCards.length-1;i++){
    const a=roleCards[i].getBoundingClientRect(),b=roleCards[i+1].getBoundingClientRect();
    const q=clamp(1-(b.top-a.top-24)/320,0,1);
    roleCards[i].style.transform=`scale(${1-.04*q})`;
    roleCards[i].style.opacity=1-.3*q;
  }
}
/* S8: Roadmap-Linie + Horizontalfahrt (4 sichtbar → 6) */
const rmPath=$("#rm-line"),steps=$$(".step"),rmTrack=$(".rm-track"),s8w=$(".s8-wrap");
let rmLen=0;
if(rmPath){rmLen=rmPath.getTotalLength();rmPath.style.strokeDasharray=rmLen;rmPath.style.strokeDashoffset=scrubOn?rmLen:0;}
function roadmapUpdate(){
  if(!rmPath||!scrubOn)return;
  const p=progressOf(s8w);
  rmPath.style.strokeDashoffset=rmLen*(1-easeOut(seg(p,.04,.85)));
  [.06,.14,.22,.30,.56,.74].forEach((th,i)=>{if(p>=th)steps[i].classList.add("in");});
  rmTrack.style.transform=`translateX(${(-easeOut(seg(p,.4,.92))*100/3).toFixed(3)}%)`;
}
/* ---- Counters (S6 + S5 statisch) ---- */
function animCount(el,target,suffix,dur,delay){
  if(reduced){el.textContent=target.toLocaleString("de-DE")+suffix;return;}
  const st=performance.now()+delay;
  function tick(now){const t=clamp((now-st)/dur,0,1);if(t<=0){requestAnimationFrame(tick);return;}
    el.textContent=Math.round(target*easeOut(t)).toLocaleString("de-DE")+suffix;
    if(t<1)requestAnimationFrame(tick);}
  requestAnimationFrame(tick);
}
const cio=new IntersectionObserver(es=>{es.forEach(en=>{if(!en.isIntersecting)return;cio.unobserve(en.target);
  const el=en.target;animCount(el,+el.dataset.count,el.dataset.suffix||"+",1200,+(el.dataset.start||0));});},{threshold:.4});
$$("[data-count]").forEach(el=>cio.observe(el));
const bio=new IntersectionObserver(es=>{es.forEach(en=>{if(!en.isIntersecting)return;bio.unobserve(en.target);const el=en.target;setTimeout(()=>{el.style.width=el.dataset.w;},150);});},{threshold:.5});
$$(".fill[data-w]").forEach(el=>bio.observe(el));
if(!scrubOn&&kpiNum){const kio=new IntersectionObserver(es=>{es.forEach(en=>{if(!en.isIntersecting)return;kio.unobserve(en.target);animCount(kpiNum,1000,"+",1200,0);});},{threshold:.4});kio.observe(kpiNum);}
/* ---- Hero-Intro ---- */
const seen=sessionStorage.getItem("ttpsc_ki_seen");
if(seen)document.body.classList.add("fastintro");
if(!scrubOn)document.body.classList.add("mobintro");
const skipBtn=$(".skip-intro");
let introDone=false;
function finishIntro(){introDone=true;$$(".hero-in,.hero-badge,.site-header").forEach(el=>el.classList.add("go"));if(skipBtn)skipBtn.classList.remove("show");}
function runIntro(){
  sessionStorage.setItem("ttpsc_ki_seen","1");
  perf.hero=Math.round(performance.now()-t0);console.log("[perf] Time-to-Hero: "+perf.hero+"ms");
  if(reduced||has("skip")){finishIntro();return;}
  const stag=seen?60:120;
  $(".site-header").classList.add("go");
  const els=$$(".hero-in");
  els.forEach((el,i)=>setTimeout(()=>el.classList.add("go"),i*stag));
  setTimeout(()=>{if(badge)badge.classList.add("go");},els.length*stag+150);
  if(skipBtn&&!seen){skipBtn.classList.add("show");setTimeout(()=>{if(!introDone)skipBtn.classList.remove("show");introDone=true;},els.length*stag+1400);}
}
if(skipBtn)skipBtn.addEventListener("click",finishIntro);
/* Asset-Gate: Intro erst, wenn Hero-Bild bereit (Fallback 2.5 s) */
(function(){
  const img=new Image();let started=false;
  const go=()=>{if(started)return;started=true;const wait=has("slowload")?2000:0;setTimeout(runIntro,wait);};
  img.onload=()=>{console.log("[perf] hero-bg geladen: "+Math.round(performance.now()-t0)+"ms");go();};
  img.onerror=go;img.src=(window.__resources&&window.__resources.heroBg)||"assets/hero-bg.webp";
  setTimeout(go,2500);
})();
/* ---- Badge Loop + Scrub (ein rAF) ---- */
let rafScrollY=scrollY;
function frame(now){
  if(smoothOK&&swActive){
    swCur+=(swTarget-swCur)*0.14;
    if(Math.abs(swTarget-swCur)<.5){swCur=swTarget;swActive=false;}
    scrollTo({top:swCur,behavior:"instant"});
  }
  if(scrubOn){
    ctrls.forEach(c=>c.fn(progressOf(c.w)));
    stackUpdate();roadmapUpdate();
    if(badge&&introDone!==null){
      const p=heroP;
      const amp=10*(1-p),rot=1.5*(1-p);
      const fy=Math.sin(now/5500*2*Math.PI)*amp;
      const fr=Math.sin(now/5500*2*Math.PI+1.2)*rot;
      badge.style.transform=`translateY(calc(${-25*p}vh + ${fy}px)) rotate(${fr}deg)`;
      badge.style.filter=`blur(${4*p}px) drop-shadow(0 24px 60px rgba(208,58,140,${.45*(1-p)}))`;
      if(badge.classList.contains("go")&&p>0.001)badge.style.opacity=1-p;else badge.style.opacity="";
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
/* ---- Custom Cursor ---- */
if(scrubOn&&!has("weak")){
  const dot=document.createElement("div"),ring=document.createElement("div");
  dot.id="cur-dot";ring.id="cur-ring";document.body.append(dot,ring);
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,shown=false;
  addEventListener("mousemove",e=>{mx=e.clientX;my=e.clientY;if(!shown){shown=true;document.body.classList.add("cursor-on");rx=mx;ry=my;}});
  document.addEventListener("mouseover",e=>{
    const cta=e.target.closest("[data-cursor]");
    const link=e.target.closest("a,button,summary,.faq-q");
    const track=e.target.closest(".s4-stage");
    ring.classList.toggle("label",!!cta);
    ring.classList.toggle("grow",!cta&&!!link);
    ring.textContent=cta?cta.getAttribute("data-cursor"):(track&&!link?"⟷":"");
  });
  (function cur(){rx+=(mx-rx)*.15;ry+=(my-ry)*.15;
    dot.style.transform=`translate3d(${mx}px,${my}px,0)`;
    ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(cur);})();
}
/* ---- FAQ ---- */
const faqItems=$$(".faq-item");
faqItems.forEach(item=>{
  const btn=$(".faq-q",item);
  btn.addEventListener("click",()=>{
    const open=item.classList.contains("open");
    faqItems.forEach(i=>{i.classList.remove("open");$(".faq-q",i).setAttribute("aria-expanded","false");});
    if(!open){item.classList.add("open");btn.setAttribute("aria-expanded","true");}
  });
});
/* ---- Formular \u2192 Cloudflare Worker \u2192 Lettermint (API-Token bleibt serverseitig) ---- */
/* >>> NUR DIESE ZWEI ZEILEN ANPASSEN (siehe worker/ANLEITUNG.md) <<< */
const WHITEPAPER_URL="assets/whitepaper-engineering-intelligence-de.pdf";
const LEAD_ENDPOINT="https://ttpsc-lead.m-freese.workers.dev";
const form=$(".cform");
if(form){
  const REQ=[["firstname","Bitte Vornamen angeben."],["lastname","Bitte Nachnamen angeben."],["company","Bitte Unternehmen angeben."],["email","Bitte eine g\u00fcltige E-Mail-Adresse angeben."],["consent","Bitte der Verarbeitung zustimmen."]];
  const mailOK=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  function mark(input,msg){const lab=input.closest("label");let el=lab.querySelector(".field-err");if(!el){el=document.createElement("span");el.className="field-err";lab.appendChild(el);}el.textContent=msg||"";lab.classList.toggle("invalid",!!msg);}
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const btn=form.querySelector('button[type="submit"]'),ok=$(".ok",form),err=$(".err",form);
    ok.style.display="none";err.style.display="none";
    let firstBad=null;
    REQ.forEach(([n,msg])=>{const el=form.elements[n];
      const bad=el.type==="checkbox"?!el.checked:(n==="email"?!mailOK(String(el.value).trim()):!String(el.value).trim());
      mark(el,bad?msg:"");if(bad&&!firstBad)firstBad=el;});
    if(firstBad){firstBad.focus();return;}
    if(LEAD_ENDPOINT.includes("HIER-WORKER-URL")){console.warn("[form] LEAD_ENDPOINT nicht gesetzt");err.style.display="block";return;}
    btn.disabled=true;const btxt=btn.textContent;btn.textContent="Wird gesendet \u2026";
    const payload={consent:true,page:location.href,source:"LP AI Aerospace & Defense",website:form.elements.website?form.elements.website.value:""};
    ["firstname","lastname","company","email"].forEach(n=>payload[n]=String(form.elements[n].value).trim());
    try{
      const r=await fetch(LEAD_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(!r.ok)throw new Error("HTTP "+r.status);
      ok.style.display="block";btn.textContent="Anfrage gesendet";track("Whitepaper Download");
      form.querySelectorAll("input").forEach(el=>{if(el.type==="checkbox")el.checked=false;else el.value="";});
      if(WHITEPAPER_URL)window.open(WHITEPAPER_URL,"_blank","noopener");
    }catch(ex){
      console.warn("[form] \u00dcbermittlung fehlgeschlagen:",ex);
      err.style.display="block";btn.disabled=false;btn.textContent=btxt;
    }
  });
}
/* ---- Analytics-Events (tool-neutral): feuert an Vercel Analytics (window.va), Plausible (window.plausible) oder GA4 (window.gtag), je nachdem welches Snippet in index.html liegt ---- */
function track(name,props){try{if(window.va)window.va("event",{name,data:props||{}});else if(window.plausible)window.plausible(name,props?{props}:undefined);else if(window.gtag)window.gtag("event",name.toLowerCase().replace(/[^a-z0-9]+/g,"_"),props||{});}catch(e){}}
document.addEventListener("click",e=>{const a=e.target.closest("a");if(!a)return;const h=a.getAttribute("href")||"",t=(a.textContent||"").trim().slice(0,60);
  if(h.startsWith("mailto:"))track("Assessment Anfrage",{cta:t});
  else if(a.classList.contains("pill")&&h.startsWith("#"))track("CTA Klick",{cta:t,ziel:h.slice(1)});
  else if(a.classList.contains("pill")&&/^https?:/.test(h))track("Outbound Klick",{ziel:h});});
if(form&&"IntersectionObserver"in window){const io=new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting)){track("Formular erreicht");io.disconnect();}},{threshold:.4});io.observe(form);}
/* ---- Resize: Modus neu bewerten (einfach: reload-frei nur Breite) ---- */
let wasWide=wide();
addEventListener("resize",()=>{if(wide()!==wasWide)location.reload();});
/* ---- Dev-API ---- */
window.__ttpscki={flags,reduced,scrub:scrubOn,perf,
  go:id=>{const el=document.getElementById(id);if(el)scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:"instant"});},
  progress:()=>Object.fromEntries(ctrls.map(c=>[c.w.className.split(" ")[0],+progressOf(c.w).toFixed(3)]))};
})();
