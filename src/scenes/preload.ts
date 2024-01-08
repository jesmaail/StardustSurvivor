import * as Phaser from "phaser";
import ScrollingSpaceScene from "./scrollingSpaceScene";
import { PhaserSound } from "../../types/PhaserExtensions";
import { AUDIO_PATH, DEATH_SOUND, DECIGAMES_LOGO, DEFLECT_SOUND, END_MUSIC, EXPLODE_SOUND, FIRE_SOUND, GAME_MUSIC, HIT_SOUND, IMAGE_PATH, MENU_MUSIC, POWERUP_SOUND, SHIELD_SOUND, SITE_LINK, SPACE_BACKGROUND, SPRITE_ATLAS } from "../constants/assetConstants";
import { getScreenCenter, Point2D } from "../helpers";
import { registerGameObjectFactoryExtensions } from "../PhaserFactoryExtensions";
import { MAIN_SCENE_KEY } from "./main";
import { DEFAULT_VOLUME, TEXT_FONT, DEFAULT_TEXT_COLOUR, SPRITE_DEPTH, AUDIO_ENABLED } from "../constants/gameplayConstants";

export const PRELOAD_SCENE_KEY = "PreloadScene";

export default class PreloadScene extends ScrollingSpaceScene {
    private screenCenter: Point2D;
    private startKey: Phaser.Input.Keyboard.Key;
    private music: PhaserSound;
    
    constructor() {
        super({ key: PRELOAD_SCENE_KEY });

        registerGameObjectFactoryExtensions();
    }

    preload() {
        this.screenCenter = getScreenCenter(this.cameras.main);
        const loading = this.add.text(this.screenCenter.x, this.screenCenter.y, "LOADING...");
        loading.setOrigin(0.5);

        this.loadAudio();
        this.load.image(SPACE_BACKGROUND, `${IMAGE_PATH}/space.png`);

        this.load.path = `${IMAGE_PATH}/`;
        this.load.multiatlas(SPRITE_ATLAS, "sprite_atlas.json");
        this.sound.volume = DEFAULT_VOLUME;
    }

    // TODO - Clean up positioning
    create() {
        this.initSpaceBackground();
        this.music = this.game.sound.add(MENU_MUSIC);
        
        const titleText = this.add.text(this.screenCenter.x, 50, "STARDUST\nSURVIVOR", {fontFamily: TEXT_FONT, fontSize: 40, color: DEFAULT_TEXT_COLOUR});
        titleText.setOrigin(0.5, 0);
        titleText.setDepth(SPRITE_DEPTH);

        const startTextYPosition = this.cameras.main.height - 150;
        const startTextConfig = {fontFamily: TEXT_FONT, fontSize: 18, color: DEFAULT_TEXT_COLOUR};
        const startText = this.add.text(this.screenCenter.x, startTextYPosition, "PRESS [↑] TO START!", startTextConfig);
        startText.setOrigin(0.5);
        startText.setDepth(SPRITE_DEPTH);
        
        const logo = this.add.image(this.cameras.main.width - 50, this.cameras.main.height - 50, SPRITE_ATLAS, DECIGAMES_LOGO);
        logo.setScale(0.5);
        logo.setOrigin(0.5);
        logo.setDepth(SPRITE_DEPTH);
        logo.setInteractive();
        logo.on("pointerdown", () => this.linkToSite());

        if(AUDIO_ENABLED){
            this.music.loop = true;
            this.music.play();
        }

        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    }

    update() { 
        if (this.startKey.isDown){
            this.music.stop();
            this.scene.start(MAIN_SCENE_KEY);
        }

        this.scrollSpaceBackground();
    }

    private loadAudio() {
        this.load.audio(MENU_MUSIC, `${AUDIO_PATH}/startMusic.mp3`);
        this.load.audio(GAME_MUSIC, `${AUDIO_PATH}/gameMusic.mp3`);
        this.load.audio(FIRE_SOUND, `${AUDIO_PATH}/fire.mp3`);
        this.load.audio(DEATH_SOUND, `${AUDIO_PATH}/playerDeath.mp3`);
        this.load.audio(HIT_SOUND, `${AUDIO_PATH}/hit.mp3`);
        this.load.audio(EXPLODE_SOUND, `${AUDIO_PATH}/explode.mp3`);
        this.load.audio(POWERUP_SOUND, `${AUDIO_PATH}/powerup.mp3`);
        this.load.audio(SHIELD_SOUND, `${AUDIO_PATH}/shieldActivate.mp3`);
        this.load.audio(DEFLECT_SOUND, `${AUDIO_PATH}/deflect.mp3`);
        this.load.audio(END_MUSIC, `${AUDIO_PATH}/endScreen.mp3`);
    }

    linkToSite(){
        window.open(SITE_LINK, "_blank");
    }

}