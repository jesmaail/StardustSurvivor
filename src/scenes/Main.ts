import * as Phaser from "phaser";
import IAsteroidPool from "../sprites/AsteroidPool";
import IMissilePool from "../sprites/MissilePool";
import ScrollingSpaceScene from "./ScrollingSpaceScene";
import Powerup from "../sprites/Powerup";
import { Point2D, rollPercentageChance, debugLog, cullObjectGroupByCondition } from "../Helpers";
import { AsteroidType } from "../sprites/AsteroidType";
import { Asteroid } from "../sprites/Asteroid";
import { PlayerShip, ShipAction } from "../sprites/PlayerShip";
import { IPowerupPool } from "../sprites/PowerupPool";
import { PhaserSound } from "../../types/PhaserExtensions";
import { END_SCENE_KEY } from "./End";
import { HIT_SOUND, POWERUP_SOUND, DEFLECT_SOUND, DEATH_SOUND, GAME_MUSIC} from "../constants/AssetConstants";
import { TEXT_Y, INGAME_TEXT_STYLE, TEXT_DEPTH, AUDIO_ENABLED, SCORE_INCREMENT, DIFFICULTY_INCREASE_RATE, ASTEROID_SPAWN_RATE, POWERUP_SPAWN_CHANCE, PLAYER_DEATH_WAIT, SPRITE_DEPTH } from "../constants/GameplayConstants";
import { IExplosionPool } from "../sprites/ExplosionPool";

export const MAIN_SCENE_KEY = "MainScene";

export default class MainScene extends ScrollingSpaceScene {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private music: PhaserSound;
    private scoreText: Phaser.GameObjects.Text;

    private gameTick: number;
    private score: number;
    private scoreTimer: number = 0;

    private player: PlayerShip;
    private playerDeathSound: PhaserSound;
    private playerDestroyed: boolean = false;
    private playerDeathTimer: number;

    private missilePool: IMissilePool;
    private asteroidPool: IAsteroidPool;
    private powerupPool: IPowerupPool;
    private explosionPool: IExplosionPool;

    private hitSound: PhaserSound;
    private powerupSound: PhaserSound;
    private shieldDeflectSound: PhaserSound;

    constructor() {
        super({ key: MAIN_SCENE_KEY });
    }

    preload () {
        this.missilePool = this.add.missilePool();
        this.powerupPool = this.add.powerupPool();
        this.asteroidPool = this.add.asteroidPool();
        this.spaceScroll = this.add.group();
        this.explosionPool = this.add.explosionPool();

        this.score = 0;
        this.playerDeathTimer = 0;
        this.playerDestroyed = false;

        this.hitSound = this.game.sound.add(HIT_SOUND);
        this.powerupSound = this.game.sound.add(POWERUP_SOUND);
        this.shieldDeflectSound = this.game.sound.add(DEFLECT_SOUND);
        this.playerDeathSound = this.game.sound.add(DEATH_SOUND);
        this.music = this.game.sound.add(GAME_MUSIC);
    }

    create() {
        this.gameTick = 0;
        // this.physics.world.createDebugGraphic();
        this.player = this.add.playerShip(this.missilePool);

        this.initSpaceBackground();
        this.scoreText = this.add.text(290, TEXT_Y, "Score: " + this.score , INGAME_TEXT_STYLE);
        this.scoreText.setDepth(TEXT_DEPTH);

        if(AUDIO_ENABLED){
            this.music.loop = true;
            this.music.play();
        }
        
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        this.gameTick++;
        debugLog(this, this.fps);
        
        this.scrollSpaceBackground();
        this.spawnAsteroids();
        this.player.body.velocity.x = 0;
        this.gameObjectCulling();

        if(this.playerDestroyed){
            this.endingHandler();
            return;
        }
        // Everything above here needs to happen regardless of player state

        if(this.time.now > this.scoreTimer){
            this.scoreTimer = this.time.now + SCORE_INCREMENT;
            this.score++;
        }

        this.scoreText.setText("Score: " + this.score);

        this.playerControls();
        this.collisionDetection();
        this.player.shieldSystem();
    }

    playerControls(){
        if(this.playerDestroyed){
            return;
        }

        switch(true){
            case this.cursors.left.isDown:
                this.player.performAction(ShipAction.MoveLeft);
                break;
            case this.cursors.right.isDown:
                this.player.performAction(ShipAction.MoveRight);
                break;
            case this.cursors.up.isDown:
                this.player.performAction(ShipAction.FireMissile);
                break;
            case this.cursors.down.isDown:
                this.player.performAction(ShipAction.ActivateShield);
                break;
        }
    }

    spawnAsteroids() {
        const difficultyMultiplier = Math.floor(this.gameTick / DIFFICULTY_INCREASE_RATE);
        const spawnRate = Math.max(ASTEROID_SPAWN_RATE - difficultyMultiplier,  10);
        
        if(this.gameTick % spawnRate !== 0){
            return;
        }
        this.asteroidPool.createAsteroid();
    }

    collisionDetection(){
        this.physics.add.collider(this.missilePool, this.asteroidPool, this.collideBulletAsteroid, null, this);
        this.physics.add.collider(this.explosionPool, this.asteroidPool, this.collideBulletAsteroid, null, this);
        this.physics.add.collider(this.player, this.powerupPool, this.obtainPowerup, null, this);
        this.physics.add.collider(this.player.shield, this.asteroidPool, this.collideShieldAsteroid, null, this);
        this.physics.add.collider(this.player, this.asteroidPool, this.collidePlayer, null, this);
    }

    collideBulletAsteroid(bullet: Phaser.Physics.Arcade.Sprite, asteroid: Asteroid){
        bullet.destroy();
        const collisionPoint: Point2D = { x: asteroid.x, y: asteroid.y};
        asteroid.destroy();

        if(asteroid.asteroidType !== AsteroidType.Large){
            this.explosionPool.createExplosion(collisionPoint);
            if(rollPercentageChance(POWERUP_SPAWN_CHANCE)){
                this.powerupPool.createPowerup(collisionPoint);
            }
            return;
        }
        this.hitSound.play();
        this.asteroidPool.createAsteroid(collisionPoint);
    }

    collideShieldAsteroid(_shield: Phaser.Physics.Arcade.Sprite, asteroid: Phaser.Physics.Arcade.Sprite){
        if(this.player.shieldTimer < this.time.now){
            return;
        }
        asteroid.destroy();
        this.shieldDeflectSound.play();
    }

    collidePlayer(player: Phaser.Physics.Arcade.Sprite, asteroid: Phaser.Physics.Arcade.Sprite){
        asteroid.destroy();
        player.setVisible(false);

        this.music.stop();
        this.playerDeathSound.play();
        
        this.explosionPool.createExplosion({x: player.body.x, y: player.body.y});
        this.playerDestroyed = true;
        this.playerDeathTimer = this.time.now + PLAYER_DEATH_WAIT;
    }

    obtainPowerup(player: PlayerShip, powerup: Powerup){
        powerup.destroy();
        this.powerupSound.play();
        player.obtainPowerup(powerup.powerupType);
    }

    gameObjectCulling(){
        cullObjectGroupByCondition(this.missilePool, (missile) => missile.y < this.physics.world.bounds.top);
        cullObjectGroupByCondition(this.asteroidPool, (asteroid) => asteroid.y > this.physics.world.bounds.bottom);
        cullObjectGroupByCondition(this.powerupPool, (powerup) => powerup.y > this.physics.world.bounds.bottom);
    }

    endingHandler(){
        if(this.playerDeathTimer < this.time.now){
            this.scene.stop();
            this.scene.start(END_SCENE_KEY, { score: this.score });
        }
    }
}