import * as Phaser from "phaser";
import { SPRITE_SCALE, SPRITE_DEPTH } from "../constants/gameplayConstants";
import { SPRITE_ATLAS } from "../constants/assetConstants";
import { getRandomFromSelection, Point2D } from "../helpers";
import { PowerupType } from "./PowerupType";

const POWERUP_FRAMES: string[] = [
    PowerupType.Ammo,
    PowerupType.Double,
    PowerupType.Shield
];
const SPEED = 200;

export default class Powerup extends Phaser.Physics.Arcade.Sprite {
    powerupType: PowerupType;

    constructor(scene: Phaser.Scene, position: Point2D) {
        const assetFrame = getRandomFromSelection(POWERUP_FRAMES);
        super(scene, position.x, position.y, SPRITE_ATLAS, assetFrame);
        this.powerupType = assetFrame;

        scene.physics.add.existing(this);

        this.setScale(SPRITE_SCALE);
        this.setDepth(SPRITE_DEPTH);
        scene.physics.world.enable(this);

        this.body.velocity.y = SPEED;
    }
}