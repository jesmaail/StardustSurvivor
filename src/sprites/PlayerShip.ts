import * as Phaser from "phaser";
import { SPRITE_SCALE, SPRITE_DEPTH } from "../constants/gameplayConstants";
import { SPRITE_ATLAS } from "../constants/assetConstants";
import { Point2D } from "../helpers";
import { IMissilePool } from "./MissilePool";

const ASSET_NAME = "ship";
const SPAWN_POSITION: Point2D = { x: 200, y: 540};
const SPEED = 500;
const MISSILE_DELAY = 300;
const STARTING_AMMO = 40;

const AMMO_POWERUP_INCREMENT = 5;
const DOUBLE_POWERUP_DURATION = 2500;

export enum ShipAction {
    FireMissile,
    ActivateShield,
    MoveLeft,
    MoveRight,
    ObtainAmmo,
    ObtainShield,
    ObtainDouble
}

// TODO - Shield logic in here also (will need to expose the shield sprite for collisions)
export class PlayerShip extends Phaser.Physics.Arcade.Sprite {
    physicsBody: Phaser.Physics.Arcade.Body;
    missilePool: IMissilePool;

    ammo: number = STARTING_AMMO;
    shieldAvailable: boolean = false;
    doubleTimer: number = 0;
    shieldTimer: number = 0;
    fireTimer: number = 0;

    constructor(scene: Phaser.Scene, missilePool: IMissilePool) {
        super(scene, SPAWN_POSITION.x, SPAWN_POSITION.y, SPRITE_ATLAS, ASSET_NAME);
        this.setOrigin(0.5, 0);
        this.setScale(SPRITE_SCALE);
        this.setDepth(SPRITE_DEPTH);

        scene.physics.add.existing(this);
        this.physicsBody = this.body as Phaser.Physics.Arcade.Body;

        this.setupPhysicsBody();

        this.missilePool = missilePool;
    }

    private setupPhysicsBody(){
        this.physicsBody.setCollideWorldBounds(true);
        this.physicsBody.setImmovable(true);
    }

    // CHECKPOINT <---------------
    // TODO - Finish player sprite
    //      - Fire Missile needs double powerup interactions and collisions
    //      - Add shield functionality
    //      - Add powerup acquisition
    performAction(action: ShipAction) {
        switch(action){
            case ShipAction.MoveLeft:
                this.physicsBody.velocity.x = -SPEED;
                break;

            case ShipAction.MoveRight:
                this.physicsBody.velocity.x = SPEED;
                break;
            
            case ShipAction.FireMissile:
                if(this.fireTimer < this.scene.time.now){
                    this.fireTimer = this.scene.time.now + MISSILE_DELAY;
                    const spawnPosition: Point2D = { x: this.physicsBody.x, y: this.physicsBody.y };
                    this.missilePool.createMissile(spawnPosition);
                }
                break;
            case ShipAction.ObtainAmmo:
                this.ammo += AMMO_POWERUP_INCREMENT;
                break;
            case ShipAction.ObtainShield:
                this.shieldAvailable = true;
                break;
            case ShipAction.ObtainDouble:
                this.doubleTimer = this.scene.time.now + DOUBLE_POWERUP_DURATION;
                break;
        }
    }
}