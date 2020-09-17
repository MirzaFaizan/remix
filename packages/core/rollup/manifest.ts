import path from "path";
import { promises as fsp } from "fs";
import type { NormalizedOutputOptions, OutputBundle, Plugin } from "rollup";

export interface BuildManifest {
  [chunkName: string]: BuildChunk;
}

export interface BuildChunk {
  fileName: string;
  imports: string[];
  moduleNames: string[];
}

function createManifest(bundle: OutputBundle): BuildManifest {
  return Object.keys(bundle).reduce((manifest, key) => {
    let assetOrChunk = bundle[key];

    if (assetOrChunk.type === "chunk") {
      manifest[assetOrChunk.name] = {
        fileName: assetOrChunk.fileName,
        imports: assetOrChunk.imports,
        moduleNames: Object.keys(assetOrChunk.modules)
      };
    }

    return manifest;
  }, {} as BuildManifest);
}

export default function manifestPlugin({
  filename = "manifest.json",
  outputDir
}: {
  filename?: string;
  outputDir: string;
}): Plugin {
  return {
    name: "manifest-plugin",
    async generateBundle(
      _options: NormalizedOutputOptions,
      bundle: OutputBundle,
      isWrite: boolean
    ) {
      let manifest = createManifest(bundle);

      if (isWrite) {
        let file = path.join(outputDir, filename);
        await fsp.mkdir(path.dirname(file), { recursive: true });
        await fsp.writeFile(file, JSON.stringify(manifest));
      }
    }
  };
}