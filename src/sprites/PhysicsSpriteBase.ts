import * as Phaser from "phaser";
import { SPRITE_SCALE, SPRITE_DEPTH } from "../constants/GameplayConstants";
import { SPRITE_ATLAS } from "../constants/AssetConstants";
import { Point2D } from "../Helpers";


export class PhysicsSpriteBase extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, position: Point2D, assetName: string) {
        super(scene, position.x, position.y, SPRITE_ATLAS, assetName);
        this.setScale(SPRITE_SCALE);
        this.setDepth(SPRITE_DEPTH);

        scene.physics.add.existing(this);
    }
}