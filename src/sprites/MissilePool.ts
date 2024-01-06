import * as Phaser from "phaser";
import { SPRITE_SCALE, SPRITE_DEPTH } from "../constants/gameplayConstants";
import { SPRITE_ATLAS } from "../constants/assetConstants";
import { FIRE_SOUND } from "../constants/assetConstants";
import { Point2D } from "../helpers";
import { Asteroid } from "./Asteroid";
import { AsteroidType } from "./AsteroidType";
import { PhaserSound } from "../../types/PhaserExtensions";

export declare interface IMissilePool extends Phaser.GameObjects.Group {
    createMissile(position: Point2D): void;
}

export default class MissilePool extends Phaser.GameObjects.Group implements IMissilePool {
    private triggerSound: PhaserSound;

    constructor(scene: Phaser.Scene, config: Phaser.Types.GameObjects.Group.GroupConfig = {}) {
        const defaults: Phaser.Types.GameObjects.Group.GroupConfig = {
            classType: Phaser.GameObjects.Sprite,
            maxSize: -1
        };
        super(scene, Object.assign(defaults, config));

        this.triggerSound = this.scene.game.sound.add(FIRE_SOUND);
    }

    createMissile(position: Point2D){
        // TODO - Double fire mode for powerup
        const missile = new Missile(this.scene, position);
        this.add(missile, true);
        this.triggerSound.play();

        this.addAsteroidToScene(AsteroidType.Normal);
    }

    private addAsteroidToScene(type: AsteroidType, position?: Point2D){
        const asteroid = new Asteroid(this.scene, type, position);
        asteroid.setVisible(true);
        this.add(asteroid, true);
    }
}

const ASSET_NAME = "laser";
const SPEED = 800;

export class Missile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, position: Point2D) {
        super(scene, position.x, position.y, SPRITE_ATLAS, ASSET_NAME);
        this.setScale(SPRITE_SCALE);
        this.setDepth(SPRITE_DEPTH);
        this.setOrigin(0.5, 0);

        scene.physics.add.existing(this);
        this.body.velocity.y = -SPEED;
    }
}