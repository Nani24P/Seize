export const GAME_WIDTH  = 430;
export const GAME_HEIGHT = 760;
export const BOARD = { x: 14, y: 108, w: 402, h: 514 };

export const JUNGLE_MAP = {
  id:   "jungle",
  name: "Verdant Siege",
  boss: "Jungle Warlord",

  theme: {
    // Cinematic dark jungle palette
    sky:       0x1a3d2a,   // deep forest canopy
    ground:    0x2a5e38,   // dark jungle floor
    tileA:     0x2e6840,
    tileB:     0x245232,
    path:      0xc8a85a,   // sandy/dirt trail
    pathEdge:  0x8a6030,
    water:     0x1a7a9a,   // darker teal water
    waterDeep: 0x0e4f66,
    pad:       0x4a2e14,
    padEdge:   0xb8e870,
    hud:       0x0f2018,
    accent:    0x6adf4a,
    particle:  0xa8f070,
    fog:       0x0a1a10,
  },

  // Winding jungle path matching the reference screenshot aesthetic
  path: [
    [38,  580],
    [160, 580],
    [160, 420],
    [80,  420],
    [80,  260],
    [215, 260],
    [215, 500],
    [300, 500],
    [300, 200],
    [390, 200],
    [390, 390],
    [335, 390],
    [335, 140],
  ],

  // 10 build pads, carefully placed off the path
  pads: [
    { x: 58,  y: 500, role: "entry"  },
    { x: 200, y: 504, role: "choke1" },
    { x: 118, y: 340, role: "bend1"  },
    { x: 58,  y: 176, role: "front"  },
    { x: 148, y: 170, role: "mid"    },
    { x: 270, y: 370, role: "center" },
    { x: 248, y: 160, role: "upper"  },
    { x: 362, y: 296, role: "top"    },
    { x: 390, y: 480, role: "choke2" },
    { x: 270, y: 620, role: "exit"   },
  ],
};
