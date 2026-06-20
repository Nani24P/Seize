// 20 towers across 4 tiers.
// Tier 1 (waves 1+):   5 towers — always available
// Tier 2 (waves 10+):  5 towers — unlock at wave 10
// Tier 3 (waves 30+):  5 towers — unlock at wave 30
// Tier 4 (waves 60+):  5 towers — unlock at wave 60
//
// Strategy notes:
//  - Waves 1-50:  any mix of T1-T2 works
//  - Waves 51-70: needs deliberate T3 combos (Cryo+Venom chains, Sonic aoe, etc.)
//  - Waves 71-100: only near-perfect T4 synergy clears (Singularity+Phantom+Apex)

export const TOWERS = {
  // ── TIER 1 ────────────────────────────────────────────────────────────────
  thorn: {
    tier: 1, name: "Thorn", cost: 80, range: 110, damage: 14, fireRate: 0.4,
    color: 0x6abf47, accent: 0xd4f5a0,
    texture: "tw-thorn", role: "Fast single target",
    desc: "Rapid vine shots. Great early cleanup.",
  },
  sling: {
    tier: 1, name: "Slingshot", cost: 100, range: 130, damage: 22, fireRate: 0.65,
    color: 0xd4a04a, accent: 0xffe8a0,
    texture: "tw-sling", role: "Long range basic",
    desc: "Stone shots, decent range, reliable damage.",
  },
  bomb: {
    tier: 1, name: "Bomb", cost: 180, range: 95, damage: 38, fireRate: 1.1,
    splash: 52, color: 0x7a6070, accent: 0xffa03a,
    texture: "tw-bomb", role: "Splash area",
    desc: "Slow but hits everything nearby on impact.",
  },
  web: {
    tier: 1, name: "Web", cost: 120, range: 105, damage: 4, fireRate: 0.5,
    slow: 0.45, slowTime: 2.0,
    color: 0xc8d8e8, accent: 0xffffff,
    texture: "tw-web", role: "Slow support",
    desc: "Spider webs slow enemies considerably.",
  },
  dart: {
    tier: 1, name: "Dart", cost: 150, range: 100, damage: 30, fireRate: 0.55,
    pierce: true,
    color: 0x44a060, accent: 0x90f0b0,
    texture: "tw-dart", role: "Pierce line",
    desc: "Darts pierce through enemies in a line.",
  },

  // ── TIER 2 (unlocks wave 10) ──────────────────────────────────────────────
  venom: {
    tier: 2, name: "Venom", cost: 280, range: 100, damage: 8, fireRate: 0.38,
    burn: 28, burnTime: 3.0,
    color: 0x58d068, accent: 0xb0ffb0,
    texture: "tw-venom", role: "Poison DoT",
    desc: "Coats enemies in toxin. Stacks with Cryo.",
  },
  cryo: {
    tier: 2, name: "Cryo", cost: 320, range: 115, damage: 6, fireRate: 0.7,
    slow: 0.35, slowTime: 2.5,
    color: 0x61d5ff, accent: 0xe8fbff,
    texture: "tw-cryo", role: "Heavy slow",
    desc: "Deep freeze. Enemies slowed by 65% + venom bonus.",
  },
  mortar: {
    tier: 2, name: "Mortar", cost: 350, range: 180, damage: 55, fireRate: 1.8,
    splash: 72, color: 0x8a7050, accent: 0xffd080,
    texture: "tw-mortar", role: "Long range AoE",
    desc: "Lobs shells at long range with wide splash.",
  },
  sniper: {
    tier: 2, name: "Sniper", cost: 400, range: 220, damage: 90, fireRate: 2.2,
    color: 0x2060a0, accent: 0x80c0ff,
    texture: "tw-sniper", role: "Long range burst",
    desc: "Extreme range, extreme single hit. Targets strongest.",
  },
  shaman: {
    tier: 2, name: "Shaman", cost: 300, range: 120, damage: 12, fireRate: 0.6,
    chain: 3, color: 0xa060e0, accent: 0xe0c0ff,
    texture: "tw-shaman", role: "Chain magic",
    desc: "Mystic bolts arc to 3 nearby enemies.",
  },

  // ── TIER 3 (unlocks wave 30) ──────────────────────────────────────────────
  sonic: {
    tier: 3, name: "Sonic", cost: 600, range: 135, damage: 42, fireRate: 0.6,
    splash: 90, slow: 0.6, slowTime: 1.2,
    color: 0xf0e040, accent: 0xffffa0,
    texture: "tw-sonic", role: "AoE slow pulse",
    desc: "Sound waves damage and slow in a large radius.",
  },
  eclipse: {
    tier: 3, name: "Eclipse", cost: 650, range: 125, damage: 60, fireRate: 0.9,
    burn: 45, burnTime: 4.0,
    color: 0x301850, accent: 0xff80ff,
    texture: "tw-eclipse", role: "Shadow burn",
    desc: "Dark energy that burns. Damage doubled vs slowed.",
  },
  canopy: {
    tier: 3, name: "Canopy", cost: 700, range: 160, damage: 35, fireRate: 0.5,
    chain: 5, color: 0x208840, accent: 0x80ffa0,
    texture: "tw-canopy", role: "Multi-chain",
    desc: "Roots arc to 5 enemies simultaneously.",
  },
  juggernaut: {
    tier: 3, name: "Juggernaut", cost: 750, range: 90, damage: 120, fireRate: 1.4,
    splash: 60, color: 0x804020, accent: 0xff8040,
    texture: "tw-juggernaut", role: "Massive splash",
    desc: "Slow rate but devastating close-range blast.",
  },
  phantom: {
    tier: 3, name: "Phantom", cost: 800, range: 200, damage: 50, fireRate: 0.7,
    pierce: true, burn: 20, burnTime: 2.5,
    color: 0x406080, accent: 0xa0d8ff,
    texture: "tw-phantom", role: "Pierce + burn",
    desc: "Ghost arrows pierce and ignite every target hit.",
  },

  // ── TIER 4 (unlocks wave 60) ──────────────────────────────────────────────
  singularity: {
    tier: 4, name: "Singularity", cost: 1400, range: 150, damage: 80, fireRate: 0.5,
    splash: 120, slow: 0.25, slowTime: 3.0, burn: 60, burnTime: 5.0,
    color: 0x1a0840, accent: 0xc080ff,
    texture: "tw-singularity", role: "Black hole AoE",
    desc: "Collapses space. Burns, slows, splashes massively.",
  },
  apex: {
    tier: 4, name: "Apex", cost: 1600, range: 240, damage: 200, fireRate: 1.8,
    chain: 8, color: 0xa08020, accent: 0xffe840,
    texture: "tw-apex", role: "Golden chain",
    desc: "Legendary shots chain to 8 targets. High cost, high return.",
  },
  tempest: {
    tier: 4, name: "Tempest", cost: 1200, range: 170, damage: 65, fireRate: 0.45,
    splash: 100, slow: 0.4, slowTime: 2.0,
    color: 0x204880, accent: 0x60a8ff,
    texture: "tw-tempest", role: "Storm barrage",
    desc: "Rapid storm blasts. Best sustained AoE in tier 4.",
  },
  behemoth: {
    tier: 4, name: "Behemoth", cost: 1800, range: 100, damage: 320, fireRate: 2.5,
    splash: 80, color: 0x5a1010, accent: 0xff4040,
    texture: "tw-behemoth", role: "Cataclysm",
    desc: "Slow but hits for catastrophic damage in area.",
  },
  verdant: {
    tier: 4, name: "Verdant", cost: 2000, range: 180, damage: 100, fireRate: 0.55,
    chain: 6, burn: 80, burnTime: 6.0, slow: 0.3, slowTime: 4.0,
    color: 0x106030, accent: 0x60ff80,
    texture: "tw-verdant", role: "Jungle god",
    desc: "The jungle itself attacks. Chains, burns, and freezes at once.",
  },
};

export const TOWER_ORDER = [
  // T1
  "thorn","sling","bomb","web","dart",
  // T2
  "venom","cryo","mortar","sniper","shaman",
  // T3
  "sonic","eclipse","canopy","juggernaut","phantom",
  // T4
  "singularity","apex","tempest","behemoth","verdant",
];

export const TIER_UNLOCK = { 1: 1, 2: 10, 3: 30, 4: 60 };
