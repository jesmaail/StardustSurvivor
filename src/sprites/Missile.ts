import * as Phaser from "phaser";
import { Point2D } from "../Helpers";
import { PhysicsSpriteBase } from "./PhysicsSpriteBase";

const ASSET_NAME = "laser";
const SPEED = 800;

export class Missile extends PhysicsSpriteBase {
    constructor(scene: Phaser.Scene, position: Point2D) {
        super(scene, position, ASSET_NAME);
        this.setOrigin(0.5, 0);
        this.body.velocity.y = -SPEED;
    }
}