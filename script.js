/* =========================================================
   CONFIG — ajuste estes valores
   ========================================================= */
// Número de WhatsApp da empresa (formato internacional, só dígitos)
// Ex.: 55 + DDD + número  ->  5532999999999
const WHATSAPP_EMPRESA = "553220290074";

// (Futuro) URL do Web App publicado no Google Apps Script.
// Deixe vazio ("") enquanto não houver back-end.
const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbwhVzfQkAp7AM-ksoODMxZtSun1r2kZSbSWuwXqA2qQYZLfP2F0tqW8OCylPhMVtYbw1w/exec";
/* ========================================================= */

const form = document.getElementById("leadForm");
const nome = document.getElementById("nome");
const tel  = document.getElementById("telefone");
const erroNome = document.getElementById("erroNome");
const erroTel  = document.getElementById("erroTel");

// Máscara simples de telefone (BR)
tel.addEventListener("input", () => {
  let v = tel.value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 6)      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else if (v.length > 0) v = `(${v}`;
  tel.value = v;
});

function validar() {
  const nomeOk = nome.value.trim().length >= 2;
  const digitos = tel.value.replace(/\D/g, "");
  const telOk = digitos.length >= 10;

  nome.classList.toggle("err", !nomeOk);
  erroNome.classList.toggle("show", !nomeOk);
  tel.classList.toggle("err", !telOk);
  erroTel.classList.toggle("show", !telOk);

  return nomeOk && telOk;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validar()) return;

  const dados = {
    nome: nome.value.trim(),
    telefone: tel.value.trim(),
    campanha: "Sorriso Campeão",
    origem: "Landing PAP / QR Code",
    data: new Date().toISOString()
  };

  // Envia ao Apps Script. "keepalive" garante que a requisição
  // termine mesmo com o redirecionamento ao WhatsApp logo em seguida.
  if (APPSCRIPT_URL) {
    try {
      fetch(APPSCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(dados)
      });
    } catch (err) { /* não bloqueia o fluxo */ }
  }

  // Monta a mensagem e abre o WhatsApp da empresa
  const msg =
    `Olá! Quero concorrer na promoção *Sorriso Campeão*\n\n` +
    `*Nome:* ${dados.nome}\n` +
    `*Telefone:* ${dados.telefone}`;

  window.location.href = montarLinkWhatsapp(WHATSAPP_EMPRESA, msg);
});

// Link de WhatsApp que funciona no celular (app) e no computador (WhatsApp Web).
function montarLinkWhatsapp(numero, texto) {
  const t = encodeURIComponent(texto);
  const ehMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
  return ehMobile
    ? `https://wa.me/${numero}?text=${t}`
    : `https://web.whatsapp.com/send?phone=${numero}&text=${t}`;
}
