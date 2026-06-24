type SocketListener = (payload?: unknown) => void

export type DashboardSocket = {
  connected: boolean
  disconnect: () => void
  emit: (event: string, payload?: unknown) => void
  on: (event: string, listener: SocketListener) => void
}

type SocketFactory = (
  url: string,
  options: {
    auth: { token: string }
    transports: string[]
  },
) => DashboardSocket

declare global {
  interface Window {
    io?: SocketFactory
  }
}

let socketClientPromise: Promise<SocketFactory> | null = null

export const loadSocketClient = (apiBaseUrl: string) => {
  if (window.io) {
    return Promise.resolve(window.io)
  }

  if (socketClientPromise) {
    return socketClientPromise
  }

  socketClientPromise = new Promise<SocketFactory>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-dashboard-socket-client]',
    )

    const resolveFactory = () => {
      if (window.io) {
        resolve(window.io)
        return
      }

      socketClientPromise = null
      reject(new Error('Socket client did not initialize'))
    }

    if (existingScript) {
      existingScript.addEventListener('load', resolveFactory, { once: true })
      existingScript.addEventListener(
        'error',
        () => {
          socketClientPromise = null
          reject(new Error('Unable to load realtime client'))
        },
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.src = `${apiBaseUrl}/socket.io/socket.io.js`
    script.async = true
    script.crossOrigin = 'anonymous'
    script.dataset.dashboardSocketClient = 'true'
    script.addEventListener('load', resolveFactory, { once: true })
    script.addEventListener(
      'error',
      () => {
        socketClientPromise = null
        reject(new Error('Unable to load realtime client'))
      },
      { once: true },
    )
    document.head.appendChild(script)
  })

  return socketClientPromise
}
