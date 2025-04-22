const socket = io("http://localhost:3000");

const src = { srcNum: 0, srcName: "?" };
const dest = { destNum: 0, destName: "?" };

let currentSrcNum = 0;

let cmd = "";

const cmdBar = document.getElementById("cmdBar");

let hasTaken = false;

const takeButton = document.getElementById("takeButton");
const defaultBgColor = takeButton.style.backgroundColor;
takeButton.addEventListener("click", (ev) => {
  socket.emit("take", src.srcNum);
  ev.target.innerText = "Taking...";
  for (let i = 1; i < 33; i++) {
    document.getElementById("src_" + i).style.backgroundColor = "white";
  }
  hasTaken = true;
});

const destSelect = document.getElementById("destSelect");
destSelect.addEventListener("change", (ev) => {
  dest.destNum = ev.target.options[ev.target.selectedIndex].value;
  dest.destName = ev.target.options[ev.target.selectedIndex].innerText;
  cmd = `Src ${src.srcName} -> Dest ${dest.destName}`;
  cmdBar.innerText = cmd;
  takeButton.innerText = "Take!";
  hasTaken = false;
  for (let i = 1; i < 33; i++) {
    document.getElementById("src_" + i).style.backgroundColor = "white";
  }
  socket.emit("destNum", dest.destNum);
});

const srcButtonClicked = (ev) => {
  if (src.srcNum != 0) {
    document.getElementById("src_" + src.srcNum).style.backgroundColor =
      "white";
  }
  if (currentSrcNum != 0) {
    document.getElementById("src_" + currentSrcNum).style.backgroundColor =
      "#61CC80";
  }
  ev.target.style.backgroundColor = "yellow";
  src.srcNum = ev.target.id.split("_")[ev.target.id.split("_").length - 1];
  src.srcName = ev.target.innerText;
  cmd = `Src ${src.srcName} -> Dest ${dest.destName}`;
  cmdBar.innerText = cmd;
  takeButton.style.backgroundColor = defaultBgColor;
  takeButton.innerText = "Take!";
  hasTaken = false;
};

const row1 = document.getElementById("row1");
for (let i = 1; i < 17; i++) {
  const td = document.createElement("td");
  const button = document.createElement("button");
  button.className = "src-button";
  td.appendChild(button);
  button.id = "src_" + i;
  button.addEventListener("click", (ev) => {
    srcButtonClicked(ev);
  });
  button.style.backgroundColor = "white";
  button.style.marginBottom = "5px";
  row1.append(td);
}

const row2 = document.getElementById("row2");
for (let i = 17; i < 33; i++) {
  const td = document.createElement("td");
  const button = document.createElement("button");
  button.className = "src-button";
  td.appendChild(button);
  button.id = "src_" + i;
  button.addEventListener("click", (ev) => {
    srcButtonClicked(ev);
  });
  button.style.backgroundColor = "white";
  button.style.marginTop = "5px";
  row2.append(td);
}

socket.on("init", (info) => {
  for (let i = 1; i <= 32; i++) {
    if (info.dests[i] != "") {
      const option = document.createElement("option");
      option.value = i;
      option.innerText = info.dests[i];
      destSelect.appendChild(option);
    }
  }

  for (let i = 1; i < 33; i++) {
    document.getElementById("src_" + i).innerText = i;
  }

  for (let i = 0; i < destSelect.options.length; i++) {
    if (destSelect.options[i].value == info.selectedDestNum) {
      destSelect.selectedIndex = i;
      dest.destNum = destSelect.options[i].value;
      dest.destName = destSelect.options[i].innerText;
    }
  }
  cmd = `Src ${src.srcName} -> Dest ${dest.destName}`;
  cmdBar.innerText = cmd;
  socket.emit("destNum", dest.destNum);
});

socket.on("selectedDest", (destNum) => {
  console.log(destNum);
  for (let i = 0; i < 32; i++) {
    if (destSelect.options[i].value == destNum) {
      destSelect.selectedIndex = i;
      dest.destNum = destSelect.options[i].value;
      dest.destName = destSelect.options[i].innerText;
    }
  }
  cmd = `Src ${src.srcName} -> Dest ${dest.destName}`;
  cmdBar.innerText = cmd;
  socket.emit("destNum", dest.destNum);
});

socket.on("setSrcSelection", (src) => {
  console.log(currentSrcNum);
  if (currentSrcNum != 0) {
    document.getElementById("src_" + currentSrcNum).style.backgroundColor =
      "white";
  }

  currentSrcNum = src;
  document.getElementById("src_" + src).style.backgroundColor = "#61CC80";
  if (hasTaken) {
    takeButton.innerText = "Taken!";
  }
});

socket.on("error", (err) => {
  console.log(err.err);
});
