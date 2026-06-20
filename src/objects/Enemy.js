import { ENEMY_ROLES, JUNGLE_ENEMIES, waveHpScale, waveSpeedScale } from "../../data/enemies.js";
import { WAVE_MODIFIERS } from "../../data/waves.js";

export class Enemy {
  constructor(scene, role, path, waveNumber, modifierKey) {
    this.scene       = scene;
    this.role        = role;
    this.path        = path;
    this.pathIndex   = 1;
    this.reached     = false;
    this.dead        = false;
    this.slowUntil   = 0;
    this.slowFactor  = 1;
    this.burnUntil   = 0;
    this.burnDps     = 0;

    const base = ENEMY_ROLES[role];
    const mod  = WAVE_MODIFIERS[modifierKey] || WAVE_MODIFIERS.normal;
    const hpScale    = waveHpScale(waveNumber);
    const spdScale   = waveSpeedScale(waveNumber);

    this.maxHp  = Math.round(base.hp * hpScale * mod.hp);
    this.hp     = this.maxHp;
    this.speed  = base.speed * spdScale * mod.speed;
    this.reward = Math.round(base.reward * mod.reward);
    this.radius = base.radius;
    this.arrowDamageMultiplier = base.arrowDamageMultiplier ?? 1;

    this.theme = JUNGLE_ENEMIES[role];

    const [sx, sy] = path[0];
    this.sprite = scene.add.sprite(sx, sy, this.theme.texture).setDepth(6);
    this.sprite.setScale(role === "warlord" ? 1.22 : role === "titan" ? 1.08 : 1.0);

    const barW = role === "warlord" ? 62 : role === "titan" ? 50 : 38;
    this.hpBack = scene.add.rectangle(sx, sy - this.radius - 13, barW, 5, 0x1a2530, 0.95).setDepth(7);
    this.hpBar  = scene.add.rectangle(sx, sy - this.radius - 13, barW, 5, 0x22c55e, 1).setOrigin(0, 0.5).setDepth(8);
    this._barW  = barW;
  }

  update(dt, now) {
    if (this.dead || this.reached) return;

    // Burn tick
    if (this.burnUntil > now) {
      this.hp -= this.burnDps * Math.min(dt, 0.05);
    }
    if (this.hp <= 0) { this.dead = true; return; }

    const target = this.path[this.pathIndex];
    if (!target) { this.reached = true; return; }

    const dx = target[0] - this.sprite.x;
    const dy = target[1] - this.sprite.y;
    const d  = Math.hypot(dx, dy);

    if (d < 3) {
      this.pathIndex++;
    } else {
      const slow = this.slowUntil > now ? this.slowFactor : 1;
      this.sprite.x += (dx / d) * this.speed * slow * dt;
      this.sprite.y += (dy / d) * this.speed * slow * dt;
    }

    this.updateBars();
  }

  updateBars() {
    const pct = Math.max(0, this.hp / this.maxHp);
    const bx  = this.sprite.x;
    const by  = this.sprite.y - this.radius - 13;
    this.hpBack.setPosition(bx, by);
    this.hpBar.setPosition(bx - this._barW / 2, by);
    this.hpBar.width     = this._barW * pct;
    this.hpBar.fillColor = pct > 0.5 ? 0x22c55e : pct > 0.25 ? 0xfacc15 : 0xef4444;
  }

  damage(amount, kind) {
    let final = amount;
    if (kind === "thorn" || kind === "dart" || kind === "sling") {
      final *= this.arrowDamageMultiplier;
    }
    // Venom+Cryo combo bonus: burning enemies take 20% more from slow towers
    if (this.burnUntil > 0 && (kind === "cryo" || kind === "web")) final *= 1.2;
    // Eclipse doubles damage vs slowed
    if (kind === "eclipse" && this.slowFactor < 1 && this.slowUntil > 0) final *= 2.0;
    this.hp -= final;
    this.scene.floatText(
      this.sprite.x,
      this.sprite.y - 20,
      Math.round(final),
      kind === "eclipse" && final > amount ? "#ff80ff" : "#ffffff"
    );
  }

  destroy() {
    this.sprite.destroy();
    this.hpBack.destroy();
    this.hpBar.destroy();
  }
}
