import fsExtra from "fs-extra";

Promise.all([fsExtra.copy("src/views", "dist/src/views")])
  .then(() => console.log("Copied all necessary files into the dist folder"))
  .catch((error) => console.error(error));
