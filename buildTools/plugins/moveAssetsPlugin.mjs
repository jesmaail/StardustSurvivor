import fs from "fs";
import path from "path";

const moveAssets = (destinationDirectory, manifestDirectory, manifestFileName = "manifest.json") => {
    return {
        name: "move-assets",
        writeBundle: () => {
            const manifestFilePath = path.join(manifestDirectory, manifestFileName);
            console.log(`Moving asset files defined in ${manifestFilePath}`);

            const manifestJsonString = fs.readFileSync(manifestFilePath, "utf-8");
            const manifest = JSON.parse(manifestJsonString);

            manifest.assetGroups.forEach(assetGroup => {
                const assetInputPath = path.join(manifestDirectory, assetGroup.folderName);
                const assetOutputPath = path.join(destinationDirectory, manifestDirectory, assetGroup.folderName);
                    
                assetGroup.files.forEach(file => {
                    const nestedDirectories = path.dirname(file);
                    const outputDirectory = path.join(assetOutputPath, nestedDirectories);
                    createDirectoryIfNotExists(outputDirectory);

                    const inputFilePath = path.join(assetInputPath, file);
                    const outputFilePath = path.join(assetOutputPath, file);
                    
                    copyFileIfExists(inputFilePath, outputFilePath);

                });
            });
        }
    };
};

const createDirectoryIfNotExists = (directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

const copyFileIfExists = (filename, destinationPath) => {
    if(fs.existsSync(filename)){
        fs.copyFileSync(filename, destinationPath);
    } else {
        console.warn(`Error moving file - ${filename}`);
    }
};
export default moveAssets;