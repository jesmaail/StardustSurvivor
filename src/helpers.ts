import * as Phaser from 'phaser';
import * as GameConstants from './constants';

import Camera = Phaser.Cameras.Scene2D.Camera

export type Point2D = {
    x: number;
    y: number;
}

export function getScreenCenter(mainCamera: Camera): Point2D {
    let centerX = mainCamera.width / 2;
    let centerY = mainCamera.height / 2;

    return { x: centerX, y: centerY}
}

export function getRandomFromSelection(selection: Array<any>){
    // -1 because although rare it can hit the max and then be out of bounds
    let upperBound = (selection.length * 100) - 1;
    let random = Phaser.Math.Between(0, upperBound);
    let roundedRandom = Math.floor(random / 100);

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

    console.log(`${group.getLength()}`)
}