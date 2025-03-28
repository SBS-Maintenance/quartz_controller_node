const socket = io();

let src = { srcNum: 0, srcName: "" };
let dest = { destNum: 0, destName: "" };

let cmd = "";

const cmdBar = document.getElementById("cmdBar");

const takeButton = document.getElementById("takeButton");
const defaultBgColor = takeButton.style.backgroundColor;
takeButton.addEventListener("click", (ev) => {
  socket.emit("take", src.srcNum);
  ev.target.innerText = "Taking...";
  ev.target.style.backgroundColor = "yellow";
  for (let i = 1; i < 33; i++) {
    document.getElementById("src_" + i).style.backgroundColor = "white";
  }
});

const destSelect = document.getElementById("destSelect");
destSelect.addEventListener("change", (ev) => {
  dest.destNum = ev.target.options[ev.target.selectedIndex].value;
  dest.destName = ev.target.options[ev.target.selectedIndex].innerText;
  cmd = `${src.srcName} -> ${dest.destName}`;
  console.log(cmd);
  cmdBar.innerText = cmd;
  takeButton.style.backgroundColor = defaultBgColor;
  takeButton.innerText = "Take!";
  for (let i = 1; i < 33; i++) {
    document.getElementById("src_" + i).style.backgroundColor = "white";
  }
  socket.emit("destIndex", dest.destNum);
});

const srcButtonClicked = (ev) => {
  if (src.srcNum != 0) {
    document.getElementById("src_" + src.srcNum).style.backgroundColor =
      "white";
  }
  ev.target.style.backgroundColor = "yellow";
  src.srcNum = ev.target.id.split("_")[ev.target.id.split("_").length - 1];
  src.srcName = ev.target.innerText;
  cmd = `${src.srcName} -> ${dest.destName}`;
  console.log(cmd);
  cmdBar.innerText = cmd;
  takeButton.style.backgroundColor = defaultBgColor;
  takeButton.innerText = "Take!";
};

const row1 = document.getElementById("row1");
for (let i = 1; i < 17; i++) {
  const td = document.createElement("td");
  const button = document.createElement("button");
  button.className = "src-button";
  td.appendChild(button);
  button.id = "src_" + i;
  button.addEventListener("click", (ev) => {
    console.log(ev);
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

socket.on("destinations", (dests) => {
  for (let i = 1; i < 33; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.innerText = dests[i];
    destSelect.appendChild(option);
  }
});

socket.on("srcs", (srcs) => {
  for (let i = 1; i < 33; i++) {
    document.getElementById("src_" + i).innerText = srcs[i];
  }
});

socket.on("selectedDest", (destIndex) => {
  destSelect.selectedIndex = destIndex;
  dest.destNum = destSelect.options[destIndex].value;
  dest.destName = destSelect.options[destIndex].innerText;
  cmd = `${src.srcName} -> ${dest.destName}`;
  cmdBar.innerText = cmd;
  socket.emit("destIndex", dest.destNum);
});

socket.on("setSrcSelection", (src) => {
  document.getElementById("src_" + src).style.backgroundColor = "red";
  takeButton.innerText = "Taken!";
  takeButton.style.backgroundColor = "blue";
});

socket.on("error", (err) => {
  console.log(err.err);
});
