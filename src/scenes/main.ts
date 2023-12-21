import * as Phaser from 'phaser';
import { Point2D, getRandomFromSelection, rollPercentageChance, debugLogGroupCount } from '../helpers';
import ScrollingSpaceScene from './scrollingSpaceScene';
import * as GameConstants from '../constants/gameplayConstants';
import * as Assets from '../constants/assetConstants';

export default class MainScene extends ScrollingSpaceScene {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    private music: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;

    // Text
    private ammoText: Phaser.GameObjects.Text
    private scoreText: Phaser.GameObjects.Text
    private shieldText: Phaser.GameObjects.Text

    // Score
    private score: number = 0;
    private scoreTimer: number = 0;

    // Player
    private player: Phaser.GameObjects.Sprite;
    private playerBody: Phaser.Physics.Arcade.Body;
    private playerDeathSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    private playerDestroyed: boolean = false;
    private playerDeathTimer: number;

    // Bullets
    private bullets: Phaser.GameObjects.Group;
    private bulletSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    private ammo: number = GameConstants.STARTING_AMMO;
    private fireTimer: number = 0;

    // Asteroids
    private asteroids: Phaser.GameObjects.Group;
    private largeAsteroids: Phaser.GameObjects.Group;
    private asteroidX: number = 0;
    private asteroidY: number = 20;
    private explosions: Phaser.GameObjects.Group;
    private hitSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    private explosionSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;

    // Powerups 
    private shieldPowerups: Phaser.GameObjects.Group;
    private doublePowerups: Phaser.GameObjects.Group;
    private ammoPowerups: Phaser.GameObjects.Group;
    private powerupSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    private shieldAvailable: boolean = false;
    private shieldTimer: number = 0;
    private doubleBulletTimer: number = 0;
    private shield: Phaser.GameObjects.Sprite;
    private shieldActivateSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    private shieldDeflectSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;

    constructor() {
        super({ key: 'MainScene' })
    }

    preload () {
        this.bullets = this.add.group();
        this.spaceScroll = this.add.group();
        this.asteroids = this.add.group();
        this.largeAsteroids = this.add.group();
        this.explosions = this.add.group();
        this.shieldPowerups = this.add.group();
        this.doublePowerups = this.add.group();
        this.ammoPowerups = this.add.group();

        this.bulletSound = this.game.sound.add(Assets.FIRE_SOUND);
        this.hitSound = this.game.sound.add(Assets.HIT_SOUND);
        this.explosionSound = this.game.sound.add(Assets.EXPLODE_SOUND);
        this.powerupSound = this.game.sound.add(Assets.POWERUP_SOUND);
        this.shieldActivateSound = this.game.sound.add(Assets.SHIELD_SOUND);
        this.shieldDeflectSound = this.game.sound.add(Assets.DEFLECT_SOUND);
        this.playerDeathSound = this.game.sound.add(Assets.DEATH_SOUND);
        this.music = this.game.sound.add(Assets.GAME_MUSIC);
    }

    create() {
        this.initSpaceBackground();
        this.ammoText = this.add.text(30, GameConstants.TEXT_Y, "Ammo: "+ this.ammo , GameConstants.DEFAULT_TEXT_STYLE);
        this.ammoText.setDepth(GameConstants.TEXT_DEPTH);
		this.scoreText = this.add.text(290, GameConstants.TEXT_Y, "Score: " + this.score , GameConstants.DEFAULT_TEXT_STYLE);
        this.scoreText.setDepth(GameConstants.TEXT_DEPTH);
		this.shieldText = this.add.text(200, GameConstants.TEXT_Y, "" , {font: GameConstants.TEXT_FONT, color: GameConstants.SHIELD_TEXT_COLOUR });
        this.shieldText.setOrigin(0.5, 0)
        this.shieldText.setDepth(GameConstants.TEXT_DEPTH);


        if(GameConstants.AUDIO_ENABLED){
            this.music.loop = true;
            this.music.play();
        }
        
        this.cursors = this.input.keyboard.createCursorKeys();

        this.player = this.physics.add.sprite(200, 540, Assets.SHIP);
        this.player.setOrigin(0.5, 0);
        this.player.setScale(GameConstants.SPRITE_SCALE);
        this.player.setDepth(GameConstants.SPRITE_DEPTH);
        this.physics.world.enable(this.player);

        // Issue with type-checking on setCollideWorldBounds()
        this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        this.playerBody.setCollideWorldBounds(true);
        this.playerBody.setImmovable(true);

        this.shield = this.physics.add.sprite(-100, -100, Assets.SHIELD);
        this.shield.setScale(GameConstants.SPRITE_SCALE);
        this.shield.setDepth(GameConstants.SPRITE_DEPTH);
        this.shield.setVisible(false);
        this.physics.world.enable(this.shield);
    }

    update() {
        debugLogGroupCount(this.explosions);
        
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

        this.ammoText.setText("Ammo: " + this.ammo);
		this.scoreText.setText("Score: " + this.score);


        this.playerControls();
        this.collisionDetection();
        this.shieldSystem();
    }

    playerControls(){
        if(this.playerDestroyed){
            return;
        }

        switch(true){
            case this.cursors.left.isDown:
                this.player.body.velocity.x = -GameConstants.PLAYER_SPEED;
                break;
            case this.cursors.right.isDown:
                this.player.body.velocity.x = GameConstants.PLAYER_SPEED;
                break;
            case this.cursors.up.isDown:
                if(this.fireTimer < this.time.now){
                    this.fire();
                }
                break;
            case this.cursors.down.isDown:
                this.shieldText.setText("");
                this.shieldTimer = this.time.now + GameConstants.SHIELD_POWERUP_DURATION;
                this.shieldAvailable = false;
                this.shieldActivateSound.play();
                break;
        }
    }

    fire(){
        this.fireTimer = this.time.now + GameConstants.FIRE_DELAY;
        if(this.ammo <= 0){
            return;
        }
        
        if(this.doubleBulletTimer > this.time.now){
            this.createBullet(this.playerBody.x, this.playerBody.y);
            this.createBullet((this.playerBody.x + this.playerBody.width), this.playerBody.y);
            return;
        }
        
        this.createBullet(this.playerBody.x + (this.playerBody.width/2), this.playerBody.y - 30);
    }

    createBullet(x: number, y: number) {
        let bullet = this.bullets.create(x, y, Assets.BULLET);
        bullet.setScale(GameConstants.SPRITE_SCALE);
        bullet.setOrigin(0.5, 0); 
        bullet.setDepth(GameConstants.SPRITE_DEPTH)

        this.physics.world.enable(bullet);
        bullet.body.velocity.y = -GameConstants.BULLET_SPEED;

        this.bulletSound.play();

        this.ammo--;
    }

    spawnAsteroids() {
        // TODO - Probably worth extracting Asteroid spawn logic out entirely.

        // I need to remember what this is for...
        // Looks like X and Y were bad values for this.
        this.asteroidX++; 

        if(this.asteroidX % this.asteroidY != 0){
            return;
        }

        // Not sure what this logic chunk is doing either :D
        if(this.asteroidX % 25 == 0){
            if(this.asteroidY == 3){
                this.asteroidY = 20;
            }
            this.asteroidY -=1;
        }

        let spawnPointX = Phaser.Math.Between(-100, 4050) / 10; // Again, why these numbers?

        if(rollPercentageChance(GameConstants.LARGE_ASTEROID_CHANCE)){
            this.spawnLargeAsteroid(spawnPointX);
            return;
        }
        let asteroidSpeed = Phaser.Math.Between(GameConstants.ASTEROID_SPEED_MIN, GameConstants.ASTEROID_SPEED_MAX);
        this.spawnNormalAsteroid(spawnPointX, asteroidSpeed);
    }

    spawnLargeAsteroid(spawnX: number){
        // TODO - There is a third animation frame
        // but it isn't loading, either fix or throw out when improving
        // graphics
        let asteroidAnimations = ['la0', 'la1'];
        let selectedAnimation = getRandomFromSelection(asteroidAnimations);

        if(this.largeAsteroids.getLength() == 0){
            asteroidAnimations.forEach((value: string, index: number) => {
                this.anims.create({
                    key: value,
                    frames: [{key: Assets.ASTEROID_BIG, frame: index}]
                });
            });    
        }

        let asteroid = this.largeAsteroids.create(spawnX, GameConstants.ASTEROID_SPAWN_Y, Assets.ASTEROID_BIG);
        asteroid.setScale(GameConstants.SPRITE_SCALE);
        asteroid.setDepth(GameConstants.SPRITE_DEPTH)
        this.physics.world.enable(asteroid);
        asteroid.body.velocity.x = GameConstants.ASTEROID_VELOCITY_X;
        asteroid.body.velocity.y = GameConstants.LARGE_ASTEROID_SPEED;
        
        asteroid.play(selectedAnimation);
    }

    spawnNormalAsteroid(
        spawnX: number,
        velocityY: number,
        spawnY: number = GameConstants.ASTEROID_SPAWN_Y,
        velocityX: number = GameConstants.ASTEROID_VELOCITY_X){

        let asteroidAnimations = ['a0', 'a1', 'a2', 'a3'];
        let selectedAnimation = getRandomFromSelection(asteroidAnimations);

        if(this.asteroids.getLength() == 0){
            asteroidAnimations.forEach((value: string, index: number) => {
                this.anims.create({
                    key: value,
                    frames: [{key: Assets.ASTEROID, frame: index}]
                });
            });    
        }

        let asteroid = this.asteroids.create(spawnX, spawnY, Assets.ASTEROID);
        asteroid.setScale(GameConstants.SPRITE_SCALE);
        asteroid.setDepth(GameConstants.SPRITE_DEPTH)
        this.physics.world.enable(asteroid);
        asteroid.body.velocity.x = velocityX;
        asteroid.body.velocity.y = velocityY;
        
        asteroid.play(selectedAnimation);
    }

    collisionDetection(){
        // Asteroid collisions
        this.physics.add.collider(this.bullets, this.asteroids, this.collideBulletAsteroid, null, this)
        this.physics.add.collider(this.bullets, this.largeAsteroids, this.collideBulletLargeAsteroid, null, this)
        this.physics.add.collider(this.explosions, this.asteroids, this.collideBulletAsteroid, null, this)

        // Powerup collisions
        this.physics.add.collider(this.player, this.ammoPowerups, this.obtainAmmoPowerup, null, this);
        this.physics.add.collider(this.player, this.doublePowerups, this.obtainDoublePowerup, null, this);
        this.physics.add.collider(this.player, this.shieldPowerups, this.obtainShieldPowerup, null, this);

        // Shield collisions
        this.physics.add.collider(this.shield, this.asteroids, this.collideShieldAsteroid, null, this);
        this.physics.add.collider(this.shield, this.largeAsteroids, this.collideShieldAsteroid, null, this);

        // Player collisions
        this.physics.add.collider(this.player, this.asteroids, this.collidePlayer, null, this);
        this.physics.add.collider(this.player, this.largeAsteroids, this.collidePlayer, null, this);
    }

    collideBulletAsteroid(bullet: Phaser.Physics.Arcade.Sprite, asteroid: Phaser.Physics.Arcade.Sprite){
        bullet.destroy();
        let collisionPoint: Point2D = { x: asteroid.x, y: asteroid.y};
        asteroid.destroy();
        this.createExplosion(collisionPoint);

        if(rollPercentageChance(GameConstants.POWERUP_SPAWN_CHANCE)){
            this.spawnPowerup(collisionPoint);
        }
    }

    collideBulletLargeAsteroid(bullet: Phaser.Physics.Arcade.Sprite, largeAsteroid: Phaser.Physics.Arcade.Sprite){
        bullet.destroy();

        let collisionPoint: Point2D = { x: largeAsteroid.x, y: largeAsteroid.y};

        let randomSpeed = Phaser.Math.Between(GameConstants.FRACTURED_ASTEROID_SPEED_MIN, GameConstants.FRACTURED_ASTEROID_SPEED_MAX);
        let randomPositiveDrift = Phaser.Math.Between(0, GameConstants.FRACTURED_ASTEROID_DRIFT_MAX);
        let randomNegativeDrift = Phaser.Math.Between(0, -GameConstants.FRACTURED_ASTEROID_DRIFT_MAX)

        largeAsteroid.destroy();
        this.hitSound.play();

        this.spawnNormalAsteroid(collisionPoint.x, randomSpeed, collisionPoint.y, randomPositiveDrift);
        this.spawnNormalAsteroid(collisionPoint.x, randomSpeed, collisionPoint.y, randomNegativeDrift);
    }

    collideShieldAsteroid(_shield: Phaser.Physics.Arcade.Sprite, asteroid: Phaser.Physics.Arcade.Sprite){
        if(this.shieldTimer < this.time.now){
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
        

        this.createExplosion({x: player.body.x, y: player.body.y});
        this.playerDestroyed = true;
        this.playerDeathTimer = this.time.now + GameConstants.PLAYER_DEATH_WAIT;
    }

    createExplosion(spawn: Point2D){
        let explosion: Phaser.Physics.Arcade.Sprite = this.explosions.create(spawn.x, spawn.y, Assets.EXPLOSION);
        explosion.setDepth(GameConstants.SPRITE_DEPTH);
        this.physics.world.enable(explosion);

        // TODO - Can use this animations config to set up animations once rather than each creation
        var config = {
            key: 'boom',
            frames: Assets.EXPLOSION,
            frameRate: 15,
            repeat: 0
        };
        this.anims.create(config);
        explosion.on('animationcomplete-boom', () => {
            explosion.destroy();
        });

        explosion.play('boom');
        this.explosionSound.play();
    }

    spawnPowerup(spawn: Point2D){
        let powerups = [
            GameConstants.SHIELD_POWERUP_FRAME_KEY,
            GameConstants.DOUBLE_POWERUP_FRAME_KEY,
            GameConstants.AMMO_POWERUP_FRAME_KEY
        ]

        let selectedPowerupFrameKey = getRandomFromSelection(powerups);

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

        let powerup = powerupSpawnGroup.create(spawn.x, spawn.y, Assets.POWERUPS, selectedPowerupFrameKey);
        powerup.setScale(GameConstants.SPRITE_SCALE);
        powerup.setDepth(GameConstants.SPRITE_DEPTH);
        
        this.physics.world.enable(powerup);

        powerup.body.velocity.y = GameConstants.POWERUP_SPEED;
    }

    obtainAmmoPowerup(_player: Phaser.Physics.Arcade.Sprite, powerup: Phaser.Physics.Arcade.Sprite){
        powerup.destroy();
        this.powerupSound.play();
        this.ammo += GameConstants.AMMO_POWERUP_INCREMENT;
    }

    obtainDoublePowerup(_player: Phaser.Physics.Arcade.Sprite, powerup: Phaser.Physics.Arcade.Sprite){
        powerup.destroy();
        this.powerupSound.play();
        this.doubleBulletTimer = this.time.now + GameConstants.DOUBLE_POWERUP_DURATION;
    }

    obtainShieldPowerup(_player: Phaser.Physics.Arcade.Sprite, powerup: Phaser.Physics.Arcade.Sprite){
        powerup.destroy();
        this.powerupSound.play();
        this.shieldAvailable = true;
    }

    shieldSystem(){
        if(this.shieldTimer > this.time.now){
            this.shield.setVisible(true);
            let shieldBody = this.shield.body as Phaser.Physics.Arcade.Body;
            shieldBody.x = this.playerBody.x;
            shieldBody.y = this.playerBody.y - GameConstants.SHIELD_Y_BUFFER;
        }else{
            this.shield.setVisible(false);
        }

        if(this.shieldAvailable){
            this.shieldText.setText(GameConstants.SHIELD_POWERUP_TEXT);
        }
        
    }

    gameObjectCulling(){
        this.bullets.getChildren().forEach((bullet: Phaser.GameObjects.Sprite) => {
            if(bullet.y < this.physics.world.bounds.top){
                bullet.destroy();
            }
        })

        this.asteroids.getChildren().forEach((asteroid: Phaser.GameObjects.Sprite) => {
            if(asteroid.y > this.physics.world.bounds.bottom){
                asteroid.destroy();
            }
        })
        this.largeAsteroids.getChildren().forEach((largeAsteroid: Phaser.GameObjects.Sprite) => {
            if((largeAsteroid.y - largeAsteroid.height) > this.physics.world.bounds.bottom){
                largeAsteroid.destroy();
            }
        })
    }

    endingHandler(){
        if(this.playerDeathTimer < this.time.now){
            let finalScore = this.score;

            // Clean up state ready for restart
            this.playerDeathTimer = 0;
            this.shieldTimer = 0;
            this.ammo = GameConstants.STARTING_AMMO;
            this.score = 0;
            this.playerDestroyed = false;
            this.shieldAvailable = false;

            this.scene.stop();
            this.scene.start('EndScene', { score: finalScore });
        }
    }
}