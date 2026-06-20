import { GAME_WIDTH, GAME_HEIGHT } from "../../data/map.js";
import { saveSystem } from "../systems/SaveSystem.js";
import { audioSystem } from "../systems/AudioSystem.js";

const VERSION = "v1.0";

export class MenuScene extends Phaser.Scene {
  constructor() { super("MenuScene"); }

  create() {
    audioSystem.startMusic();
    this.drawBackground();
    this.drawTitle();
    this.drawSlots();
    this.drawProfileCard();
    this.drawStartButton();
    this.drawFooter();
  }

  shutdown() { audioSystem.stopMusic(); }

  drawBackground() {
    const g = this.add.graphics();
    // Deep cinematic jungle gradient
    g.fillGradientStyle(0x0d2016, 0x0d2016, 0x061008, 0x061008, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Atmospheric fog layers
    for (let i = 0; i < 6; i++) {
      g.fillStyle(0x1a4a28, 0.08 + i * 0.03);
      g.fillEllipse(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(100, GAME_HEIGHT - 100),
        Phaser.Math.Between(200, 380),
        Phaser.Math.Between(60, 120)
      );
    }

    // Distant tree canopy silhouettes
    g.fillStyle(0x0a1e0f, 1);
    for (let i = 0; i < 18; i++) {
      const x = (i * 76 + 20) % (GAME_WIDTH + 40) - 20;
      const h = 120 + (i % 4) * 40;
      const w = 28 + (i % 3) * 16;
      g.fillTriangle(x, GAME_HEIGHT - 40, x - w / 2, GAME_HEIGHT - 40 - h, x + w / 2, GAME_HEIGHT - 40 - h);
      g.fillRect(x - 5, GAME_HEIGHT - 40 - h, 10, h);
    }

    // Firefly particles
    for (let i = 0; i < 28; i++) {
      const x = Phaser.Math.Between(20, GAME_WIDTH - 20);
      const y = Phaser.Math.Between(80, GAME_HEIGHT - 80);
      const dot = this.add.circle(x, y, Phaser.Math.Between(1, 3), 0x90ff80, 0.0);
      this.tweens.add({
        targets: dot,
        alpha: { from: 0, to: 0.7 },
        duration: Phaser.Math.Between(800, 2400),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
      });
    }
  }

  drawTitle() {
    // Glow behind title
    const glow = this.add.graphics();
    glow.fillStyle(0x20a040, 0.08);
    glow.fillEllipse(215, 110, 380, 120);

    this.add.text(215, 72, "VERDANT", {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "52px",
      fontStyle: "bold",
      color: "#6adf4a",
      stroke: "#0a2010",
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(215, 126, "SIEGE", {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "32px",
      fontStyle: "bold",
      color: "#c8f080",
      stroke: "#0a2010",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(215, 158, "Jungle Tower Defense  •  100 Waves", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#4a8a50",
    }).setOrigin(0.5);
  }

  drawSlots() {
    this.add.text(215, 188, "SAVE SLOT", {
      fontFamily: "monospace", fontSize: "11px", color: "#4a7a50",
    }).setOrigin(0.5);

    [1, 2, 3].forEach((slot, i) => {
      const x = 130 + i * 85;
      const active = slot === saveSystem.slot;
      const bg = this.add.rectangle(x, 208, 72, 32,
        active ? 0x1a5028 : 0x0d2016, 1
      ).setStrokeStyle(2, active ? 0x6adf4a : 0x1a4020, 1)
        .setInteractive({ useHandCursor: true });

      this.add.text(x, 208, `SLOT ${slot}`, {
        fontFamily: "monospace", fontSize: "11px", fontStyle: "bold",
        color: active ? "#6adf4a" : "#2a5030",
      }).setOrigin(0.5);

      bg.on("pointerdown", () => {
        audioSystem.sfx("click");
        saveSystem.setSlot(slot);
        this.scene.restart();
      });
    });
  }

  drawProfileCard() {
    const p = saveSystem.getProfile();
    const g = this.add.graphics();
    g.fillStyle(0x0d2016, 0.96);
    g.fillRoundedRect(24, 234, GAME_WIDTH - 48, 120, 16);
    g.lineStyle(2, 0x1a5028, 1);
    g.strokeRoundedRect(24, 234, GAME_WIDTH - 48, 120, 16);

    this.add.text(44, 252, "CAMPAIGN RECORD", {
      fontFamily: "monospace", fontSize: "11px", color: "#2a6030",
    });

    const bestWave  = p.bestWave  || 0;
    const bestScore = p.bestScore || 0;
    const totalRuns = p.totalRuns || 0;

    // Best wave badge
    const waveColor = bestWave >= 70 ? "#ff8040" : bestWave >= 30 ? "#6adf4a" : "#4a7a50";
    this.add.text(44, 276, `BEST WAVE`, { fontFamily: "monospace", fontSize: "11px", color: "#3a6040" });
    this.add.text(44, 294, String(bestWave), {
      fontFamily: "Georgia, serif", fontSize: "34px", fontStyle: "bold",
      color: waveColor, stroke: "#061008", strokeThickness: 6,
    });

    this.add.text(164, 276, `BEST SCORE`, { fontFamily: "monospace", fontSize: "11px", color: "#3a6040" });
    this.add.text(164, 292, bestScore.toLocaleString(), {
      fontFamily: "monospace", fontSize: "20px", fontStyle: "bold", color: "#c8f080",
    });

    this.add.text(164, 318, `${totalRuns} run${totalRuns !== 1 ? "s" : ""}`, {
      fontFamily: "monospace", fontSize: "12px", color: "#2a5030",
    });

    // Tier unlock hints
    const hints = [
      { wave: 10, label: "T2 Unlocks", color: "#4a8a50" },
      { wave: 30, label: "T3 Unlocks", color: "#6adf4a" },
      { wave: 60, label: "T4 Unlocks", color: "#a0ff60" },
    ];
    hints.forEach(({ wave, label, color }, i) => {
      const x = 290 + i * 48;
      const reached = bestWave >= wave;
      this.add.text(x, 276, String(wave), {
        fontFamily: "monospace", fontSize: "14px", fontStyle: "bold",
        color: reached ? color : "#1a3020",
      }).setOrigin(0.5);
      this.add.text(x, 292, label.replace(" Unlocks", ""), {
        fontFamily: "monospace", fontSize: "8px", color: reached ? color : "#1a3020",
      }).setOrigin(0.5);
      this.add.text(x, 308, reached ? "✓" : "–", {
        fontFamily: "monospace", fontSize: "12px", color: reached ? color : "#1a3020",
      }).setOrigin(0.5);
    });
  }

  drawStartButton() {
    const g = this.add.graphics();
    g.fillStyle(0x1a5028, 0.2);
    g.fillRoundedRect(24, 372, GAME_WIDTH - 48, 340, 16);
    g.lineStyle(1, 0x1a5028, 1);
    g.strokeRoundedRect(24, 372, GAME_WIDTH - 48, 340, 16);

    this.add.text(215, 390, "JUNGLE MAP", {
      fontFamily: "monospace", fontSize: "11px", color: "#2a6030",
    }).setOrigin(0.5);

    // Map preview area
    this.add.text(215, 450, "🌿", { fontSize: "64px" }).setOrigin(0.5);
    this.add.text(215, 506, "Verdant Siege", {
      fontFamily: "Georgia, serif", fontSize: "22px", fontStyle: "bold",
      color: "#ffffff", stroke: "#0a2010", strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(215, 532, "100 waves  •  20 towers  •  8 enemies", {
      fontFamily: "monospace", fontSize: "11px", color: "#3a7040",
    }).setOrigin(0.5);
    this.add.text(215, 550, "Targeting modes  •  Range rings  •  4 tower tiers", {
      fontFamily: "monospace", fontSize: "11px", color: "#2a5030",
    }).setOrigin(0.5);

    // PLAY button
    const play = this.add.rectangle(215, 606, 260, 64, 0x1a6030, 1)
      .setStrokeStyle(3, 0x6adf4a, 1)
      .setInteractive({ useHandCursor: true });

    const playText = this.add.text(215, 606, "► ENTER THE JUNGLE", {
      fontFamily: "Georgia, serif", fontSize: "20px", fontStyle: "bold",
      color: "#c8f080", stroke: "#061008", strokeThickness: 5,
    }).setOrigin(0.5);

    // Pulse animation on play button
    this.tweens.add({
      targets: play,
      scaleX: 1.02, scaleY: 1.02,
      duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
    });

    play.on("pointerover", () => play.setFillStyle(0x226838));
    play.on("pointerout",  () => play.setFillStyle(0x1a6030));
    play.on("pointerdown", () => {
      audioSystem.sfx("click");
      this.scene.start("GameScene");
    });
  }

  drawFooter() {
    this.btn(130, 706, 180, 38, "NEW SLOT RUN", () => {
      if (!window.confirm("Reset this save slot?")) return;
      saveSystem.resetSlot();
      this.scene.restart();
    }, 0x0d2016, 0x1a4020, "#2a6030");

    this.btn(330, 706, 140, 38, `${VERSION}`, () => {}, 0x060e08, 0x0f2014, "#1a4020");
  }

  btn(x, y, w, h, label, fn, fill, stroke, color) {
    const r = this.add.rectangle(x, y, w, h, fill, 1)
      .setStrokeStyle(1, stroke, 1)
      .setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontFamily: "monospace", fontSize: "12px", color,
    }).setOrigin(0.5);
    r.on("pointerdown", () => { audioSystem.sfx("click"); fn(); });
  }
}
