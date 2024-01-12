import * as Phaser from "phaser";
import { SPRITE_SCALE, SPRITE_DEPTH, INGAME_TEXT_STYLE, TEXT_Y, TEXT_DEPTH, SHIELD_TEXT_COLOUR, TEXT_FONT } from "../constants/GameplayConstants";
import { DEATH_SOUND, SHIELD_SOUND, SPRITE_ATLAS } from "../constants/AssetConstants";
import { Point2D } from "../Helpers";
import { IMissilePool } from "./MissilePool";
import { PhaserSound } from "../../types/PhaserExtensions";
import { PowerupType } from "./PowerupType";
import { PhysicsSpriteBase } from "./PhysicsSpriteBase";

const ASSET_NAME = "ship";
const SHIELD_ASSET_NAME = "shield";
const SPAWN_POSITION: Point2D = { x: 200, y: 540};
const SPEED = 500;
const MISSILE_DELAY = 300;
const STARTING_AMMO = 40;
const DEATH_DURATION = 750;

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
}

export class PlayerShip extends PhysicsSpriteBase {
    physicsBody: Phaser.Physics.Arcade.Body;
    missilePool: IMissilePool;
    shield: Phaser.Physics.Arcade.Sprite;
    ammo: number = STARTING_AMMO;

    shieldAvailable: boolean = false;
    doubleTimer: number = 0;
    shieldTimer: number = 0;
    private fireTimer: number = 0;
    private shieldSound: PhaserSound;
    private shieldText: Phaser.GameObjects.Text;
    private ammoText: Phaser.GameObjects.Text;
    private deathSound: PhaserSound;

    constructor(scene: Phaser.Scene, missilePool: IMissilePool) {
        super(scene, SPAWN_POSITION, ASSET_NAME);
        this.setOrigin(0.5, 0);

        this.physicsBody = this.body as Phaser.Physics.Arcade.Body;

        this.setupPhysicsBody();
        this.setupAmmoCounter();
        this.setupShield();

        this.missilePool = missilePool;

        this.deathSound = this.scene.game.sound.add(DEATH_SOUND);
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

    private refreshAmmoText(){
        this.ammoText.setText("Ammo: " + this.ammo);
    }

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
        }
    }

    obtainPowerup(powerupType: PowerupType){
        switch(powerupType){
            case PowerupType.Ammo:
                this.ammo += AMMO_POWERUP_INCREMENT;
                this.refreshAmmoText();
                break;
            case PowerupType.Double:
                this.doubleTimer = this.scene.time.now + DOUBLE_POWERUP_DURATION;
                break;
            case PowerupType.Shield:
                this.shieldAvailable = true;
                break;
        }
    }

    fireMissile(){
        if(this.fireTimer > this.scene.time.now || this.ammo < 1){
            return;
        }
        this.fireTimer = this.scene.time.now + MISSILE_DELAY;

        this.ammo--;
        this.refreshAmmoText();

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

    destroyShip(callback: () => void){
        this.setVisible(false);
        this.body.enable = false;
        this.deathSound.play();

        const deathX = this.body.x + (this.width / 2);
        const deathY = this.body.y + (this.height / 2);

        const deathSprite = this.scene.add.sprite(deathX, deathY, SPRITE_ATLAS, ASSET_NAME);
        deathSprite.setScale(SPRITE_SCALE);
        deathSprite.setOrigin(0.5);
        
        const horizontalOffset = Phaser.Math.FloatBetween(-50, 50);
        const verticalOffset = 200;
        const spinAmount = 360 * Phaser.Math.FloatBetween(-1.5, 1.5);

        this.scene.tweens.add({
            targets: deathSprite,
            x: deathSprite.x + horizontalOffset,
            y: deathSprite.y + verticalOffset,
            angle: spinAmount,
            ease: "Linear",
            duration: DEATH_DURATION, 
            onComplete: () => {
                deathSprite.destroy();
                callback.call(this.scene);
            }
        });
    }
}