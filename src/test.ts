import * as ts from "typescript";
import { getServiceHost } from "./languageService";

const files = {
  "/test/tsconfig.json": `{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["esnext"],
    "target": "esnext",
    "module": "CommonJS",
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src"]
}
`,
  "/test/src/index.ts": `
const sum =
  `,
  "/test/src/add.ts": `
  export const add = (a,b) => a + b
    `
};

export interface VirtualFileSystem {
  readonly readFile: ts.LanguageServiceHost["readFile"];
  readonly fileExists: ts.LanguageServiceHost["fileExists"];
  readonly directoryExists: ts.LanguageServiceHost["directoryExists"];
  readonly getDirectories: ts.LanguageServiceHost["getDirectories"];
  readonly readDirectory: ts.LanguageServiceHost["readDirectory"];
}

const readFile: VirtualFileSystem["readFile"] = path => files[path];

const fileExists: VirtualFileSystem["fileExists"] = path => !!files[path];

const directoryExists: VirtualFileSystem["directoryExists"] = path =>
  Object.keys(files).some(
    file => file.startsWith(path) && !file.endsWith(path)
  );

const getDirectories: VirtualFileSystem["getDirectories"] = path => {
  return [];
};

const readDirectory: VirtualFileSystem["readDirectory"] = (
  path,
  extensions,
  exclude,
  include,
  depth
) => {
  // extensions;
  // exclude;
  // include;
  // depth;
  const result = Object.keys(files).filter(
    file =>
      file.startsWith(path) &&
      extensions.some(extension => file.endsWith(extension))
  );

  return result;
};

const virtualFileSystem: VirtualFileSystem = {
  readFile,
  fileExists,
  directoryExists,
  getDirectories,
  readDirectory
};

const serviceHost = getServiceHost(ts, virtualFileSystem, "/test");

const { entries } = serviceHost.getCompletionsAtPosition(
  "/test/src/index.ts",
  12,
  {
    includeCompletionsForModuleExports: true
  }
);

const addEntry = entries.find(entry => entry.name === "add");

addEntry; //?
// .entries.map(entry => entry.name); //?
