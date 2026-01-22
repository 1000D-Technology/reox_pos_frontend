const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printSilent: (content) => ipcRenderer.invoke('print-silent', content)
});
