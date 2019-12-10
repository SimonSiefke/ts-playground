import * as ts from "typescript";
import { getServiceHost } from "./languageService";
import { filter } from "minimatch";

const files = {
  "/test/tsconfig.json": `{ "compilerOptions": { "moduleResolution": "node" } }`,
  "/test/src/index.ts": "import { reactive } from '@vue/'",
  "/test/package.json":
    '{"dependencies": { "@vue/composition-api": "1.0.0" } }',
  "/test/node_modules/@vue/composition-api/package.json": `{ "name": "@vue/composition-api", "main": "dist/main.js", "typings": "dist/main.d.ts" }`,
  "/test/node_modules/@vue/composition-api/dist/main.js": `export function reactive(obj){}`,
  "/test/node_modules/@vue/composition-api/dist/main.d.ts": `export declare function reactive(obj: any): any;`
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
  console.log("get dirs " + path);
  const seen = {};
  const duplicate = file => {
    if (seen[file]) {
      return false;
    }
    seen[file] = true;
    return true;
  };
  return Object.keys(files)
    .filter(file => file.startsWith(path) && !file.endsWith(path))
    .map(x => x.slice(path.length))
    .map(x => {
      if (x.includes("/")) {
        return x.slice(0, x.indexOf("/"));
      }
      return x;
    })
    .filter(duplicate)
    .map(x => path + x); //?

  return [];
};

const readDirectory: VirtualFileSystem["readDirectory"] = (
  path,
  extensions,
  exclude,
  include,
  depth
) => {
  path;
  depth;
  extensions;
  include;
  exclude;
  Object.keys(files).filter(filter(include[0], {})); //?
  // path; //?ve
  // extensions;
  // exclude;
  // include;
  // depth;

  const result = Object.keys(files).filter(
    file =>
      file.startsWith(path) &&
      extensions.some(extension => file.endsWith(extension))
  ); //?

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
  31,
  {
    includeCompletionsForModuleExports: true
  }
);

entries; //?

const entryConsole = entries.find(entry => entry.name === "console");

entryConsole; //?
// .entries.map(entry => entry.name); //?
