import * as Phaser from 'phaser';
import * as Assets from '../constants/assetConstants';

export default class ScrollingSpaceScene extends Phaser.Scene {
    scrollBuffer: number = 0;
    spaceScrollVelocity: number = 200;
    spaceScroll: Phaser.GameObjects.Group;

    constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    initSpaceBackground() {
        let background = this.add.sprite(0, 0, Assets.SPACE_BACKGROUND);
        background.setOrigin(0, 0);
        this.physics.world.enable(background);
        background.body.velocity.y = this.spaceScrollVelocity;
        
        this.spaceScroll = this.add.group();
    }

    scrollSpaceBackground() {
        if (this.spaceScroll.countActive(true) < 5 && this.scrollBuffer < this.time.now) {
            let space: Phaser.GameObjects.Sprite = this.spaceScroll.create(0, 0, Assets.SPACE_BACKGROUND);
            space.setOrigin(0, 1);
            space.setDepth(Number.MIN_VALUE)
            this.physics.world.enable(space);
            space.body.velocity.y = this.spaceScrollVelocity;

            this.scrollBuffer = this.time.now + 1500; // Cannot remember where I got this value from :D
        }
        // Cull Space Background sprites out of bounds
        this.spaceScroll.getChildren().forEach((space: Phaser.GameObjects.Sprite) => {            
            if (space.y - space.height > this.physics.world.bounds.bottom) {
                space.destroy();
            }
        });
    }
}