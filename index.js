const express = require("express");
const { Server } = require("socket.io");

const app = express();

const server = require("http").createServer(app);
const io = new Server(server);

const fs = require("node:fs");

const path = require("path");
const publicPath = path.join(__dirname, "client");
app.use("/", express.static(publicPath));

const configIni = require("config.ini");
const conf = configIni.load("./config.ini");

let selectedDest = conf.settings.dest ? conf.settings.dest : "0";
const targetIP = conf.settings.ip;

const net = require("net");
const socket = net.connect({ host: targetIP, port: 23 });
socket.setEncoding("ascii");

let src = "0";

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
    src = rcvdString.split(",")[1].split("\r")[0];
    io.emit("setSrcSelection", src);
  }
  if (rcvdString.startsWith(".UV")) {
    if (rcvdString.split(",")[0].split("V")[1] == selectedDest) {
      io.emit("setSrcSelection", rcvdString.split(",")[1].split("\r")[0]);
    }
  }
});

const interrogate = (dest) => {
  selectedDest = dest;
  socket.write(Buffer.from(`.IV${selectedDest}\r`, "ascii"));
};

const destsNames = {};
const getDestsNames = () => {
  for (let i = 1; i < 33; i++) {
    destsNames[i] = conf.dest[i];
  }
};
getDestsNames();

const srcsNames = {};
const getSrcsNames = () => {
  for (let i = 1; i < 33; i++) {
    srcsNames[i] = conf.src[i];
  }
};
getSrcsNames();

const saveDest = (dest) => {
  conf.settings.dest = dest;
  selectedDest = dest;
  fs.writeFile("./config.ini", configIni.stringify(conf), (err) => {
    if (err) {
      console.log(err);
    }
  });
};

io.on("connection", (sock) => {
  sock.emit("destinations", destsNames);
  sock.emit("srcs", srcsNames);
  sock.emit("selectedDest", selectedDest - 1);
  sock.on("take", (src) => {
    socket.write(Buffer.from(`.SV${selectedDest},${src}\r`, "ascii"));
  });
  sock.on("destIndex", (dest) => {
    interrogate(dest);
    console.log(dest);
    saveDest(dest);
  });
});

server.listen(3000, () => {
  console.log("server is running at 3000");
});
