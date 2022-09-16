"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var command_parser_1 = __importDefault(require("@vs-org/command-parser"));
var logger_1 = require("@vs-org/logger");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var fsExtra = __importStar(require("fs-extra"));
var child_process_1 = require("child_process");
var placeholders = {
    packageName: "{package-name}",
    packageDescription: "{package-description}",
    repoUrl: "{repoUrl}",
    author: "{author}",
    bugsUr: "{bugsUrl}",
    homepageUrl: "{homepageUrl}"
};
var packageConstants = {
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
    postBuildScript: "const { copyFileSync, realpathSync } = require(\"fs\");\n  const path = require(\"path\");\n const buildDir = \"lib\";\n\n  const filesToMove = [\"README.md\"];\n  \n  const resolvePath = relativePath =>\n    path.resolve(realpathSync(process.cwd()), relativePath);\n  \n  if (filesToMove.length) {\n    for (const fileName of filesToMove) {\n      const filePath = resolvePath(fileName);\n      const destFilePath = resolvePath(path.join(buildDir, fileName));\n      copyFileSync(filePath, destFilePath);\n    }\n  }\n  ",
    test: "describe(\"Sample test\", () => {\n    test(\"Should pass\", () => {\n      expect(true).toBeTruthy();\n    });\n  });\n  ",
    index: "import printPackageInitMsg from \"./testPackage\";\nexport default printPackageInitMsg",
    packageSrc: "const printPackageInitMsg = () => console.log(\"{package-name} is ready......\");\nexport default printPackageInitMsg;\n  "
};
var paths = {
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
var FileSystemUtils = /** @class */ (function () {
    function FileSystemUtils() {
    }
    FileSystemUtils.resolvePath = function (relativePath) {
        return path_1.default.resolve(fs_1.default.realpathSync(process.cwd()), relativePath);
    };
    FileSystemUtils.exist = function (dir) { return fs_1.default.existsSync(dir); };
    FileSystemUtils.createFile = function (fileName, fileData) {
        fs_1.default.writeFileSync(fileName, fileData, "utf-8");
    };
    FileSystemUtils.emptyDirectorySync = function (dirName) {
        return fsExtra.removeSync(dirName);
    };
    FileSystemUtils.createDir = function (dirName) {
        fsExtra.ensureDirSync(dirName);
    };
    FileSystemUtils.copyFiles = function (src, dest) {
        fsExtra.copyFileSync(src, dest);
    };
    /**
     *
     * @param {String[] | String} files
     * @param {String[]} toReplace
     * @param {String[]} replaceWith
     */
    FileSystemUtils.replaceInFile = function (files, toReplace, replaceWith) {
        var e_1, _a;
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
            throw new Error("toReplace(Array) and replaceWith(Array) should have same length");
        }
        var _loop_1 = function (fileName) {
            var fileContent = fs_1.default.readFileSync(fileName, "utf8") || "";
            var replaced = false;
            toReplace.forEach(function (_toReplace, index) {
                if (fileContent.includes(_toReplace)) {
                    fileContent = fileContent.replace(new RegExp(_toReplace, "g"), replaceWith[index]);
                    replaced = true;
                }
            });
            replaced && fs_1.default.writeFileSync(fileName, fileContent, "utf8");
        };
        try {
            for (var files_1 = __values(files), files_1_1 = files_1.next(); !files_1_1.done; files_1_1 = files_1.next()) {
                var fileName = files_1_1.value;
                _loop_1(fileName);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (files_1_1 && !files_1_1.done && (_a = files_1.return)) _a.call(files_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    FileSystemUtils.readDirSync = function (dirName) {
        return fs_1.default.readdirSync(dirName, {
            withFileTypes: true
        });
    };
    FileSystemUtils.isDirectory = function (dirPath) {
        return (FileSystemUtils.exist(dirPath) && fs_1.default.lstatSync(dirPath).isDirectory());
    };
    FileSystemUtils.writeFileSync = function (fileName, data) {
        try {
            fs_1.default.writeFileSync(fileName, data, {
                encoding: "utf-8"
            });
        }
        catch (error) {
            throw error;
        }
    };
    FileSystemUtils.writeJsonFileSync = function (fileName, data) {
        try {
            fs_1.default.writeFileSync(fileName, JSON.stringify(data, null, 4), {
                encoding: "utf-8"
            });
        }
        catch (error) {
            throw error;
        }
    };
    return FileSystemUtils;
}());
var Command = /** @class */ (function () {
    function Command() {
        this.commands = {
            install: function () { return "cross-env npm install"; },
            test: function () { return "cross-env npm t"; },
            build: function () { return "cross-env npm build"; },
            changeDirToPackage: function (packageName) { return "cd ".concat(packageName, " && ls -ltr"); }
        };
    }
    Command.install = function (packagePath) {
        return (0, child_process_1.execSync)("cross-env npm install", { stdio: "inherit", cwd: packagePath });
    };
    Command.test = function (packagePath) {
        return (0, child_process_1.execSync)("cross-env npm t", { stdio: "inherit", cwd: packagePath });
    };
    Command.build = function (packagePath) {
        return (0, child_process_1.execSync)("cross-env npm run build", { stdio: "inherit", cwd: packagePath });
    };
    return Command;
}());
var vsCommandParser = new command_parser_1.default({
    userInputOptions: {
        projectName: {
            question: "Name of project",
            description: "Project name, will be used to create folder and in package.json",
            required: true,
            validationMsg: "Project name is required"
        },
        projectDescription: {
            question: "Project description",
            description: "Project description, will be used in package.json and README.md file"
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
var createTypescriptPackage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var options, logger, log, packageName, packageDescription, author, githubRepo, githubRepoWithoutDotGit, packageJsonStringified, testFolderPath, testFilePath, srcFolderPath, indexFilePath, packageSrcFilePath, buildUtilsFolderPath, postBuildScript;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, vsCommandParser.parse()];
            case 1:
                options = _a.sent();
                if (options) {
                    logger = logger_1.Logger.getInstance("info");
                    log = logger.getLogger();
                    packageName = options["projectName"].value;
                    packageDescription = options["projectDescription"].value || "This is sample typscript package";
                    author = options["author"].value || "John Doe";
                    githubRepo = options["githubUrl"].value || "https://github.com/username/repo.git";
                    log.info("Creating directory with name ".concat(packageName));
                    // if (FileSystemUtils.exist(packageName)) {
                    //   throw new Error(`Folder already exist with name ${packageName}.`);
                    // }
                    FileSystemUtils.createDir(packageName);
                    log.info("Created directory with name ".concat(packageName));
                    // create package.json file
                    log.info("Creating file with name package.json");
                    githubRepoWithoutDotGit = githubRepo.replace(".git", "");
                    packageJsonStringified = JSON.stringify(packageConstants.packagejson)
                        .replace(placeholders.packageName, packageName)
                        .replace(placeholders.packageDescription, packageDescription)
                        .replace(placeholders.author, author)
                        .replace(placeholders.repoUrl, githubRepo)
                        .replace(placeholders.bugsUr, githubRepoWithoutDotGit)
                        .replace(placeholders.homepageUrl, githubRepoWithoutDotGit);
                    FileSystemUtils.writeJsonFileSync(FileSystemUtils.resolvePath(path_1.default.join(packageName, paths.packageJson)), JSON.parse(packageJsonStringified));
                    log.info("Created file with name package.json");
                    // create tsconfig.json file
                    log.info("Creating file with name ".concat(paths.tsconfig));
                    FileSystemUtils.writeJsonFileSync(FileSystemUtils.resolvePath(path_1.default.join(packageName, paths.tsconfig)), packageConstants.tsconfig);
                    log.info("Created file with name tsconfig.json");
                    // create jestconfig.json file
                    log.info("Creating file with name ".concat(paths.jestConfig));
                    FileSystemUtils.writeJsonFileSync(FileSystemUtils.resolvePath(path_1.default.join(packageName, paths.jestConfig)), packageConstants.jestconfig);
                    log.info("Created file with name jestconfig.json");
                    // create README.md file
                    log.info("Creating file with name ".concat(paths.readMe));
                    FileSystemUtils.writeFileSync(FileSystemUtils.resolvePath(path_1.default.join(packageName, paths.readMe)), packageConstants.readMe
                        .replace(placeholders.packageName, packageName)
                        .replace(placeholders.packageDescription, packageDescription));
                    log.info("Created file with name ".concat(paths.readMe));
                    testFolderPath = path_1.default.join(packageName, paths.testFolder);
                    log.info("Creating __test__ folder with path ".concat(testFolderPath));
                    FileSystemUtils.createDir(testFolderPath);
                    testFilePath = path_1.default.join(testFolderPath, paths.testFile);
                    log.info("Creating file with name ".concat(testFilePath));
                    FileSystemUtils.writeFileSync(FileSystemUtils.resolvePath(testFilePath), packageConstants.test);
                    log.info("Created file with name ".concat(testFilePath));
                    srcFolderPath = path_1.default.join(packageName, paths.srcFolder);
                    log.info("Creating src folder with path ".concat(srcFolderPath));
                    FileSystemUtils.createDir(srcFolderPath);
                    indexFilePath = path_1.default.join(srcFolderPath, paths.indexFile);
                    log.info("Creating file with name ".concat(indexFilePath));
                    FileSystemUtils.writeFileSync(FileSystemUtils.resolvePath(indexFilePath), packageConstants.index);
                    log.info("Created file with name ".concat(indexFilePath));
                    packageSrcFilePath = path_1.default.join(srcFolderPath, paths.packageSrcFile);
                    log.info("Creating file with name ".concat(packageSrcFilePath));
                    FileSystemUtils.writeFileSync(FileSystemUtils.resolvePath(packageSrcFilePath), packageConstants.packageSrc.replace(placeholders.packageName, packageName));
                    log.info("Created file with name ".concat(packageSrcFilePath));
                    buildUtilsFolderPath = path_1.default.join(packageName, paths.buildUtilsFolder);
                    log.info("Creating src folder with path ".concat(buildUtilsFolderPath));
                    FileSystemUtils.createDir(buildUtilsFolderPath);
                    postBuildScript = path_1.default.join(buildUtilsFolderPath, paths.postBuildScript);
                    log.info("Creating file with name ".concat(postBuildScript));
                    FileSystemUtils.writeFileSync(FileSystemUtils.resolvePath(postBuildScript), packageConstants.postBuildScript);
                    log.info("Created file with name ".concat(postBuildScript));
                    // NPM commands
                    Command.install(FileSystemUtils.resolvePath(packageName));
                    log.info("Dependencies installed successfully");
                    Command.test(packageName);
                    Command.build(packageName);
                    log.info("Package build successfully...");
                }
                return [2 /*return*/];
        }
    });
}); };
exports.default = createTypescriptPackage;
