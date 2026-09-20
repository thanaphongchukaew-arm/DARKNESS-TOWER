// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Electron entry point: wraps the web game (index.html) in a native desktop
// window so it can ship as a standalone Windows .exe. Saves still live in
// localStorage, which Electron persists under the user's AppData folder.
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

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
