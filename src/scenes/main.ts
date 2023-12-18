import * as Phaser from 'phaser';
import { getScreenCenter, Point2D } from '../helpers';
import ScrollingSpaceScene from './scrollingSpaceScene';
import * as GameConstants from '../constants';

export default class MainScene extends ScrollingSpaceScene {
    private screenCenter: Point2D
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    // Text
    private ammoText: Phaser.GameObjects.Text
    private scoreText: Phaser.GameObjects.Text
    private powerText: Phaser.GameObjects.Text

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

    constructor() {
        super({ key: 'MainScene' })
    }

    preload () { 
        this.bullets = this.add.group();
        this.spaceScroll = this.add.group();

        this.screenCenter = getScreenCenter(this.cameras.main);

        this.bulletSound = this.game.sound.add('fire');
    }

    create() {
        this.initSpaceBackground();
        this.ammoText = this.add.text(30, 30, "Ammo: "+ this.ammo , GameConstants.DEFAULT_TEXT_STYLE);
        this.ammoText.setDepth(Number.MAX_VALUE)
		this.scoreText = this.add.text(290, 30, "Score: " + this.score , GameConstants.DEFAULT_TEXT_STYLE);
        this.scoreText.setDepth(Number.MAX_VALUE)	
		this.powerText = this.add.text(125, 30, "" , {font: GameConstants.TEXT_FONT, color: GameConstants.SHIELD_TEXT_COLOUR });
        this.powerText.setDepth(Number.MAX_VALUE)


        if(GameConstants.AUDIO_ENABLED){
            let bgMusic = this.game.sound.add('gameMusic')
            bgMusic.loop = true;
            bgMusic.play();
        }
        
        this.cursors = this.input.keyboard.createCursorKeys();

        this.player = this.physics.add.sprite(200, 540, 'ship');
        this.player.setOrigin(0.5, 0);
        this.player.setScale(GameConstants.SPRITE_SCALE);
        this.player.setDepth(Number.MAX_VALUE)
        this.physics.world.enable(this.player);

        // Issue with type-checking on setCollideWorldBounds()
        this.playerBody = this.player.body as Phaser.Physics.Arcade.Body
        this.playerBody.setCollideWorldBounds(true);
    }

    update() { 
        this.debugLog();
        if(this.time.now > this.scoreTimer){
            this.scoreTimer = this.time.now + GameConstants.SCORE_INCREMENT;
            this.score++;
        }

        this.ammoText.setText("Ammo: " + this.ammo);
		this.scoreText.setText("Score: " + this.score);


        this.scrollSpaceBackground();
        this.player.body.velocity.x = 0;

        this.playerControls();
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
        bullet.setDepth(Number.MAX_VALUE)

        this.physics.world.enable(bullet);
        bullet.body.velocity.y = -GameConstants.BULLET_SPEED;

        this.bulletSound.play();

        this.ammo--;
    }

    gameObjectCulling(){
        this.bullets.getChildren().forEach((bullet: Phaser.GameObjects.Sprite) => {
            if(bullet.y < this.physics.world.bounds.top){
                bullet.destroy();
            }
        })
    }

    debugLog(){
        if(!GameConstants.DEBUG_ENABLED){
            return;
        }

        let bulletCount = this.bullets.getLength();
        console.log(`Bullets: ${bulletCount}`)
    }
}