import * as Phaser from "phaser";
import { FIRE_SOUND } from "../constants/AssetConstants";
import { Point2D } from "../Helpers";
import { Asteroid } from "./Asteroid";
import { AsteroidType } from "./AsteroidType";
import { PhaserSound } from "../../types/PhaserExtensions";
import { Missile } from "./Missile";

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
