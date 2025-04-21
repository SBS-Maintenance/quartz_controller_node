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
  ev.target.style.backgroundColor = "yellow";
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
  takeButton.style.backgroundColor = defaultBgColor;
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
      "red";
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
  row2.append(td);
}

socket.on("init", (info) => {
  // for (let i = 1; i < 33; i++) {
  for (let i = 1; i < 7; i++) {
    const option = document.createElement("option");
    // option.value = i;
    option.value = i + 11;
    // option.innerText = info.dests[i];
    option.innerText = info.dests[i + 11];
    destSelect.appendChild(option);
  }

  for (let i = 1; i < 33; i++) {
    document.getElementById("src_" + i).innerText = info.srcs[i];
  }

  // destSelect.selectedIndex = info.selectedDestNum - 1;
  destSelect.selectedIndex = info.selectedDestNum - 1 - 11;
  dest.destNum = destSelect.options[destSelect.selectedIndex].value;
  dest.destName = destSelect.options[destSelect.selectedIndex].innerText;
  cmd = `Src ${src.srcName} -> Dest ${dest.destName}`;
  cmdBar.innerText = cmd;
  socket.emit("destNum", dest.destNum);
});

socket.on("selectedDest", (destNum) => {
  destSelect.selectedIndex = destNum - 1;
  dest.destNum = destSelect.options[destIndex].value;
  dest.destName = destSelect.options[destIndex].innerText;
  cmd = `Src ${src.srcName} -> Dest ${dest.destName}`;
  cmdBar.innerText = cmd;
  socket.emit("destNum", dest.destNum);
});

socket.on("setSrcSelection", (src) => {
  currentSrcNum = src;
  document.getElementById("src_" + src).style.backgroundColor = "red";
  if (hasTaken) {
    takeButton.innerText = "Taken!";
    takeButton.style.backgroundColor = "blue";
  }
});

socket.on("error", (err) => {
  console.log(err.err);
});
