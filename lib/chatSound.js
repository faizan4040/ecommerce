/*
 * Chat sounds made with the Web Audio API (no audio files needed).
 *   playSound("incoming") – soft two-note "ding" for a new message
 *   playSound("sent")     – short "pop" when your message is sent
 * Mute is remembered per browser.
 */
let ctx = null
const KEY = "chat-sound-muted"

export const isMuted = () => {
  try {
    return localStorage.getItem(KEY) === "1"
  } catch {
    return false
  }
}
export const setMuted = (m) => {
  try {
    localStorage.setItem(KEY, m ? "1" : "0")
  } catch {}
}

function audio() {
  if (typeof window === "undefined") return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === "suspended") ctx.resume().catch(() => {})
  return ctx
}

function tone(ac, freq, start, duration, volume = 0.18, type = "sine") {
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

export function playSound(kind = "incoming") {
  if (isMuted()) return
  const ac = audio()
  if (!ac) return
  const t = ac.currentTime + 0.01
  if (kind === "sent") {
    // quick rising pop
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(420, t)
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.12, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
    osc.connect(gain).connect(ac.destination)
    osc.start(t)
    osc.stop(t + 0.14)
  } else {
    // two-note ding
    tone(ac, 880, t, 0.18, 0.16)
    tone(ac, 1318.5, t + 0.11, 0.32, 0.14)
  }
}

// Browsers only allow audio after a user gesture – unlock on the first click/tap.
if (typeof window !== "undefined") {
  const unlock = () => {
    audio()
    window.removeEventListener("pointerdown", unlock)
    window.removeEventListener("keydown", unlock)
  }
  window.addEventListener("pointerdown", unlock)
  window.addEventListener("keydown", unlock)
}
