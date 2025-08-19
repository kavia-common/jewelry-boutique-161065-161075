export const loadedScripts = new Set<string>()

interface ScriptWithState extends HTMLScriptElement {
  _loaded?: boolean
}

// PUBLIC_INTERFACE
export function loadScriptOnce(src: string): Promise<void> {
  /** Load a remote script tag once and resolve when it loads. Subsequent calls no-op. */
  return new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) {
      resolve()
      return
    }
    const existingEl = Array.from(document.getElementsByTagName('script')).find((s) => s.src === src) as ScriptWithState | undefined
    if (existingEl) {
      loadedScripts.add(src)
      if (existingEl._loaded) {
        resolve()
      } else {
        existingEl.addEventListener('load', () => resolve())
        existingEl.addEventListener('error', (e) => reject(e as unknown))
      }
      return
    }
    const script = document.createElement('script') as ScriptWithState
    script.src = src
    script.async = true
    script._loaded = false
    script.onload = () => {
      script._loaded = true
      loadedScripts.add(src)
      resolve()
    }
    script.onerror = (e) => reject(e as unknown)
    document.head.appendChild(script)
  })
}
