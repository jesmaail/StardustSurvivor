import IAsteroidPool from "../src/sprites/AsteroidPool";
import "phaser";

declare module "phaser" {
    namespace GameObjects {
        interface GameObjectFactory {
            asteroidPool(): IAsteroidPool;
        }
    }
}