'use strict';
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('../db/database');

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

  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

  win.webContents.on('did-finish-load', () => {
    win.setTitle('Kaswa Jebel Caly — Hasap ulgamy');
  });
}

app.whenReady().then(() => {
  db.init(app.getPath('userData'));
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('db:loadAll', () => db.loadAll());
ipcMain.handle('db:insert', (_, table, data) => db.insert(table, data));
ipcMain.handle('db:delete', (_, table, id) => db.deleteRecord(table, id));
