import fs from "fs";

const imageFileExtension = ".png";

const freeTexturePackerPhaserFix = (textureMapFiles) => {
    return {
        name: "phaser-fix-free-tex-packer",
        writeBundle: () => {
            console.log("Fixing Texture map files for use with Phaser3");

            textureMapFiles.forEach(file => {
                const fileJsonString = fs.readFileSync(file, "utf-8");
                const textureMap = JSON.parse(fileJsonString);

                textureMap.textures.forEach(texture => {
                    if (!texture.image.endsWith(imageFileExtension)) {
                        texture.image += imageFileExtension;
                    }
                });

                const modifiedJson = JSON.stringify(textureMap, null, 4); // 4 for pretty printing

                fs.writeFile(file, modifiedJson, "utf8", (err) => {
                    if (err) {
                        console.error("Error writing back to the file:", err);
                    }
                });
            });

            
        }
    };
};

export default freeTexturePackerPhaserFix;