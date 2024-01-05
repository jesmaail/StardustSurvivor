import * as Phaser from "phaser";
import { getScreenCenter, Point2D } from "../helpers";
import * as Assets from "../constants/assetConstants";
import * as GameConstants from "../constants/gameplayConstants";

export default class EndScene extends Phaser.Scene {
    private screenCenter: Point2D;
    private restartKey: Phaser.Input.Keyboard.Key;

    private endMusic: Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;
    
    private score: number = 0;

    constructor() {
        super({ key: "EndScene" });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    init(data: any) {
        this.score = data.score;
    }

    preload() {
        this.screenCenter = getScreenCenter(this.cameras.main);

        this.endMusic = this.game.sound.add(Assets.END_MUSIC);

        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    }

    create() {
        this.endMusic.play();
        const background = this.add.sprite(0, 0, Assets.SPACE_BACKGROUND);
        background.setOrigin(0, 0);

        const dramaticReadout1 = "YOUR SHIP CRASHED\nINTO AN ASTEROID.";
        const dramaticReadout2 = "ALL CREW ABOARD\nWERE INCINERATED\nUPON IMPACT.";
        const dramaticReadout3 = "AND IT WAS ALL\nYOUR FAULT.";
        const fullDramaticReadout = `${dramaticReadout1}\n\n${dramaticReadout2}\n\n${dramaticReadout3}`;

        const dramaticTextConfig = {fontFamily: GameConstants.TEXT_FONT, fontSize: 20, color: GameConstants.DEFAULT_TEXT_COLOUR};
        const dramaticText = this.add.text(this.screenCenter.x, 20, fullDramaticReadout, dramaticTextConfig);
        dramaticText.setOrigin(0.5, 0);
        dramaticText.setDepth(GameConstants.SPRITE_DEPTH);

        const restartTextYPosition = this.cameras.main.height - 100;
        const restartTextConfig = {fontFamily: GameConstants.TEXT_FONT, fontSize: 18, color: GameConstants.DEFAULT_TEXT_COLOUR};
        const restartText = this.add.text(this.screenCenter.x, restartTextYPosition, "PRESS [↑] TO RESTART", restartTextConfig);
        restartText.setOrigin(0.5);
        restartText.setDepth(GameConstants.SPRITE_DEPTH);

        const scoreTextConfig = {fontFamily: GameConstants.TEXT_FONT, fontSize: 20, color: "#ff7800", align: "center"};
        const scoreText = this.add.text(this.cameras.main.centerX, 350, `YOU SURVIVED\n${this.score}\nSECONDS!`, scoreTextConfig);
        scoreText.setOrigin(0.5, 0);
    }

    update() {
        if(this.restartKey.isDown){
            this.endMusic.stop();
            this.scene.stop();
            this.scene.start("MainScene");

        }
    }
}