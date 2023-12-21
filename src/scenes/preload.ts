import * as Phaser from 'phaser';
import { AUDIO_PATH, IMAGE_PATH } from '../constants';
import { getScreenCenter, Point2D } from '../helpers';
import ScrollingSpaceScene from './scrollingSpaceScene';
import * as GameConstants from '../constants';

import ImageFrameConfig = Phaser.Types.Loader.FileTypes.ImageFrameConfig

export default class PreloadScene extends ScrollingSpaceScene {
    private screenCenter: Point2D
    private startKey: Phaser.Input.Keyboard.Key;

    private music: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    
    constructor() {
        super({ key: 'PreloadScene' })
    }

    preload() {
        this.screenCenter = getScreenCenter(this.cameras.main);
        let loading = this.add.text(this.screenCenter.x, this.screenCenter.y, "LOADING...");
        loading.setOrigin(0.5)

        this.loadImages();
        this.loadSpritesheets();
        this.loadAudio();  
    }

    // TODO - Clean up positioning
    create() {
        this.initSpaceBackground();
        this.music = this.game.sound.add('menuMusic')

        let title = this.add.image(40, 50, 'title');
        title.setOrigin(0, 0);
        title.setDepth(GameConstants.SPRITE_DEPTH)

        let start = this.add.image(this.screenCenter.x, this.cameras.main.height - 150, 'start');
        start.setOrigin(0.5);
        start.setDepth(GameConstants.SPRITE_DEPTH)

        
        let logo = this.add.image(this.cameras.main.width - 50, this.cameras.main.height - 50, 'dg');
        logo.setScale(0.5);
        logo.setOrigin(0.5);
        logo.setDepth(GameConstants.SPRITE_DEPTH);
        logo.setInteractive();
        logo.on('pointerdown', () => this.linkToSite());


        if(GameConstants.AUDIO_ENABLED){
            this.music.loop = true;
            this.music.play();
        }

        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    }

    update() { 
        if (this.startKey.isDown){
            this.music.stop();
            this.scene.start('MainScene');
        }

        this.scrollSpaceBackground();
    }

    private loadImages() {
        // Backgrounds
		this.load.image('space', `${IMAGE_PATH}/space.png`);

        // Text
		this.load.image('dead', `${IMAGE_PATH}/dead.png`);
		this.load.image('restart', `${IMAGE_PATH}/restart.png`);

        // Menus
		this.load.image('title', `${IMAGE_PATH}/title.png`);
		this.load.image('start', `${IMAGE_PATH}/start.png`);


        // Sprites
		this.load.image('ship', `${IMAGE_PATH}/ship.png`);
		this.load.image('bullet', `${IMAGE_PATH}/rocket.png`);
		this.load.image('shield', `${IMAGE_PATH}/shield.png`);

        // Logo
		this.load.image('dg', `${IMAGE_PATH}/dg.png`);
    }

    private loadSpritesheets() {
        let asteroid_sprite_config: ImageFrameConfig = {
            frameWidth: 150,
            frameHeight: 150
        };
        this.load.spritesheet('asteroid', `${IMAGE_PATH}/asteroid.png`, asteroid_sprite_config);

        let big_asteroid_sprite_config: ImageFrameConfig = {
            frameWidth: 289,
            frameHeight: 289
        };
        this.load.spritesheet('asteroidBig', `${IMAGE_PATH}/asteroidBig.png`, big_asteroid_sprite_config);

        let explosion_sprite_config: ImageFrameConfig = {
            frameWidth: 40,
            frameHeight: 40
        };
        this.load.spritesheet('explosion', `${IMAGE_PATH}/explosion.png`, explosion_sprite_config);

        let powerup_sprite_config: ImageFrameConfig = {
            frameWidth: 144,
            frameHeight: 144
        };
        this.load.spritesheet('powerups', `${IMAGE_PATH}/powerups.png`, powerup_sprite_config);
    }

    private loadAudio() {
        this.load.audio('menuMusic', `${AUDIO_PATH}/startMusic.mp3`)
        this.load.audio('gameMusic', `${AUDIO_PATH}/gameMusic.mp3`)
        this.load.audio('fire', `${AUDIO_PATH}/fire.mp3`)
        this.load.audio('death', `${AUDIO_PATH}/playerDeath.mp3`)
        this.load.audio('hit', `${AUDIO_PATH}/hit.mp3`)
        this.load.audio('explode', `${AUDIO_PATH}/explode.mp3`)
        this.load.audio('powerup', `${AUDIO_PATH}/powerup.mp3`)
        this.load.audio('shieldActivate', `${AUDIO_PATH}/shieldActivate.mp3`)
        this.load.audio('deflect', `${AUDIO_PATH}/deflect.mp3`)
        this.load.audio('endMusic', `${AUDIO_PATH}/endScreen.mp3`)
    }

    linkToSite(){
		window.open(GameConstants.SITE_LINK, '_blank');
	}

}