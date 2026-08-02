(() => {
  const faceLights = {
    0: "lit-a",
    1: "lit-b",
    2: "lit-x",
    3: "lit-y"
  };

  const pad = document.getElementById("pad");
  if (!pad) return;

  const faces = Array.from(pad.querySelectorAll(".face"));
  const cards = Array.from(document.querySelectorAll(".card[data-slot]"));

  function setSlot(slot, on) {
    faces.forEach((f) => f.classList.remove("lit-a", "lit-b", "lit-x", "lit-y"));
    const key = String(slot);
    if (on && key in faceLights) {
      const target = faces.find((f) => f.dataset.slot === key);
      if (target) target.classList.add(faceLights[key]);
    }
  }

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => setSlot(card.dataset.slot, true));
    card.addEventListener("mouseleave", () => setSlot(card.dataset.slot, false));
    card.addEventListener("focus", () => setSlot(card.dataset.slot, true));
    card.addEventListener("blur", () => setSlot(card.dataset.slot, false));
  });
})();
