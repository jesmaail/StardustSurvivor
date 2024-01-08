import * as Phaser from "phaser";
import EndScene from "./scenes/End";
import MainScene from "./scenes/Main";
import PreloadScene from "./scenes/Preload";

import GameConfig = Phaser.Types.Core.GameConfig

const config: GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#111440",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 640,
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [PreloadScene, MainScene, EndScene]
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const game = new Phaser.Game(config);
