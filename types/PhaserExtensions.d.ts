import "phaser";
import IAsteroidPool from "../src/sprites/AsteroidPool";
import IMissilePool from "../src/sprites/MissilePool";
import IPowerupPool from "../src/sprites/PowerupPool";
import { PlayerShip } from "../src/sprites/PlayerShip";

declare module "phaser" {
    namespace GameObjects {
        interface GameObjectFactory {
            asteroidPool(): IAsteroidPool;
            missilePool(): IMissilePool;
            powerupPool(): IPowerupPool;
            playerShip(missilePool: IMissilePool): PlayerShip;
        }
    }
}

type PhaserSound = Phaser.Sound.HTML5AudioSound | Phaser.Sound.NoAudioSound | Phaser.Sound.WebAudioSound;