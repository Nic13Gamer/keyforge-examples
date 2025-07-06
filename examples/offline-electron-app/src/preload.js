const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('license', {
  onLicenseData: (callback) =>
    ipcRenderer.on('license-data', (event, data) => callback(data)),
});
