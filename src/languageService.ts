import * as ts from "typescript";
import { VirtualFileSystem } from "./test";

function getDefaultCompilerOptions(tsModule: typeof import("typescript")) {
  const defaultCompilerOptions: ts.CompilerOptions = {
    allowNonTsExtensions: true,
    allowJs: true,
    lib: ["lib.dom.d.ts", "lib.es2017.d.ts"],
    target: tsModule.ScriptTarget.Latest,
    moduleResolution: tsModule.ModuleResolutionKind.NodeJs,
    module: tsModule.ModuleKind.CommonJS,
    jsx: tsModule.JsxEmit.Preserve,
    allowSyntheticDefaultImports: true,
    experimentalDecorators: true
  };

  return defaultCompilerOptions;
}

/**
 * Manges 4 set of files
 *
 * - `vue` files in workspace
 * - `js/ts` files in workspace
 * - `vue` files in `node_modules`
 * - `js/ts` files in `node_modules`
 */
export function getServiceHost(
  tsModule: typeof import("typescript"),
  virtualFileSystem: VirtualFileSystem,
  workspacePath: string
): ts.LanguageService {
  const h: ts.ParseConfigHost = {
    fileExists: virtualFileSystem.fileExists,
    readDirectory: virtualFileSystem.readDirectory,
    readFile: virtualFileSystem.readFile,
    useCaseSensitiveFileNames: true
  };
  function getParsedConfig(
    tsModule: typeof import("typescript"),
    workspacePath: string
  ) {
    const configFilename =
      tsModule.findConfigFile(
        workspacePath,
        virtualFileSystem.fileExists,
        "tsconfig.json"
      ) ||
      tsModule.findConfigFile(
        workspacePath,
        virtualFileSystem.fileExists,
        "jsconfig.json"
      );

    const configJson =
      configFilename &&
      tsModule.readConfigFile(configFilename, virtualFileSystem.readFile)
        .config;
    console.log(configJson);
    return tsModule.parseJsonConfigFileContent(
      configJson,
      h,
      workspacePath,
      {},
      configFilename,
      undefined,
      []
    );
  }
  const parsedConfig = getParsedConfig(tsModule, workspacePath);
  /**
   * Only js/ts files in local project
   */
  const initialProjectFiles = parsedConfig.fileNames;
  console.log(
    `Initializing ServiceHost with ${
      initialProjectFiles.length
    } files: ${JSON.stringify(initialProjectFiles)}`
  );
  const scriptFileNameSet = new Set(initialProjectFiles);

  const compilerOptions = {
    ...getDefaultCompilerOptions(tsModule),
    ...parsedConfig.options
  };
  compilerOptions.allowNonTsExtensions = true;

  function createLanguageServiceHost(
    options: ts.CompilerOptions
  ): ts.LanguageServiceHost {
    return {
      getCompilationSettings: () => options,
      getScriptFileNames: () => Array.from(scriptFileNameSet),
      getScriptVersion(fileName) {
        return "0";
      },
      getDirectories: virtualFileSystem.getDirectories,
      directoryExists: virtualFileSystem.directoryExists,
      fileExists: virtualFileSystem.fileExists,
      readFile: virtualFileSystem.readFile,
      readDirectory: virtualFileSystem.readDirectory,
      getScriptSnapshot: (fileName: string) => {
        console.log(fileName);
        const fileContents = virtualFileSystem.readFile(fileName);
        console.log(fileContents);
        return ts.ScriptSnapshot.fromString(fileContents || "");
      },
      getCurrentDirectory: () => workspacePath,
      getDefaultLibFileName: tsModule.getDefaultLibFilePath,
      getNewLine: () => "\n",
      useCaseSensitiveFileNames: () => true
    };
  }

  const jsHost = createLanguageServiceHost(compilerOptions);
  let jsLanguageService = tsModule.createLanguageService(jsHost);
  return jsLanguageService;
}
