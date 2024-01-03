import * as Phaser from "phaser";
import { getScreenCenter, Point2D } from "../helpers";
import * as Assets from "../constants/assetConstants";

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
        console.log(data);
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

        const deathText = this.add.sprite(this.screenCenter.x, 20, Assets.TEXT_ATLAS, Assets.DEATH_TEXT);
        deathText.setOrigin(0.5, 0);

        const restartText = this.add.sprite(this.screenCenter.x, 500, Assets.TEXT_ATLAS, Assets.RESTART_TEXT);
        restartText.setOrigin(0.5, 0);

        const scoreText = this.add.text(this.cameras.main.centerX, 350, `YOU SURVIVED ${this.score} SECONDS!`, { 
            font: "bold 23px Courier New", 
            color: "#ff7800",
            align: "center"
        });
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