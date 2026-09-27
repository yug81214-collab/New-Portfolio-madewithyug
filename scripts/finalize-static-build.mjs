import { copyFile, readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

const root = process.cwd()
const clientDir = join(root, "dist", "client")
const assetsDir = join(clientDir, "assets")
const sourceHtml = await readFile(join(root, "index.html"), "utf8")
const assets = await readdir(assetsDir)
const script = assets.find((file) => /^index-[^/]+\.js$/.test(file))
const stylesheet = assets.find((file) => /^styles-[^/]+\.css$/.test(file))

if (!script) throw new Error("Production client bundle was not generated")

const stylesheetTag = stylesheet ? `    <link rel="stylesheet" href="/assets/${stylesheet}" />\n` : ""
const productionHtml = sourceHtml
  .replace(/\s*<script type="module" src="\/src\/main\.tsx"><\/script>/, "")
  .replace("  </head>", `${stylesheetTag}  </head>`)
  .replace("  </body>", `    <script type="module" src="/assets/${script}"></script>\n  </body>`)

await writeFile(join(clientDir, "index.html"), productionHtml)
await copyFile(join(root, "public", "favicon.ico"), join(clientDir, "favicon.ico")).catch(() => {})
console.log(`Finalized static entry with /assets/${script}`)
