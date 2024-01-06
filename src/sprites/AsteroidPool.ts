import * as Phaser from "phaser";

import * as Assets from "../constants/assetConstants";
import * as GameConstants from "../constants/gameplayConstants";

import { getRandomFromSelection, Point2D, rollPercentageChance } from "../helpers";

declare interface IAsteroidPool extends Phaser.GameObjects.Group {
    createAsteroid(): void;
}

export enum AsteroidType {
    Normal,
    Large,
    PositiveFracture,
    NegativeFracture
}

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
    asteroidType: AsteroidType;
    
    constructor(scene: Phaser.Scene, asteroidType: AsteroidType, position?: Point2D) {
        const assets = asteroidType == AsteroidType.Large ? Assets.LARGE_ASTEROID_SPRITE_FRAMES : Assets.ASTEROID_SPRITE_FRAMES;
        const asteroidFrame = getRandomFromSelection(assets);

        if(!position){
            position = {
                x: Phaser.Math.Between(-100, 4050) / 10, // Why these numbers?
                y: GameConstants.ASTEROID_SPAWN_Y
            };
        }

        super(scene, position.x, position.y, Assets.SPRITE_ATLAS, asteroidFrame);

        this.asteroidType = asteroidType;

        scene.physics.add.existing(this);

        this.setScale(GameConstants.SPRITE_SCALE);
        this.setDepth(GameConstants.SPRITE_DEPTH);
        scene.physics.world.enable(this);

        const velocity = this.determineAsteroidSpeed(asteroidType);

        this.body.velocity.x = velocity.x;
        this.body.velocity.y = velocity.y;
    }

    private determineAsteroidSpeed(asteroidType: AsteroidType): Point2D {
        switch(asteroidType){
            default:
            case AsteroidType.Normal:
                return {
                    x: GameConstants.ASTEROID_VELOCITY_X,
                    y: Phaser.Math.Between(GameConstants.ASTEROID_SPEED_MIN, GameConstants.ASTEROID_SPEED_MAX)
                };

            case AsteroidType.Large:
                return {
                    x: GameConstants.ASTEROID_VELOCITY_X,
                    y: GameConstants.LARGE_ASTEROID_SPEED
                };

            case AsteroidType.PositiveFracture:
                return {
                    x: Phaser.Math.Between(0, GameConstants.FRACTURED_ASTEROID_DRIFT_MAX),
                    y: Phaser.Math.Between(GameConstants.FRACTURED_ASTEROID_SPEED_MIN, GameConstants.FRACTURED_ASTEROID_SPEED_MAX)
                };
            case AsteroidType.NegativeFracture:
                return {
                    x: Phaser.Math.Between(0, -GameConstants.FRACTURED_ASTEROID_DRIFT_MAX),
                    y: Phaser.Math.Between(GameConstants.FRACTURED_ASTEROID_SPEED_MIN, GameConstants.FRACTURED_ASTEROID_SPEED_MAX)
                };
        }
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

    createAsteroid(fracturePosition?: Point2D){
        if(fracturePosition){
            // TODO - can create variable fractures
            this.addAsteroidToScene(AsteroidType.PositiveFracture, fracturePosition);
            this.addAsteroidToScene(AsteroidType.NegativeFracture, fracturePosition);
            return;
        }
        
        if(rollPercentageChance(GameConstants.LARGE_ASTEROID_CHANCE)){
            this.addAsteroidToScene(AsteroidType.Large);
            return;
        }

        this.addAsteroidToScene(AsteroidType.Normal);
    }

    private addAsteroidToScene(type: AsteroidType, position?: Point2D){
        const asteroid = new Asteroid(this.scene, type, position);
        asteroid.setVisible(true);
        this.add(asteroid, true);
    }
}