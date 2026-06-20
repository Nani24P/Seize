import { TOWERS } from "../../data/towers.js";

const TARGET_MODES  = ["first", "strong", "weak", "close"];
const TARGET_LABELS = { first: "1ST", strong: "STR", weak: "WEK", close: "CLO" };

export class Tower {
  constructor(scene, kind, pad) {
    this.scene       = scene;
    this.kind        = kind;
    this.def         = TOWERS[kind];
    this.pad         = pad;           // store reference directly
    this.x           = pad.x;
    this.y           = pad.y;
    this.level       = 1;
    this.cooldown    = 0;
    this.range       = this.def.range;
    this.targetMode  = "first";

    // Sprite
    this.sprite = scene.add.sprite(this.x, this.y, this.def.texture)
      .setDepth(5)
      .setInteractive({ useHandCursor: true });

    // Level badge
    this.levelBadge = scene.add.text(this.x + 18, this.y + 18, "1", {
      fontFamily: "monospace",
      fontSize: "13px",
      fontStyle: "900",
      color: "#ffffff",
      stroke: "#0a1a10",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(8);

    // Range ring (hidden by default)
    this.rangeRing = scene.add.circle(this.x, this.y, this.range, 0x6adf4a, 0)
      .setStrokeStyle(1.5, 0x6adf4a, 0.45)
      .setDepth(4);
    this.rangeRing.setVisible(false);

    this.sprite.on("pointerdown", () => scene.selectTower(this));
  }

  showRange()  { this.rangeRing.setVisible(true);  }
  hideRange()  { this.rangeRing.setVisible(false); }

  cycleTarget() {
    const idx = TARGET_MODES.indexOf(this.targetMode);
    this.targetMode = TARGET_MODES[(idx + 1) % TARGET_MODES.length];
    return TARGET_LABELS[this.targetMode];
  }

  get targetLabel() { return TARGET_LABELS[this.targetMode]; }

  update(dt, enemies, now) {
    this.cooldown -= dt;
    if (this.cooldown > 0) return;
    const target = this.findTarget(enemies);
    if (!target) return;
    this.fire(target, now);
    this.cooldown = this.def.fireRate / this.level;
  }

  findTarget(enemies) {
    const alive = enemies.filter(
      (e) => !e.dead && !e.reached &&
      Phaser.Math.Distance.Between(this.x, this.y, e.sprite.x, e.sprite.y) <= this.range
    );
    if (!alive.length) return null;
    switch (this.targetMode) {
      case "strong": return alive.sort((a, b) => b.hp - a.hp)[0];
      case "weak":   return alive.sort((a, b) => a.hp - b.hp)[0];
      case "close":  return alive.sort((a, b) =>
        Phaser.Math.Distance.Between(this.x, this.y, a.sprite.x, a.sprite.y) -
        Phaser.Math.Distance.Between(this.x, this.y, b.sprite.x, b.sprite.y)
      )[0];
      default:       return alive.sort((a, b) => b.pathIndex - a.pathIndex)[0];
    }
  }

  fire(target, now) {
    const dmg = this.def.damage * this.level;
    const scene = this.scene;
    const gs    = scene.gameState;

    if (this.def.pierce) {
      // Hit all enemies in line between tower and target
      const tx = target.sprite.x, ty = target.sprite.y;
      gs.enemies.forEach((e) => {
        if (e.dead || e.reached) return;
        const d = Phaser.Math.Distance.BetweenPoints(
          { x: this.x, y: this.y }, { x: tx, y: ty }
        );
        // Project enemy onto shot line
        const ex = e.sprite.x - this.x, ey = e.sprite.y - this.y;
        const lx = tx - this.x,          ly = ty - this.y;
        const t  = (ex * lx + ey * ly) / (d * d);
        if (t < 0 || t > 1) return;
        const perpDist = Math.abs(ex * ly - ey * lx) / d;
        if (perpDist <= e.radius + 4) e.damage(dmg, this.kind);
      });
    } else {
      target.damage(dmg, this.kind);
    }

    scene.drawShot(this.x, this.y, target.sprite.x, target.sprite.y, this.def.color, this.kind);

    // Splash
    if (this.def.splash) {
      scene.burst(target.sprite.x, target.sprite.y, this.def.color, this.def.splash);
      gs.enemies.forEach((e) => {
        if (e === target || e.dead) return;
        if (Phaser.Math.Distance.Between(e.sprite.x, e.sprite.y, target.sprite.x, target.sprite.y) <= this.def.splash) {
          e.damage(dmg * 0.52, this.kind);
        }
      });
    }

    // Slow
    if (this.def.slow) {
      target.slowFactor = this.def.slow;
      target.slowUntil  = now + this.def.slowTime;
    }

    // Burn / DoT
    if (this.def.burn) {
      target.burnDps   = this.def.burn * this.level;
      target.burnUntil = now + this.def.burnTime;
    }

    // Chain lightning
    if (this.def.chain) {
      gs.enemies
        .filter((e) => e !== target && !e.dead &&
          Phaser.Math.Distance.Between(e.sprite.x, e.sprite.y, target.sprite.x, target.sprite.y) < 100
        )
        .slice(0, this.def.chain)
        .forEach((e) => {
          e.damage(dmg * 0.62, this.kind);
          scene.drawShot(target.sprite.x, target.sprite.y, e.sprite.x, e.sprite.y, this.def.color, "chain");
        });
    }
  }

  upgrade() {
    if (this.level >= 5) return false;
    this.level++;
    this.range += 8;
    this.rangeRing.setRadius(this.range);
    this.sprite.setScale(1 + (this.level - 1) * 0.07);
    this.levelBadge.setText(String(this.level));
    return true;
  }

  destroy() {
    this.sprite.destroy();
    this.levelBadge.destroy();
    this.rangeRing.destroy();
  }
}
