import * as Phaser from "phaser";
import { SPRITE_SCALE, SPRITE_DEPTH } from "../constants/GameplayConstants";
import { SPRITE_ATLAS } from "../constants/AssetConstants";
import { getRandomFromSelection, Point2D, } from "../Helpers";
import { AsteroidType } from "./AsteroidType";

const ASTEROID_SPRITE_FRAMES: string[] = [
    "asteroid0", 
    "asteroid1", 
    "asteroid2", 
    "asteroid3", 
    "asteroid4", 
    "asteroid5"
];
const LARGE_ASTEROID_SPRITE_FRAMES: string[] = [
    "asteroidBig0", 
    "asteroidBig1", 
    "asteroidBig2", 
    "asteroidBig3", 
    "asteroidBig4", 
    "asteroidBig5",
    "asteroidBig6",
    "asteroidBig7"
];
const LARGE_ASTEROID_SPEED = 250;
const ASTEROID_SPEED_MIN = 325;
const ASTEROID_SPEED_MAX = 375;
const ASTEROID_SPAWN_Y = -50;
const ASTEROID_VELOCITY_X = 0;
const FRACTURED_ASTEROID_SPEED_MIN = 250;
const FRACTURED_ASTEROID_SPEED_MAX = 350;
const FRACTURED_ASTEROID_DRIFT_MIN = 0;
const FRACTURED_ASTEROID_DRIFT_MAX = 150;

export class Asteroid extends Phaser.Physics.Arcade.Sprite {
    asteroidType: AsteroidType;
    
    constructor(scene: Phaser.Scene, asteroidType: AsteroidType, position?: Point2D) {
        const frames = asteroidType == AsteroidType.Large ? LARGE_ASTEROID_SPRITE_FRAMES : ASTEROID_SPRITE_FRAMES;
        const asteroidFrame = getRandomFromSelection(frames);

        if(!position){
            position = {
                x: Phaser.Math.Between(-100, 4050) / 10, // Why these numbers?
                y: ASTEROID_SPAWN_Y
            };
        }

        super(scene, position.x, position.y, SPRITE_ATLAS, asteroidFrame);

        this.asteroidType = asteroidType;

        scene.physics.add.existing(this);

        this.setScale(SPRITE_SCALE);
        this.setDepth(SPRITE_DEPTH);
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
                    x: ASTEROID_VELOCITY_X,
                    y: Phaser.Math.Between(ASTEROID_SPEED_MIN, ASTEROID_SPEED_MAX)
                };

            case AsteroidType.Large:
                return {
                    x: ASTEROID_VELOCITY_X,
                    y: LARGE_ASTEROID_SPEED
                };

            case AsteroidType.PositiveFracture:
                return {
                    x: Phaser.Math.Between(FRACTURED_ASTEROID_DRIFT_MIN, FRACTURED_ASTEROID_DRIFT_MAX),
                    y: Phaser.Math.Between(FRACTURED_ASTEROID_SPEED_MIN, FRACTURED_ASTEROID_SPEED_MAX)
                };
            case AsteroidType.NegativeFracture:
                return {
                    x: Phaser.Math.Between(FRACTURED_ASTEROID_DRIFT_MIN, -FRACTURED_ASTEROID_DRIFT_MAX),
                    y: Phaser.Math.Between(FRACTURED_ASTEROID_SPEED_MIN, FRACTURED_ASTEROID_SPEED_MAX)
                };
        }
    }
}
