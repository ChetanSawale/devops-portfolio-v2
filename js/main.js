/* CHETAN.SAWALE — NOC edition: interactions
   Vanilla JS, no dependencies. Signature effect: drill-down service panels. */
(function(){
"use strict";
var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── boot shimmer: fast + skippable ── */
var boot = document.getElementById("boot");
function dismissBoot(){ boot.classList.add("gone"); }
setTimeout(dismissBoot, 600);
boot.addEventListener("click", dismissBoot);

/* ── live IST clock ── */
var clockEl = document.getElementById("ist-clock");
function tickClock(){
  try{
    var t = new Date().toLocaleTimeString("en-IN",{
      timeZone:"Asia/Kolkata", hour12:false,
      hour:"2-digit", minute:"2-digit", second:"2-digit"
    });
    clockEl.textContent = t + " IST";
  }catch(e){ clockEl.textContent = ""; }
}
tickClock(); setInterval(tickClock, 1000);

/* ── mobile menu ── */
var toggle = document.getElementById("menu-toggle"),
    menu = document.getElementById("mobile-menu");
toggle.addEventListener("click", function(){
  var open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
});
menu.querySelectorAll("a").forEach(function(a){
  a.addEventListener("click", function(){ menu.classList.remove("open"); });
});

/* ── animated counters (hero stats) ── */
function animateCounter(el){
  var target = parseInt(el.getAttribute("data-target"), 10) || 0;
  if(reduced){ el.textContent = target; return; }
  var start = null, dur = 1100;
  function frame(ts){
    if(!start) start = ts;
    var p = Math.min((ts - start) / dur, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if(p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
var counted = false;
function startCounters(){
  if(counted) return; counted = true;
  document.querySelectorAll(".counter").forEach(animateCounter);
}

/* ── sparklines (skill tiles) ── */
function drawSpark(canvas, seed){
  var ctx = canvas.getContext("2d"),
      W = canvas.width, H = canvas.height,
      rnd = (function(s){ return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; })(seed),
      pts = [], i, v = 0.5;
  for(i = 0; i < 28; i++){ v += (rnd() - 0.48) * 0.28; v = Math.max(0.12, Math.min(0.9, v)); pts.push(v); }
  function render(progress){
    ctx.clearRect(0, 0, W, H);
    // faint grid
    ctx.strokeStyle = "rgba(139,148,158,.12)"; ctx.lineWidth = 1;
    for(i = 1; i < 3; i++){ ctx.beginPath(); ctx.moveTo(0, H * i / 3); ctx.lineTo(W, H * i / 3); ctx.stroke(); }
    // area + line
    var n = Math.max(2, Math.floor(pts.length * progress));
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(0,212,255,.35)"); grad.addColorStop(1, "rgba(0,212,255,0)");
    ctx.beginPath();
    for(i = 0; i < n; i++){ var x = (i / (pts.length - 1)) * W, y = H - pts[i] * H; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = "#00d4ff"; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.lineTo((n - 1) / (pts.length - 1) * W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    // last point dot
    var lx = (n - 1) / (pts.length - 1) * W, ly = H - pts[n - 1] * H;
    ctx.beginPath(); ctx.arc(lx, ly, 2.6, 0, 7); ctx.fillStyle = "#3fb950"; ctx.fill();
  }
  if(reduced){ render(1); return; }
  var t0 = null;
  (function anim(ts){
    if(!t0) t0 = ts;
    var p = Math.min((ts - t0) / 1400, 1);
    render(p);
    if(p < 1) requestAnimationFrame(anim);
  })(performance.now());
}
document.querySelectorAll("canvas.spark").forEach(function(c, i){ drawSpark(c, 42 + i * 17); });

/* ── drill-down drawers (signature interaction) ── */
document.querySelectorAll("[data-svc] .proj-row").forEach(function(btn){
  btn.addEventListener("click", function(){
    var card = btn.closest(".proj"),
        drawer = card.querySelector(".drawer"),
        open = card.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    drawer.style.maxHeight = open ? drawer.scrollHeight + "px" : "0px";
  });
});

/* ── ticker: duplicate track for seamless loop ── */
var track = document.getElementById("ticker-track");
track.innerHTML += track.innerHTML;

/* ── scroll reveals + bar fills + counters ── */
var io = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll(".bar span").forEach(function(b){ b.style.width = b.style.getPropertyValue("--w"); });
    if(e.target.closest("#overview")) startCounters();
    io.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal, #overview").forEach(function(el){ io.observe(el); });
// hero stats may already be in view on load
startCounters();

/* ── active nav highlight ── */
var sections = ["overview","services","projects","timeline","page-me"],
    navLinks = document.querySelectorAll("#statusbar nav a");
var navIO = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(!e.isIntersecting) return;
    navLinks.forEach(function(a){
      if(a.getAttribute("href") === "#page-me") return; /* leave the CTA styled as-is */
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id);
    });
  });
}, { rootMargin: "-40% 0px -55% 0px" });
sections.forEach(function(id){ var s = document.getElementById(id); if(s) navIO.observe(s); });

})();
