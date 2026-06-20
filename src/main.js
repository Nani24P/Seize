import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../data/map.js";

function startGame() {
  if (!window.Phaser) {
    window.__VS_BOOT?.showStatus?.("Phaser missing", "Engine failed to load.", true);
    return;
  }
  window.__VS_GAME__ = new window.Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-container",
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#061008",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: { pixelArt: false, antialias: true, roundPixels: false },
    scene: [BootScene, MenuScene, GameScene],
    callbacks: {
      postBoot: () => window.__VS_BOOT?.hideStatus?.(),
    },
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js?v=1-0")
      .then((r) => r.update())
      .catch((e) => console.warn("SW skipped", e));
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", startGame, { once: true });
} else {
  startGame();
}
