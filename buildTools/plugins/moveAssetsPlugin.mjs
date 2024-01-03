import fs from "fs";
import path from "path";

// TODO - Create directory if doesn't exist.
const moveAssets = (fileList) => {
    return {
        name: "move-assets",
        writeBundle: () => {
            console.log("Moving asset files...");
            const destinationDirectory = "./dist";

            fileList.forEach(file => {
                console.log(`Moving ${file}`);
                const destinationPath = path.join(destinationDirectory, file);

                if(fs.existsSync(file)){
                    fs.copyFileSync(file, destinationPath);
                } else {
                    console.warn(`File not found ${file}`);
                }
            });
        }
    };
};

export default moveAssets;