// Wave composition for all 100 waves.
// Modifiers affect the entire wave's stat block.
// Composition gets richer as waves climb.

export const WAVE_MODIFIERS = {
  normal:   { label: "Normal",        speed: 1.0,  hp: 1.0,  reward: 1.0  },
  rush:     { label: "Rush",          speed: 1.28, hp: 0.88, reward: 1.06 },
  armored:  { label: "Armored",       speed: 0.92, hp: 1.22, reward: 1.12 },
  swarm:    { label: "Swarm",         speed: 1.1,  hp: 0.8,  reward: 0.95 },
  titans:   { label: "Titan Wave",    speed: 0.88, hp: 1.35, reward: 1.25 },
  boss:     { label: "Warlord Wave",  speed: 1.0,  hp: 1.5,  reward: 1.5  },
  berserk:  { label: "Berserk",       speed: 1.4,  hp: 1.15, reward: 1.2  },
  siege:    { label: "Siege",         speed: 0.78, hp: 1.6,  reward: 1.4  },
  phantom:  { label: "Phantom Rush",  speed: 1.55, hp: 1.05, reward: 1.3  },
  apocalypse:{ label: "Apocalypse",   speed: 1.2,  hp: 1.8,  reward: 1.6  },
};

function pickModifier(w) {
  if (w % 25 === 0) return "boss";
  if (w % 20 === 0) return "apocalypse";
  if (w % 15 === 0) return "siege";
  if (w % 10 === 0) return "titans";
  if (w % 7  === 0) return "berserk";
  if (w % 6  === 0) return "phantom";
  if (w % 5  === 0) return "armored";
  if (w % 4  === 0) return "rush";
  if (w % 3  === 0) return "swarm";
  if (w % 2  === 0) return "rush";
  return "normal";
}

export function buildWave(waveNumber) {
  const modifierKey = pickModifier(waveNumber);
  const roles = [];
  const base = Math.floor(6 + waveNumber * 1.1);

  for (let i = 0; i < base; i++) {
    // Role composition gets richer over time
    if (waveNumber >= 80 && i % 5 === 0) { roles.push("warlord"); continue; }
    if (waveNumber >= 60 && i % 6 === 1) { roles.push("titan");   continue; }
    if (waveNumber >= 50 && i % 7 === 2) { roles.push("shaman");  continue; }
    if (waveNumber >= 40 && i % 6 === 3) { roles.push("titan");   continue; }
    if (waveNumber >= 30 && i % 5 === 1) { roles.push("shaman");  continue; }
    if (waveNumber >= 20 && i % 4 === 2) { roles.push("leaper");  continue; }
    if (waveNumber >= 15 && i % 5 === 3) { roles.push("shield");  continue; }
    if (waveNumber >= 10 && i % 4 === 0) { roles.push("brute");   continue; }
    if (waveNumber >= 5  && i % 3 === 0) { roles.push("crawler"); continue; }
    roles.push(i % 4 === 0 ? "crawler" : "sprout");
  }

  // Modifier bonus enemies
  if (modifierKey === "swarm")   { roles.push("sprout","sprout","crawler","sprout"); }
  if (modifierKey === "titans")  { roles.push("titan","titan"); }
  if (modifierKey === "boss")    { roles.push("warlord"); }
  if (modifierKey === "siege")   { roles.push("brute","titan","brute"); }
  if (modifierKey === "apocalypse") { roles.push("warlord","titan","shaman"); }

  return { modifierKey, roles };
}

// Gold awarded at end of wave
export function waveEndGold(waveNumber) {
  return 60 + waveNumber * 10 + Math.floor(waveNumber / 10) * 50;
}

// Score awarded at end of wave
export function waveEndScore(waveNumber) {
  return 100 + waveNumber * 20;
}
