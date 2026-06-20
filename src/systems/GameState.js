export class GameState {
  constructor() {
    this.gold        = 600;
    this.lives       = 25;
    this.wave        = 1;
    this.score       = 0;
    this.towers      = [];
    this.enemies     = [];
    this.spawnQueue  = [];
    this.spawnTimer  = 0;
    this.waveActive  = false;
    this.gameOver    = false;
    this.won         = false;
    this.currentWave = null;
    this.selectedBuild = null;
    this.stats       = { spent: 0, kills: 0, peakWave: 1 };
    this.speed       = 1;      // 1 or 2 (wave speed multiplier)
    this.unlockedTier = 1;     // increases at waves 10, 30, 60
  }

  updateTierUnlock() {
    if (this.wave >= 60) this.unlockedTier = 4;
    else if (this.wave >= 30) this.unlockedTier = 3;
    else if (this.wave >= 10) this.unlockedTier = 2;
    else this.unlockedTier = 1;
  }
}
