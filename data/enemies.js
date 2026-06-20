// 8 enemy roles for the Jungle map.
// HP/speed/reward are BASE values — GameState scales by wave and modifier.
// Scaling curve:
//   waves 1-50:  linear   +12% HP per wave
//   waves 51-70: steep    +22% HP per wave (forces T3 use)
//   waves 71-100: brutal  +35% HP per wave (only T4 combos survive)

export const ENEMY_ROLES = {
  sprout:  { hp: 36,   speed: 110, reward: 8,   radius: 11, label: "Sprout"  },
  crawler: { hp: 60,   speed: 80,  reward: 10,  radius: 14, label: "Crawler" },
  brute:   { hp: 180,  speed: 48,  reward: 22,  radius: 20, label: "Brute"   },
  shield:  { hp: 130,  speed: 60,  reward: 18,  radius: 17, arrowDamageMultiplier: 0.65, label: "Shield" },
  leaper:  { hp: 90,   speed: 130, reward: 20,  radius: 14, label: "Leaper"  },
  shaman:  { hp: 110,  speed: 70,  reward: 25,  radius: 16, label: "Shaman"  },
  titan:   { hp: 420,  speed: 38,  reward: 55,  radius: 24, label: "Titan"   },
  warlord: { hp: 900,  speed: 30,  reward: 140, radius: 30, label: "Warlord" },
};

export const JUNGLE_ENEMIES = {
  sprout:  { name: "Vine Sprout",    texture: "ej-sprout",  color: 0xc8e898 },
  crawler: { name: "Mud Crawler",    texture: "ej-crawler", color: 0x7a5c38 },
  brute:   { name: "Jungle Brute",   texture: "ej-brute",   color: 0x4a7a30 },
  shield:  { name: "Bark Shield",    texture: "ej-shield",  color: 0x8a6040 },
  leaper:  { name: "Canopy Leaper",  texture: "ej-leaper",  color: 0xd4a820 },
  shaman:  { name: "Root Shaman",    texture: "ej-shaman",  color: 0x9860d0 },
  titan:   { name: "Stone Titan",    texture: "ej-titan",   color: 0x607868 },
  warlord: { name: "Jungle Warlord", texture: "ej-warlord", color: 0xd84020 },
};

// HP scaling factor by wave number
export function waveHpScale(waveNumber) {
  if (waveNumber <= 50) return 1 + (waveNumber - 1) * 0.12;
  if (waveNumber <= 70) return waveHpScale(50) + (waveNumber - 50) * 0.22;
  return waveHpScale(70) + (waveNumber - 70) * 0.35;
}

export function waveSpeedScale(waveNumber) {
  if (waveNumber <= 50) return 1 + (waveNumber - 1) * 0.008;
  if (waveNumber <= 70) return waveSpeedScale(50) + (waveNumber - 50) * 0.014;
  return waveSpeedScale(70) + (waveNumber - 70) * 0.018;
}
