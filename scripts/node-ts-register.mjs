import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./node-ts-hooks.mjs", pathToFileURL(import.meta.dirname + "/"));
