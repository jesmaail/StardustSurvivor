import * as Phaser from "phaser";

import * as Assets from "../constants/assetConstants";
import * as GameConstants from "../constants/gameplayConstants";

import { getRandomFromSelection, Point2D } from "../helpers";

declare interface IAsteroidPool extends Phaser.GameObjects.Group {
    createAsteroid(location: Point2D, velocity: Point2D, isLarge: boolean): void;
}

class Asteroid extends Phaser.GameObjects.Sprite {
    isLarge: boolean;
    
    constructor(scene: Phaser.Scene, position: Point2D, velocity: Point2D) {
        const asteroidFrame = getRandomFromSelection(Assets.ASTEROID_SPRITE_FRAMES);
        super(scene, position.x, position.y, Assets.SPRITE_ATLAS, asteroidFrame);

        scene.physics.add.existing(this);

        this.setScale(GameConstants.SPRITE_SCALE);
        this.setDepth(GameConstants.SPRITE_DEPTH);
        scene.physics.world.enable(this);
        this.body.velocity.x = velocity.x;
        this.body.velocity.y = velocity.y;
    }
}

export default class AsteroidPool extends Phaser.GameObjects.Group implements IAsteroidPool {

    constructor(scene: Phaser.Scene, config: Phaser.Types.GameObjects.Group.GroupConfig = {}) {
        const defaults: Phaser.Types.GameObjects.Group.GroupConfig = {
            classType: Phaser.GameObjects.Sprite,
            maxSize: -1
        };
        super(scene, Object.assign(defaults, config));
    }

    createAsteroid(location: Point2D, velocity: Point2D, isLarge: boolean){
        const asteroid = new Asteroid(this.scene, location, velocity);

        asteroid.setVisible(true);
        this.add(asteroid, true);
    }
}