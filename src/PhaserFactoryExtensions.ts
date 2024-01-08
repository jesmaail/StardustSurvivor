import * as Phaser from "phaser";
import AsteroidPool from "./sprites/AsteroidPool";
import PowerupPool from "./sprites/PowerupPool";
import MissilePool, { IMissilePool } from "./sprites/MissilePool";
import { PlayerShip } from "./sprites/PlayerShip";

export function registerGameObjectFactoryExtensions(){
    Phaser.GameObjects.GameObjectFactory.register("asteroidPool", function () {
        return this.updateList.add(new AsteroidPool(this.scene));
    });

    Phaser.GameObjects.GameObjectFactory.register("missilePool", function () {
        return this.updateList.add(new MissilePool(this.scene));
    });

    Phaser.GameObjects.GameObjectFactory.register("powerupPool", function () {
        return this.updateList.add(new PowerupPool(this.scene));
    });

    Phaser.GameObjects.GameObjectFactory.register("playerShip", function (this: Phaser.GameObjects.GameObjectFactory, missilePool: IMissilePool) {
        const playerShip = new PlayerShip(this.scene, missilePool);
        this.scene.add.existing(playerShip);
        return this.updateList.add(playerShip);
    });
}