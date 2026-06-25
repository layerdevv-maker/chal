'use strict';
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// SQLite only needed for one-time migration of old data.
// If better-sqlite3 fails (wrong arch, missing native module), app still works via localStorage.
let db = null;
try {
  db = require('../db/database');
} catch(e) {
  console.log('SQLite not available, skipping migration:', e.message);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Kaswa Jebel Caly — Hasap ulgamy',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  win.webContents.on('did-finish-load', () => {
    win.setTitle('Kaswa Jebel Caly — Hasap ulgamy');
  });
}

app.whenReady().then(() => {
  if (db) {
    try { db.init(app.getPath('userData')); } catch(e) { console.log('DB init failed:', e.message); db = null; }
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('db:loadAll', () => db ? db.loadAll() : null);
ipcMain.handle('db:insert', (_, table, data) => db ? db.insert(table, data) : null);
ipcMain.handle('db:delete', (_, table, id) => db ? db.deleteRecord(table, id) : null);
