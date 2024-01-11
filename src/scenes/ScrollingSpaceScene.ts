import * as Phaser from "phaser";
import { SPRITE_ATLAS } from "../constants/AssetConstants";
import { SPRITE_DEPTH } from "../constants/GameplayConstants";


const STAR_SCALE = 0.1;
const STAR_FRAMES = ["star0", "star1", "star2"];
const STAR_SPEED_MIN = 150;
const STAR_SPEED_MAX = 300;
const STAR_LIFESPAN_MIN = 8000;
const STAR_LIFESPAN_MAX = 10000;

export default class ScrollingSpaceScene extends Phaser.Scene {
    fps: Phaser.GameObjects.Text;
    scrollBuffer: number = 0;
    spaceScrollVelocity: number = 200;

    width: number;
    height: number;

    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    initSpaceBackground() { 
        const { width, height } = this.scale;

        const maxX = this.cameras.main.width;
        const maxY = this.cameras.main.height;
        this.fps = this.add.text(maxX - 5, maxY - 5, "");
        this.fps.setOrigin(1, 1);

        const starZoneX = -50;
        const starZoneWidth = width+50;
        const starZoneHeight = 10;

        const emitZone = new Phaser.Geom.Rectangle(starZoneX, -100, starZoneWidth, starZoneHeight);
        const deathZone = new Phaser.Geom.Rectangle(starZoneX, height, starZoneWidth, starZoneHeight);

        const particles = this.add.particles(0, 0, SPRITE_ATLAS, {
            frame: STAR_FRAMES,
            x: 0,
            y: 0,
            scale: {start: STAR_SCALE, end: STAR_SCALE},
            emitZone: {
                source: emitZone,
                type: "random",
                quantity: 120
            },
            deathZone: { source: deathZone, type: "onEnter" },
            speedY: { min: STAR_SPEED_MIN, max: STAR_SPEED_MAX },
            speedX: 0,
            lifespan: { min: STAR_LIFESPAN_MIN, max: STAR_LIFESPAN_MAX },
            alpha: { random: [0.1, 0.8] },
            frequency: 50,
            blendMode: "ADD",
        });
        particles.setDepth(SPRITE_DEPTH / 2);

        const startingEmitZone = new Phaser.Geom.Rectangle(starZoneX, -50, starZoneWidth, height+50);

        const startingParticles = this.add.particles(0, 0, SPRITE_ATLAS, {
            frame: STAR_FRAMES,
            x: 0,
            y: 0,
            scale: {start: STAR_SCALE, end: STAR_SCALE},
            emitZone: {
                source: startingEmitZone,
                type: "random",
                quantity: 200
            },
            deathZone: { source: deathZone, type: "onEnter" },
            speedY: { min: STAR_SPEED_MIN, max: STAR_SPEED_MAX },
            speedX: 0,
            lifespan: { min: STAR_LIFESPAN_MIN, max: STAR_LIFESPAN_MAX },
            alpha: { random: [0.1, 0.8] },
            frequency: -1,
            blendMode: "ADD",
        });
        startingParticles.setDepth(SPRITE_DEPTH / 2);
        startingParticles.explode(40);
    }
}