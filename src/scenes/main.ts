import * as Phaser from "phaser";

import * as GameConstants from "../constants/gameplayConstants";
import * as Assets from "../constants/assetConstants";

import IAsteroidPool from "../sprites/AsteroidPool";
import IMissilePool from "../sprites/MissilePool";
import ScrollingSpaceScene from "./scrollingSpaceScene";

import { Point2D, getRandomFromSelection, rollPercentageChance, debugLog } from "../helpers";
import { AsteroidType } from "../sprites/AsteroidType";
import { Asteroid } from "../sprites/Asteroid";
import { PlayerShip, ShipAction } from "../sprites/PlayerShip";

export default class MainScene extends ScrollingSpaceScene {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    private music: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;

    private gameTick: number;

    // Text
    private scoreText: Phaser.GameObjects.Text;

    // Score
    private score: number = 0;
    private scoreTimer: number = 0;

    // Player
    private player: PlayerShip;
    private playerDeathSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    private playerDestroyed: boolean = false;
    private playerDeathTimer: number;

    // Bullets
    private missilePool: IMissilePool;

    // Asteroids
    private asteroidPool: IAsteroidPool;
    private explosions: Phaser.GameObjects.Group;
    private hitSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    private explosionSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;

    // Powerups 
    private shieldPowerups: Phaser.GameObjects.Group;
    private doublePowerups: Phaser.GameObjects.Group;
    private ammoPowerups: Phaser.GameObjects.Group;
    private powerupSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    private shieldDeflectSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;


    constructor() {
        super({ key: "MainScene" });
    }

    preload () {
        this.missilePool = this.add.missilePool();
        this.spaceScroll = this.add.group();
        this.explosions = this.add.group();
        this.shieldPowerups = this.add.group();
        this.doublePowerups = this.add.group();
        this.ammoPowerups = this.add.group();

        this.hitSound = this.game.sound.add(Assets.HIT_SOUND);
        this.explosionSound = this.game.sound.add(Assets.EXPLODE_SOUND);
        this.powerupSound = this.game.sound.add(Assets.POWERUP_SOUND);
        this.shieldDeflectSound = this.game.sound.add(Assets.DEFLECT_SOUND);
        this.playerDeathSound = this.game.sound.add(Assets.DEATH_SOUND);
        this.music = this.game.sound.add(Assets.GAME_MUSIC);

        this.anims.create({
            key: Assets.EXPLOSION_ANIMATIONS,
            frames: [
                { key: Assets.SPRITE_ATLAS, frame: `${Assets.EXPLOSION}0`},
                { key: Assets.SPRITE_ATLAS, frame: `${Assets.EXPLOSION}1`},
                { key: Assets.SPRITE_ATLAS, frame: `${Assets.EXPLOSION}2`}
            ],
            frameRate: 15,
            repeat: 0
        });
    }

    create() {
        this.gameTick = 0;
        // this.physics.world.createDebugGraphic();

        // TODO - move to preload?
        this.asteroidPool = this.add.asteroidPool();
        this.player = this.add.playerShip(this.missilePool);

        this.initSpaceBackground();
        this.scoreText = this.add.text(290, GameConstants.TEXT_Y, "Score: " + this.score , GameConstants.INGAME_TEXT_STYLE);
        this.scoreText.setDepth(GameConstants.TEXT_DEPTH);

        if(GameConstants.AUDIO_ENABLED){
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
            this.scoreTimer = this.time.now + GameConstants.SCORE_INCREMENT;
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
                this.player.body.velocity.x = GameConstants.PLAYER_SPEED;
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
        const difficultyMultiplier = Math.floor(this.gameTick / GameConstants.DIFFICULTY_INCREASE_RATE);
        const spawnRate = Math.max(GameConstants.ASTEROID_SPAWN_RATE - difficultyMultiplier,  10);
        
        if(this.gameTick % spawnRate !== 0){
            return;
        }
        this.asteroidPool.createAsteroid();
    }

    collisionDetection(){
        // Asteroid collisions
        this.physics.add.collider(this.missilePool, this.asteroidPool, this.collideBulletAsteroid, null, this);
        this.physics.add.collider(this.explosions, this.asteroidPool, this.collideBulletAsteroid, null, this);

        // Powerup collisions
        this.physics.add.collider(this.player, this.ammoPowerups, this.obtainAmmoPowerup, null, this);
        this.physics.add.collider(this.player, this.doublePowerups, this.obtainDoublePowerup, null, this);
        this.physics.add.collider(this.player, this.shieldPowerups, this.obtainShieldPowerup, null, this);

        // Shield collisions
        this.physics.add.collider(this.player.shield, this.asteroidPool, this.collideShieldAsteroid, null, this);

        // Player collisions
        this.physics.add.collider(this.player, this.asteroidPool, this.collidePlayer, null, this);
    }

    collideBulletAsteroid(bullet: Phaser.Physics.Arcade.Sprite, asteroid: Asteroid){
        bullet.destroy();
        const collisionPoint: Point2D = { x: asteroid.x, y: asteroid.y};
        asteroid.destroy();

        if(asteroid.asteroidType !== AsteroidType.Large){
            this.createExplosion(collisionPoint);
            if(rollPercentageChance(GameConstants.POWERUP_SPAWN_CHANCE)){
                this.spawnPowerup(collisionPoint);
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
        console.log("Collision");
        asteroid.destroy();
        this.shieldDeflectSound.play();
    }

    collidePlayer(player: Phaser.Physics.Arcade.Sprite, asteroid: Phaser.Physics.Arcade.Sprite){
        asteroid.destroy();
        player.setVisible(false);

        this.music.stop();
        this.playerDeathSound.play();
        

        this.createExplosion({x: player.body.x, y: player.body.y});
        this.playerDestroyed = true;
        this.playerDeathTimer = this.time.now + GameConstants.PLAYER_DEATH_WAIT;
    }

    createExplosion(spawn: Point2D){
        const explosion: Phaser.Physics.Arcade.Sprite = this.explosions.create(spawn.x, spawn.y, Assets.EXPLOSION);
        explosion.setDepth(GameConstants.SPRITE_DEPTH);
        this.physics.world.enable(explosion);

        explosion.on(`animationcomplete-${Assets.EXPLOSION_ANIMATIONS}`, () => {
            explosion.destroy();
        });

        explosion.play(Assets.EXPLOSION_ANIMATIONS);
        this.explosionSound.play();
    }

    spawnPowerup(spawn: Point2D){
        const powerups = [
            GameConstants.SHIELD_POWERUP_FRAME_KEY,
            GameConstants.DOUBLE_POWERUP_FRAME_KEY,
            GameConstants.AMMO_POWERUP_FRAME_KEY
        ];

        const selectedPowerupFrameKey = getRandomFromSelection(powerups);

        let powerupSpawnGroup: Phaser.GameObjects.Group = null;

        switch(selectedPowerupFrameKey){
            case GameConstants.SHIELD_POWERUP_FRAME_KEY:
                powerupSpawnGroup = this.shieldPowerups;
                break;
            case GameConstants.DOUBLE_POWERUP_FRAME_KEY:
                powerupSpawnGroup = this.doublePowerups;
                break;
            case GameConstants.AMMO_POWERUP_FRAME_KEY:
                powerupSpawnGroup = this.ammoPowerups;
                break;
        }
        const powerup = powerupSpawnGroup.create(spawn.x, spawn.y, Assets.SPRITE_ATLAS, selectedPowerupFrameKey);
        powerup.setScale(GameConstants.SPRITE_SCALE);
        powerup.setDepth(GameConstants.SPRITE_DEPTH);
        
        this.physics.world.enable(powerup);

        powerup.body.velocity.y = GameConstants.POWERUP_SPEED;
    }

    obtainAmmoPowerup(_player: Phaser.Physics.Arcade.Sprite, powerup: Phaser.Physics.Arcade.Sprite){
        powerup.destroy();
        this.powerupSound.play();
        this.player.ammo += GameConstants.AMMO_POWERUP_INCREMENT;
    }

    obtainDoublePowerup(_player: Phaser.Physics.Arcade.Sprite, powerup: Phaser.Physics.Arcade.Sprite){
        powerup.destroy();
        this.powerupSound.play();
        this.player.doubleTimer = this.time.now + GameConstants.DOUBLE_POWERUP_DURATION;
    }

    obtainShieldPowerup(_player: Phaser.Physics.Arcade.Sprite, powerup: Phaser.Physics.Arcade.Sprite){
        powerup.destroy();
        this.powerupSound.play();
        this.player.shieldAvailable = true;
    }

    gameObjectCulling(){
        this.missilePool.getChildren().forEach((bullet: Phaser.GameObjects.Sprite) => {
            if(bullet.y < this.physics.world.bounds.top){
                bullet.destroy();
            }
        });

        this.asteroidPool.getChildren().forEach((asteroid: Phaser.GameObjects.Sprite) => {
            if(asteroid.y > this.physics.world.bounds.bottom){
                asteroid.destroy();
            }
        });
    }

    endingHandler(){
        if(this.playerDeathTimer < this.time.now){
            const finalScore = this.score;

            // Clean up state ready for restart
            this.playerDeathTimer = 0;
            this.score = 0;
            this.playerDestroyed = false;

            this.scene.stop();
            this.scene.start("EndScene", { score: finalScore });
        }
    }
}