let autopokeInterval;

let onNavigate = (function() {
  let handlers = [];
  let oldURL = window.location.href;
  let timer = setInterval(function() {
    if (window.location.href !== oldURL) {
      handlers.forEach(function(handler) { handler() });
      oldURL = window.location.href;
    }
  }, 500);

  return function(handler) {
    handlers.push(handler);
  }
}());

function pokeAll() {
  // get poke buttons, including suggested pokes
  let pokeButtons = document.querySelectorAll("._4-u2._xct")[0].querySelectorAll("a._42ft._4jy0._4jy3._4jy1");
  // click all poke buttons
  for (let i = 0; i < pokeButtons.length; i++) {
    pokeButtons[i].click();
  }
}

function updateInterval() {
  clearInterval(autopokeInterval);
  autopokeInterval = setInterval(pokeAll, Number(document.getElementById("autopoke_intervalinput").value) * 1000);
}

function isOnPokesPage() {
  return location.href.indexOf("://www.facebook.com/pokes") !== -1;
}

function locationCheck() {
  if (isOnPokesPage()) {
    let headerElem = document.querySelector(".uiHeader.uiHeaderPage._5i1b");
    if (document.getElementsByClassName("autopoke").length == 0 && headerElem) {
      chrome.storage.local.get("interval", r => {
        let containerElem = document.createElement("div");
        containerElem.classList.add("autopoke");
        containerElem.id = "autopoke_container";
        headerElem.appendChild(containerElem);

        // write "autopoke" toggle
        let autopokeLabel = document.createElement("label");
        autopokeLabel.innerHTML = "<span>Auto-return pokes</span>";

        let autopokeToggle = document.createElement("input");
        autopokeToggle.type = "checkbox";
        autopokeToggle.classList.add("autopoke");
        autopokeToggle.id = "autopoke_autopoke";

        autopokeLabel.appendChild(autopokeToggle);
        containerElem.appendChild(autopokeLabel);

        // write interval input
        let intervalLabel = document.createElement("label");
        intervalLabel.innerHTML = "<span>Check interval (s):</span>";

        let intervalInput = document.createElement("input");
        intervalInput.type = "number";
        intervalInput.classList.add("autopoke");
        intervalInput.id = "autopoke_intervalinput";
        intervalInput.setAttribute("min", 0.5);
        intervalInput.setAttribute("step", 0.5);
        intervalInput.setAttribute("value", r.interval || 5);

        intervalLabel.appendChild(intervalInput);
        containerElem.appendChild(intervalLabel);

        // write "poke all" button
        let pokeAllButton = document.createElement("input");
        pokeAllButton.classList.add("autopoke");
        pokeAllButton.type = "button";
        pokeAllButton.id = "autopoke_pokeall";
        pokeAllButton.value = "Poke All Back";
        pokeAllButton.addEventListener("click", function() {
          pokeAll();
          pokeAllButton.style.opacity = "0.2";
          let fadeInterval = setInterval(function() {
            pokeAllButton.style.opacity = Number(pokeAllButton.style.opacity) + 0.01;
            if (pokeAllButton.style.opacity === "1") {
              clearInterval(fadeInterval);
            }
          });
        });
        containerElem.appendChild(pokeAllButton);

        // listeners
        autopokeToggle.addEventListener("change", e => {
          if (e.target.checked) {
            pokeAll();
            updateInterval();
          } else {
            clearInterval(autopokeInterval);
          }
        });

        intervalInput.addEventListener("change", e => {
          chrome.storage.local.set({ interval: Number(e.target.value) });
          if (autopokeToggle.checked) {
            updateInterval();
          }
        });
      });
    }
  } else {
    clearInterval(autopokeInterval);
  }
}

locationCheck();

onNavigate(locationCheck);
