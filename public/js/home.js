function _encode(e) {
  return btoa(JSON.stringify(e));
}

function _decode(e) {
  return JSON.parse(decodeURIComponent(atob(e)));
}

const _isExtra = type => type.indexOf("XYZ") !== -1 || type.indexOf("Synchro") !== -1 || type.indexOf("Fusion") !== -1 || type.indexOf("Link") !== -1

function downloadList(filename, onlydata, main, extra, side) {
  var element = document.createElement("a");
  var textdata = `#created by Godoka @ decklists - DUELISTS UNITE
#main
${main}
#extra
${extra}
!side
${side}
`
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(textdata)
  );
  element.setAttribute("download", filename + ".txt");

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
  return window.location.replace("/decklists?d=" + _encode(onlydata));
}

function download(filename, text, onlydata) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename + ".ydk");

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
  return window.location.replace("/decklists?d=" + _encode(onlydata));
}

function _getComputedData(decklist) {
  if (!decklist) return [];
  return decklist.split("\n").map(function (c) {
    return {
      name: c.match(/(\d)x?\s?(\S.*)/)[2].trim(),
      val: parseInt(c.match(/(\d)x?\s?(\S.*)/)[1]),
    };
  });
}

function _fetchDeckId(decklist) {
  return fetch(
    `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${encodeURIComponent(
      decklist
        .join(",")
        .trim()
    )}`
  ).then((res) => res.json());
}

function _fetchDeck(decklist) {
  return fetch(
    `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(
      decklist
        .map((c) => c.name.trim())
        .join("|")
        .trim()
    )}`
  ).then((res) => res.json());
}

function _mountYDK(ydk) {
  return `#created by Godoka @ decklists - DUELISTS UNITE
#main and extra
${ydk[0].join("\n")}
!side
${ydk[1].join("\n")}`;
}

function separateYDK (ydk) {
  var deck = []
  var _lines = ydk.split("\n")
  _lines.forEach(l => l.startsWith("#") ? false : deck.push(l))
  deck = deck.join("\n").split("!side")
  deck[0] = deck[0].split("\n").filter(c => +c)
  deck[1] = deck[1].split("\n").filter(c => +c)
  deck = deck.filter(Boolean)
  var _cardnames = []
  Promise.all(deck.map(_fetchDeckId)).then((vals) => {
    _cardnames[0] = _cardnames[0] || { main: [], extra: [] }
    vals.forEach((val, i) => {
      var data = val.data;
      if (!data) return;
      var cardlist = data.map((card) => {
        return { id: parseInt(card.id) || 0, name: card.name || "", type: card.type };
      });
      var _findId = id => cardlist.find(c => c.id === parseInt(id))
      if (i === 0) {
        _cardnames[0]["extra"] = deck[0].filter(id => _isExtra(_findId(id).type)).map(id => _findId(id).name )
        _cardnames[0]["main"] = deck[0].filter(id => !_isExtra(_findId(id).type)).map(id => _findId(id).name )
      } else {
        _cardnames[i] = deck[i].map(id => _findId(id).name)
      }
    });
    var countsM = {};
    var countsE = {};
    var countsS = {};
    _cardnames[0].main.forEach(function(x) { countsM[x] = (countsM[x] || 0)+1; });
    _cardnames[0].extra.forEach(function(x) { countsE[x] = (countsE[x] || 0)+1; });
    if (_cardnames[1]) _cardnames[1].forEach(function(x) { countsS[x] = (countsS[x] || 0)+1; });
    var __main = Object.keys(countsM).map(name => countsM[name] + " " + name).join("\n")
    var __extra = Object.keys(countsE).map(name => countsE[name] + " " + name).join("\n")
    var __side = Object.keys(countsS).map(name => countsS[name] + " " + name).join("\n")
    var deckname = prompt("What's the deck name?");
    downloadList(deckname, deck, __main, __extra, __side);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#ydkfile").addEventListener("change", function (e) {
    if (this.files && this.files[0]) {
      var myFile = this.files[0];
      var reader = new FileReader();
      
      reader.addEventListener('load', function (e) {
        separateYDK(e.target.result);
      });
      
      reader.readAsBinaryString(myFile);
    }   
  });

  document.querySelector("#modaltoggle").addEventListener("click", function (e) {
    document.querySelector("#modalbody").classList.toggle("open")
  })

  document.querySelector("#modaltoggle2").addEventListener("click", function (e) {
    document.querySelector("#modalbody").classList.toggle("open")
  })

  document.querySelector("#import").addEventListener("submit", function (e) {
    e.preventDefault();
    if (
      !document.querySelector("#deck").value &&
      !document.querySelector("#sidedeck").value
    )
      return;
    var maindeck = _getComputedData(document.querySelector("#deck").value);
    var sidedeck = _getComputedData(document.querySelector("#sidedeck").value);
    var decklist = [maindeck, sidedeck];
    var ydk = [];
    Promise.all(decklist.map(_fetchDeck)).then((vals) => {
      vals.forEach((val, i) => {
        var data = val.data;
        var cardlist = data.map((card) => {
          return { id: card.id || 0, name: card.name || "" };
        });
        var deck = (card) =>
          decklist[i].find(
            (c) => c.name.toLowerCase() === card.name.toLowerCase()
          ) || { val: 0 };
        var _ydk = cardlist
          .map((card) => Array(deck(card).val).fill(card.id))
          .reduce((b, a) => a.concat(b), []);
        ydk.push(_ydk);
      });
      var deckname = prompt("What's the deck name?");
      download(deckname, _mountYDK(ydk), ydk);
    });
  });
  document.querySelector("#deck").placeholder =
    "Insert your card list here as in example above\n\rOnly put cards here\n\r2 Tour Guide from the Underworld\n\r3 Sangan\n\r1 Upstart Goblin\n\r3 Infinite Impermanence";
  document.querySelector("#sidedeck").placeholder =
    "Insert your card list here as in example above\n\rOnly put cards here\n\r2 Tour Guide from the Underworld\n\r3 Sangan\n\r1 Upstart Goblin\n\r3 Infinite Impermanence";
});
