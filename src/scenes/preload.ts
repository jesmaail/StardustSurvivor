import * as Phaser from "phaser";
import { AUDIO_PATH, IMAGE_PATH, SITE_LINK } from "../constants/assetConstants";
import { getScreenCenter, Point2D } from "../helpers";
import ScrollingSpaceScene from "./scrollingSpaceScene";
import * as GameConstants from "../constants/gameplayConstants";
import * as Assets from "../constants/assetConstants";

import ImageFrameConfig = Phaser.Types.Loader.FileTypes.ImageFrameConfig

export default class PreloadScene extends ScrollingSpaceScene {
    private screenCenter: Point2D;
    private startKey: Phaser.Input.Keyboard.Key;

    private music: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        this.screenCenter = getScreenCenter(this.cameras.main);
        const loading = this.add.text(this.screenCenter.x, this.screenCenter.y, "LOADING...");
        loading.setOrigin(0.5);

        this.loadImages();
        this.loadSpritesheets();
        this.loadAudio();  
    }

    // TODO - Clean up positioning
    create() {
        this.initSpaceBackground();
        this.music = this.game.sound.add(Assets.MENU_MUSIC);

        const title = this.add.image(40, 50, Assets.TITLE_TEXT);
        title.setOrigin(0, 0);
        title.setDepth(GameConstants.SPRITE_DEPTH);
        
        const start = this.add.image(this.screenCenter.x, this.cameras.main.height - 150, Assets.START_TEXT);
        start.setOrigin(0.5);
        start.setDepth(GameConstants.SPRITE_DEPTH);

        
        const logo = this.add.image(this.cameras.main.width - 50, this.cameras.main.height - 50, Assets.DECIGAMES_LOGO);
        logo.setScale(0.5);
        logo.setOrigin(0.5);
        logo.setDepth(GameConstants.SPRITE_DEPTH);
        logo.setInteractive();
        logo.on("pointerdown", () => this.linkToSite());


        if(GameConstants.AUDIO_ENABLED){
            this.music.loop = true;
            this.music.play();
        }

        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    }

    update() { 
        if (this.startKey.isDown){
            this.music.stop();
            this.scene.start("MainScene");
        }

        this.scrollSpaceBackground();
    }

    private loadImages() {
        // Backgrounds
        this.load.image(Assets.SPACE_BACKGROUND, `${IMAGE_PATH}/space.png`);

        // Text
        this.load.image(Assets.DEATH_TEXT, `${IMAGE_PATH}/dead.png`);
        this.load.image(Assets.RESTART_TEXT, `${IMAGE_PATH}/restart.png`);

        // Menus
        this.load.image(Assets.TITLE_TEXT, `${IMAGE_PATH}/title.png`);
        this.load.image(Assets.START_TEXT, `${IMAGE_PATH}/start.png`);


        // Sprites
        this.load.image(Assets.SHIP, `${IMAGE_PATH}/ship.png`);
        this.load.image(Assets.BULLET, `${IMAGE_PATH}/rocket.png`);
        this.load.image(Assets.SHIELD, `${IMAGE_PATH}/shield.png`);

        // Logo
        this.load.image(Assets.DECIGAMES_LOGO, `${IMAGE_PATH}/dg.png`);
    }

    private loadSpritesheets() {
        const asteroid_sprite_config: ImageFrameConfig = {
            frameWidth: 150,
            frameHeight: 150
        };
        this.load.spritesheet(Assets.ASTEROID, `${IMAGE_PATH}/asteroid.png`, asteroid_sprite_config);

        const big_asteroid_sprite_config: ImageFrameConfig = {
            frameWidth: 289,
            frameHeight: 289
        };
        this.load.spritesheet(Assets.ASTEROID_BIG, `${IMAGE_PATH}/asteroidBig.png`, big_asteroid_sprite_config);

        const explosion_sprite_config: ImageFrameConfig = {
            frameWidth: 40,
            frameHeight: 40
        };
        this.load.spritesheet(Assets.EXPLOSION, `${IMAGE_PATH}/explosion.png`, explosion_sprite_config);

        const powerup_sprite_config: ImageFrameConfig = {
            frameWidth: 144,
            frameHeight: 144
        };
        this.load.spritesheet(Assets.POWERUPS, `${IMAGE_PATH}/powerups.png`, powerup_sprite_config);
    }

    private loadAudio() {
        this.load.audio(Assets.MENU_MUSIC, `${AUDIO_PATH}/startMusic.mp3`);
        this.load.audio(Assets.GAME_MUSIC, `${AUDIO_PATH}/gameMusic.mp3`);
        this.load.audio(Assets.FIRE_SOUND, `${AUDIO_PATH}/fire.mp3`);
        this.load.audio(Assets.DEATH_SOUND, `${AUDIO_PATH}/playerDeath.mp3`);
        this.load.audio(Assets.HIT_SOUND, `${AUDIO_PATH}/hit.mp3`);
        this.load.audio(Assets.EXPLODE_SOUND, `${AUDIO_PATH}/explode.mp3`);
        this.load.audio(Assets.POWERUP_SOUND, `${AUDIO_PATH}/powerup.mp3`);
        this.load.audio(Assets.SHIELD_SOUND, `${AUDIO_PATH}/shieldActivate.mp3`);
        this.load.audio(Assets.DEFLECT_SOUND, `${AUDIO_PATH}/deflect.mp3`);
        this.load.audio(Assets.END_MUSIC, `${AUDIO_PATH}/endScreen.mp3`);
    }

    linkToSite(){
        window.open(SITE_LINK, "_blank");
    }

}