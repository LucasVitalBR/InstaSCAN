/* InstaScan: desenha o cupom de diagnóstico como imagem PNG no navegador,
   para enviar pelo WhatsApp. Nada é enviado a servidor. */
(function (global) {
  "use strict";

  var C = {
    bg: "#070B24", indigo: "#2B2FB3", violet: "#6A35E8", text: "#F2F4FF", muted: "#AEB5DA",
    orange: "#FF8A47", orangeMark: "#FF6B1F", cyan: "#45D4FF", ok: "#4ADE9B", warn: "#FFB547"
  };
  var W = 1080, H = 1740;
  var CORNERS = ["M12 36 V24 A12 12 0 0 1 24 12 H36", "M84 12 H96 A12 12 0 0 1 108 24 V36", "M108 84 V96 A12 12 0 0 1 96 108 H84", "M36 108 H24 A12 12 0 0 1 12 96 V84"];
  var AT_TAIL = "M71 52 V64 A8 8 0 0 0 87 64 V60 A27 27 0 1 0 76.5 81.5";

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function drawMark(ctx, x, y, size) {
    var k = size / 120;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 10; ctx.fillStyle = "transparent";
    ctx.strokeStyle = C.cyan;
    CORNERS.forEach(function (d) { ctx.stroke(new Path2D(d)); });
    ctx.strokeStyle = C.orangeMark;
    ctx.beginPath(); ctx.arc(60, 60, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.stroke(new Path2D(AT_TAIL));
    ctx.restore();
  }
  function fitText(ctx, text, maxW, size, weight, family) {
    var s = size;
    do { ctx.font = weight + " " + s + "px " + family; s -= 2; } while (ctx.measureText(text).width > maxW && s > 14);
  }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function ensureFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all([
      document.fonts.load('600 60px "Lexend"'), document.fonts.load('300 30px "Lexend"'),
      document.fonts.load('500 32px "Martian Mono"'), document.fonts.load('700 32px "Martian Mono"')
    ]).catch(function () {});
  }

  function draw(canvas, d) {
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext("2d");
    var LEX = '"Lexend", system-ui, sans-serif', MONO = '"Martian Mono", ui-monospace, monospace';

    // fundo
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    var g1 = ctx.createRadialGradient(140, 0, 0, 140, 0, 900); g1.addColorStop(0, "rgba(106,53,232,.55)"); g1.addColorStop(1, "rgba(106,53,232,0)");
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    var g2 = ctx.createRadialGradient(1000, 120, 0, 1000, 120, 800); g2.addColorStop(0, "rgba(43,47,179,.6)"); g2.addColorStop(1, "rgba(43,47,179,0)");
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

    // cartão de vidro com picotes (camada separada para recortar)
    var cx = 90, cy = 90, cw = 900, ch = 1520, perfY = cy + 940;
    var layer = document.createElement("canvas"); layer.width = W; layer.height = H;
    var l = layer.getContext("2d");
    roundRect(l, cx, cy, cw, ch, 72);
    var gf = l.createLinearGradient(0, cy, 0, cy + ch); gf.addColorStop(0, "rgba(255,255,255,.15)"); gf.addColorStop(1, "rgba(255,255,255,.06)");
    l.fillStyle = gf; l.fill();
    l.lineWidth = 2; l.strokeStyle = "rgba(214,222,255,.28)"; l.stroke();
    var px = ctx.getImageData(30, perfY, 1, 1).data, notch = "rgb(" + px[0] + "," + px[1] + "," + px[2] + ")";
    ctx.save(); ctx.shadowColor = "rgba(2,4,20,.7)"; ctx.shadowBlur = 60; ctx.shadowOffsetY = 30; ctx.drawImage(layer, 0, 0); ctx.restore();
    ctx.fillStyle = notch;
    [cx, cx + cw].forEach(function (nx) { ctx.beginPath(); ctx.arc(nx, perfY, 36, 0, Math.PI * 2); ctx.fill(); });

    var left = cx + 80, right = cx + cw - 80, mid = W / 2;
    // marca
    ctx.font = "600 64px " + LEX;
    var w1 = ctx.measureText("insta").width, w2 = ctx.measureText("scan").width, mark = 76, gap = 20;
    var total = mark + gap + w1 + w2, sx = mid - total / 2, by = cy + 150;
    drawMark(ctx, sx, by - 58, mark);
    ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    ctx.fillStyle = C.text; ctx.fillText("insta", sx + mark + gap, by);
    ctx.fillStyle = C.orange; ctx.fillText("scan", sx + mark + gap + w1, by);
    ctx.textAlign = "center"; ctx.fillStyle = C.muted; ctx.font = "500 28px " + MONO;
    ctx.fillText("CUPOM DE DIAGNÓSTICO", mid, by + 66);

    function dashed(y) {
      ctx.save(); ctx.setLineDash([14, 12]); ctx.lineWidth = 3; ctx.strokeStyle = "rgba(214,222,255,.32)";
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke(); ctx.restore();
    }
    function row(label, value, y, color, bold) {
      ctx.textAlign = "left"; ctx.font = "500 30px " + MONO; ctx.fillStyle = C.text; ctx.fillText(label, left, y);
      ctx.textAlign = "right"; ctx.fillStyle = color || C.text;
      fitText(ctx, String(value), (right - left) * 0.58, 30, bold ? 700 : 500, MONO);
      ctx.fillText(String(value), right, y);
    }

    var y = by + 120; dashed(y); y += 64;
    var rows = [["PERFIL", d.h ? "@" + String(d.h).replace(/^@/, "") : "—"]];
    if (d.n) rows.push(["NOME", d.n]);
    if (d.p) rows.push(["POSTS", d.p]);
    if (d.s) rows.push(["SEGUIDORES", d.s]);
    if (d.g) rows.push(["SEGUINDO", d.g]);
    rows.forEach(function (r) { row(r[0], r[1], y); y += 52; });
    y += 10; dashed(y); y += 64;
    row("PILARES FORTES", d.f || 0, y, C.ok, true); y += 52;
    row("A AJUSTAR", d.a || 0, y, C.warn, true); y += 52;
    row("A VERIFICAR", d.v || 0, y); y += 40;

    // nota (alinhada abaixo do picote)
    dashed(perfY);
    var ny = perfY + 230;
    ctx.textAlign = "left"; ctx.font = "300 34px " + LEX; ctx.fillStyle = C.muted; ctx.fillText("nota do perfil", left, ny);
    ctx.textAlign = "right"; ctx.font = "300 34px " + LEX; var slash = "/100"; var sw = ctx.measureText(slash).width;
    ctx.fillText(slash, right, ny);
    ctx.font = "600 210px " + LEX; ctx.fillStyle = C.orange; ctx.fillText(String(d.t != null ? d.t : "—"), right - sw - 8, ny);

    // código de barras (padrão a partir do @)
    var bx = mid - 260, bw = 520, bTop = ny + 50, bH = 110, seed = hash(String(d.h || "instascan")), x = bx;
    ctx.fillStyle = C.text;
    while (x < bx + bw) {
      seed = Math.imul(seed ^ (seed >>> 15), 2246822507) >>> 0;
      var bar = 3 + (seed % 4) * 3, space = 4 + ((seed >>> 8) % 3) * 3;
      if (x + bar > bx + bw) break;
      ctx.fillRect(x, bTop, bar, bH); x += bar + space;
    }
    ctx.textAlign = "center"; ctx.font = "500 26px " + MONO; ctx.fillStyle = C.muted;
    ctx.fillText("MUNDO SENAI 2026 · NAVIRAÍ-MS", mid, bTop + bH + 58);
    ctx.font = "700 30px " + MONO; ctx.fillStyle = C.text;
    ctx.fillText("OBRIGADO PELA VISITA", mid, bTop + bH + 108);

    // rodapé
    ctx.font = "300 28px " + LEX; ctx.fillStyle = C.muted;
    ctx.fillText("Diagnóstico gerado por IA · SENAI Naviraí", mid, H - 60);
    return canvas;
  }

  function toBlob(data) {
    return ensureFonts().then(function () {
      var c = draw(document.createElement("canvas"), data);
      return new Promise(function (res) { c.toBlob(function (b) { res(b); }, "image/png"); });
    });
  }

  global.InstaCupom = { draw: draw, toBlob: toBlob, ensureFonts: ensureFonts };
})(window);
