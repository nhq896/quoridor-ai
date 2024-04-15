"use strict";

/*
 * Web worker.
 * Để cho AI chạy song song với luồng chính
 * tránh cho giao diện ở luồng chính không thể tương tác được trong lúc đợi AI tính toán
 */

importScripts("game.js");
importScripts("ai.js");

onmessage = function (event) {
  const game = Game.clone(event.data.game);
  if (game.winner === null) {
    const ai = new AI(
      event.data.numOfMCTSSimulations,
      event.data.uctConst,
      event.data.aiDevelopMode,
      true
    );
    const move = ai.chooseNextMove(game);
    postMessage(move);
  }
};
