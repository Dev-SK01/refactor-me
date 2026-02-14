import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Renderer process started');
// @ts-ignore
console.log('window.ipcRenderer available:', !!window.ipcRenderer);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (message) => {
  console.log(message)
})
