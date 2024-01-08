import * as Phaser from "phaser";
import { Point2D, rollPercentageChance } from "../Helpers";
import { Asteroid } from "./Asteroid";
import { AsteroidType } from "./AsteroidType";

declare interface IAsteroidPool extends Phaser.GameObjects.Group {
    createAsteroid(fracturePosition?: Point2D): void;
}

const LARGE_ASTEROID_CHANCE = 10;

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
        
        if(rollPercentageChance(LARGE_ASTEROID_CHANCE)){
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
