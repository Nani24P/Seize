class AudioSystem {
  constructor() {
    this.ctx     = null;
    this.enabled = true;
    this.music   = true;
    this.musicTimer = null;
  }

  ensure() {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  tone(freq, duration = 0.08, type = "sine", gain = 0.03, force = false) {
    if (!force && !this.enabled) return;
    this.ensure();
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, this.ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(amp);
    amp.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  sfx(name) {
    const map = {
      click:   [[480, 0.04, "square",   0.022]],
      place:   [[380, 0.05, "triangle", 0.028], [680, 0.07, "triangle", 0.022]],
      upgrade: [[500, 0.05, "sine",     0.028], [800, 0.09, "sine",     0.026]],
      sell:    [[300, 0.06, "triangle", 0.025], [240, 0.08, "triangle", 0.020]],
      wave:    [[220, 0.06, "sawtooth", 0.022], [330, 0.06, "sawtooth", 0.018]],
      boss:    [[110, 0.2,  "sawtooth", 0.038], [88,  0.22, "sawtooth", 0.032]],
      hit:     [[240, 0.03, "square",   0.016]],
      unlock:  [[440, 0.05, "sine",     0.03],  [660, 0.07, "sine",     0.03], [880, 0.10, "sine", 0.025]],
    };
    (map[name] || map.click).forEach((n) => this.tone(...n));
  }

  startMusic() {
    if (this.musicTimer || !this.music) return;
    let step = 0;
    // Minor pentatonic — mysterious jungle feel
    const scale = [164, 196, 220, 261, 311, 261, 220, 196, 164, 146, 164, 196];
    this.musicTimer = setInterval(() => {
      if (this.music) this.tone(scale[step % scale.length], 0.12, "sine", 0.010, true);
      step++;
    }, 600);
  }

  stopMusic() {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  toggleMusic() {
    this.music = !this.music;
    if (!this.music) this.stopMusic();
    else this.startMusic();
    return this.music;
  }

  toggleSfx() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const audioSystem = new AudioSystem();
