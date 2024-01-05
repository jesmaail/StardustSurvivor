import * as Phaser from "phaser";
import { AUDIO_PATH, IMAGE_PATH, SITE_LINK } from "../constants/assetConstants";
import { getScreenCenter, Point2D } from "../helpers";
import ScrollingSpaceScene from "./scrollingSpaceScene";
import * as GameConstants from "../constants/gameplayConstants";
import * as Assets from "../constants/assetConstants";

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

        this.loadAudio();
        this.load.image(Assets.SPACE_BACKGROUND, `${IMAGE_PATH}/space.png`);

        this.load.path = `${IMAGE_PATH}/`;
        this.load.multiatlas(Assets.SPRITE_ATLAS, "sprite_atlas.json");
        this.sound.volume = GameConstants.DEFAULT_VOLUME;
    }

    // TODO - Clean up positioning
    create() {
        this.initSpaceBackground();
        this.music = this.game.sound.add(Assets.MENU_MUSIC);
        
        const titleText = this.add.text(this.screenCenter.x, 50, "STARDUST\nSURVIVOR", {fontFamily: GameConstants.TEXT_FONT, fontSize: 40, color: GameConstants.DEFAULT_TEXT_COLOUR});
        titleText.setOrigin(0.5, 0);
        titleText.setDepth(GameConstants.SPRITE_DEPTH);

        const startTextYPosition = this.cameras.main.height - 150;
        const startTextConfig = {fontFamily: GameConstants.TEXT_FONT, fontSize: 18, color: GameConstants.DEFAULT_TEXT_COLOUR};
        const startText = this.add.text(this.screenCenter.x, startTextYPosition, "PRESS [↑] TO START!", startTextConfig);
        startText.setOrigin(0.5);
        startText.setDepth(GameConstants.SPRITE_DEPTH);
        
        const logo = this.add.image(this.cameras.main.width - 50, this.cameras.main.height - 50, Assets.SPRITE_ATLAS, Assets.DECIGAMES_LOGO);
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