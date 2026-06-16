'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('db', {
  loadAll: ()             => ipcRenderer.invoke('db:loadAll'),
  insert:  (table, data)  => ipcRenderer.invoke('db:insert', table, data),
  delete:  (table, id)    => ipcRenderer.invoke('db:delete', table, id)
});
