import * as Phaser from 'phaser';
import { getScreenCenter, Point2D, getRandomFromSelection, debugLogGroupCount } from '../helpers';
import ScrollingSpaceScene from './scrollingSpaceScene';
import * as GameConstants from '../constants';

export default class MainScene extends ScrollingSpaceScene {
    private screenCenter: Point2D
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    // Text
    private ammoText: Phaser.GameObjects.Text
    private scoreText: Phaser.GameObjects.Text
    private powerText: Phaser.GameObjects.Text

    // Score
    private score: number = 0;
    private scoreTimer: number = 0;

    // Player
    private player: Phaser.GameObjects.Sprite;
    private playerBody: Phaser.Physics.Arcade.Body;

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
    private explosionSound: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    

    constructor() {
        super({ key: 'MainScene' })
    }

    preload () { 
        this.bullets = this.add.group();
        this.spaceScroll = this.add.group();
        this.asteroids = this.add.group();
        this.largeAsteroids = this.add.group();
        this.explosions = this.add.group();

        this.screenCenter = getScreenCenter(this.cameras.main);

        this.bulletSound = this.game.sound.add('fire');
        this.explosionSound = this.game.sound.add('explode');
    }

    create() {
        this.initSpaceBackground();
        this.ammoText = this.add.text(30, 30, "Ammo: "+ this.ammo , GameConstants.DEFAULT_TEXT_STYLE);
        this.ammoText.setDepth(GameConstants.TEXT_DEPTH)
		this.scoreText = this.add.text(290, 30, "Score: " + this.score , GameConstants.DEFAULT_TEXT_STYLE);
        this.scoreText.setDepth(GameConstants.TEXT_DEPTH)	
		this.powerText = this.add.text(125, 30, "" , {font: GameConstants.TEXT_FONT, color: GameConstants.SHIELD_TEXT_COLOUR });
        this.powerText.setDepth(GameConstants.TEXT_DEPTH)


        if(GameConstants.AUDIO_ENABLED){
            let bgMusic = this.game.sound.add('gameMusic')
            bgMusic.loop = true;
            bgMusic.play();
        }
        
        this.cursors = this.input.keyboard.createCursorKeys();

        this.player = this.physics.add.sprite(200, 540, 'ship');
        this.player.setOrigin(0.5, 0);
        this.player.setScale(GameConstants.SPRITE_SCALE);
        this.player.setDepth(GameConstants.SPRITE_DEPTH)
        this.physics.world.enable(this.player);

        // Issue with type-checking on setCollideWorldBounds()
        this.playerBody = this.player.body as Phaser.Physics.Arcade.Body
        this.playerBody.setCollideWorldBounds(true);
    }

    update() {
        debugLogGroupCount(this.explosions);
        if(this.time.now > this.scoreTimer){
            this.scoreTimer = this.time.now + GameConstants.SCORE_INCREMENT;
            this.score++;
        }

        this.ammoText.setText("Ammo: " + this.ammo);
		this.scoreText.setText("Score: " + this.score);


        this.scrollSpaceBackground();
        this.spawnAsteroids();
        this.player.body.velocity.x = 0;

        this.playerControls();
        this.collisionDetection();
        this.gameObjectCulling();
    }

    playerControls(){
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
                console.log("TODO Shield!");
                break;
        }
    }

    fire(){
        this.fireTimer = this.time.now + GameConstants.FIRE_DELAY;
        if(this.ammo <= 0){
            return;
        }
        
        this.createBullet(this.playerBody.x + (this.playerBody.width/2), this.playerBody.y - 30);
    }

    createBullet(x: number, y: number) {
        let bullet = this.bullets.create(x, y, 'bullet');
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

        let spawnLargeChance = Phaser.Math.Between(0, GameConstants.LARGE_ASTEROID_CHANCE);
        let spawnPointX = Phaser.Math.Between(-100, 4050) / 10; // Again, why these numbers?

        if(spawnLargeChance > 250 && spawnLargeChance < 300){
            this.spawnLargeAsteroid(spawnPointX);
            return;
        }        
        
        this.spawnNormalAsteroid(spawnPointX);
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
                    frames: [{key: 'asteroidBig', frame: index}]
                });
            });    
        }

        let asteroid = this.largeAsteroids.create(spawnX, GameConstants.ASTEROID_SPAWN_Y, 'asteroidBig');
        asteroid.setScale(GameConstants.SPRITE_SCALE);
        asteroid.setDepth(GameConstants.SPRITE_DEPTH)
        this.physics.world.enable(asteroid);
        asteroid.body.velocity.x = GameConstants.ASTEROID_VELOCITY_X;
        asteroid.body.velocity.y = GameConstants.LARGE_ASTEROID_SPEED;
        
        asteroid.play(selectedAnimation);
    }

    spawnNormalAsteroid(spawnX: number){
        let asteroidSpeed = Phaser.Math.Between(GameConstants.ASTEROID_SPEED_MIN, GameConstants.ASTEROID_SPEED_MAX);

        let asteroidAnimations = ['a0', 'a1', 'a2', 'a3'];
        let selectedAnimation = getRandomFromSelection(asteroidAnimations);

        if(this.asteroids.getLength() == 0){
            asteroidAnimations.forEach((value: string, index: number) => {
                this.anims.create({
                    key: value,
                    frames: [{key: 'asteroid', frame: index}]
                });
            });    
        }

        let asteroid = this.asteroids.create(spawnX, GameConstants.ASTEROID_SPAWN_Y, 'asteroid');
        asteroid.setScale(GameConstants.SPRITE_SCALE);
        asteroid.setDepth(GameConstants.SPRITE_DEPTH)
        this.physics.world.enable(asteroid);
        asteroid.body.velocity.x = GameConstants.ASTEROID_VELOCITY_X;
        asteroid.body.velocity.y = asteroidSpeed;
        
        asteroid.play(selectedAnimation);
    }

    collisionDetection(){
        this.physics.add.collider(this.bullets, this.asteroids, this.collideBulletAsteroid, null, this)
    }

    collideBulletAsteroid(bullet: Phaser.Physics.Arcade.Sprite, asteroid: Phaser.Physics.Arcade.Sprite){
        bullet.destroy();
        let explosionPoint: Point2D = { x: asteroid.x, y: asteroid.y};
        asteroid.destroy();
        this.createExplosion(explosionPoint);
    }

    createExplosion(spawn: Point2D){
        let explosion: Phaser.Physics.Arcade.Sprite = this.explosions.create(spawn.x, spawn.y, 'explosion');
        explosion.setDepth(GameConstants.SPRITE_DEPTH);
        // TODO - Can use this animations config to set up animations once rather than each creation
        var config = {
            key: 'boom',
            frames: 'explosion',
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
}