const express = require("express");
const { Server } = require("socket.io");

const app = express();

const server = require("http").createServer(app);
const io = new Server(server);

const fs = require("fs");

const path = require("path");
const publicPath = path.join(__dirname, "client");
app.use("/", express.static(publicPath));

const configIni = require("config.ini");
const conf = configIni.load("./config.ini");

let selectedDestNum = conf.settings.dest ? conf.settings.dest : "0";
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
    if (rcvdString.split(",")[0].split("V")[1] == selectedDestNum) {
      io.emit("setSrcSelection", rcvdString.split(",")[1].split("\r")[0]);
    }
  }
});

const interrogate = (destNum) => {
  selectedDestNum = destNum;
  socket.write(Buffer.from(`.IV${selectedDestNum}\r`, "ascii"));
};

const Names = { destNames: {}, srcNames: {} };
for (let i = 1; i < 33; i++) {
  Names.destsNames[i] = conf.dest[i];
  Names.srcsNames[i] = conf.src[i];
}

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
    srcs: Names.srcNames,
    selectedDestNum: selectedDestNum,
  });

  sock.on("take", (src) => {
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
