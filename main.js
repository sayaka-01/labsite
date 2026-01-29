const host = document.getElementById("svgHost");
const toast = document.getElementById("toast");

// Publications search
const pubSearch = document.getElementById("pubSearch");
const pubList = document.getElementById("pubList");
pubSearch?.addEventListener("input", () => {
  const q = pubSearch.value.trim().toLowerCase();
  [...pubList.querySelectorAll("li")].forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
  });
});

function showToast(text){
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 1200);
}

fetch("./assets/brain.svg")
  .then(r => r.text())
  .then(svgText => {
    host.innerHTML = svgText;

    const svg = host.querySelector("svg");
    if (!svg) throw new Error("SVG not found");

    // --- ぐりぐり（擬似回転）---
    let dragging = false;
    let moved = false;
    let startX = 0;
    let rot = 0;

    svg.addEventListener("pointerdown", (e) => {
      dragging = true;
      moved = false;
      startX = e.clientX;
      svg.setPointerCapture(e.pointerId);
      svg.style.cursor = "grabbing";
    });

    svg.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 2) moved = true;
      startX = e.clientX;
      rot += dx * 0.35;
      svg.style.transform = `rotate(${rot}deg)`;
    });

    svg.addEventListener("pointerup", () => {
      dragging = false;
      svg.style.cursor = "grab";
    });

    // --- クリック（領域IDを拾う）---
    svg.addEventListener("click", (e) => {
      if (moved) return; // ドラッグ直後の誤クリック抑制

      let el = e.target;
      for (let i = 0; i < 6 && el; i++){
        if (el.id) {
          console.log("Clicked:", el.id);
          showToast(`Clicked: ${el.id}`);
          return;
        }
        el = el.parentElement;
      }
      showToast("Clicked: (no id)");
    });
  })
  .catch(err => {
    console.error(err);
    host.innerHTML = `<div style="padding:18px;color:#fca5a5">SVG読み込み失敗：assets/brain.svg を確認</div>`;
  });
