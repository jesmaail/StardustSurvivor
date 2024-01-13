import fs from "fs";

const outputFilePath = "./dist/index.html";

const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style media='screen' type='text/css'>
      @font-face {
        font-family: PressStart2P;
        src: url('./assets/fonts/PressStart2P/PressStart2P-Regular.ttf');
        font-weight:400;
        font-weight:normal;
      }
    </style>
    <div style="font-family:PressStart2P; position:absolute; left:-1000px; visibility:hidden;">.</div>
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