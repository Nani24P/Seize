import { TOWERS } from "../../data/towers.js";
import { JUNGLE_ENEMIES } from "../../data/enemies.js";

export class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }

  create() {
    this.createTowerTextures();
    this.createEnemyTextures();
    this.scene.start("MenuScene");
  }

  // ── Core helpers ──────────────────────────────────────────────────────────

  makeCanvas(key, w, h, fn) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    fn(c.getContext("2d"), w, h);
    this.textures.addCanvas(key, c);
  }

  sphere(ctx, cx, cy, r, hi, mid, lo) {
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.06, cx, cy, r);
    g.addColorStop(0, hi); g.addColorStop(0.42, mid); g.addColorStop(1, lo);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
  }

  shadow(ctx, cx, cy, rx, ry) {
    ctx.save(); ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  }

  hexPath(cx, cy, r) {
    const p = new Path2D();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 - Math.PI / 6;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      i === 0 ? p.moveTo(x, y) : p.lineTo(x, y);
    }
    p.closePath(); return p;
  }

  starPath(cx, cy, pts, ro, ri) {
    const p = new Path2D();
    for (let i = 0; i < pts * 2; i++) {
      const a = (i * Math.PI) / pts - Math.PI / 2;
      const r = i % 2 === 0 ? ro : ri;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      i === 0 ? p.moveTo(x, y) : p.lineTo(x, y);
    }
    p.closePath(); return p;
  }

  css(hex) { return "#" + hex.toString(16).padStart(6, "0"); }

  darken(hex, f) {
    return `rgb(${Math.floor(((hex>>16)&0xff)*(1-f))},${Math.floor(((hex>>8)&0xff)*(1-f))},${Math.floor((hex&0xff)*(1-f))})`;
  }

  lighten(hex, f) {
    return `rgb(${Math.min(255,Math.floor(((hex>>16)&0xff)+(255-((hex>>16)&0xff))*f))},${Math.min(255,Math.floor(((hex>>8)&0xff)+(255-((hex>>8)&0xff))*f))},${Math.min(255,Math.floor((hex&0xff)+(255-(hex&0xff))*f))})`;
  }

  // ── TOWER TEXTURES ────────────────────────────────────────────────────────

  createTowerTextures() {
    const drawFns = {
      "tw-thorn":       (ctx) => this.t_thorn(ctx),
      "tw-sling":       (ctx) => this.t_sling(ctx),
      "tw-bomb":        (ctx) => this.t_bomb(ctx),
      "tw-web":         (ctx) => this.t_web(ctx),
      "tw-dart":        (ctx) => this.t_dart(ctx),
      "tw-venom":       (ctx) => this.t_venom(ctx),
      "tw-cryo":        (ctx) => this.t_cryo(ctx),
      "tw-mortar":      (ctx) => this.t_mortar(ctx),
      "tw-sniper":      (ctx) => this.t_sniper(ctx),
      "tw-shaman":      (ctx) => this.t_shaman(ctx),
      "tw-sonic":       (ctx) => this.t_sonic(ctx),
      "tw-eclipse":     (ctx) => this.t_eclipse(ctx),
      "tw-canopy":      (ctx) => this.t_canopy(ctx),
      "tw-juggernaut":  (ctx) => this.t_juggernaut(ctx),
      "tw-phantom":     (ctx) => this.t_phantom(ctx),
      "tw-singularity": (ctx) => this.t_singularity(ctx),
      "tw-apex":        (ctx) => this.t_apex(ctx),
      "tw-tempest":     (ctx) => this.t_tempest(ctx),
      "tw-behemoth":    (ctx) => this.t_behemoth(ctx),
      "tw-verdant":     (ctx) => this.t_verdant(ctx),
    };
    Object.entries(drawFns).forEach(([key, fn]) => this.makeCanvas(key, 74, 74, fn));
  }

  // T1 ── Thorn: slender leaf-blade tower
  t_thorn(ctx) {
    this.shadow(ctx, 37, 68, 16, 6);
    // Stone base
    const bg = ctx.createLinearGradient(18, 56, 56, 68);
    bg.addColorStop(0,"#5a7a40"); bg.addColorStop(1,"#2a4020");
    ctx.beginPath(); ctx.roundRect(20,56,34,12,4); ctx.fillStyle=bg; ctx.fill();
    // Leaf-blade body
    ctx.save(); ctx.shadowColor="#6abf4788"; ctx.shadowBlur=8;
    const b = ctx.createLinearGradient(25,8,49,56);
    b.addColorStop(0,"#c8f080"); b.addColorStop(0.4,"#6abf47"); b.addColorStop(1,"#1e4010");
    ctx.beginPath();
    ctx.moveTo(37,8); ctx.quadraticCurveTo(52,28,44,56);
    ctx.lineTo(30,56); ctx.quadraticCurveTo(22,28,37,8);
    ctx.fillStyle=b; ctx.fill();
    ctx.strokeStyle="#a8e870"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.restore();
    // Spine vein
    ctx.strokeStyle="#1e4010aa"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(37,12); ctx.lineTo(37,52); ctx.stroke();
    // Side veins
    ctx.lineWidth=1; ctx.globalAlpha=0.5;
    for (const [sy,ex,ey] of [[22,44,20],[32,46,30],[42,43,40]]) {
      ctx.beginPath(); ctx.moveTo(37,sy); ctx.lineTo(ex,ey); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(37,sy); ctx.lineTo(74-ex,ey); ctx.stroke();
    }
    ctx.globalAlpha=1;
  }

  // T1 ── Sling: wooden catapult silhouette
  t_sling(ctx) {
    this.shadow(ctx,37,68,18,7);
    const bg=ctx.createLinearGradient(14,56,60,68);
    bg.addColorStop(0,"#a07040"); bg.addColorStop(1,"#4a2810");
    ctx.beginPath(); ctx.roundRect(14,56,46,12,5); ctx.fillStyle=bg; ctx.fill();
    // Two upright posts
    for (const px of [22,52]) {
      const pg=ctx.createLinearGradient(px,16,px+8,56);
      pg.addColorStop(0,"#c89050"); pg.addColorStop(1,"#5a3010");
      ctx.beginPath(); ctx.roundRect(px,16,8,40,3); ctx.fillStyle=pg; ctx.fill();
      ctx.strokeStyle="#e0b070"; ctx.lineWidth=1; ctx.stroke();
    }
    // Cross-arm
    const cg=ctx.createLinearGradient(18,30,56,36);
    cg.addColorStop(0,"#d0a060"); cg.addColorStop(1,"#704020");
    ctx.beginPath(); ctx.roundRect(18,30,38,10,4); ctx.fillStyle=cg; ctx.fill();
    ctx.strokeStyle="#e8c080"; ctx.lineWidth=1; ctx.stroke();
    // Stone projectile in sling cup
    this.sphere(ctx,37,22,7,"#d0d0d0","#909090","#303030");
    // Sling straps
    ctx.strokeStyle="#8a6040"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(24,20); ctx.lineTo(34,25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(50,20); ctx.lineTo(40,25); ctx.stroke();
  }

  // T1 ── Bomb: squat mortar barrel
  t_bomb(ctx) {
    this.shadow(ctx,37,68,20,7);
    const bg=ctx.createLinearGradient(12,54,62,68);
    bg.addColorStop(0,"#706060"); bg.addColorStop(1,"#301818");
    ctx.beginPath(); ctx.roundRect(14,54,46,14,5); ctx.fillStyle=bg; ctx.fill();
    // Wide barrel body
    ctx.save(); ctx.shadowColor="#00000066"; ctx.shadowBlur=6;
    const bdy=ctx.createRadialGradient(30,30,4,37,38,26);
    bdy.addColorStop(0,"#a09090"); bdy.addColorStop(0.5,"#604848"); bdy.addColorStop(1,"#1a0808");
    ctx.beginPath(); ctx.roundRect(14,18,46,38,10); ctx.fillStyle=bdy; ctx.fill();
    ctx.strokeStyle="#908080"; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
    // Barrel rings
    for (const ry of [26,36,46]) {
      ctx.strokeStyle="#c0a0a0"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(14,ry); ctx.lineTo(60,ry); ctx.stroke();
    }
    // Fuse
    ctx.strokeStyle="#d0a020"; ctx.lineWidth=2; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(37,18); ctx.quadraticCurveTo(48,8,44,4); ctx.stroke();
    // Fuse spark
    ctx.save(); ctx.shadowColor="#ff8000cc"; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.arc(44,4,3,0,Math.PI*2); ctx.fillStyle="#ffcc00"; ctx.fill(); ctx.restore();
    // Highlight
    ctx.globalAlpha=0.25; ctx.fillStyle="#ffffff";
    ctx.beginPath(); ctx.roundRect(18,20,22,10,4); ctx.fill(); ctx.globalAlpha=1;
  }

  // T1 ── Web: spider post with web strands
  t_web(ctx) {
    this.shadow(ctx,37,68,16,6);
    const bg=ctx.createLinearGradient(20,56,54,68);
    bg.addColorStop(0,"#4a4060"); bg.addColorStop(1,"#1a1030");
    ctx.beginPath(); ctx.roundRect(20,56,34,12,4); ctx.fillStyle=bg; ctx.fill();
    // Central post
    const pg=ctx.createLinearGradient(33,12,41,56);
    pg.addColorStop(0,"#907080"); pg.addColorStop(1,"#281820");
    ctx.beginPath(); ctx.roundRect(33,12,8,44,3); ctx.fillStyle=pg; ctx.fill();
    // Web strands (concentric + radials)
    ctx.strokeStyle="#c8d8e8"; ctx.lineWidth=1; ctx.globalAlpha=0.7;
    for (const r of [8,15,22,29]) {
      ctx.beginPath(); ctx.arc(37,30,r,0,Math.PI*2); ctx.stroke();
    }
    // Radial lines
    for (let i=0;i<8;i++) {
      const a=(i*Math.PI)/4;
      ctx.beginPath();
      ctx.moveTo(37+Math.cos(a)*3,30+Math.sin(a)*3);
      ctx.lineTo(37+Math.cos(a)*29,30+Math.sin(a)*29);
      ctx.stroke();
    }
    ctx.globalAlpha=1;
    // Spider body
    this.sphere(ctx,37,30,6,"#d0c0d0","#806080","#200820");
  }

  // T1 ── Dart: narrow blowpipe tower
  t_dart(ctx) {
    this.shadow(ctx,37,68,14,5);
    const bg=ctx.createLinearGradient(20,56,54,68);
    bg.addColorStop(0,"#40784a"); bg.addColorStop(1,"#183020");
    ctx.beginPath(); ctx.roundRect(22,56,30,12,4); ctx.fillStyle=bg; ctx.fill();
    // Pipe body — very narrow, tall
    ctx.save(); ctx.shadowColor="#44a06088"; ctx.shadowBlur=6;
    const pg=ctx.createLinearGradient(32,8,42,56);
    pg.addColorStop(0,"#90d8a8"); pg.addColorStop(0.4,"#44a060"); pg.addColorStop(1,"#0e3020");
    ctx.beginPath(); ctx.roundRect(32,8,10,48,5); ctx.fillStyle=pg; ctx.fill();
    ctx.strokeStyle="#80f0a0"; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
    // Wrapped grip bands
    ctx.strokeStyle="#1a4028"; ctx.lineWidth=2;
    for (const gy of [28,36,44]) {
      ctx.beginPath(); ctx.moveTo(32,gy); ctx.lineTo(42,gy); ctx.stroke();
    }
    // Dart nock at top
    ctx.save(); ctx.shadowColor="#90f0a0aa"; ctx.shadowBlur=6;
    ctx.fillStyle="#e0ffc0"; ctx.beginPath();
    ctx.moveTo(37,6); ctx.lineTo(33,14); ctx.lineTo(41,14); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // T2 ── Venom: toxic dripping tower
  t_venom(ctx) {
    this.shadow(ctx,37,68,18,6);
    const bg=ctx.createLinearGradient(14,54,60,68);
    bg.addColorStop(0,"#2a6030"); bg.addColorStop(1,"#0e2010");
    ctx.beginPath(); ctx.roundRect(16,54,42,14,5); ctx.fillStyle=bg; ctx.fill();
    // Bulbous toxic body
    ctx.save(); ctx.shadowColor="#58d06888"; ctx.shadowBlur=10;
    const b=ctx.createRadialGradient(31,24,3,37,36,24);
    b.addColorStop(0,"#c0ff80"); b.addColorStop(0.45,"#58d068"); b.addColorStop(1,"#0e3818");
    ctx.beginPath();
    ctx.moveTo(37,10); ctx.bezierCurveTo(56,14,58,50,37,54); ctx.bezierCurveTo(16,50,18,14,37,10);
    ctx.fillStyle=b; ctx.fill(); ctx.strokeStyle="#90f060"; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
    // Drip drops
    ctx.save(); ctx.shadowColor="#90ff4088"; ctx.shadowBlur=4;
    ctx.fillStyle="#c8ff60";
    for (const [dx,dy,dr] of [[30,54,3],[37,58,4],[44,55,2.5]]) {
      ctx.beginPath(); ctx.arc(dx,dy,dr,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    // Skull icon
    ctx.fillStyle="#0e3818cc"; ctx.font="bold 16px monospace"; ctx.textAlign="center";
    ctx.fillText("☠",37,38); ctx.textAlign="left";
  }

  // T2 ── Cryo: hexagonal ice crystal
  t_cryo(ctx) {
    this.shadow(ctx,37,68,18,6);
    const bg=ctx.createLinearGradient(14,54,60,68);
    bg.addColorStop(0,"#a0d8f0"); bg.addColorStop(1,"#183858");
    ctx.beginPath(); ctx.roundRect(16,54,42,14,5); ctx.fillStyle=bg; ctx.fill();
    // Hex body
    ctx.save(); ctx.shadowColor="#61d5ffaa"; ctx.shadowBlur=12;
    const hex=this.hexPath(37,32,24);
    const hg=ctx.createRadialGradient(30,24,2,37,32,24);
    hg.addColorStop(0,"#f0fbff"); hg.addColorStop(0.4,"#61d5ff"); hg.addColorStop(1,"#083850");
    ctx.fillStyle=hg; ctx.fill(hex); ctx.strokeStyle="#c0f0ff"; ctx.lineWidth=2; ctx.stroke(hex); ctx.restore();
    // Snowflake
    ctx.strokeStyle="#ffffff"; ctx.lineWidth=1.8; ctx.globalAlpha=0.9;
    for (let i=0;i<6;i++) {
      const a=(i*Math.PI)/3;
      ctx.beginPath(); ctx.moveTo(37,32);
      ctx.lineTo(37+Math.cos(a)*16,32+Math.sin(a)*16); ctx.stroke();
      const mx=37+Math.cos(a)*10, my=32+Math.sin(a)*10, pa=a+Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(mx-Math.cos(pa)*4,my-Math.sin(pa)*4);
      ctx.lineTo(mx+Math.cos(pa)*4,my+Math.sin(pa)*4); ctx.stroke();
    }
    ctx.globalAlpha=1;
    this.sphere(ctx,37,32,5,"#ffffff","#a0e8ff","#1060a0");
  }

  // T2 ── Mortar: heavy artillery tube
  t_mortar(ctx) {
    this.shadow(ctx,37,68,22,8);
    for (const wx of [18,56]) {
      this.sphere(ctx,wx,60,9,"#b0c0d0","#607080","#181828");
      ctx.strokeStyle="#8090a0"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(wx-7,60); ctx.lineTo(wx+7,60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx,53); ctx.lineTo(wx,67); ctx.stroke();
      ctx.beginPath(); ctx.arc(wx,60,2,0,Math.PI*2); ctx.fillStyle="#c0d0e0"; ctx.fill();
    }
    // Axle
    const ag=ctx.createLinearGradient(16,55,16,63);
    ag.addColorStop(0,"#7080a0"); ag.addColorStop(1,"#202840");
    ctx.beginPath(); ctx.roundRect(16,55,42,8,3); ctx.fillStyle=ag; ctx.fill();
    // Carriage
    const cg=ctx.createLinearGradient(12,36,12,56);
    cg.addColorStop(0,"#808898"); cg.addColorStop(1,"#282e3c");
    ctx.beginPath(); ctx.roundRect(12,36,50,22,6); ctx.fillStyle=cg; ctx.fill();
    ctx.strokeStyle="#b0b8c8"; ctx.lineWidth=1.5; ctx.stroke();
    // Barrel — tilted up
    ctx.save(); ctx.translate(30,38); ctx.rotate(-0.4);
    const br=ctx.createLinearGradient(0,-8,0,8);
    br.addColorStop(0,"#c0d0e0"); br.addColorStop(0.4,"#5a6878"); br.addColorStop(1,"#101828");
    ctx.beginPath(); ctx.roundRect(0,-8,38,16,7); ctx.fillStyle=br; ctx.fill();
    ctx.strokeStyle="#8898b0"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(38,0,8,0,Math.PI*2); ctx.fillStyle="#0c1520"; ctx.fill();
    ctx.strokeStyle="#5a6878"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.restore();
  }

  // T2 ── Sniper: long slim rifle tower
  t_sniper(ctx) {
    this.shadow(ctx,37,68,14,5);
    const bg=ctx.createLinearGradient(20,54,54,68);
    bg.addColorStop(0,"#3a4a6a"); bg.addColorStop(1,"#10182a");
    ctx.beginPath(); ctx.roundRect(22,54,30,14,4); ctx.fillStyle=bg; ctx.fill();
    // Rifle body
    ctx.save(); ctx.shadowColor="#2060a088"; ctx.shadowBlur=8;
    const rg=ctx.createLinearGradient(28,6,46,56);
    rg.addColorStop(0,"#a0c0e0"); rg.addColorStop(0.4,"#2060a0"); rg.addColorStop(1,"#08183a");
    ctx.beginPath(); ctx.roundRect(29,6,10,48,4); ctx.fillStyle=rg; ctx.fill();
    ctx.strokeStyle="#60a0d8"; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
    // Scope
    const sg=ctx.createLinearGradient(39,20,52,32);
    sg.addColorStop(0,"#8090b0"); sg.addColorStop(1,"#202840");
    ctx.beginPath(); ctx.roundRect(38,22,14,10,4); ctx.fillStyle=sg; ctx.fill();
    ctx.strokeStyle="#a0b8d0"; ctx.lineWidth=1; ctx.stroke();
    // Scope lens glow
    ctx.save(); ctx.shadowColor="#80c0ffcc"; ctx.shadowBlur=6;
    ctx.beginPath(); ctx.arc(52,27,4,0,Math.PI*2);
    ctx.fillStyle="#c0e8ff"; ctx.fill(); ctx.restore();
    // Stock / grip
    ctx.fillStyle="#304060"; ctx.beginPath(); ctx.roundRect(29,40,20,10,3); ctx.fill();
    // Barrel tip
    ctx.fillStyle="#a0c0e0"; ctx.beginPath(); ctx.roundRect(30,5,8,6,2); ctx.fill();
  }

  // T2 ── Shaman: mystic totem
  t_shaman(ctx) {
    this.shadow(ctx,37,68,18,6);
    const bg=ctx.createLinearGradient(16,54,58,68);
    bg.addColorStop(0,"#5a4080"); bg.addColorStop(1,"#1a0840");
    ctx.beginPath(); ctx.roundRect(18,54,38,14,5); ctx.fillStyle=bg; ctx.fill();
    // Totem pole body
    const tg=ctx.createLinearGradient(28,8,46,56);
    tg.addColorStop(0,"#c090f0"); tg.addColorStop(0.5,"#8050c0"); tg.addColorStop(1,"#200840");
    ctx.beginPath(); ctx.roundRect(28,8,18,46,4); ctx.fillStyle=tg; ctx.fill();
    ctx.strokeStyle="#d0a8ff"; ctx.lineWidth=1.5; ctx.stroke();
    // Rune bands
    ctx.strokeStyle="#ffffffaa"; ctx.lineWidth=1.5;
    for (const ry of [20,32,44]) {
      ctx.beginPath(); ctx.moveTo(28,ry); ctx.lineTo(46,ry); ctx.stroke();
    }
    // Top orb
    ctx.save(); ctx.shadowColor="#9060ffcc"; ctx.shadowBlur=12;
    this.sphere(ctx,37,12,10,"#e0c0ff","#9060e0","#200840"); ctx.restore();
    // Energy wisps
    ctx.globalAlpha=0.6; ctx.strokeStyle="#c090ff"; ctx.lineWidth=1;
    for (const [sx,sy,ex,ey] of [[28,24,20,18],[46,32,54,26],[28,40,20,44]]) {
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.quadraticCurveTo((sx+ex)/2,(sy+ey)/2-8,ex,ey); ctx.stroke();
    }
    ctx.globalAlpha=1;
  }

  // T3 ── Sonic: circular speaker dish
  t_sonic(ctx) {
    this.shadow(ctx,37,68,20,7);
    const bg=ctx.createLinearGradient(14,54,60,68);
    bg.addColorStop(0,"#a0a020"); bg.addColorStop(1,"#3a3a08");
    ctx.beginPath(); ctx.roundRect(14,54,46,14,5); ctx.fillStyle=bg; ctx.fill();
    // Dish — large circle with concentric rings
    ctx.save(); ctx.shadowColor="#f0e04088"; ctx.shadowBlur=10;
    const dg=ctx.createRadialGradient(32,26,2,37,34,26);
    dg.addColorStop(0,"#ffffa0"); dg.addColorStop(0.4,"#d0c030"); dg.addColorStop(1,"#303008");
    ctx.beginPath(); ctx.arc(37,34,26,0,Math.PI*2); ctx.fillStyle=dg; ctx.fill();
    ctx.strokeStyle="#f0e060"; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
    // Sound rings
    ctx.strokeStyle="#ffffffaa"; ctx.lineWidth=1.5;
    for (const r of [10,17,24]) {
      ctx.beginPath(); ctx.arc(37,34,r,0,Math.PI*2); ctx.stroke();
    }
    // Center speaker cone
    this.sphere(ctx,37,34,8,"#ffffff","#e0d040","#5a5010");
    // Sound wave lines emanating
    ctx.strokeStyle="#f0e06080"; ctx.lineWidth=1;
    for (let i=0;i<8;i++) {
      const a=(i*Math.PI)/4;
      ctx.beginPath();
      ctx.moveTo(37+Math.cos(a)*26,34+Math.sin(a)*26);
      ctx.lineTo(37+Math.cos(a)*32,34+Math.sin(a)*32);
      ctx.stroke();
    }
  }

  // T3 ── Eclipse: dark orb on shadow plinth
  t_eclipse(ctx) {
    this.shadow(ctx,37,68,18,6);
    const bg=ctx.createLinearGradient(16,54,58,68);
    bg.addColorStop(0,"#2a1040"); bg.addColorStop(1,"#08040c");
    ctx.beginPath(); ctx.roundRect(18,54,38,14,5); ctx.fillStyle=bg; ctx.fill();
    // Dark energy body
    ctx.save(); ctx.shadowColor="#ff40ffcc"; ctx.shadowBlur=14;
    const eg=ctx.createRadialGradient(31,27,2,37,34,24);
    eg.addColorStop(0,"#ff80ff"); eg.addColorStop(0.35,"#8020c0"); eg.addColorStop(0.7,"#200840"); eg.addColorStop(1,"#000000");
    ctx.beginPath(); ctx.arc(37,34,24,0,Math.PI*2); ctx.fillStyle=eg; ctx.fill(); ctx.restore();
    // Eclipse ring
    ctx.save(); ctx.shadowColor="#9020d0aa"; ctx.shadowBlur=8;
    ctx.strokeStyle="#d060ff"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(37,34,24,0,Math.PI*2); ctx.stroke(); ctx.restore();
    // Dark core
    ctx.beginPath(); ctx.arc(37,34,10,0,Math.PI*2); ctx.fillStyle="#000000cc"; ctx.fill();
    // Star glint in center
    ctx.save(); ctx.shadowColor="#ff80ff"; ctx.shadowBlur=10;
    ctx.fillStyle="#ff80ff"; ctx.beginPath(); ctx.arc(37,34,3,0,Math.PI*2); ctx.fill(); ctx.restore();
    // Orbiting sparks
    ctx.globalAlpha=0.7;
    for (let i=0;i<5;i++) {
      const a=(i*Math.PI*2)/5;
      const sx=37+Math.cos(a)*20, sy=34+Math.sin(a)*20;
      ctx.beginPath(); ctx.arc(sx,sy,2,0,Math.PI*2); ctx.fillStyle="#e080ff"; ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  // T3 ── Canopy: multi-root emanating tower
  t_canopy(ctx) {
    this.shadow(ctx,37,68,20,7);
    const bg=ctx.createLinearGradient(14,54,60,68);
    bg.addColorStop(0,"#1a6828"); bg.addColorStop(1,"#082010");
    ctx.beginPath(); ctx.roundRect(14,54,46,14,5); ctx.fillStyle=bg; ctx.fill();
    // Tree trunk body
    const tg=ctx.createLinearGradient(28,14,46,54);
    tg.addColorStop(0,"#80a840"); tg.addColorStop(0.5,"#3a7020"); tg.addColorStop(1,"#0e2808");
    ctx.beginPath(); ctx.roundRect(28,14,18,40,5); ctx.fillStyle=tg; ctx.fill();
    ctx.strokeStyle="#90c050"; ctx.lineWidth=1.5; ctx.stroke();
    // Root arms spreading out
    ctx.strokeStyle="#60a030"; ctx.lineWidth=3; ctx.lineCap="round";
    const roots=[[28,40,12,32],[28,30,10,22],[28,20,14,14],[46,40,62,32],[46,30,64,22],[46,20,60,14]];
    roots.forEach(([sx,sy,ex,ey])=>{
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.quadraticCurveTo((sx+ex)/2-4,(sy+ey)/2+4,ex,ey); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex,ey,3,0,Math.PI*2); ctx.fillStyle="#90ff40"; ctx.fill();
    });
    // Canopy top
    ctx.save(); ctx.shadowColor="#50c03088"; ctx.shadowBlur=8;
    const cg=ctx.createRadialGradient(33,14,2,37,18,16);
    cg.addColorStop(0,"#c0ff70"); cg.addColorStop(0.5,"#50a028"); cg.addColorStop(1,"#102008");
    ctx.beginPath(); ctx.arc(37,18,16,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill();
    ctx.strokeStyle="#80d040"; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
  }

  // T3 ── Juggernaut: massive armoured cube
  t_juggernaut(ctx) {
    this.shadow(ctx,37,68,24,8);
    const bg=ctx.createLinearGradient(10,56,64,68);
    bg.addColorStop(0,"#8a4820"); bg.addColorStop(1,"#300e08");
    ctx.beginPath(); ctx.roundRect(10,56,54,12,4); ctx.fillStyle=bg; ctx.fill();
    // Huge body
    ctx.save(); ctx.shadowColor="#80201000"; ctx.shadowBlur=8;
    const b=ctx.createLinearGradient(8,10,66,56);
    b.addColorStop(0,"#d08050"); b.addColorStop(0.4,"#804020"); b.addColorStop(1,"#200808");
    ctx.beginPath(); ctx.roundRect(8,12,58,44,8); ctx.fillStyle=b; ctx.fill();
    ctx.strokeStyle="#ff8040"; ctx.lineWidth=2.5; ctx.stroke(); ctx.restore();
    // Armour plate bolts
    ctx.fillStyle="#ffa060";
    for (const [bx,by] of [[16,20],[58,20],[16,48],[58,48],[37,34]]) {
      ctx.beginPath(); ctx.arc(bx,by,3,0,Math.PI*2); ctx.fill();
    }
    // Glowing crack
    ctx.save(); ctx.shadowColor="#ff4000cc"; ctx.shadowBlur=10;
    ctx.strokeStyle="#ff6020"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(20,28); ctx.lineTo(30,34); ctx.lineTo(24,42); ctx.stroke();
    ctx.restore();
    // Barrel nub
    ctx.fillStyle="#501808"; ctx.beginPath(); ctx.roundRect(37,10,24,12,5); ctx.fill();
    ctx.strokeStyle="#ff6030"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(61,16,5,0,Math.PI*2); ctx.fillStyle="#180808"; ctx.fill();
  }

  // T3 ── Phantom: ethereal ghost archer
  t_phantom(ctx) {
    this.shadow(ctx,37,68,16,5);
    const bg=ctx.createLinearGradient(18,54,56,68);
    bg.addColorStop(0,"#304858"); bg.addColorStop(1,"#0c1820");
    ctx.beginPath(); ctx.roundRect(20,54,34,14,4); ctx.fillStyle=bg; ctx.fill();
    // Ghostly wisp body
    ctx.save(); ctx.shadowColor="#60b0ffaa"; ctx.shadowBlur=14;
    const pg=ctx.createRadialGradient(32,26,3,37,34,22);
    pg.addColorStop(0,"#c0e8ff"); pg.addColorStop(0.4,"#4090c0"); pg.addColorStop(0.8,"#102848"); pg.addColorStop(1,"transparent");
    ctx.beginPath();
    ctx.moveTo(37,10); ctx.bezierCurveTo(54,14,56,48,37,54); ctx.bezierCurveTo(18,48,20,14,37,10);
    ctx.fillStyle=pg; ctx.fill(); ctx.restore();
    // Ghost eyes
    for (const ex of [30,44]) {
      ctx.save(); ctx.shadowColor="#80d0ffcc"; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(ex,30,4,0,Math.PI*2); ctx.fillStyle="#b0e8ff"; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(ex,30,2,0,Math.PI*2); ctx.fillStyle="#ffffff"; ctx.fill();
    }
    // Arrow through body
    ctx.strokeStyle="#c0e8ffaa"; ctx.lineWidth=1.5; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(22,40); ctx.lineTo(52,20); ctx.stroke();
    ctx.fillStyle="#c0e8ff";
    ctx.beginPath(); ctx.moveTo(52,20); ctx.lineTo(46,24); ctx.lineTo(50,26); ctx.closePath(); ctx.fill();
  }

  // T4 ── Singularity: black hole vortex
  t_singularity(ctx) {
    this.shadow(ctx,37,68,20,7);
    const bg=ctx.createLinearGradient(14,54,60,68);
    bg.addColorStop(0,"#180830"); bg.addColorStop(1,"#040008");
    ctx.beginPath(); ctx.roundRect(14,54,46,14,5); ctx.fillStyle=bg; ctx.fill();
    // Accretion disk rings
    ctx.save();
    for (let i=4;i>=0;i--) {
      const r=12+i*4, alpha=0.15+i*0.08;
      ctx.globalAlpha=alpha;
      ctx.strokeStyle=i%2===0?"#9040ff":"#ff40ff";
      ctx.lineWidth=3; ctx.beginPath(); ctx.arc(37,33,r,0,Math.PI*2); ctx.stroke();
    }
    ctx.globalAlpha=1; ctx.restore();
    // Event horizon — true black
    ctx.save(); ctx.shadowColor="#9040ffcc"; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.arc(37,33,14,0,Math.PI*2); ctx.fillStyle="#000000"; ctx.fill(); ctx.restore();
    // Outer glow
    ctx.save(); ctx.shadowColor="#c060ffee"; ctx.shadowBlur=20;
    ctx.strokeStyle="#a050ff"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(37,33,14,0,Math.PI*2); ctx.stroke(); ctx.restore();
    // Particle streaks
    ctx.globalAlpha=0.6; ctx.strokeStyle="#d090ff"; ctx.lineWidth=1;
    for (let i=0;i<8;i++) {
      const a=(i*Math.PI)/4;
      ctx.beginPath();
      ctx.moveTo(37+Math.cos(a)*16,33+Math.sin(a)*16);
      ctx.lineTo(37+Math.cos(a)*28,33+Math.sin(a)*28);
      ctx.stroke();
    }
    ctx.globalAlpha=1;
  }

  // T4 ── Apex: gold relic totem
  t_apex(ctx) {
    this.shadow(ctx,37,68,20,7);
    const bg=ctx.createLinearGradient(14,54,60,68);
    bg.addColorStop(0,"#c09020"); bg.addColorStop(1,"#402c00");
    ctx.beginPath(); ctx.roundRect(14,54,46,14,5); ctx.fillStyle=bg; ctx.fill();
    // Gold column
    const cg=ctx.createLinearGradient(28,10,46,56);
    cg.addColorStop(0,"#fff080"); cg.addColorStop(0.3,"#d0a020"); cg.addColorStop(0.7,"#806010"); cg.addColorStop(1,"#201800");
    ctx.beginPath(); ctx.roundRect(28,10,18,44,5); ctx.fillStyle=cg; ctx.fill();
    ctx.strokeStyle="#ffe840"; ctx.lineWidth=2; ctx.stroke();
    // Gold band details
    for (const gy of [20,32,44]) {
      ctx.fillStyle="#ffe870aa"; ctx.beginPath(); ctx.roundRect(27,gy,20,5,2); ctx.fill();
    }
    // Crown top
    ctx.save(); ctx.shadowColor="#ffe800cc"; ctx.shadowBlur=14;
    ctx.fillStyle="#ffe840"; ctx.strokeStyle="#a07010"; ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.rect(26,12,22,8);
    for (let i=0;i<5;i++) { const bx=26+i*5.5; ctx.moveTo(bx,12); ctx.lineTo(bx+2.75,4); ctx.lineTo(bx+5.5,12); }
    ctx.fill(); ctx.stroke(); ctx.restore();
    // Gem in crown center
    this.sphere(ctx,37,8,5,"#ffffff","#ffd020","#806000");
  }

  // T4 ── Tempest: storm vortex tower
  t_tempest(ctx) {
    this.shadow(ctx,37,68,20,7);
    const bg=ctx.createLinearGradient(14,54,60,68);
    bg.addColorStop(0,"#2040a0"); bg.addColorStop(1,"#081028");
    ctx.beginPath(); ctx.roundRect(14,54,46,14,5); ctx.fillStyle=bg; ctx.fill();
    // Swirling storm body
    ctx.save(); ctx.shadowColor="#4080ffaa"; ctx.shadowBlur=12;
    const sg=ctx.createRadialGradient(31,27,3,37,34,24);
    sg.addColorStop(0,"#c0d8ff"); sg.addColorStop(0.45,"#3060c0"); sg.addColorStop(1,"#040c28");
    ctx.beginPath(); ctx.arc(37,34,24,0,Math.PI*2); ctx.fillStyle=sg; ctx.fill(); ctx.restore();
    // Spiral arms
    ctx.strokeStyle="#80b0ffaa"; ctx.lineWidth=2;
    for (let i=0;i<3;i++) {
      const startA=(i*Math.PI*2)/3;
      ctx.beginPath();
      for (let t=0;t<=1;t+=0.05) {
        const r=t*22, a=startA+t*Math.PI*2;
        const x=37+Math.cos(a)*r, y=34+Math.sin(a)*r;
        t===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    // Core
    this.sphere(ctx,37,34,7,"#e0f0ff","#6090e0","#0c2060");
    // Outer ring
    ctx.strokeStyle="#80b0ff"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(37,34,24,0,Math.PI*2); ctx.stroke();
  }

  // T4 ── Behemoth: colossal siege machine
  t_behemoth(ctx) {
    this.shadow(ctx,37,68,26,9);
    const bg=ctx.createLinearGradient(8,56,66,68);
    bg.addColorStop(0,"#6a1010"); bg.addColorStop(1,"#1a0404");
    ctx.beginPath(); ctx.roundRect(8,56,58,12,4); ctx.fillStyle=bg; ctx.fill();
    // Massive body
    ctx.save(); ctx.shadowColor="#ff000066"; ctx.shadowBlur=10;
    const b=ctx.createLinearGradient(6,8,68,56);
    b.addColorStop(0,"#d04030"); b.addColorStop(0.4,"#801818"); b.addColorStop(1,"#100404");
    ctx.beginPath(); ctx.roundRect(6,10,62,46,8); ctx.fillStyle=b; ctx.fill();
    ctx.strokeStyle="#ff4030"; ctx.lineWidth=3; ctx.stroke(); ctx.restore();
    // Bolts grid
    ctx.fillStyle="#ff6040";
    for (const [bx,by] of [[14,18],[60,18],[14,46],[60,46],[37,32],[22,32],[52,32]]) {
      ctx.beginPath(); ctx.arc(bx,by,2.5,0,Math.PI*2); ctx.fill();
    }
    // Double barrel
    for (const bx of [26,48]) {
      const br=ctx.createLinearGradient(bx,6,bx+10,14);
      br.addColorStop(0,"#808898"); br.addColorStop(1,"#181828");
      ctx.beginPath(); ctx.roundRect(bx,6,10,22,4); ctx.fillStyle=br; ctx.fill();
      ctx.strokeStyle="#a0b0c0"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(bx+5,6,4,0,Math.PI*2); ctx.fillStyle="#0c1018"; ctx.fill();
    }
    // Lava crack glow
    ctx.save(); ctx.shadowColor="#ff2000ee"; ctx.shadowBlur=12;
    ctx.strokeStyle="#ff4020"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(16,26); ctx.lineTo(28,34); ctx.lineTo(20,44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(58,28); ctx.lineTo(46,36); ctx.lineTo(52,44); ctx.stroke();
    ctx.restore();
  }

  // T4 ── Verdant: living jungle god
  t_verdant(ctx) {
    this.shadow(ctx,37,68,22,8);
    const bg=ctx.createLinearGradient(12,54,62,68);
    bg.addColorStop(0,"#106020"); bg.addColorStop(1,"#040e08");
    ctx.beginPath(); ctx.roundRect(12,54,50,14,5); ctx.fillStyle=bg; ctx.fill();
    // Living tree body
    ctx.save(); ctx.shadowColor="#20ff6088"; ctx.shadowBlur=14;
    const tg=ctx.createRadialGradient(30,26,3,37,34,26);
    tg.addColorStop(0,"#80ff80"); tg.addColorStop(0.35,"#20b040"); tg.addColorStop(0.7,"#086020"); tg.addColorStop(1,"#021008");
    ctx.beginPath(); ctx.arc(37,34,26,0,Math.PI*2); ctx.fillStyle=tg; ctx.fill();
    ctx.strokeStyle="#60ff80"; ctx.lineWidth=2.5; ctx.stroke(); ctx.restore();
    // Vines wrapping
    ctx.strokeStyle="#40c050aa"; ctx.lineWidth=2;
    for (let i=0;i<4;i++) {
      const a0=(i*Math.PI)/2+0.3;
      ctx.beginPath();
      for (let t=0;t<=1;t+=0.08) {
        const r=22+Math.sin(t*Math.PI*3)*4, a=a0+t*Math.PI*0.8;
        const x=37+Math.cos(a)*r, y=34+Math.sin(a)*r;
        t===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    // Leaf clusters
    ctx.fillStyle="#80ff60";
    for (let i=0;i<6;i++) {
      const a=(i*Math.PI)/3, r=24;
      const lx=37+Math.cos(a)*r, ly=34+Math.sin(a)*r;
      ctx.beginPath(); ctx.ellipse(lx,ly,5,8,a,0,Math.PI*2); ctx.fill();
    }
    // Ancient eye — the god looks
    ctx.save(); ctx.shadowColor="#00ffaacc"; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.arc(37,34,8,0,Math.PI*2); ctx.fillStyle="#000000cc"; ctx.fill();
    ctx.beginPath(); ctx.arc(37,34,5,0,Math.PI*2); ctx.fillStyle="#00ff80"; ctx.fill();
    ctx.beginPath(); ctx.arc(37,34,2.5,0,Math.PI*2); ctx.fillStyle="#ffffff"; ctx.fill();
    ctx.restore();
  }

  // ── ENEMY TEXTURES ────────────────────────────────────────────────────────

  createEnemyTextures() {
    Object.entries(JUNGLE_ENEMIES).forEach(([role, data]) => {
      this.makeCanvas(data.texture, 70, 70, (ctx) => {
        this.drawEnemy(ctx, role, data.color);
      });
    });
  }

  drawEnemy(ctx, role, hex) {
    const col   = this.css(hex);
    const light = this.lighten(hex, 0.5);
    const dark  = this.darken(hex, 0.5);
    const map = {
      sprout:  () => this.e_sprout(ctx, col, light, dark),
      crawler: () => this.e_crawler(ctx, col, light, dark),
      brute:   () => this.e_brute(ctx, col, light, dark),
      shield:  () => this.e_shield(ctx, col, light, dark),
      leaper:  () => this.e_leaper(ctx, col, light, dark),
      shaman:  () => this.e_shaman(ctx, col, light, dark),
      titan:   () => this.e_titan(ctx, col, light, dark),
      warlord: () => this.e_warlord(ctx, col, light, dark),
    };
    (map[role] || map.crawler)();
  }

  e_sprout(ctx, col, light, dark) {
    this.shadow(ctx,35,60,12,4);
    this.sphere(ctx,35,38,12,light,col,dark);
    // Tiny leaf on top
    ctx.fillStyle=light; ctx.beginPath();
    ctx.ellipse(35,24,4,7,0.2,0,Math.PI*2); ctx.fill();
    ctx.ellipse(28,28,3,5,-0.4,0,Math.PI*2); ctx.fill();
    ctx.ellipse(42,28,3,5,0.4,0,Math.PI*2); ctx.fill();
    // Eyes
    for (const ex of [30,40]) {
      ctx.beginPath(); ctx.arc(ex,36,2.5,0,Math.PI*2); ctx.fillStyle="#ffffff"; ctx.fill();
      ctx.beginPath(); ctx.arc(ex,36,1.2,0,Math.PI*2); ctx.fillStyle="#0a1a0a"; ctx.fill();
    }
  }

  e_crawler(ctx, col, light, dark) {
    this.shadow(ctx,35,60,15,5);
    // Flat oval body — crawls low
    const g=ctx.createRadialGradient(30,34,2,35,38,16);
    g.addColorStop(0,light); g.addColorStop(0.5,col); g.addColorStop(1,dark);
    ctx.beginPath(); ctx.ellipse(35,40,16,13,0,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle=light; ctx.lineWidth=1.5; ctx.stroke();
    // Legs
    ctx.strokeStyle=dark; ctx.lineWidth=1.5;
    for (const [lx,ly,ex,ey] of [[22,38,12,32],[22,42,11,46],[48,38,58,32],[48,42,59,46]]) {
      ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(ex,ey); ctx.stroke();
    }
    // Eyes on stalks
    for (const [ex,sy] of [[28,28],[42,28]]) {
      ctx.strokeStyle=dark; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ex,34); ctx.lineTo(ex,sy); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex,sy,4,0,Math.PI*2); ctx.fillStyle="#ffffff"; ctx.fill();
      ctx.beginPath(); ctx.arc(ex,sy,2,0,Math.PI*2); ctx.fillStyle="#0a1a0a"; ctx.fill();
    }
  }

  e_brute(ctx, col, light, dark) {
    this.shadow(ctx,35,62,20,7);
    // Wide hunched body
    const g=ctx.createRadialGradient(29,28,3,35,38,22);
    g.addColorStop(0,light); g.addColorStop(0.4,col); g.addColorStop(1,dark);
    ctx.beginPath(); ctx.roundRect(14,22,42,36,8); ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle=light; ctx.lineWidth=2; ctx.stroke();
    // Thick neck/head
    this.sphere(ctx,35,22,12,light,col,dark);
    // Fists
    this.sphere(ctx,12,40,8,light,col,dark);
    this.sphere(ctx,58,40,8,light,col,dark);
    // Scowl
    ctx.strokeStyle=dark; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(28,20); ctx.lineTo(26,16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(42,20); ctx.lineTo(44,16); ctx.stroke();
    for (const ex of [30,40]) {
      ctx.beginPath(); ctx.arc(ex,22,3,0,Math.PI*2); ctx.fillStyle="#f00a0a"; ctx.fill();
    }
  }

  e_shield(ctx, col, light, dark) {
    this.shadow(ctx,35,61,18,6);
    // Body
    this.sphere(ctx,35,38,16,light,col,dark);
    // Large front shield
    ctx.save(); ctx.shadowColor="#f0d09088"; ctx.shadowBlur=6;
    const sg=ctx.createLinearGradient(16,20,54,52);
    sg.addColorStop(0,"#e8d080"); sg.addColorStop(0.5,"#a08020"); sg.addColorStop(1,"#302800");
    ctx.beginPath();
    ctx.moveTo(35,14); ctx.lineTo(54,22); ctx.lineTo(54,48); ctx.lineTo(35,56); ctx.lineTo(16,48); ctx.lineTo(16,22); ctx.closePath();
    ctx.fillStyle=sg; ctx.fill(); ctx.strokeStyle="#f0e090"; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
    // Shield boss (central rivet)
    this.sphere(ctx,35,35,6,"#ffffff","#d0c050","#504000");
    // Red eyes peering over shield
    for (const ex of [28,42]) {
      ctx.beginPath(); ctx.arc(ex,20,3,0,Math.PI*2); ctx.fillStyle="#ff2020"; ctx.fill();
    }
  }

  e_leaper(ctx, col, light, dark) {
    this.shadow(ctx,35,60,13,4);
    // Compact circular body
    this.sphere(ctx,35,34,13,light,col,dark);
    // Spring legs — bent/coiled ready to jump
    ctx.strokeStyle=dark; ctx.lineWidth=3; ctx.lineCap="round";
    for (const [sx,sy,mx,my,ex,ey] of [[26,42,18,54,24,58],[44,42,52,54,46,58]]) {
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.quadraticCurveTo(mx,my,ex,ey); ctx.stroke();
    }
    // Wide eyes — manic
    for (const ex of [27,43]) {
      ctx.beginPath(); ctx.arc(ex,30,5,0,Math.PI*2); ctx.fillStyle="#ffff80"; ctx.fill();
      ctx.strokeStyle=dark; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.arc(ex,30,2.5,0,Math.PI*2); ctx.fillStyle="#101000"; ctx.fill();
    }
    // Grin
    ctx.strokeStyle=dark; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(35,38,6,0.2,Math.PI-0.2); ctx.stroke();
  }

  e_shaman(ctx, col, light, dark) {
    this.shadow(ctx,35,61,14,5);
    // Robed body
    const rg=ctx.createLinearGradient(22,22,48,60);
    rg.addColorStop(0,light); rg.addColorStop(0.5,col); rg.addColorStop(1,dark);
    ctx.beginPath();
    ctx.moveTo(35,22); ctx.lineTo(48,58); ctx.lineTo(22,58); ctx.closePath();
    ctx.fillStyle=rg; ctx.fill(); ctx.strokeStyle=light; ctx.lineWidth=1.5; ctx.stroke();
    // Head
    this.sphere(ctx,35,22,10,light,col,dark);
    // Glowing staff
    ctx.save(); ctx.shadowColor="#ff80ffcc"; ctx.shadowBlur=8;
    ctx.strokeStyle="#d070e0"; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(50,12); ctx.lineTo(38,48); ctx.stroke();
    ctx.beginPath(); ctx.arc(50,12,6,0,Math.PI*2); ctx.fillStyle="#ff60f0"; ctx.fill(); ctx.restore();
    // Rune glyph on robe
    ctx.strokeStyle=light+"aa"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.arc(35,42,6,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(35,36); ctx.lineTo(35,48); ctx.moveTo(29,42); ctx.lineTo(41,42); ctx.stroke();
  }

  e_titan(ctx, col, light, dark) {
    this.shadow(ctx,35,63,22,8);
    // Massive stone-slab body
    const g=ctx.createLinearGradient(10,14,60,62);
    g.addColorStop(0,light); g.addColorStop(0.35,col); g.addColorStop(1,dark);
    ctx.beginPath(); ctx.roundRect(10,16,50,44,6); ctx.fillStyle=g; ctx.fill();
    ctx.strokeStyle=light; ctx.lineWidth=2.5; ctx.stroke();
    // Stone cracks
    ctx.strokeStyle=dark+"cc"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(22,24); ctx.lineTo(30,36); ctx.lineTo(26,46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(48,20); ctx.lineTo(40,32); ctx.lineTo(44,48); ctx.stroke();
    // Head — small atop wide body
    this.sphere(ctx,35,16,10,light,col,dark);
    // Glowing eyes
    for (const ex of [29,41]) {
      ctx.save(); ctx.shadowColor="#ff8000cc"; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(ex,16,4,0,Math.PI*2); ctx.fillStyle="#ff8020"; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(ex,16,2,0,Math.PI*2); ctx.fillStyle="#ffff00"; ctx.fill();
    }
    // Stone fists
    this.sphere(ctx,8,42,9,light,col,dark);
    this.sphere(ctx,62,42,9,light,col,dark);
  }

  e_warlord(ctx, col, light, dark) {
    this.shadow(ctx,35,64,26,9);
    // Imposing main body
    ctx.save(); ctx.shadowColor=col+"aa"; ctx.shadowBlur=14;
    const g=ctx.createRadialGradient(28,20,4,35,38,28);
    g.addColorStop(0,light); g.addColorStop(0.3,col); g.addColorStop(1,dark);
    ctx.beginPath(); ctx.arc(35,38,26,0,Math.PI*2); ctx.fillStyle=g; ctx.fill(); ctx.restore();
    ctx.strokeStyle=light; ctx.lineWidth=2.5; ctx.stroke();
    // Crown — boss indicator
    ctx.save(); ctx.shadowColor="#ffef00cc"; ctx.shadowBlur=10;
    ctx.fillStyle="#ffef40"; ctx.strokeStyle="#806000"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.rect(20,14,30,8);
    for (let i=0;i<4;i++) {
      const bx=20+i*7.5;
      ctx.moveTo(bx,14); ctx.lineTo(bx+3.75,6); ctx.lineTo(bx+7.5,14);
    }
    ctx.fill(); ctx.stroke(); ctx.restore();
    // Battle-scarred face
    for (const ex of [24,46]) {
      ctx.save(); ctx.shadowColor="#ff0000"; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(ex,38,6,0,Math.PI*2); ctx.fillStyle="#ff1010"; ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(ex,38,3.5,0,Math.PI*2); ctx.fillStyle="#ff9090"; ctx.fill();
    }
    // War-paint slash
    ctx.strokeStyle=dark; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(26,32); ctx.lineTo(30,44); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(44,32); ctx.lineTo(40,44); ctx.stroke();
    // Massive pauldrons
    this.sphere(ctx,8,36,9,light,col,dark);
    this.sphere(ctx,62,36,9,light,col,dark);
    ctx.strokeStyle=light; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(8,36,9,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(62,36,9,0,Math.PI*2); ctx.stroke();
    // Snarl
    ctx.strokeStyle=dark; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(24,50); ctx.quadraticCurveTo(35,56,46,50); ctx.stroke();
    // Highlight
    ctx.globalAlpha=0.25; ctx.fillStyle="#ffffff";
    ctx.beginPath(); ctx.ellipse(28,28,7,10,-0.3,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
}
