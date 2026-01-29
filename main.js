const host = document.getElementById("svgHost");

// modal
const backdrop = document.getElementById("backdrop");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("close");
const mTitle = document.getElementById("mTitle");
const mBody = document.getElementById("mBody");

function openModal(title, html){
  mTitle.textContent = title;
  mBody.innerHTML = html;
  backdrop.hidden = false;
  modal.hidden = false;
}
function closeModal(){
  backdrop.hidden = true;
  modal.hidden = true;
}
backdrop.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);

// ここに「SVGの部位ID -> 説明」を書く（あとで増やす）
const PART_INFO = {
  FrontalLobe: {
    title: "前頭葉",
    html: `意思決定・計画など。<br><br><a class="inline-link" href="#publications">業績一覧</a>`
  },
  MotorCortex: {
    title: "一次運動野",
    html: `運動に関わる領域。MI/SMRなど。`
  }
};

// SVGをinlineで読み込む（これがクリック可能にする鍵）
fetch("./assets/brain.svg")
  .then(r => r.text())
  .then(svgText => {
    host.innerHTML = svgText;

    const svg = host.querySelector("svg");
    if (!svg) throw new Error("SVG not found");

    // ---- 擬似回転（ドラッグで回す）----
    let dragging = false;
    let startX = 0;
    let rot = 0;

    const down = (e) => {
      dragging = true;
      startX = e.clientX;
      svg.style.cursor = "grabbing";
    };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      startX = e.clientX;
      rot += dx * 0.4; // 回転の感度
      svg.style.transform = `rotate(${rot}deg)`;
    };
    const up = () => {
      dragging = false;
      svg.style.cursor = "grab";
    };

    svg.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    // ---- クリック判定（部位IDがある前提）----
    // クリックされた要素から、親を辿って id を探す
    svg.addEventListener("click", (e) => {
      // ドラッグ直後の誤クリックを減らしたいならここを工夫できる
      let el = e.target;
      for (let i = 0; i < 6 && el; i++){
        if (el.id && PART_INFO[el.id]) {
          const info = PART_INFO[el.id];
          openModal(info.title, info.html);

          // モーダル内の #リンククリックでモーダル閉じる
          mBody.querySelectorAll('a[href^="#"]').forEach(a=>{
            a.addEventListener("click", closeModal, { once:true });
          });
          return;
        }
        el = el.parentElement;
      }

      // 何がクリックされてるか確認用（開発中だけ）
      // console.log("clicked:", e.target?.id, e.target);
    });
  })
  .catch(err => {
    console.error(err);
    openModal("エラー", "SVGの読み込みに失敗しました。assets/brain.svg のパスを確認してね。");
  });
