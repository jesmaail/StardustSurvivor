# Stardust Survivor
_Working title: "Space Fighters: Asteroid Field"_

This game has been ported across from Phaser 2 Javascript to Phaser 3 Typescript :tada:


## Improvements
- "GameFeel" improvements
- Abstract logic out of main.ts
- Encapsulate behaviours
    - e.g. Ship, Asteroids, Powerups.
    - Asteroid and LargeAsteroid spawn logic now identical so needs consolidation
- Powerup improvements
    - Use icon to signify online/available
    - Duration indicator
- Turn down the audio level

## Gotchas
- Need to append '.png' to image name under the json file for texture atlas files so Phaser can load it.
    - A potential thing to add into the rollup pipeline via a plugin in the future?

# Credits

- [Kenney Space Shooter Redux](https://kenney.nl/assets/space-shooter-reduxe)
- [TexturePacker](https://www.codeandweb.com/texturepacker)
- ['Press Start 2P' Font](https://fonts.google.com/specimen/Press+Start+2P)