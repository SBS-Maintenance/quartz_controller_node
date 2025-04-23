const express = require("express");
const { Server } = require("socket.io");

const { BrowserWindow, ipcMain } = require("electron");
const electronApp = require("electron").app;

const { autoUpdater } = require("electron-updater");

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1090,
    height: 260,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  win.loadFile("./index.html");
  win.setMenuBarVisibility(false);
  win.resizable = false;
};

electronApp.whenReady().then(() => {
  createWindow();

  autoUpdater.checkForUpdatesAndNotify();

  electronApp.on("activate", () => {
    if (BrowserWindow.getAllWindows().length == 0) {
      createWindow();
    }
  });
});

ipcMain.on("app_version", (event) => {
  event.sender.send("app_version", { version: electronApp.getVersion() });
});

autoUpdater.on("update-available", () => {
  win.webContents.send("update_available");
});

autoUpdater.on("update-downloaded", () => {
  win.webContents.send("update_downloaded");
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall(true, true);
});

electronApp.on("window-all-closed", () => {
  if (process.platform != "darwin") {
    electronApp.quit();
  }
});

const app = express();

const server = require("http").createServer(app);
const io = new Server(server);

const fs = require("fs");

const path = require("path");
const publicPath = path.join(__dirname);
app.use("/", express.static(publicPath));

const configIni = require("config.ini");
console.log(electronApp.getAppPath());
const conf = configIni.load(electronApp.getAppPath() + "/../../config.ini");

let selectedDestNum = conf.settings.destNum ? conf.settings.destNum : "0";
const targetIP = conf.settings.ip;
const targetPort = conf.settings.port;

const net = require("net");

const socket = net.connect({ host: targetIP, port: targetPort });
socket.setEncoding("ascii");

let src = "0";

const Names = { destNames: {} };

for (let i = 1; i <= 32; i++) {
  Names.destNames[i] = conf.dest[i];
  console.log(Names.destNames[i]);
}

socket.on("error", (err) => {
  console.log(err);
  io.emit("error", { err: err });
});

socket.on("timeout", (err) => {
  console.log(err);
  io.emit("error", { err: err });
});

socket.on("data", (data) => {
  const rcvdString = data.toString();
  console.log(rcvdString);
  if (rcvdString.startsWith(".AV")) {
    src = parseInt(rcvdString.split(",")[1].split("\r")[0]);
    io.emit("setSrcSelection", src);
  }
  if (rcvdString.startsWith(".UV")) {
    if (parseInt(rcvdString.split(",")[0].split("V")[1]) == selectedDestNum) {
      io.emit(
        "setSrcSelection",
        parseInt(rcvdString.split(",")[1].split("\r")[0])
      );
    }
  }
});

const interrogate = (destNum) => {
  selectedDestNum = destNum;
  socket.write(Buffer.from(`.IV${selectedDestNum}\r`, "ascii"));
};

const saveDest = (destNum) => {
  conf.settings.destNum = destNum;
  selectedDestNum = destNum;
  fs.writeFile("./config.ini", configIni.stringify(conf), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

io.on("connection", (sock) => {
  sock.emit("init", {
    dests: Names.destNames,
    selectedDestNum: selectedDestNum,
  });

  sock.on("take", (src) => {
    console.log(`${src} -> ${selectedDestNum} Take cmd rcvd`);
    socket.write(Buffer.from(`.SV${selectedDestNum},${src}\r`, "ascii"));
  });

  sock.on("destNum", (destNum) => {
    interrogate(destNum);
    saveDest(destNum);
  });
});

server.listen(3000, () => {
  console.log("server is running at 3000");
});
