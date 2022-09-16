import VsCommandParser from "@vs-org/command-parser";
import { Logger } from "@vs-org/logger";
import path from "path";
import fs from "fs";
import * as fsExtra from "fs-extra";
import { execSync } from "child_process";

const placeholders = {
  packageName: "{package-name}",
  packageDescription: "{package-description}",
  repoUrl: "{repoUrl}",
  author: "{author}",
  bugsUr: "{bugsUrl}",
  homepageUrl: "{homepageUrl}"
};

const packageConstants = {
  tsconfig: {
    compilerOptions: {
      target: "es5",
      module: "commonjs",
      declaration: true,
      outDir: "./lib",
      strict: true,
      esModuleInterop: true,
      noUnusedLocals: true,
      downlevelIteration: true
    },
    include: ["src"],
    exclude: ["node_modules", "**/__tests__/*"]
  },
  readMe: "# {package-name} \n{package-description}",
  jestconfig: {
    transform: {
      "^.+\\.(t|j)s?$": "ts-jest"
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(js?|ts?)$",
    moduleFileExtensions: ["ts", "js", "json", "node"]
  },
  packagejson: {
    name: "{package-name}",
    version: "0.0.1",
    description: "{package-description}",
    main: "lib/index.js",
    types: "lib/index.d.ts",
    files: ["lib/**/*"],
    scripts: {
      test: "jest --config jestconfig.json",
      dev: "ts-node-dev --respawn --transpile-only index.ts",
      build: "rm -rf lib/ && tsc && npm run post-build",
      "post-build": "node build-utils/post-build-script.js",
      prepublishOnly: "npm run build"
    },
    license: "MIT",
    repository: {
      type: "git",
      url: "git+{repoUrl}"
    },
    author: "{author}",
    bugs: {
      url: "{bugsUrl}/issues"
    },
    homepage: "{homepageUrl}#readme",
    devDependencies: {
      "@types/jest": "^28.1.7",
      "@types/node": "^18.7.15",
      jest: "^28.1.3",
      "test-jest": "^1.0.1",
      "ts-jest": "^28.0.8",
      "ts-node": "^10.9.1",
      "ts-node-dev": "^2.0.0",
      typescript: "^4.8.2"
    }
  },
  postBuildScript: `const { copyFileSync, realpathSync } = require("fs");
  const path = require("path");\n const buildDir = "lib";

  const filesToMove = ["README.md"];
  
  const resolvePath = relativePath =>
    path.resolve(realpathSync(process.cwd()), relativePath);
  
  if (filesToMove.length) {
    for (const fileName of filesToMove) {
      const filePath = resolvePath(fileName);
      const destFilePath = resolvePath(path.join(buildDir, fileName));
      copyFileSync(filePath, destFilePath);
    }
  }
  `,
  test: `describe("Sample test", () => {
    test("Should pass", () => {
      expect(true).toBeTruthy();
    });
  });
  `,
  index: `import printPackageInitMsg from "./testPackage";\nexport default printPackageInitMsg`,
  packageSrc: `const printPackageInitMsg = () => console.log("{package-name} is ready......");\nexport default printPackageInitMsg;
  `
};

const paths = {
  testFolder: "__test__",
  srcFolder: "src",
  buildUtilsFolder: "build-utils",
  indexFile: "index.ts",
  packageSrcFile: "testPackage.ts",
  testFile: "Sample.test.ts",
  jestConfig: "jestconfig.json",
  packageJson: "package.json",
  readMe: "README.md",
  tsconfig: "tsconfig.json",
  postBuildScript: "post-build-script.js"
};

class FileSystemUtils {
  public static resolvePath = (relativePath: string) =>
    path.resolve(fs.realpathSync(process.cwd()), relativePath);

  public static exist = (dir: string) => fs.existsSync(dir);

  public static createFile = (fileName: string, fileData: string) => {
    fs.writeFileSync(fileName, fileData, "utf-8");
  };

  public static emptyDirectorySync = (dirName: string) =>
    fsExtra.removeSync(dirName);

  public static createDir = (dirName: string) => {
    fsExtra.ensureDirSync(dirName);
  };

  public static copyFiles = (src: string, dest: string) => {
    fsExtra.copyFileSync(src, dest);
  };

  /**
   *
   * @param {String[] | String} files
   * @param {String[]} toReplace
   * @param {String[]} replaceWith
   */
  public static replaceInFile = (
    files: string | string[],
    toReplace: string[],
    replaceWith: string[]
  ) => {
    if (!Array.isArray(files)) {
      files = [files];
    }
    if (!Array.isArray(toReplace)) {
      toReplace = [toReplace];
    }
    if (!Array.isArray(replaceWith)) {
      replaceWith = [replaceWith];
    }
    if (toReplace.length !== replaceWith.length) {
      throw new Error(
        `toReplace(Array) and replaceWith(Array) should have same length`
      );
    }
    for (const fileName of files) {
      let fileContent = fs.readFileSync(fileName, "utf8") || "";
      let replaced = false;
      toReplace.forEach((_toReplace, index) => {
        if (fileContent.includes(_toReplace)) {
          fileContent = fileContent.replace(
            new RegExp(_toReplace, "g"),
            replaceWith[index]
          );
          replaced = true;
        }
      });
      replaced && fs.writeFileSync(fileName, fileContent, "utf8");
    }
  };

  public static readDirSync = (dirName: string) =>
    fs.readdirSync(dirName, {
      withFileTypes: true
    });

  public static isDirectory = (dirPath: string) => {
    return (
      FileSystemUtils.exist(dirPath) && fs.lstatSync(dirPath).isDirectory()
    );
  };

  public static writeFileSync = (fileName: string, data: string) => {
    try {
      fs.writeFileSync(fileName, data, {
        encoding: "utf-8"
      });
    } catch (error) {
      throw error;
    }
  };

  public static writeJsonFileSync = (fileName: string, data: object) => {
    try {
      fs.writeFileSync(fileName, JSON.stringify(data, null, 4), {
        encoding: "utf-8"
      });
    } catch (error) {
      throw error;
    }
  };
}

class Command {
  commands = {
    install: () => `cross-env npm install`,
    test: () => `cross-env npm t`,
    build: () => `cross-env npm build`,
    changeDirToPackage: (packageName: string) => `cd ${packageName} && ls -ltr`
  };

  public static install = (packagePath: string) =>
    execSync(`cross-env npm install`, { stdio: "inherit", cwd: packagePath });
  public static test = (packagePath: string) =>
    execSync(`cross-env npm t`, { stdio: "inherit", cwd: packagePath });
  public static build = (packagePath: string) =>
    execSync(`cross-env npm run build`, { stdio: "inherit", cwd: packagePath });
}

const vsCommandParser = new VsCommandParser({
  userInputOptions: {
    projectName: {
      question: "Name of project",
      description:
        "Project name, will be used to create folder and in package.json",
      required: true,
      validationMsg: "Project name is required"
    },
    projectDescription: {
      question: "Project description",
      description:
        "Project description, will be used in package.json and README.md file"
    },
    author: {
      question: "Author?",
      description: "Author name, will be used in package.json"
    },
    githubUrl: {
      question: "Github repo url? eg: https://github.com/username/repo.git",
      description: "Github repo, will be used in package.json"
    }
  }
});

const createTypescriptPackage = async () => {
  const options = await vsCommandParser.parse();

  if (options) {
    const logger = Logger.getInstance("info");
    const log = logger.getLogger();
    const packageName = options["projectName"].value;
    const packageDescription =
      options["projectDescription"].value || "This is sample typscript package";
    const author = options["author"].value || "John Doe";
    const githubRepo =
      options["githubUrl"].value || "https://github.com/username/repo.git";
    log.info(`Creating directory with name ${packageName}`);

    // if (FileSystemUtils.exist(packageName)) {
    //   throw new Error(`Folder already exist with name ${packageName}.`);
    // }
    FileSystemUtils.createDir(packageName);
    log.info(`Created directory with name ${packageName}`);

    // create package.json file
    log.info(`Creating file with name package.json`);
    const githubRepoWithoutDotGit = githubRepo.replace(".git", "");
    const packageJsonStringified = JSON.stringify(packageConstants.packagejson)
      .replace(placeholders.packageName, packageName)
      .replace(placeholders.packageDescription, packageDescription)
      .replace(placeholders.author, author)
      .replace(placeholders.repoUrl, githubRepo)
      .replace(placeholders.bugsUr, githubRepoWithoutDotGit)
      .replace(placeholders.homepageUrl, githubRepoWithoutDotGit);

    FileSystemUtils.writeJsonFileSync(
      FileSystemUtils.resolvePath(path.join(packageName, paths.packageJson)),
      JSON.parse(packageJsonStringified)
    );
    log.info(`Created file with name package.json`);

    // create tsconfig.json file
    log.info(`Creating file with name ${paths.tsconfig}`);
    FileSystemUtils.writeJsonFileSync(
      FileSystemUtils.resolvePath(path.join(packageName, paths.tsconfig)),
      packageConstants.tsconfig
    );
    log.info(`Created file with name tsconfig.json`);

    // create jestconfig.json file
    log.info(`Creating file with name ${paths.jestConfig}`);
    FileSystemUtils.writeJsonFileSync(
      FileSystemUtils.resolvePath(path.join(packageName, paths.jestConfig)),
      packageConstants.jestconfig
    );
    log.info(`Created file with name jestconfig.json`);

    // create README.md file
    log.info(`Creating file with name ${paths.readMe}`);
    FileSystemUtils.writeFileSync(
      FileSystemUtils.resolvePath(path.join(packageName, paths.readMe)),
      packageConstants.readMe
        .replace(placeholders.packageName, packageName)
        .replace(placeholders.packageDescription, packageDescription)
    );
    log.info(`Created file with name ${paths.readMe}`);

    // create __test__ folder
    const testFolderPath = path.join(packageName, paths.testFolder);
    log.info(`Creating __test__ folder with path ${testFolderPath}`);
    FileSystemUtils.createDir(testFolderPath);

    const testFilePath = path.join(testFolderPath, paths.testFile);
    log.info(`Creating file with name ${testFilePath}`);
    FileSystemUtils.writeFileSync(
      FileSystemUtils.resolvePath(testFilePath),
      packageConstants.test
    );
    log.info(`Created file with name ${testFilePath}`);

    // create src folder
    const srcFolderPath = path.join(packageName, paths.srcFolder);
    log.info(`Creating src folder with path ${srcFolderPath}`);
    FileSystemUtils.createDir(srcFolderPath);

    const indexFilePath = path.join(srcFolderPath, paths.indexFile);
    log.info(`Creating file with name ${indexFilePath}`);
    FileSystemUtils.writeFileSync(
      FileSystemUtils.resolvePath(indexFilePath),
      packageConstants.index
    );
    log.info(`Created file with name ${indexFilePath}`);

    const packageSrcFilePath = path.join(srcFolderPath, paths.packageSrcFile);
    log.info(`Creating file with name ${packageSrcFilePath}`);
    FileSystemUtils.writeFileSync(
      FileSystemUtils.resolvePath(packageSrcFilePath),
      packageConstants.packageSrc.replace(placeholders.packageName, packageName)
    );
    log.info(`Created file with name ${packageSrcFilePath}`);

    // create build-utils folder
    const buildUtilsFolderPath = path.join(packageName, paths.buildUtilsFolder);
    log.info(`Creating src folder with path ${buildUtilsFolderPath}`);
    FileSystemUtils.createDir(buildUtilsFolderPath);

    const postBuildScript = path.join(
      buildUtilsFolderPath,
      paths.postBuildScript
    );
    log.info(`Creating file with name ${postBuildScript}`);
    FileSystemUtils.writeFileSync(
      FileSystemUtils.resolvePath(postBuildScript),
      packageConstants.postBuildScript
    );
    log.info(`Created file with name ${postBuildScript}`);

    // NPM commands
    Command.install(FileSystemUtils.resolvePath(packageName));
    log.info(`Dependencies installed successfully`);
    Command.test(packageName);
    Command.build(packageName);
    log.info(`Package build successfully...`);
  }
};

export default createTypescriptPackage;
