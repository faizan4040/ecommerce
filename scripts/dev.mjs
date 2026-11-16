/*
 * `npm run dev` – starts the Next.js app AND the chat socket server together.
 * In production they are deployed separately (see socket-server/README.md).
 */
import { spawn } from "node:child_process"

const procs = [
  { name: "next  ", color: "\x1b[36m", cmd: "npx", args: ["next", "dev"] },
  { name: "socket", color: "\x1b[35m", cmd: "node", args: ["--watch", "socket-server/index.js"] },
]

const children = procs.map(({ name, color, cmd, args }) => {
  const child = spawn(cmd, args, { shell: process.platform === "win32", env: process.env })
  const prefix = `${color}[${name}]\x1b[0m `
  const pipe = (stream, out) =>
    stream.on("data", (buf) =>
      buf
        .toString()
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((line) => out.write(prefix + line + "\n"))
    )
  pipe(child.stdout, process.stdout)
  pipe(child.stderr, process.stderr)
  child.on("exit", (code) => {
    console.log(`${prefix}exited with code ${code}`)
    shutdown()
  })
  return child
})

let stopping = false
function shutdown() {
  if (stopping) return
  stopping = true
  children.forEach((c) => c.kill())
  setTimeout(() => process.exit(0), 300)
}
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
