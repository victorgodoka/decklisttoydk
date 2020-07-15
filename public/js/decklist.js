function _decode (e) {
  return JSON.parse(atob(e))
}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const _isExtra = type => type.indexOf("XYZ") !== -1 || type.indexOf("Synchro") !== -1 || type.indexOf("Fusion") !== -1 || type.indexOf("Link") !== -1
const d = urlParams.get("d")

if (!d) {
  window.location.replace("/")
}

var maindeck = []
var extradeck = []
var sidedeck = _decode(d)[1]

fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${_decode(d)[0].join(",")}`)
  .then((res) => res.json())
  .then(({ data }) => {
    var _find = card => data.find(c => c.id === parseInt(card))
    _decode(d)[0].forEach(function (card) {
      if (_isExtra(_find(card).type)) {
        extradeck.push(card)
      } else {
        maindeck.push(card)
      }
    })
    document.querySelector(".maindeck").innerHTML = maindeck.map(id => `<img class="card-img" src="${_find(id).card_images[0].image_url}" />`).join("")
    document.querySelector(".extradeck").innerHTML = extradeck.map(id => `<img class="card-img" src="${_find(id).card_images[0].image_url}" />`).join("")
    document.querySelector(".sidedeck").innerHTML = sidedeck.map(id => `<img class="card-img" src="${_find(id).card_images[0].image_url}" />`).join("")
  })
