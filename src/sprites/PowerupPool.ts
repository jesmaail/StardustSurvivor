import * as Phaser from "phaser";
import Powerup from "./Powerup";
import { Point2D } from "../Helpers";

export declare interface IPowerupPool extends Phaser.GameObjects.Group {
    createPowerup(position: Point2D): void;
}

export default class PowerupPool extends Phaser.GameObjects.Group implements IPowerupPool {

    constructor(scene: Phaser.Scene, config: Phaser.Types.GameObjects.Group.GroupConfig = {}) {
        const defaults: Phaser.Types.GameObjects.Group.GroupConfig = {
            classType: Phaser.GameObjects.Sprite,
            maxSize: -1
        };
        super(scene, Object.assign(defaults, config));
    }

    createPowerup(position: Point2D){
        const powerup = new Powerup(this.scene, position);
        this.add(powerup, true);
    }
}
