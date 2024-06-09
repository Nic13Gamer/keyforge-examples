const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('license', {
  activate: async (licenseKey) =>
    ipcRenderer.invoke('activate-license', licenseKey),
});
