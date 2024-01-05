import * as Phaser from "phaser";
import * as GameConstants from "./constants/gameplayConstants";

import Camera = Phaser.Cameras.Scene2D.Camera

export type Point2D = {
    x: number;
    y: number;
}

export function getScreenCenter(mainCamera: Camera): Point2D {
    const centerX = mainCamera.width / 2;
    const centerY = mainCamera.height / 2;

    return { x: centerX, y: centerY };
}

export function getRandomFromSelection(selection: Array<any>){
    // -1 because although rare it can hit the max and then be out of bounds
    const upperBound = (selection.length * 100) - 1;
    const random = Phaser.Math.Between(0, upperBound);
    const roundedRandom = Math.floor(random / 100);

    return selection[roundedRandom];
}

export function rollPercentageChance(chance: number): boolean {
    const randomNumber = Math.random() * 100;
    return randomNumber < chance;
}

export function debugLogGroupCount(group: Phaser.GameObjects.Group){
    if(!GameConstants.DEBUG_ENABLED){
        return;
    }

    console.log(`${group.getLength()}`);
}

export function debugLog(gameScene: Phaser.Scene, fpsReadout: Phaser.GameObjects.Text){
    if(!GameConstants.DEBUG_ENABLED){
        return;
    }
    const fps = gameScene.game.loop.actualFps.toFixed(2);
    fpsReadout.setText(`FPS: ${fps}`);
    fpsReadout.setDepth(GameConstants.TEXT_DEPTH);
}