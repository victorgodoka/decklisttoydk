const _isExtra = (type) =>
  type.indexOf("XYZ") !== -1 ||
  type.indexOf("Synchro") !== -1 ||
  type.indexOf("Fusion") !== -1 ||
  type.indexOf("Link") !== -1;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const d = urlParams.get("d");
function _decode(e) {
  return JSON.parse(atob(e));
}

let maindeck = [];
document.addEventListener("DOMContentLoaded", function () {
  fetch(
    `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${_decode(d)[0].join(
      ","
    )}`
  )
    .then((res) => res.json())
    .then(({ data }) => {
      var _find = (card) => data.find((c) => c.id === parseInt(card));
      _decode(d)[0].forEach(function (card) {
        if (!_isExtra(_find(card).type)) {
          maindeck.push(parseInt(card));
        }
      });
      var count = {};
      maindeck.forEach(function (x) {
        count[x] = (count[x] || 0) + 1;
      });
      var decklist = Object.keys(count).map((id) => {
        return {
          id: parseInt(id),
          name: _find(id).name,
          val: count[id],
        };
      }).sort(function (a, b) {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });
      window.options = decklist;
    }).then(() => newCombo(1))
});

function _findCopies(id) {
  return window.options.find(c => c.id === id).val
}

function _option(card, group, l) {
  return `<label class="dropdown-option" data-copies="${_findCopies(card.id)}">
    <span>
      <input type="checkbox" data-position="${l}" data-combo="${group}" data-copies="${_findCopies(card.id)}" name="card-group-${group}" value="${card.id}" />
      ${card.name}
    </span>
    <img src="https://storage.googleapis.com/ygoprodeck.com/pics_artgame/${card.id}.jpg" alt="${card.name}">
  </label>`
}

function _dropdown(group, l) {
  l = l ? l + 1 : 1
  return `<div class="col-12 dropdown-area" data-combo="${group}">
    <div class="col-1 dropdown" data-combo="${group}">
      ${l}.
    </div>
    <div class="col-7 dropdown" data-combo="${group}" data-control="checkbox-dropdown">
      <label class="dropdown-label">Select card(s)</label>

      <div class="dropdown-list">
        <a href="#" data-toggle="check-all" class="dropdown-option">
          Check All
        </a>

        ${window.options.map(card => _option(card, group, l)).join("")}
        
      </div>
    </div>
    <div class="col-4 row">
      <div class="col-6 minmaxcolumn">
        <label for="min-${group}" class="${l > 1 ? ' hide' : ""}">min</label>
        <select class="min minmaxselect" id="min-${group}-${l}" data-combo="${group}" data-position="${l}">
          <option value="0">0</option>
        </select>
      </div>
      <div class="col-6 minmaxcolumn">
        <label for="max-${group}" class="${l > 1 ? ' hide' : ""}">max</label>
        <select class="max minmaxselect" id="max-${group}-${l}" data-combo="${group}" data-position="${l}">
          <option value="0">0</option>
        </select>
      </div>
    </div>
  </div>`
}

function _addDropdown(group) {
  var l = document.querySelector(`.dropdown-wrapper[data-combo="${group}"]`).querySelectorAll(".dropdown[data-control]").length
  document.querySelector(`#minus-${group}`).classList.remove("disabled")
  document.querySelector(`.dropdown-wrapper[data-combo="${group}"]`).innerHTML += _dropdown(group, l)
  _update()
  if (l >= 9) {
    document.querySelector(`#plus-${group}`).classList.add("disabled")
  }
}

function _removeDropdown(group) {
  var l = document.querySelector(`.dropdown-wrapper[data-combo="${group}"]`).querySelectorAll(".dropdown[data-control]").length
  document.querySelector(`#plus-${group}`).classList.remove("disabled")
  document.querySelector(`.dropdown-wrapper[data-combo="${group}"]`).querySelectorAll(".dropdown-area")[l - 1].remove();
  if (l <= 2) {
    document.querySelector(`#minus-${group}`).classList.add("disabled")
  }
}

function newCombo(group) {
  document.querySelector("#combos").innerHTML += `<div class="col-6 combo-wrapper" id="combo-${group}" data-combo="${group}">
    <div class="row">
      <h2>Combo ${group}</h2>
    </div>
    <div class="row">
      <p>Select the card(s) you want in your hand</p>
    </div>
    <div class="row center">
      <div class="col-9 dropdown-wrapper" data-combo="${group}">
        ${_dropdown(group)}
      </div>
      <div class="col-3 buttons-wrapper">
        <button class="button small button--ghost--inverted" id="plus-${group}" onclick="_addDropdown(${group})">+</button>
        <button class="disabled button small button--ghost--inverted" id="minus-${group}" onclick="_removeDropdown(${group})">-</button>
      </div>
    </div>
  </div>
  `
  _update()
}

function _update() {
  var checkboxesDropdowns = document.querySelectorAll('[data-control="checkbox-dropdown"]');
  document.querySelectorAll(".dropdown-label").forEach(el => el.innerHTML = "Select card(s)");
  document.querySelectorAll(".min")
    .forEach(el => el.addEventListener("change",
      () => $(`#max-${el.dataset.combo}-${el.dataset.position} option`).each(function () {
        $(this).val()
        if (parseInt($(this).val()) < parseInt($(el).val())) {
          $(this).attr('disabled', 'disabled');
        } else if (parseInt($(this).val()) === parseInt($(el).val())) {
          $(this).removeAttr('disabled');
          $(this).attr('selected', 'selected');
        } else {
          $(this).removeAttr('disabled');
        }
      })))
  for (var i = 0, length = checkboxesDropdowns.length; i < length; i++) {
    new CheckboxDropdown(checkboxesDropdowns[i]);
  }
}

document.querySelector("#newcombo").addEventListener("click", () => {
  var l = document.querySelectorAll(".combo-wrapper").length
  newCombo(l + 1)
})

function getAllValues() {
  var comboresults = document.getElementById("comboresults");
  comboresults.innerHTML = "";
  const round = (x) => Number.parseFloat(x).toFixed(5);
  var mins = Array.from($(".combo-wrapper").find("select[id^=min-]"))
  var minsByCombo = []
  mins.forEach(el => {
    minsByCombo[parseInt(el.dataset.combo)] = minsByCombo[parseInt(el.dataset.combo)] || []
    minsByCombo[parseInt(el.dataset.combo)].push(parseInt(el.value)) || [parseInt(el.value)]
  })
  minsByCombo = minsByCombo.filter(Boolean)


  var maxs = Array.from($(".combo-wrapper").find("select[id^=max-]"))
  var maxsByCombo = []
  maxs.forEach(el => {
    maxsByCombo[parseInt(el.dataset.combo)] = maxsByCombo[parseInt(el.dataset.combo)] || []
    maxsByCombo[parseInt(el.dataset.combo)].push(parseInt(el.value)) || [parseInt(el.value)]
  })
  maxsByCombo = maxsByCombo.filter(Boolean)

  var selecteds = Array.from($("input[name^='card-group']:checked"))
  var selectedsByCombo = []
  selecteds.forEach(el => {
    selectedsByCombo[parseInt(el.dataset.combo - 1)] = selectedsByCombo[parseInt(el.dataset.combo - 1)] || []
    selectedsByCombo[parseInt(el.dataset.combo - 1)][parseInt(el.dataset.position)] = selectedsByCombo[parseInt(el.dataset.combo - 1)][parseInt(el.dataset.position)] + parseInt(el.dataset.copies) || parseInt(el.dataset.copies)
  })
  selectedsByCombo = selectedsByCombo.filter(Boolean)

  var hand = document.getElementById("cardsinhand");
  var cardsinhand = parseInt(hand.options[hand.selectedIndex].value);

  var probs = []
  for (let i = 0; i < minsByCombo.length; i++) {
    probs[i] = comboCalc(selectedsByCombo[i].filter(Boolean), minsByCombo[i], maxsByCombo[i], cardsinhand, window.options.reduce((b, a) => a.val + b, 0))
    comboresults.innerHTML += `<p>The probability of opening Combo ${i + 1} in your hand is ${round(probs[i] * 100)}%.</p>`
  }

  comboresults.innerHTML += `<p>The total probability of drawing any of the above combos is ${round(probs.reduce((b, a) => a + b, 0) * 100)}%.</p>`
}