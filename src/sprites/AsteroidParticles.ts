import * as Phaser from "phaser";
import { SPRITE_ATLAS } from "../constants/AssetConstants";
import { SPRITE_DEPTH } from "../constants/GameplayConstants";
import { Point2D } from "../Helpers";

const ASSET = "asteroid3";
const COUNT = 20;
const SCALE = {
    start: 0.15, 
    end: 0.01
};
const SPEED = { 
    min: -300, 
    max: 300 
};
const LIFESPAN = { 
    min: 8000, 
    max: 10000 
};
const ALPHA = { 
    random: [0.1, 0.8] 
};

export default class AsteroidParticles {
    emitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene: Phaser.Scene) {
        const gameWidth = scene.game.config.width as number;
        const gameHeight = scene.game.config.height as number;
        const deathZone = new Phaser.Geom.Rectangle(0, 0, gameWidth, gameHeight);

        this.emitter = scene.add.particles(0, 0, SPRITE_ATLAS, {
            frame: ASSET,
            x: 0,
            y: 0,
            scale: SCALE,
            deathZone: { source: deathZone, type: "onLeave" },
            speedX: SPEED,
            speedY: SPEED,
            lifespan: LIFESPAN,
            alpha: ALPHA,
            frequency: -1,
            blendMode: "ADD",
        });
        this.emitter.setDepth(SPRITE_DEPTH / 2);
    }

    create(spawnPoint: Point2D) {
        this.emitter.x = spawnPoint.x;
        this.emitter.y = spawnPoint.y;
        this.emitter.explode(COUNT);
    }
}