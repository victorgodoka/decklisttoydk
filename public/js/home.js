function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename + ".ydk");

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
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

function _fetchDeck(decklist) {
  return fetch(
    `https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(
      decklist.map((c) => c.name).join("|")
    )}`
  ).then((res) => res.json());
}

function _mountYDK (ydk) {
  return `#created by Godoka @ decklists - DUELISTS UNITE
#main and extra
${ydk[0].join("\n")}
!side
${ydk[1].join("\n")}`
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#import").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!document.querySelector("#deck").value && !document.querySelector("#sidedeck").value) return;
    var maindeck = _getComputedData(document.querySelector("#deck").value);
    var sidedeck = _getComputedData(document.querySelector("#sidedeck").value);
    var decklist = [maindeck, sidedeck];
    var ydk = []
    Promise.all(decklist.map(_fetchDeck))
    .then((vals) => {
      vals.forEach((val, i) => {
        var data = val.data;
        var cardlist = data.map((card) => {
          return { id: card.id || 0, name: card.name || "" };
        });
        var deck = card => decklist[i].find((c) => c.name.toLowerCase() === card.name.toLowerCase()) || { val: 0 }
        var _ydk = cardlist.map((card) => Array(deck(card).val).fill(card.id)).reduce((b, a) => a.concat(b), []);
        ydk.push(_ydk)
      });
      var deckname = prompt("What's the deck name?")
      download(deckname, _mountYDK(ydk))
    });
  });
  document.querySelector("#deck").placeholder = "Insert your card list here as in example above\n\rOnly put cards here\n\r2 Tour Guide from the Underworld\n\r3 Sangan\n\r1 Upstart Goblin\n\r3 Infinite Impermanence";
  document.querySelector("#sidedeck").placeholder = "Insert your card list here as in example above\n\rOnly put cards here\n\r2 Tour Guide from the Underworld\n\r3 Sangan\n\r1 Upstart Goblin\n\r3 Infinite Impermanence";
});
