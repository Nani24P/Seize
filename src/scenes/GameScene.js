import { BOARD, JUNGLE_MAP, GAME_WIDTH, GAME_HEIGHT } from "../../data/map.js";
import { TOWERS, TOWER_ORDER, TIER_UNLOCK } from "../../data/towers.js";
import { buildWave, waveEndGold, waveEndScore, WAVE_MODIFIERS } from "../../data/waves.js";
import { Enemy } from "../objects/Enemy.js";
import { Tower } from "../objects/Tower.js";
import { audioSystem } from "../systems/AudioSystem.js";
import { GameState } from "../systems/GameState.js";
import { saveSystem } from "../systems/SaveSystem.js";

const MAP = JUNGLE_MAP;

export class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }

  init() {
    this.gameState    = new GameState();
    this.padViews     = [];
    this.shopCards    = [];
    this.selectedTower = null;
    this.uiDirty      = true;
    this.spawnSpacing = 0.46;
    this.toastText    = null;
  }

  create() {
    audioSystem.startMusic();
    this.createLayers();
    this.drawBoard();
    this.drawPath();
    this.drawPads();
    this.createHUD();
    this.createDock();
    this.createAmbient();
    this.toast("Tap a tower in the dock, then tap a build pad");
    this.markDirty();
  }

  shutdown() { audioSystem.stopMusic(); }

  // ── Layers ───────────────────────────────────────────────────────────────

  createLayers() {
    this.bgLayer    = this.add.graphics().setDepth(0);
    this.pathLayer  = this.add.graphics().setDepth(1);
    this.padLayer   = this.add.container(0, 0).setDepth(3);
    this.rangeLayer = this.add.container(0, 0).setDepth(4);
    this.towerLayer = this.add.container(0, 0).setDepth(5);
    this.enemyLayer = this.add.container(0, 0).setDepth(6);
    this.fxLayer    = this.add.container(0, 0).setDepth(8);
    this.uiLayer    = this.add.container(0, 0).setDepth(20);
    this.panelLayer = this.add.container(0, 0).setDepth(30);
  }

  // ── Board drawing ────────────────────────────────────────────────────────

  drawBoard() {
    const g = this.bgLayer;
    const t = MAP.theme;

    // Sky gradient
    g.fillGradientStyle(t.sky, t.sky, t.ground, t.ground, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Board shadow
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(10, BOARD.y - 8, BOARD.w + 8, BOARD.h + 16, 28);

    // Board background
    g.fillStyle(t.ground, 1);
    g.fillRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 20);
    g.lineStyle(5, t.pathEdge, 0.35);
    g.strokeRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 20);

    // Checkerboard tiles
    const tile = 32;
    for (let y = BOARD.y; y < BOARD.y + BOARD.h; y += tile) {
      for (let x = BOARD.x; x < BOARD.x + BOARD.w; x += tile) {
        const even = ((x / tile) + (y / tile)) % 2 === 0;
        g.fillStyle(even ? t.tileA : t.tileB, 0.5);
        g.fillRect(x, y, tile, tile);
      }
    }

    // Water border strips (left + bottom)
    g.fillStyle(t.water, 0.9);
    g.fillRoundedRect(0, BOARD.y - 2, BOARD.x - 2, BOARD.h + 4, 8);   // left
    g.fillRoundedRect(BOARD.x + BOARD.w + 2, BOARD.y - 2, GAME_WIDTH - BOARD.x - BOARD.w - 2, BOARD.h + 4, 8); // right

    // Water shimmer lines
    g.lineStyle(1, 0x40c0e0, 0.18);
    for (let wy = BOARD.y + 12; wy < BOARD.y + BOARD.h; wy += 20) {
      g.beginPath(); g.moveTo(2, wy); g.lineTo(BOARD.x - 4, wy); g.strokePath();
      g.beginPath(); g.moveTo(BOARD.x + BOARD.w + 4, wy); g.lineTo(GAME_WIDTH - 2, wy); g.strokePath();
    }

    // Dense tree line in water border
    this.drawTreeLine();

    // Board fog vignette
    g.fillStyle(t.fog, 0.12);
    g.fillRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 20);
  }

  drawTreeLine() {
    const g = this.bgLayer;
    // Left border trees
    for (let i = 0; i < 14; i++) {
      const y = BOARD.y + 18 + i * 38;
      const x = 6 + (i % 2) * 4;
      this.drawTree(g, x, y, 0.75 + (i % 3) * 0.1);
    }
    // Right border trees
    for (let i = 0; i < 14; i++) {
      const y = BOARD.y + 18 + i * 38;
      const x = BOARD.x + BOARD.w + 8 + (i % 2) * 4;
      this.drawTree(g, x, y, 0.7 + (i % 3) * 0.1);
    }
  }

  drawTree(g, x, y, s = 1) {
    g.fillStyle(0x4a3010, 1);
    g.fillRect(x - 3 * s, y + 6 * s, 6 * s, 14 * s);
    g.fillStyle(0x1a4a20, 1);
    g.fillCircle(x, y, 12 * s);
    g.fillStyle(0x0e3018, 1);
    g.fillCircle(x - 6 * s, y + 3 * s, 8 * s);
    g.fillCircle(x + 6 * s, y + 2 * s, 8 * s);
    // Canopy highlight
    g.fillStyle(0x2a7030, 0.6);
    g.fillCircle(x - 2 * s, y - 3 * s, 5 * s);
  }

  drawPath() {
    const g = this.pathLayer;
    const t = MAP.theme;
    const path = MAP.path;
    const hw = 26, hi = 20;

    path.forEach(([x, y], i) => {
      if (i === 0) return;
      const [px, py] = path[i - 1];
      if (px === x) {
        const top = Math.min(py, y), h = Math.abs(y - py);
        g.fillStyle(t.pathEdge, 1);
        g.fillRect(x - hw, top - hw, hw * 2, h + hw * 2);
        g.fillStyle(t.path, 1);
        g.fillRect(x - hi, top - hi, hi * 2, h + hi * 2);
        // Path highlight stripe
        g.fillStyle(0xffffff, 0.10);
        g.fillRect(x - 2, top - hi + 6, 4, h + hi * 2 - 12);
      } else {
        const left = Math.min(px, x), w = Math.abs(x - px);
        g.fillStyle(t.pathEdge, 1);
        g.fillRect(left - hw, y - hw, w + hw * 2, hw * 2);
        g.fillStyle(t.path, 1);
        g.fillRect(left - hi, y - hi, w + hi * 2, hi * 2);
        g.fillStyle(0xffffff, 0.10);
        g.fillRect(left - hi + 6, y - 2, w + hi * 2 - 12, 4);
      }
    });

    // Path corner joints
    path.forEach(([x, y]) => {
      g.fillStyle(t.pathEdge, 1); g.fillCircle(x, y, hw);
      g.fillStyle(t.path, 1);    g.fillCircle(x, y, hi);
      g.fillStyle(0xffffff, 0.08); g.fillCircle(x - 4, y - 4, 5);
    });

    // Start / end markers
    const [sx, sy] = path[0];
    const [ex, ey] = path[path.length - 1];
    this.add.text(sx, sy, "▶", { fontSize: "16px", color: "#6adf4a" }).setOrigin(0.5).setDepth(2);
    this.add.text(ex, ey, "🏰", { fontSize: "18px" }).setOrigin(0.5).setDepth(2);
  }

  drawPads() {
    MAP.pads.forEach((pad) => {
      const view  = this.add.container(pad.x, pad.y);
      const base  = this.add.graphics();
      const plus  = this.add.text(0, 1, "+", {
        fontFamily: "Georgia, serif", fontSize: "22px", fontStyle: "bold",
        color: "#c8f080", stroke: "#0a2010", strokeThickness: 4,
      }).setOrigin(0.5);
      const hit = this.add.circle(0, 0, 28, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      hit.on("pointerdown", () => this.handlePadTap(pad));
      view.add([base, plus, hit]);
      this.padLayer.add(view);
      const pv = { pad, view, base, plus, occupied: false };
      this.padViews.push(pv);
      this.drawPadGraphic(base, false, false);
    });
  }

  drawPadGraphic(g, selected, occupied) {
    g.clear();
    // Shadow
    g.fillStyle(0x000000, 0.22);
    g.fillEllipse(3, 10, 44, 18);
    // Pad base
    g.fillStyle(0x2a5018, 1);
    g.fillCircle(0, 0, 24);
    g.lineStyle(selected ? 4 : 3, selected ? 0xc8f080 : 0x4a8030, 1);
    g.strokeCircle(0, 0, 24);
    // Moss ring
    g.lineStyle(2, 0x6adf4a, occupied ? 0.2 : 0.45);
    g.strokeCircle(0, 0, 16);
    if (occupied) {
      g.lineStyle(4, 0xffffff, 0.12);
      g.strokeCircle(0, 0, 26);
    }
  }

  // ── HUD ──────────────────────────────────────────────────────────────────

  createHUD() {
    this.ui = {};

    // Top band
    const band = this.add.graphics();
    band.fillStyle(0x061008, 0.88);
    band.fillRoundedRect(8, 8, GAME_WIDTH - 16, 92, 18);
    band.lineStyle(3, 0x1a5028, 0.8);
    band.strokeRoundedRect(8, GAME_WIDTH - 16, GAME_WIDTH - 16, 92, 18);
    // Reuse correct coords
    band.clear();
    band.fillStyle(0x061008, 0.88);
    band.fillRoundedRect(8, 8, GAME_WIDTH - 16, 92, 18);
    band.lineStyle(3, 0x1a5028, 0.8);
    band.strokeRoundedRect(8, 8, GAME_WIDTH - 16, 92, 18);
    this.uiLayer.add(band);

    // Menu button
    this.hudBtn(18, 16, 42, 42, "☰", () => this.scene.start("MenuScene"), 0x0d2016, 0x1a5028);

    // Map name chip
    this.mapChip(68, 16, 108, 42);

    // Stat chips
    this.statChip(184, 16, 66, 42, "⭐", "score",  "#c8f080");
    this.statChip(258, 16, 60, 42, "🪙", "gold",   "#ffd447");
    this.statChip(326, 16, 52, 42, "❤",  "lives",  "#ff8080");

    // Wave row
    this.waveChip(18, 66, 70, 26);
    this.modifierChip(96, 66, 130, 26);
    this.nextWaveBtn(234, 58, 180, 38);
  }

  hudBtn(x, y, w, h, label, fn, fill, stroke) {
    const r = this.add.rectangle(x + w/2, y + h/2, w, h, fill, 1)
      .setStrokeStyle(2, stroke, 1).setInteractive({ useHandCursor: true });
    const t = this.add.text(x + w/2, y + h/2, label, {
      fontSize: "20px", fontStyle: "bold", color: "#4a8a50",
    }).setOrigin(0.5);
    r.on("pointerdown", () => { audioSystem.sfx("click"); fn(); });
    this.uiLayer.add([r, t]);
  }

  mapChip(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x0d2016, 1);
    g.fillRoundedRect(x, y, w, h, 14);
    g.lineStyle(2, 0x1a5028, 1);
    g.strokeRoundedRect(x, y, w, h, 14);
    const t = this.add.text(x + w/2, y + h/2, "🌿 Jungle", {
      fontFamily: "monospace", fontSize: "13px", fontStyle: "bold", color: "#6adf4a",
    }).setOrigin(0.5);
    this.uiLayer.add([g, t]);
  }

  statChip(x, y, w, h, icon, key, color) {
    const g = this.add.graphics();
    g.fillStyle(0x0a1a0f, 1);
    g.fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(2, 0x1a4020, 0.9);
    g.strokeRoundedRect(x, y, w, h, 12);
    const ic = this.add.text(x + 7, y + h/2 - 9, icon, { fontSize: "16px" });
    const val = this.add.text(x + 28, y + h/2 - 9, "0", {
      fontFamily: "monospace", fontSize: "17px", fontStyle: "bold",
      color, stroke: "#061008", strokeThickness: 3,
    });
    this.uiLayer.add([g, ic, val]);
    this.ui[key] = val;
  }

  waveChip(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x0a1a0f, 0.95);
    g.fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(2, 0x1a4020, 0.8);
    g.strokeRoundedRect(x, y, w, h, 10);
    this.uiLayer.add(g);
    const label = this.add.text(x + 8, y + 5, "WAVE", { fontFamily: "monospace", fontSize: "9px", color: "#2a5030" });
    const val   = this.add.text(x + 42, y + 3, "1", {
      fontFamily: "monospace", fontSize: "16px", fontStyle: "bold",
      color: "#6adf4a", stroke: "#061008", strokeThickness: 3,
    });
    this.uiLayer.add([label, val]);
    this.ui.wave = val;
  }

  modifierChip(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x0a1a0f, 0.95);
    g.fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(2, 0x1a4020, 0.8);
    g.strokeRoundedRect(x, y, w, h, 10);
    this.uiLayer.add(g);
    const val = this.add.text(x + w/2, y + h/2, "–", {
      fontFamily: "monospace", fontSize: "10px", fontStyle: "bold",
      color: "#3a6040", stroke: "#061008", strokeThickness: 2,
    }).setOrigin(0.5);
    this.uiLayer.add(val);
    this.ui.modifier = val;
  }

  nextWaveBtn(x, y, w, h) {
    const rect = this.add.rectangle(x + w/2, y + h/2, w, h, 0x0e3a1a, 1)
      .setStrokeStyle(3, 0x6adf4a, 1).setInteractive({ useHandCursor: true });
    const text = this.add.text(x + w/2, y + h/2, "▶ NEXT WAVE", {
      fontFamily: "monospace", fontSize: "15px", fontStyle: "bold",
      color: "#c8f080", stroke: "#061008", strokeThickness: 4,
    }).setOrigin(0.5);

    // 2x speed button
    const sx = x + w + 6;
    const speedRect = this.add.rectangle(sx + 26, y + h/2, 50, h, 0x0a1a0f, 1)
      .setStrokeStyle(2, 0x1a4020, 1).setInteractive({ useHandCursor: true });
    const speedText = this.add.text(sx + 26, y + h/2, "1×", {
      fontFamily: "monospace", fontSize: "13px", fontStyle: "bold", color: "#2a5030",
    }).setOrigin(0.5);

    speedRect.on("pointerdown", () => {
      audioSystem.sfx("click");
      this.gameState.speed = this.gameState.speed === 1 ? 2 : 1;
      speedText.setText(this.gameState.speed === 2 ? "2×" : "1×");
      speedText.setColor(this.gameState.speed === 2 ? "#6adf4a" : "#2a5030");
      speedRect.setStrokeStyle(2, this.gameState.speed === 2 ? 0x3a8040 : 0x1a4020, 1);
    });

    rect.on("pointerdown", () => {
      audioSystem.sfx("click");
      this.startWave();
    });
    this.uiLayer.add([rect, text, speedRect, speedText]);
    this.waveBtn = { rect, text };
  }

  // ── Bottom Dock ───────────────────────────────────────────────────────────

  createDock() {
    const dockY = 638;
    const dockH = 122;

    const g = this.add.graphics();
    // Dark wood dock
    g.fillStyle(0x061008, 0.97);
    g.fillRoundedRect(0, dockY - 4, GAME_WIDTH, dockH + 8, 14);
    g.fillStyle(0x0d2016, 1);
    g.fillRect(0, dockY, GAME_WIDTH, 10);
    g.lineStyle(4, 0x1a5028, 0.8);
    g.beginPath(); g.moveTo(0, dockY + 2); g.lineTo(GAME_WIDTH, dockY + 2); g.strokePath();
    // Vine decorations on dock border
    g.lineStyle(2, 0x2a6030, 0.4);
    for (let vx = 20; vx < GAME_WIDTH; vx += 40) {
      g.beginPath(); g.moveTo(vx, dockY + 2); g.lineTo(vx + 12, dockY - 6); g.strokePath();
    }
    this.uiLayer.add(g);

    // Tier labels
    const tiers = [
      { tier: 1, x: 41,  label: "T1",  color: "#2a5030", unlock: 1  },
      { tier: 2, x: 123, label: "T2",  color: "#1a6030", unlock: 10 },
      { tier: 3, x: 205, label: "T3",  color: "#1a7030", unlock: 30 },
      { tier: 4, x: 287, label: "T4",  color: "#1a8040", unlock: 60 },
    ];
    tiers.forEach(({ x, label, color }) => {
      this.add.text(x + 58, dockY + 6, label, {
        fontFamily: "monospace", fontSize: "9px", color,
      }).setOrigin(0.5).setDepth(21);
    });

    // Tower cards — 5 per row, 4 tiers = 20 cards laid out in 4 groups of 5
    TOWER_ORDER.forEach((kind, idx) => {
      const tier = TOWERS[kind].tier;
      const tierIdx = tier - 1;
      const posInTier = idx - tierIdx * 5;
      const cardX = 18 + tierIdx * 82 + posInTier * 14;
      // 4 tiers × 5 cards spread across 430px: each tier section ~105px wide
      const x = 18 + tierIdx * 106 + posInTier * 18;
      // Simpler layout: all 20 cards in a scrollable row at the bottom
      // Use a compact 2-row layout: T1+T2 top row, T3+T4 bottom row
      const row = tierIdx < 2 ? 0 : 1;
      const col = (tierIdx % 2) * 5 + posInTier;
      const cx = 22 + col * 42;
      const cy = dockY + 18 + row * 50;
      this.createTowerCard(kind, cx, cy, dockY);
    });
  }

  createTowerCard(kind, x, y, dockY) {
    const tower = TOWERS[kind];
    const con   = this.add.container(x, y);

    const card = this.add.rectangle(0, 0, 38, 44, 0x0d2016, 1)
      .setStrokeStyle(2, 0x1a5028, 1).setInteractive({ useHandCursor: true });
    const sprite = this.add.sprite(0, -8, tower.texture).setScale(0.5);
    const cost   = this.add.text(0, 16, String(tower.cost), {
      fontFamily: "monospace", fontSize: "9px", fontStyle: "bold",
      color: "#c8a050", stroke: "#061008", strokeThickness: 2,
    }).setOrigin(0.5);
    const tierDot = this.add.rectangle(-14, -18, 8, 8, [0x2a7030, 0x3a9040, 0x50b850, 0x6adf4a][tower.tier - 1], 1);

    con.add([card, sprite, cost, tierDot]);
    card.on("pointerdown", () => this.selectBuild(kind));
    this.uiLayer.add(con);
    this.shopCards.push({ kind, con, card, cost, sprite });
  }

  // ── Ambient ───────────────────────────────────────────────────────────────

  createAmbient() {
    // Fireflies
    this.time.addEvent({
      delay: 380, loop: true,
      callback: () => {
        const x = Phaser.Math.Between(BOARD.x + 4, BOARD.x + BOARD.w - 4);
        const y = Phaser.Math.Between(BOARD.y + 8, BOARD.y + BOARD.h - 8);
        const dot = this.add.circle(x, y, Phaser.Math.Between(1, 2), 0x90ff80, 0.0).setDepth(2);
        this.tweens.add({
          targets: dot,
          alpha: { from: 0, to: 0.45 },
          y: y - Phaser.Math.Between(14, 38),
          duration: Phaser.Math.Between(1200, 2400),
          yoyo: true,
          onComplete: () => dot.destroy(),
        });
      },
    });
  }

  // ── Tower selection / placement ───────────────────────────────────────────

  selectBuild(kind) {
    const def = TOWERS[kind];
    if (def.tier > this.gameState.unlockedTier) {
      const unlockWave = TIER_UNLOCK[def.tier];
      return this.toast(`Tier ${def.tier} unlocks at wave ${unlockWave}`);
    }
    if (this.gameState.gold < def.cost) {
      return this.toast(`Need ${def.cost}g — not enough gold`);
    }
    this.gameState.selectedBuild = kind;
    this.hidePanel();
    this.deselectTower();
    this.shopCards.forEach((c) =>
      c.card.setStrokeStyle(2, c.kind === kind ? 0x6adf4a : 0x1a5028, 1)
    );
    this.padViews.forEach(({ base, occupied }) =>
      this.drawPadGraphic(base, !occupied, occupied)
    );
    this.toast(`${def.name} (${def.cost}g) — tap a green pad`);
  }

  handlePadTap(pad) {
    const view = this.padViews.find((p) => p.pad === pad);
    if (view?.occupied) {
      // Tap occupied pad to select the tower on it
      const tower = this.gameState.towers.find(
        (t) => t.pad === pad
      );
      if (tower) this.selectTower(tower);
      return;
    }
    if (!this.gameState.selectedBuild) return this.toast("Pick a tower from the dock first");
    const def = TOWERS[this.gameState.selectedBuild];
    if (this.gameState.gold < def.cost) return this.toast("Not enough gold");

    this.gameState.gold -= def.cost;
    this.gameState.stats.spent += def.cost;

    const tower = new Tower(this, this.gameState.selectedBuild, pad);
    this.gameState.towers.push(tower);
    this.towerLayer.add([tower.sprite, tower.levelBadge]);

    view.occupied = true;
    view.plus.setVisible(false);
    this.drawPadGraphic(view.base, false, true);
    this.gameState.selectedBuild = null;
    this.shopCards.forEach((c) => c.card.setStrokeStyle(2, 0x1a5028, 1));
    audioSystem.sfx("place");
    this.markDirty();
  }

  selectTower(tower) {
    this.deselectTower();
    this.selectedTower = tower;
    this.gameState.selectedBuild = null;
    this.shopCards.forEach((c) => c.card.setStrokeStyle(2, 0x1a5028, 1));
    tower.showRange();
    this.showTowerPanel(tower);
  }

  deselectTower() {
    if (this.selectedTower) {
      this.selectedTower.hideRange();
      this.selectedTower = null;
    }
    this.hidePanel();
  }

  // ── Tower panel ───────────────────────────────────────────────────────────

  showTowerPanel(tower) {
    this.hidePanel();
    const def  = tower.def;
    const upgCost = tower.level >= 5 ? 0 : Math.floor(def.cost * 0.55 + tower.level * 70);
    const sellVal = Math.floor(def.cost * 0.45 * tower.level);

    const bg = this.add.rectangle(GAME_WIDTH / 2, 600, GAME_WIDTH - 16, 88, 0x061008, 0.97)
      .setStrokeStyle(2, 0x1a5028, 1);
    const iconBg = this.add.circle(34, 600, 24, 0x0d2016, 1).setStrokeStyle(2, 0x1a5028, 1);
    const icon   = this.add.sprite(34, 600, def.texture).setScale(0.7);
    const name   = this.add.text(62, 574, `${def.name}  Lv ${tower.level}/5`, {
      fontFamily: "monospace", fontSize: "15px", fontStyle: "bold", color: "#c8f080",
    });
    const stats  = this.add.text(62, 594, `DMG ${Math.round(def.damage * tower.level)}  RNG ${tower.range}  ${def.role}`, {
      fontFamily: "monospace", fontSize: "10px", color: "#3a7040",
    });

    // Targeting toggle
    const tgtBtn = this.panelBtn(62, 618, 78, 28, `▷ ${tower.targetLabel}`, () => {
      const label = tower.cycleTarget();
      tgtBtnText.setText(`▷ ${label}`);
      audioSystem.sfx("click");
    }, 0x0d2016, 0x1a5028, "#4a8a50");
    const tgtBtnText = tgtBtn[1];

    // Upgrade button
    const upLabel  = tower.level >= 5 ? "MAX LV" : `▲ ${upgCost}g`;
    const upColor  = tower.level >= 5 ? 0x1a3020 : 0x1a6028;
    const upStroke = tower.level >= 5 ? 0x1a3020 : 0x6adf4a;
    const upBtn    = this.panelBtn(148, 618, 96, 28, upLabel, () => {
      if (tower.level >= 5) return;
      if (this.gameState.gold < upgCost) return this.toast("Not enough gold");
      this.gameState.gold -= upgCost;
      tower.upgrade();
      audioSystem.sfx("upgrade");
      this.showTowerPanel(tower);
      this.markDirty();
    }, upColor, upStroke, tower.level >= 5 ? "#1a3020" : "#c8f080");

    // Sell button
    const sellBtn = this.panelBtn(252, 618, 80, 28, `$ ${sellVal}g`, () => {
      this.sellTower(tower, sellVal);
    }, 0x1a0a08, 0x4a1010, "#c06050");

    // Close
    const closeBtn = this.panelBtn(340, 618, 52, 28, "✕", () => {
      this.deselectTower();
    }, 0x0a1208, 0x1a3020, "#2a5030");

    this.panelLayer.add([bg, iconBg, icon, name, stats, ...tgtBtn, ...upBtn, ...sellBtn, ...closeBtn]);
  }

  panelBtn(x, y, w, h, label, fn, fill, stroke, color) {
    const r = this.add.rectangle(x + w/2, y + h/2, w, h, fill, 1)
      .setStrokeStyle(1.5, stroke, 1).setInteractive({ useHandCursor: true });
    const t = this.add.text(x + w/2, y + h/2, label, {
      fontFamily: "monospace", fontSize: "11px", fontStyle: "bold", color,
    }).setOrigin(0.5);
    r.on("pointerdown", () => { audioSystem.sfx("click"); fn(); });
    return [r, t];
  }

  hidePanel() { this.panelLayer.removeAll(true); }

  sellTower(tower, value) {
    this.gameState.gold += value;
    tower.destroy();
    this.gameState.towers = this.gameState.towers.filter((t) => t !== tower);
    const pv = this.padViews.find((p) => p.pad === tower.pad);
    if (pv) {
      pv.occupied = false;
      pv.plus.setVisible(true);
      this.drawPadGraphic(pv.base, false, false);
    }
    this.selectedTower = null;
    this.hidePanel();
    audioSystem.sfx("sell");
    this.markDirty();
  }

  // ── Wave logic ────────────────────────────────────────────────────────────

  startWave() {
    if (this.gameState.waveActive || this.gameState.gameOver || this.gameState.won) return;
    this.gameState.updateTierUnlock();

    const wave = buildWave(this.gameState.wave);
    this.gameState.currentWave = wave;
    this.gameState.spawnQueue  = wave.roles.map((role, i) => ({
      role, delay: i * this.spawnSpacing,
    }));
    this.gameState.spawnTimer  = 0;
    this.gameState.waveActive  = true;

    const mod = WAVE_MODIFIERS[wave.modifierKey];
    this.toast(`Wave ${this.gameState.wave} — ${mod.label}`);
    audioSystem.sfx(wave.modifierKey === "boss" || wave.modifierKey === "apocalypse" ? "boss" : "wave");

    if (wave.modifierKey === "boss" || wave.modifierKey === "apocalypse") {
      this.showBossAlert(mod.label);
    }

    // Check tier unlocks
    this.gameState.updateTierUnlock();
    const prevTier = TIER_UNLOCK[this.gameState.unlockedTier];
    if (this.gameState.wave === 10 || this.gameState.wave === 30 || this.gameState.wave === 60) {
      this.showTierUnlock(this.gameState.unlockedTier);
    }

    this.markDirty();
  }

  showBossAlert(label) {
    const shade = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45).setDepth(40);
    const card  = this.add.rectangle(GAME_WIDTH/2, 320, 360, 100, 0x061008, 0.96)
      .setStrokeStyle(5, 0x6adf4a, 1).setDepth(41);
    const title = this.add.text(GAME_WIDTH/2, 294, "⚠ " + label.toUpperCase() + " ⚠", {
      fontFamily: "Georgia, serif", fontSize: "24px", fontStyle: "bold",
      color: "#c8f080", stroke: "#061008", strokeThickness: 5,
    }).setOrigin(0.5).setDepth(42);
    const sub = this.add.text(GAME_WIDTH/2, 330, "All enemies empowered", {
      fontFamily: "monospace", fontSize: "13px", color: "#4a8a50",
    }).setOrigin(0.5).setDepth(42);
    this.time.delayedCall(1200, () => [shade, card, title, sub].forEach((o) => o.destroy()));
  }

  showTierUnlock(tier) {
    const colors = ["", "#4a8a50", "#6adf4a", "#a0ff60", "#c8ff80"];
    const shade = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setDepth(40);
    const card  = this.add.rectangle(GAME_WIDTH/2, 300, 340, 90, 0x061008, 0.97)
      .setStrokeStyle(4, 0x6adf4a, 1).setDepth(41);
    const t1 = this.add.text(GAME_WIDTH/2, 278, `TIER ${tier} TOWERS UNLOCKED`, {
      fontFamily: "monospace", fontSize: "16px", fontStyle: "bold", color: colors[tier],
    }).setOrigin(0.5).setDepth(42);
    const t2 = this.add.text(GAME_WIDTH/2, 306, "5 new towers available in the dock", {
      fontFamily: "monospace", fontSize: "11px", color: "#3a7040",
    }).setOrigin(0.5).setDepth(42);
    audioSystem.sfx("unlock");
    this.time.delayedCall(2000, () => [shade, card, t1, t2].forEach((o) => o.destroy()));
  }

  // ── Game loop ─────────────────────────────────────────────────────────────

  update(time, delta) {
    if (this.gameState.gameOver || this.gameState.won) {
      this.flushUI();
      return;
    }
    const spd = this.gameState.speed;
    const dt  = Math.min(0.034, delta / 1000) * spd;
    const now = (time / 1000) * spd;

    this.tickSpawns(dt);
    this.tickEnemies(dt, now);
    this.tickTowers(dt, now);
    this.cleanupEnemies();
    this.checkWaveEnd();
    this.flushUI();
  }

  tickSpawns(dt) {
    if (!this.gameState.waveActive) return;
    this.gameState.spawnTimer += dt / this.gameState.speed;
    while (
      this.gameState.spawnQueue.length &&
      this.gameState.spawnTimer >= this.gameState.spawnQueue[0].delay
    ) {
      this.spawnEnemy(this.gameState.spawnQueue.shift().role);
    }
  }

  spawnEnemy(role) {
    const enemy = new Enemy(this, role, MAP.path, this.gameState.wave, this.gameState.currentWave.modifierKey);
    this.gameState.enemies.push(enemy);
    this.enemyLayer.add([enemy.sprite, enemy.hpBack, enemy.hpBar]);
  }

  tickEnemies(dt, now) {
    this.gameState.enemies.forEach((e) => e.update(dt, now));
    this.gameState.enemies.filter((e) => e.reached).forEach((e) => {
      const dmg = e.role === "warlord" ? 4 : e.role === "titan" ? 2 : 1;
      this.gameState.lives -= dmg;
      e.dead = true;
      this.burst(e.sprite.x, e.sprite.y, 0xef4444, 32);
      if (this.gameState.lives <= 0) this.endGame();
    });
  }

  tickTowers(dt, now) {
    this.gameState.towers.forEach((t) => t.update(dt, this.gameState.enemies, now));
  }

  cleanupEnemies() {
    const killed = this.gameState.enemies.filter((e) => e.dead && !e.reached);
    killed.forEach((e) => {
      this.gameState.gold  += e.reward;
      this.gameState.score += e.reward + this.gameState.wave * 4;
      this.gameState.stats.kills++;
      this.floatText(e.sprite.x, e.sprite.y, `+${e.reward}`, "#c8f080");
      this.burst(e.sprite.x, e.sprite.y, e.theme.color, 36);
    });
    this.gameState.enemies = this.gameState.enemies.filter((e) => {
      if (e.dead || e.reached) { e.destroy(); return false; }
      return true;
    });
    if (killed.length) this.markDirty();
  }

  checkWaveEnd() {
    if (!this.gameState.waveActive || this.gameState.spawnQueue.length || this.gameState.enemies.length) return;
    this.gameState.waveActive = false;

    const goldBonus  = waveEndGold(this.gameState.wave);
    const scoreBonus = waveEndScore(this.gameState.wave);
    this.gameState.gold  += goldBonus;
    this.gameState.score += scoreBonus;
    this.floatText(GAME_WIDTH / 2, 300, `+${goldBonus}g`, "#ffd447");

    if (this.gameState.wave >= 100) return this.endGame(true);

    this.gameState.wave++;
    this.gameState.stats.peakWave = this.gameState.wave;
    this.gameState.updateTierUnlock();

    // Update dock card affordability / tier state
    this.markDirty();
    this.toast(`Wave ${this.gameState.wave - 1} cleared! +${goldBonus}g`);
  }

  endGame(won = false) {
    this.gameState.won     = won;
    this.gameState.gameOver = !won;
    saveSystem.recordRun(this.gameState.wave, this.gameState.score);
    this.showEndPanel(won);
    this.markDirty();
  }

  showEndPanel(won) {
    this.hidePanel();
    this.panelLayer.removeAll(true);
    const w = this.gameState.wave;
    const tier = w >= 100 ? "LEGEND" : w >= 70 ? "MASTER" : w >= 30 ? "VETERAN" : w >= 10 ? "SCOUT" : "RECRUIT";
    const tierColor = w >= 100 ? "#a0ff60" : w >= 70 ? "#6adf4a" : w >= 30 ? "#4a8a50" : "#2a5030";

    const shade = this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    const card  = this.add.rectangle(GAME_WIDTH/2, 360, GAME_WIDTH - 40, 300,
      won ? 0x0a2010 : 0x100808, 0.97
    ).setStrokeStyle(5, won ? 0x6adf4a : 0x6a2020, 1);

    const title = this.add.text(GAME_WIDTH/2, 252, won ? "🌿 JUNGLE CLEARED!" : "💀 GATE BREACHED", {
      fontFamily: "Georgia, serif", fontSize: "26px", fontStyle: "bold",
      color: won ? "#c8f080" : "#ff8080", stroke: "#061008", strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH/2, 292, tier, {
      fontFamily: "monospace", fontSize: "20px", fontStyle: "bold", color: tierColor,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH/2, 340, [
      `Wave Reached:  ${w}`,
      `Score:         ${this.gameState.score.toLocaleString()}`,
      `Kills:         ${this.gameState.stats.kills}`,
      `Lives Left:    ${Math.max(0, this.gameState.lives)}`,
      `Gold Spent:    ${this.gameState.stats.spent}`,
    ].join("\n"), {
      fontFamily: "monospace", fontSize: "14px", color: "#4a8a50", align: "left",
      lineSpacing: 6,
    }).setOrigin(0.5);

    // Buttons
    const retry = this.panelBtn(130, 466, 160, 48, "↺ TRY AGAIN", () => {
      this.scene.restart();
    }, 0x0a1a10, 0x1a5028, "#6adf4a");

    const menu = this.panelBtn(310, 466, 120, 48, "MENU", () => {
      this.scene.start("MenuScene");
    }, 0x0a100a, 0x1a3020, "#3a6040");

    this.panelLayer.add([shade, card, title, ...retry, ...menu]);
  }

  // ── FX helpers ────────────────────────────────────────────────────────────

  drawShot(x1, y1, x2, y2, colorHex, kind) {
    const g = this.add.graphics().setDepth(9);
    g.lineStyle(kind === "chain" ? 2 : 3, colorHex, 0.9);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath();
    this.tweens.add({ targets: g, alpha: 0, duration: 110, onComplete: () => g.destroy() });
  }

  burst(x, y, colorHex, radius) {
    const c = this.add.circle(x, y, 4, colorHex, 0.4).setDepth(9);
    this.tweens.add({ targets: c, radius, alpha: 0, duration: 260, onComplete: () => c.destroy() });
  }

  floatText(x, y, text, color) {
    const t = this.add.text(x, y, String(text), {
      fontFamily: "monospace", fontSize: "13px", fontStyle: "bold",
      color, stroke: "#061008", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10);
    this.tweens.add({ targets: t, y: y - 32, alpha: 0, duration: 700, onComplete: () => t.destroy() });
  }

  toast(msg) {
    if (this.toastText) this.toastText.destroy();
    this.toastText = this.add.text(GAME_WIDTH / 2, 624, msg, {
      fontFamily: "monospace", fontSize: "12px", fontStyle: "bold",
      color: "#6adf4a", stroke: "#061008", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(31);
    this.time.delayedCall(1800, () => this.toastText?.destroy());
  }

  // ── UI flush ─────────────────────────────────────────────────────────────

  markDirty() { this.uiDirty = true; }

  flushUI() {
    if (!this.uiDirty) return;
    this.ui.score.setText(this.gameState.score.toLocaleString());
    this.ui.wave.setText(String(this.gameState.wave));
    this.ui.gold.setText(String(Math.floor(this.gameState.gold)));
    this.ui.lives.setText(String(Math.max(0, this.gameState.lives)));

    const modKey = this.gameState.currentWave?.modifierKey;
    const modLabel = modKey ? WAVE_MODIFIERS[modKey]?.label : "–";
    this.ui.modifier.setText(modLabel || "–");

    this.waveBtn.text.setText(
      this.gameState.gameOver || this.gameState.won ? "–" :
      this.gameState.waveActive ? "WAVE ACTIVE" : `▶ WAVE ${this.gameState.wave}`
    );
    this.waveBtn.rect.setFillStyle(this.gameState.waveActive ? 0x0a1a10 : 0x0e3a1a);

    // Dim unaffordable / locked tower cards
    this.shopCards.forEach(({ kind, card, cost, sprite }) => {
      const def  = TOWERS[kind];
      const locked    = def.tier > this.gameState.unlockedTier;
      const affordable = this.gameState.gold >= def.cost;
      const alpha = locked ? 0.22 : affordable ? 1 : 0.45;
      sprite.setAlpha(alpha);
      cost.setAlpha(alpha);
      card.setStrokeStyle(2, locked ? 0x0d1a10 : affordable ? 0x1a5028 : 0x1a3020, 1);
    });

    this.uiDirty = false;
  }
}
