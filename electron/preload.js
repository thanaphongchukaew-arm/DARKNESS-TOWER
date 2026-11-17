// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// The only bridge between the sandboxed game page and the desktop shell: real
// save files (mirrored from localStorage by js/save.js), fullscreen and quit.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('DesktopBridge', {
  isDesktop: true,
  readSave: function (key) { return ipcRenderer.sendSync('save:read', String(key)); },
  writeSave: function (key, text) { return ipcRenderer.sendSync('save:write', String(key), String(text)); },
  removeSave: function (key) { return ipcRenderer.sendSync('save:remove', String(key)); },
  isFullscreen: function () { return ipcRenderer.sendSync('window:isFullscreen'); },
  setFullscreen: function (on) { ipcRenderer.send('window:setFullscreen', !!on); },
  quit: function () { ipcRenderer.send('app:quit'); }
});
