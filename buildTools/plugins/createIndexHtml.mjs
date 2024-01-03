import fs from "fs";

const outputFilePath = "./dist/index.html";

const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script src="game.js"></script>
  </head>
  <body>
  </body>
</html>`;

const createIndexHtml = () => {
    return {
        name: "create-index-html",

        writeBundle: () => {
            console.log("Creating dist/index.html...");

            fs.writeFileSync(outputFilePath, htmlContent);
        }
    };
};

export default createIndexHtml;