import IAsteroidPool from "../src/sprites/AsteroidPool";

// declare namespace Phaser.GameObjects {
//     interface GameObjectFactory {
//         asteroidPool(): IAsteroidPool;
//     }
// }

import "phaser";

declare module "phaser" {
    namespace GameObjects {
        interface GameObjectFactory {
            asteroidPool(): IAsteroidPool;
        }
    }
}