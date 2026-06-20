const SAVE_KEY = "verdant-siege-v1-save";

class SaveSystem {
  constructor() {
    this.slot = 1;
    this.data = this.load();
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY)) || this.emptySave();
    } catch {
      return this.emptySave();
    }
  }

  emptySave() {
    return {
      version: "1.0",
      activeSlot: 1,
      slots: {
        1: { bestWave: 0, bestScore: 0, totalRuns: 0 },
        2: { bestWave: 0, bestScore: 0, totalRuns: 0 },
        3: { bestWave: 0, bestScore: 0, totalRuns: 0 },
      },
    };
  }

  save() {
    this.data.activeSlot = this.slot;
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
  }

  getProfile() {
    return this.data.slots[this.slot] || this.emptySave().slots[1];
  }

  setSlot(slot) {
    this.slot = slot;
    this.data.activeSlot = slot;
    if (!this.data.slots[slot]) {
      this.data.slots[slot] = { bestWave: 0, bestScore: 0, totalRuns: 0 };
    }
    this.save();
  }

  recordRun(wave, score) {
    const p = this.getProfile();
    p.bestWave  = Math.max(p.bestWave  || 0, wave);
    p.bestScore = Math.max(p.bestScore || 0, score);
    p.totalRuns = (p.totalRuns || 0) + 1;
    this.save();
  }

  resetSlot() {
    this.data.slots[this.slot] = { bestWave: 0, bestScore: 0, totalRuns: 0 };
    this.save();
  }
}

export const saveSystem = new SaveSystem();
