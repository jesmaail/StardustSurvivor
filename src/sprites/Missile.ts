import * as Phaser from "phaser";
import { SPRITE_SCALE, SPRITE_DEPTH } from "../constants/gameplayConstants";
import { SPRITE_ATLAS } from "../constants/assetConstants";
import { Point2D } from "../helpers";

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