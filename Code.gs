/**
 * ============================================================
 *  Promoção "Sorriso Campeão" — AmorSaúde
 *  Back-end (Google Apps Script) que recebe os cadastros da
 *  landing page e salva em uma planilha do Google Sheets.
 * ============================================================
 *
 *  COMO USAR (passo a passo):
 *
 *  1) Crie uma planilha nova no Google Sheets.
 *  2) Copie o ID da planilha (trecho da URL entre /d/ e /edit) e
 *     cole na constante SPREADSHEET_ID abaixo.
 *  3) Crie o script em script.google.com (Novo projeto), apague o
 *     conteúdo padrão e cole TODO este arquivo.
 *  4) Execute a função "setup" uma vez para criar a aba/cabeçalhos
 *     e AUTORIZAR o acesso à planilha (vai pedir permissão).
 *  5) Clique em "Implantar" > "Nova implantação".
 *       - Tipo: "App da Web"
 *       - Executar como: "Eu"
 *       - Quem pode acessar: "Qualquer pessoa"
 *  6) Copie a URL gerada (termina em /exec) e cole no index.html,
 *     na constante APPSCRIPT_URL.
 *  7) Pronto! A cada envio do formulário uma nova linha é gravada.
 *
 *  TESTE RÁPIDO: abra a URL /exec no navegador — deve responder
 *  um JSON {"status":"online", ...}.
 * ============================================================
 */

// >>> OBRIGATÓRIO: ID da planilha que vai receber os cadastros.
// É o trecho da URL entre /d/ e /edit:
// https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit
const SPREADSHEET_ID = 'COLE_AQUI_O_ID_DA_PLANILHA';

// Nome da aba onde os cadastros serão gravados.
const SHEET_NAME = 'Cadastros';

/**
 * Recebe os dados enviados pela landing page (POST).
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // evita gravações simultâneas embaralhadas

    var dados = {};
    if (e && e.postData && e.postData.contents) {
      dados = JSON.parse(e.postData.contents);
    }

    var sheet = getSheet_();
    sheet.appendRow([
      new Date(),                          // Data/Hora
      dados.nome || '',                    // Nome
      "'" + (dados.telefone || ''),        // Telefone (aspa = mantém formatação)
      dados.campanha || 'Sorriso Campeão', // Campanha
      dados.origem || ''                   // Origem
    ]);

    return json_({ status: 'ok' });
  } catch (err) {
    return json_({ status: 'erro', mensagem: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Permite testar a URL abrindo-a no navegador.
 */
function doGet(e) {
  return json_({ status: 'online', servico: 'Sorriso Campeao', data: new Date() });
}

/**
 * Cria a aba e o cabeçalho (execute uma vez, opcional).
 */
function setup() {
  getSheet_();
}

/**
 * Retorna a aba de cadastros, criando-a com cabeçalho se não existir.
 */
function getSheet_() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === 'COLE_AQUI_O_ID_DA_PLANILHA') {
    throw new Error('Configure a constante SPREADSHEET_ID com o ID da planilha.');
  }
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Data/Hora', 'Nome', 'Telefone', 'Campanha', 'Origem']);
    sheet.getRange('A1:E1')
         .setFontWeight('bold')
         .setBackground('#009739')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 220);
    sheet.setColumnWidth(3, 150);
  }
  return sheet;
}

/**
 * Resposta padrão em JSON.
 */
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
