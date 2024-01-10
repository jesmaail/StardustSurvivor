import * as Phaser from "phaser";
import { EXPLODE_SOUND, SPRITE_ATLAS } from "../constants/AssetConstants";
import { Point2D } from "../Helpers";
import { PhaserSound } from "../../types/PhaserExtensions";
import { SPRITE_DEPTH } from "../constants/GameplayConstants";

const ASSET_NAME = "explosion";
const ASSET_ANIMATION_KEY = "explosionAnimation";


export declare interface IExplosionPool extends Phaser.GameObjects.Group {
    createExplosion(position: Point2D): void;
}

export default class ExplosionPool extends Phaser.GameObjects.Group implements IExplosionPool {
    private triggerSound: PhaserSound;

    constructor(scene: Phaser.Scene, config: Phaser.Types.GameObjects.Group.GroupConfig = {}) {
        const defaults: Phaser.Types.GameObjects.Group.GroupConfig = {
            classType: Phaser.GameObjects.Sprite,
            maxSize: -1
        };
        super(scene, Object.assign(defaults, config));

        if(!this.scene.anims.exists(ASSET_ANIMATION_KEY)) {
            this.scene.anims.create({
                key: ASSET_ANIMATION_KEY,
                frames: [
                    { key: SPRITE_ATLAS, frame: `${ASSET_NAME}0`},
                    { key: SPRITE_ATLAS, frame: `${ASSET_NAME}1`},
                    { key: SPRITE_ATLAS, frame: `${ASSET_NAME}2`}
                ],
                frameRate: 15,
                repeat: 0
            });
        }

        this.triggerSound = this.scene.game.sound.add(EXPLODE_SOUND);
    }

    createExplosion(position: Point2D){
        const explosion = this.scene.add.sprite(position.x, position.y, SPRITE_ATLAS, ASSET_NAME);
        explosion.setDepth(SPRITE_DEPTH);
        
        this.add(explosion, true);
        this.scene.physics.add.existing(explosion);

        explosion.on(`animationcomplete-${ASSET_ANIMATION_KEY}`, () => {
            explosion.destroy();
        });

        explosion.play(ASSET_ANIMATION_KEY);
        this.triggerSound.play();
    }
}
