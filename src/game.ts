import * as Phaser from 'phaser';
import MainScene from './scenes/main';
import PreloadScene from './scenes/preload';

import GameConfig = Phaser.Types.Core.GameConfig

const config: GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#111440',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 400,
        height: 640,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [PreloadScene, MainScene]
};

const game = new Phaser.Game(config);
