import * as Phaser from "phaser";
import { SPRITE_SCALE, SPRITE_DEPTH, INGAME_TEXT_STYLE, TEXT_Y, TEXT_DEPTH, SHIELD_TEXT_COLOUR, TEXT_FONT } from "../constants/gameplayConstants";
import { SHIELD_SOUND, SPRITE_ATLAS } from "../constants/assetConstants";
import { Point2D } from "../helpers";
import { IMissilePool } from "./MissilePool";
import { PhaserSound } from "../../types/PhaserExtensions";

const ASSET_NAME = "ship";
const SHIELD_ASSET_NAME = "shield";
const SPAWN_POSITION: Point2D = { x: 200, y: 540};
const SPEED = 500;
const MISSILE_DELAY = 300;
const STARTING_AMMO = 40;

const AMMO_POWERUP_INCREMENT = 5;
const DOUBLE_POWERUP_DURATION = 2500;

const SHIELD_POWERUP_TEXT = "Shields Online";
const SHIELD_X_OFFSET = 17;
const SHIELD_Y_OFFSET = 15;
const SHIELD_POWERUP_DURATION = 2500;

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
    shield: Phaser.Physics.Arcade.Sprite;
    ammo: number = STARTING_AMMO;

    shieldAvailable: boolean = true;
    doubleTimer: number = 0;
    shieldTimer: number = 0;
    private fireTimer: number = 0;
    private shieldSound: PhaserSound;
    private shieldText: Phaser.GameObjects.Text;
    private ammoText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, missilePool: IMissilePool) {
        super(scene, SPAWN_POSITION.x, SPAWN_POSITION.y, SPRITE_ATLAS, ASSET_NAME);
        this.setOrigin(0.5, 0);
        this.setScale(SPRITE_SCALE);
        this.setDepth(SPRITE_DEPTH);

        scene.physics.add.existing(this);
        this.physicsBody = this.body as Phaser.Physics.Arcade.Body;

        this.setupPhysicsBody();
        this.setupAmmoCounter();
        this.setupShield();

        this.missilePool = missilePool;
    }

    private setupPhysicsBody(){
        this.physicsBody.setCollideWorldBounds(true);
        this.physicsBody.setImmovable(true);
    }

    private setupAmmoCounter(){
        this.ammoText = this.scene.add.text(30, TEXT_Y, "Ammo: "+ this.ammo , INGAME_TEXT_STYLE);
        this.ammoText.setDepth(TEXT_DEPTH);
    }

    private setupShield(){
        this.shieldSound = this.scene.game.sound.add(SHIELD_SOUND);

        this.shield = this.scene.physics.add.sprite(-100, -100, SPRITE_ATLAS, SHIELD_ASSET_NAME);
        this.shield.setOrigin(0.5, 0);
        this.shield.setScale(SPRITE_SCALE);
        this.shield.setDepth(SPRITE_DEPTH);
        this.shield.setVisible(false);
        this.scene.physics.world.enable(this.shield);

        this.shieldText = this.scene.add.text(200, TEXT_Y, "" , {font: TEXT_FONT, color: SHIELD_TEXT_COLOUR });
        this.shieldText.setOrigin(0.5, 0);
        this.shieldText.setDepth(TEXT_DEPTH);

    }

    private activateShield(){
        if(!this.shieldAvailable){
            return;
        }
        this.shield.setVisible(true);
        this.shieldTimer = this.scene.time.now + SHIELD_POWERUP_DURATION;
        this.shieldAvailable = false;
        this.shieldSound.play();
    }

    // CHECKPOINT <---------------
    // TODO - Finish player sprite
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
                this.fireMissile();
                break;
            case ShipAction.ActivateShield:
                this.activateShield();
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

    fireMissile(){
        if(this.fireTimer > this.scene.time.now || this.ammo < 1){
            return;
        }
        this.fireTimer = this.scene.time.now + MISSILE_DELAY;

        this.ammo--;
        this.ammoText.setText("Ammo: " + this.ammo);

        if(this.doubleTimer < this.scene.time.now){
            const spawnPosition: Point2D = { 
                x: this.physicsBody.x + (this.physicsBody.width/2), 
                y: this.physicsBody.y };
            this.missilePool.createMissile(spawnPosition);
            return;
        }

        const leftMissile: Point2D = {
            x: this.physicsBody.x,
            y: this.physicsBody.y
        };
        this.missilePool.createMissile(leftMissile);

        const rightMissile: Point2D = {
            x: this.physicsBody.x + this.physicsBody.width-1,
            y: this.physicsBody.y
        };
        this.missilePool.createMissile(rightMissile);
    }

    shieldSystem(){
        if(this.shieldTimer > this.scene.time.now){
            this.shield.setVisible(true);
            const shieldBody = this.shield.body as Phaser.Physics.Arcade.Body;
            shieldBody.x = this.physicsBody.x - SHIELD_X_OFFSET;
            shieldBody.y = this.physicsBody.y - SHIELD_Y_OFFSET;
            this.shieldText.setText("");
            return;

        }else if(this.shieldAvailable){
            this.shieldText.setText(SHIELD_POWERUP_TEXT);
            return;
        }

        this.shield.setVisible(false);
        this.shieldText.setText("");
    }
}
