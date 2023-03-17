const { ModModule } = require("CoreJS"),
  Next = require("Next"),
  Http = new Next.Http(5),
  $ = require("$"),
  ListViewKit = new Next.ListView(),
  LATEST_LTS_VERSION = "18",
  LATEST_CURRENT_VERSION = "19";
class JsonGen {
  constructor(JsonGenerator) {
    this.JsonGenerator = JsonGenerator;
  }
  getLatestVersionData(lts = false, callback) {
    const LATEST_VERSION = `latest-v${
        lts ? LATEST_LTS_VERSION : LATEST_CURRENT_VERSION
      }.x`,
      versionUrlDir = `https://nodejs.org/dist/${LATEST_VERSION}/`,
      SHAUrl = versionUrlDir + "SHASUMS256.txt";
    $console.info({
      SHAUrl
    });
    Http.getAsync({
      url: SHAUrl,
      handler: resp => {
        const SHAData = resp.data;
        $console.info({
          SHAData
        });
        if ($.hasString(SHAData)) {
          const SHAList = {};
          SHAData.split("\n").map(line => {
            const lineList = line.split("  ");
            if (lineList.length != 2) {
              return;
            }
            const fileName = lineList[1],
              fileSHA = lineList[0];

            SHAList[fileName] = fileSHA;
          });
          $console.info({
            SHAList
          });
        } else {
        }
      }
    });
  }
  taobao({ version, x64hash, x86hash }) {
    return {
      version,
      "description":
        "As an asynchronous event driven JavaScript runtime, Node is designed to build scalable network applications.",
      "homepage": "https://registry.npmmirror.com/binary.html?path=node/",
      "license": "MIT",
      "architecture": {
        "64bit": {
          "url": `https://registry.npmmirror.com/-/binary/node/v${version}/node-v${version}-win-x64.7z`,
          "hash": x64hash,
          "extract_dir": `node-v${version}-win-x64`
        },
        "32bit": {
          "url": `https://registry.npmmirror.com/-/binary/node/v${version}/node-v${version}-win-x86.7z`,
          "hash": x86hash,
          "extract_dir": `node-v${version}-win-x86`
        }
      },
      "persist": ["bin", "cache"],
      "env_add_path": ["bin", "."],
      "post_install": [
        "# Set npm prefix to install modules inside bin and npm cache so they persist",
        'Set-Content -Value "prefix=$persist_dir\\bin`ncache=$persist_dir\\cache" -Path "$dir\\node_modules\\npm\\npmrc"'
      ]
    };
  }
  tuna({ version, x64hash, x86hash }) {
    return {
      version,
      "description":
        "As an asynchronous event driven JavaScript runtime, Node is designed to build scalable network applications.",
      "homepage": "https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/",
      "license": "MIT",
      "architecture": {
        "64bit": {
          "url": `https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v${version}/node-v${version}-win-x64.7z`,
          "hash": x64hash,
          "extract_dir": `node-v${version}-win-x64`
        },
        "32bit": {
          "url": `https://mirrors.tuna.tsinghua.edu.cn/nodejs-release/v${version}/node-v${version}-win-x64.7z`,
          "hash": x86hash,
          "extract_dir": `node-v${version}-win-x86`
        }
      },
      "persist": ["bin", "cache"],
      "env_add_path": ["bin", "."],
      "post_install": [
        "# Set npm prefix to install modules inside bin and npm cache so they persist",
        'Set-Content -Value "prefix=$persist_dir\\bin`ncache=$persist_dir\\cache" -Path "$dir\\node_modules\\npm\\npmrc"'
      ]
    };
  }
}

class ScoopNodejs extends ModModule {
  constructor(mod) {
    super({
      mod,
      id: "scoop.nodejs",
      name: "scoop.nodejs",
      version: "1"
      //author: "zhihaofans"
    });
    this.JsonGenerator = new JsonGen(mod.JsonGenerator);
  }
  initUi() {
    $ui.success("run");
    this.JsonGenerator.getLatestVersionData();
  }
}
module.exports = ScoopNodejs;
