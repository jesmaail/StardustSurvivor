import * as Phaser from 'phaser';

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
