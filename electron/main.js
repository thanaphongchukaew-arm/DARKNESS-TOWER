// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Electron entry point: wraps the web game (index.html) in a native desktop
// window so it can ship as a standalone Windows .exe. Saves still live in
// localStorage, which Electron persists under the user's AppData folder.
const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Save files live next to Electron's own profile data, one JSON file per slot.
// Slot names come from the page, so only a strict character set is accepted.
function saveFile(key) {
  if (!/^[A-Za-z0-9_]{1,64}$/.test(key)) return null;
  return path.join(app.getPath('userData'), 'saves', key + '.json');
}

ipcMain.on('save:read', function (event, key) {
  const file = saveFile(key);
  try { event.returnValue = file && fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null; }
  catch { event.returnValue = null; }
});

// Write to a temp file then rename, so a crash mid-write never truncates a save.
ipcMain.on('save:write', function (event, key, text) {
  const file = saveFile(key);
  if (!file || typeof text !== 'string') { event.returnValue = false; return; }
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file + '.tmp', text, 'utf8');
    fs.renameSync(file + '.tmp', file);
    event.returnValue = true;
  } catch { event.returnValue = false; }
});

ipcMain.on('save:remove', function (event, key) {
  const file = saveFile(key);
  try { if (file && fs.existsSync(file)) fs.unlinkSync(file); event.returnValue = true; }
  catch { event.returnValue = false; }
});

ipcMain.on('window:isFullscreen', function (event) {
  const win = BrowserWindow.fromWebContents(event.sender);
  event.returnValue = !!(win && win.isFullScreen());
});
ipcMain.on('window:setFullscreen', function (event, on) {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.setFullScreen(!!on);
});
ipcMain.on('app:quit', function () { app.quit(); });

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'DARKNESS TOWER',
    icon: path.join(__dirname, '..', 'icons', 'android-chrome-512x512.png'),
    backgroundColor: '#0a0814',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // No File/Edit/View menu -- it's a game, not an editor.
  Menu.setApplicationMenu(null);

  win.once('ready-to-show', function () { win.show(); });

  // F11 toggles fullscreen.
  win.webContents.on('before-input-event', function (event, input) {
    if (input.type === 'keyDown' && input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });

  // Any external link opens in the system browser, never inside the game window.
  win.webContents.setWindowOpenHandler(function (details) {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));
}

app.whenReady().then(function () {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  app.quit();
});
