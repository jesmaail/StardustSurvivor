# AsteroidGame
DeciGames Asteroid game


Game has been ported across from Phaser 2 Javascript to Phaser 3 Typescript :tada:

# TODO
- New name?
    - Kuiper Klash
    - Asteroid Clash
    - Kuiper Quest
    - Cosmic Collider
    - Asteroid Assault
    - Cosmic Dodger
    - Meteor Mayhem
    - Asteroid Arena
    - Starship Survival
    - Asteroid Annihilator
    - Orbit Odyssey
    - Galactic Gauntlet
    - Void Voyager
    - Stellar Striker


## Improvements
- Add rollup plugins to prod build
- Use a font rather than images - https://fonts.google.com/specimen/Press+Start+2P
- Abstract logic out of main.ts
- Encapsulate behaviours
    - e.g. Ship, Asteroids, Powerups.
    - Asteroid and LargeAsteroid spawn logic now identical so needs consolidation
- Powerup improvements
    - Use icon to signify online/available
    - Duration indicator
- Turn down the audio level

## Gotchas
- Need to create asset folders under dist before running rollup
    - Will improve the plugin to ensure it's created
- Need to append '.png' to image name under the json file for texture atlas files so Phaser can load it.
    - A potential thing to add into the rollup pipeline via a plugin in the future?

# Credits

- [Kenney Space Shooter Redux](https://kenney.nl/assets/space-shooter-reduxe)
- [TexturePacker](https://www.codeandweb.com/texturepacker)