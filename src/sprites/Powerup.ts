import * as Phaser from "phaser";
import { getRandomFromSelection, Point2D } from "../Helpers";
import { PowerupType } from "./PowerupType";
import { PhysicsSpriteBase } from "./PhysicsSpriteBase";

const POWERUP_FRAMES: string[] = [
    PowerupType.Ammo,
    PowerupType.Double,
    PowerupType.Shield
];
const SPEED = 200;

export default class Powerup extends PhysicsSpriteBase {
    powerupType: PowerupType;

    constructor(scene: Phaser.Scene, position: Point2D) {
        const assetFrame = getRandomFromSelection(POWERUP_FRAMES);
        super(scene, position, assetFrame);
        this.powerupType = assetFrame;

        this.body.velocity.y = SPEED;
    }
}