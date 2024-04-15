"use strict";

/* disable zoom */
document.addEventListener("keydown", function (e) {
  if (
    e.ctrlKey &&
    (e.keyCode == "61" ||
      e.keyCode == "107" ||
      e.keyCode == "173" ||
      e.keyCode == "109" ||
      e.keyCode == "187" ||
      e.keyCode == "189")
  ) {
    e.preventDefault();
  }
});
document.addEventListener(
  "wheel",
  function (e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  {
    passive: false,
  }
);

/* dev mode */
const aiDevelopMode = false;
const controller = new Controller(0.2, aiDevelopMode);
//   if (aiDevelopMode) {
//     const uctConstInput = document.getElementById("uctConst");
//     const rolloutNumInput = document.getElementById("rollout_num");
//     uctConstInput.classList.remove("hidden");
//     rolloutNumInput.classList.remove("hidden");
//     uctConstInput.value = controller.uctConst;
//     rolloutNumInput.value = 60000;

//     function onEditUctConst(e) {
//       var x = e.target.value;
//       controller.uctConst = x;
//     }
//     function onEditRollout(e) {
//       var x = e.target.value;
//       controller.numOfMCTSSimulations = x;
//     }

//     uctConstInput.oninput = onEditUctConst;
//     rolloutNumInput.oninput = onEditRollout;
//   }
