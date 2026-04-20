// ═══════════════════════════════════════════════════════════════
//  LUCIE LINKOVÁ – KURZY + WORKSHOPY EMAILS
//  Script independiente — instalar en script.google.com
//  1. Pegar este código → Guardar
//  2. Correr la función setup() UNA SOLA VEZ
// ═══════════════════════════════════════════════════════════════

var LUCIE_EMAIL       = 'lucielinkova@bodyease.cz';
var LUCIE_NAME        = 'Lucie Linková';
var FORM_ID           = '1c53b81xqb2pLKZB6IZns7xmEVkmSL_BFdALh45dqSho';  // kurzy
var WORKSHOP_FORM_ID  = '1cal5NTOLQ7MFXRznwiBadaxSZd5c7jeMXGnpkfDI_wY';
var SHEET_ID          = '1GggF4K-BbOvLMZysK5po6WMBiDAV0rpEwR2zZe1mCYE';
var MAX_PER_SLOT      = 10;
var WS_SHEET_NAME     = 'Workshopy';  // nombre de la pestaña en el spreadsheet

// Columnas del Sheet de Workshopy (índice base 0)
var COL_WS_TIMESTAMP = 0;
var COL_WS_NAME      = 1;
var COL_WS_EMAIL     = 2;
var COL_WS_PHONE     = 3;
var COL_WS_DATE      = 4;
var COL_WS_NOTES     = 5;

// Capacidad máxima por fecha de workshop
var WS_CAPACITY = {
  '26. dubna 2026 – Studio jógy Charkovská (9:15–11:15)': 10,
  '13. června 2026 – Grébovka, venkovní (9:15–11:15)':    20,
  '19. září 2026 – Solná jeskyně (9:30–11:00)':           7
};

var ALL_SLOTS = [
  'Úterý 16:30–17:25',
  'Úterý 17:40–18:35',
  'Středa 17:00–17:55',
  'Čtvrtek 7:00–7:55',
  'Čtvrtek 12:15–13:10'
];

// Columnas del Sheet (índice base 0, columna A = 0)
var COL_TIMESTAMP  = 0;
var COL_NAME       = 1;
var COL_EMAIL      = 2;
var COL_SLOT       = 3;
var COL_EXPERIENCE = 4;
var COL_NOTES      = 5;

// Fechas en que NO hay clase (vacaciones)
var HOLIDAY_DATES = ['2026-05-04','2026-05-05','2026-05-06','2026-05-07','2026-05-08'];


// ───────────────────────────────────────────────────────────────
//  TRIGGER 1: Email de confirmación al registrarse
//  Enruta por nombre de pestaña → kurzy o workshopy
// ───────────────────────────────────────────────────────────────
function onFormSubmit(e) {
  var sheetName = e.range.getSheet().getName();

  if (sheetName === WS_SHEET_NAME) {
    onWorkshopFormSubmit(e);
    return;
  }

  // Inscripción al kurz (comportamiento original)
  var row = e.values;
  var name       = row[COL_NAME];
  var email      = row[COL_EMAIL];
  var slot       = row[COL_SLOT];
  var experience = row[COL_EXPERIENCE];
  var notes      = row[COL_NOTES] || '—';

  sendConfirmationEmail(name, email, slot);
  notifyLucie(name, email, slot, experience, notes);
  checkAndUpdateFormOptions();
}


// ───────────────────────────────────────────────────────────────
//  WORKSHOP: handler de nueva inscripción
// ───────────────────────────────────────────────────────────────
function onWorkshopFormSubmit(e) {
  var row   = e.values;
  var name  = row[COL_WS_NAME];
  var email = row[COL_WS_EMAIL];
  var phone = row[COL_WS_PHONE] || '—';
  var date  = row[COL_WS_DATE];
  var notes = row[COL_WS_NOTES] || '—';

  // Verificar capacidad — si está lleno, avisar a Lucie y no confirmar
  if (!checkWorkshopCapacity(date)) {
    GmailApp.sendEmail(
      LUCIE_EMAIL,
      '⚠️ Workshop plný: ' + name + ' – ' + date,
      'Alguien intentó inscribirse al workshop "' + date + '" pero ya está completo.\n\n' +
      'Nombre: ' + name + '\nEmail: ' + email + '\nTeléfono: ' + phone,
      { name: 'Systém – bodyease.cz' }
    );
    // Enviar aviso al participante
    GmailApp.sendEmail(email,
      'Workshop Lucie Linková – místo není k dispozici',
      'Dobrý den ' + name + ',\n\nomlouváme se, ale termín "' + date + '" je již plně obsazen.\n\n' +
      'V případě uvolnění místa vás budeme kontaktovat.\n\nLucie Linková · bodyease.cz',
      { name: LUCIE_NAME, replyTo: LUCIE_EMAIL }
    );
    return;
  }

  sendWorkshopConfirmationEmail(name, email, date);
  notifyLucieWorkshop(name, email, phone, date, notes);
}

// ─── LÍMITE DE 10 PERSONAS POR SLOT ──────────────────────────
function checkAndUpdateFormOptions() {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  var data  = sheet.getDataRange().getValues();

  // Contar inscritos por slot
  var counts = {};
  ALL_SLOTS.forEach(function(s) { counts[s] = 0; });
  for (var i = 1; i < data.length; i++) {
    var s = data[i][COL_SLOT];
    if (counts[s] !== undefined) counts[s]++;
  }

  // Slots que aún tienen espacio
  var available = ALL_SLOTS.filter(function(s) { return counts[s] < MAX_PER_SLOT; });

  var form = FormApp.openById(FORM_ID);

  // Si todos los slots están llenos, cerrar el form
  if (available.length === 0) {
    form.setAcceptingResponses(false);
    form.setDescription('Kurz je plně obsazen. Děkujeme za váš zájem!');
    GmailApp.sendEmail(LUCIE_EMAIL, '🎉 Kurz je plně obsazen!',
      'Všechna místa ve všech termínech jsou obsazena. Formulář byl automaticky uzavřen.',
      { name: 'Systém – bodyease.cz' });
    return;
  }

  // Actualizar opciones del campo "Vybraný termín"
  var items = form.getItems();
  for (var j = 0; j < items.length; j++) {
    if (items[j].getTitle() === 'Vybraný termín') {
      var mcItem  = items[j].asMultipleChoiceItem();
      var choices = available.map(function(s) {
        var spots = MAX_PER_SLOT - counts[s];
        var label = spots <= 2 ? s + ' (poslední ' + spots + ' místa)' : s;
        return mcItem.createChoice(label);
      });
      mcItem.setChoices(choices);
      break;
    }
  }
}


// ───────────────────────────────────────────────────────────────
//  TRIGGER 2: Recordatorio el día anterior a la clase
//  Configurar: Triggers > sendDayBeforeReminders > Time-driven > Day timer > 8am–9am
// ───────────────────────────────────────────────────────────────
function sendDayBeforeReminders() {
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  var tomorrowStr = Utilities.formatDate(tomorrow, 'Europe/Prague', 'yyyy-MM-dd');
  var dayOfWeek   = tomorrow.getDay(); // 0=Sun, 2=Tue, 3=Wed, 4=Thu

  // Si mañana es vacación, no enviar
  if (HOLIDAY_DATES.indexOf(tomorrowStr) !== -1) return;

  // Determinar qué slots tienen clase mañana
  var slotsWithClassTomorrow = [];

  if (dayOfWeek === 2) { // Martes
    slotsWithClassTomorrow = ['Úterý 16:30–17:25', 'Úterý 17:40–18:35'];
  } else if (dayOfWeek === 3) { // Miércoles
    slotsWithClassTomorrow = ['Středa 17:00–17:55'];
  } else if (dayOfWeek === 4) { // Jueves
    slotsWithClassTomorrow = ['Čtvrtek 7:00–7:55', 'Čtvrtek 12:15–13:10'];
  }

  if (slotsWithClassTomorrow.length === 0) return;

  // Buscar en el Sheet todas las personas registradas en esos slots
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  var data  = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) { // fila 0 = encabezados
    var row  = data[i];
    var name  = row[COL_NAME];
    var email = row[COL_EMAIL];
    var slot  = row[COL_SLOT];

    if (slotsWithClassTomorrow.indexOf(slot) !== -1) {
      sendReminderEmail(name, email, slot, tomorrowStr);
    }
  }
}


// ═══════════════════════════════════════════════════════════════
//  EMAIL 1 – CONFIRMACIÓN (contrato de inscripción)
// ═══════════════════════════════════════════════════════════════
function sendConfirmationEmail(name, email, slot) {
  var subject = 'Potvrzení přihlášky – Kurz hypopresivní metody | Lucie Linková';

  var html = `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F6F1EB;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EB;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#FDFAF6;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(37,28,20,0.08);">

    <!-- HEADER -->
    <tr>
      <td style="background:#B8623A;padding:32px 40px;">
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Hypopresivní metoda · Vinohrady</p>
        <h1 style="margin:8px 0 0;font-size:26px;font-weight:400;color:#ffffff;font-family:Georgia,serif;">Lucie Linková</h1>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:40px 40px 32px;">
        <p style="margin:0 0 20px;font-size:16px;color:#6B5B4A;font-weight:300;">Dobrý den, <strong style="color:#251C14;">${name}</strong>,</p>

        <p style="margin:0 0 16px;font-size:15px;color:#6B5B4A;line-height:1.8;font-weight:300;">
          děkuji za Vaši přihlášku do <strong style="color:#251C14;">mírně pokročilého kurzu hypopresivní metody</strong> 🧡<br>
          Vybraný termín: <strong style="color:#B8623A;">${slot}</strong>
        </p>

        <p style="margin:0 0 28px;font-size:15px;color:#6B5B4A;line-height:1.8;font-weight:300;">
          Pro potvrzení Vašeho místa prosím o úhradu kurzovného:
        </p>

        <!-- PLATBA BOX -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E4D8;border-left:4px solid #B8623A;border-radius:2px;margin-bottom:28px;">
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Platební údaje</p>
            <p style="margin:0 0 6px;font-size:15px;color:#251C14;">• Částka: <strong>4 000 Kč</strong></p>
            <p style="margin:0 0 6px;font-size:15px;color:#251C14;">• Číslo účtu: <strong>212121381/5500</strong> (nebo QR kód níže)</p>
            <p style="margin:0;font-size:15px;color:#251C14;">• Zpráva pro příjemce: <strong>${name}</strong></p>
          </td></tr>
        </table>

        <p style="margin:0 0 28px;font-size:14px;color:#9B8B78;line-height:1.7;font-weight:300;">
          Po připsání platby na účet máte místo v kurzu rezervované. V případě potřeby Vám ráda zašlu potvrzení o platbě.
        </p>

        <!-- MÍSTO -->
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Místo konání</p>
        <p style="margin:0 0 28px;font-size:15px;color:#251C14;line-height:1.7;">
          Studio MotherGood<br>
          Sudoměřská 1243/25, 130 00 Praha – Vinohrady
        </p>

        <!-- TERMÍNY -->
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Termíny lekcí</p>
        <p style="margin:0 0 28px;font-size:15px;color:#251C14;line-height:1.7;">
          ${getSlotDates(slot)}<br>
          <span style="font-size:13px;color:#9B8B78;">Volno: 4.–8. května 2026</span>
        </p>

        <!-- NA CO SE PŘIPRAVIT -->
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Na co se připravit</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="font-size:14px;color:#6B5B4A;line-height:1.8;font-weight:300;padding-left:4px;">
            • Dorazte prosím 5–10 minut před začátkem lekce<br>
            • Cvičíme s prázdnějším žaludkem – ideálně nejezte alespoň 2 hodiny předem<br>
            • S sebou: pohodlné oblečení, vodu (cvičí se bez bot)
          </td></tr>
        </table>

        <!-- STORNO -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EB;border-radius:2px;margin-bottom:28px;">
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Storno podmínky</p>
            <p style="margin:0;font-size:13px;color:#6B5B4A;line-height:1.85;font-weight:300;">
              • Zrušení 7 a více pracovních dní před zahájením kurzu – vracíme kurzovné v plné výši<br>
              • Zrušení méně než 7 pracovních dní před zahájením – účtujeme 50% storno poplatek<br>
              • <strong style="color:#251C14;">Po zahájení kurzu se kurzovné nevrací</strong><br>
              • V případě nemoci je možné domluvit náhradu nebo převod zbývajících lekcí (dle kapacity)
            </p>
          </td></tr>
        </table>

        <p style="margin:0 0 32px;font-size:15px;color:#6B5B4A;line-height:1.8;font-weight:300;">
          Pokud byste měla jakýkoliv dotaz, klidně mi napište nebo zavolejte.
        </p>

        <p style="margin:0;font-size:15px;color:#6B5B4A;line-height:1.8;">
          Těším se na společné lekce ✨<br><br>
          <strong style="color:#251C14;">Lucie Linková</strong><br>
          <span style="font-size:13px;color:#9B8B78;">tel. 792 314 472 · <a href="https://www.bodyease.cz" style="color:#B8623A;text-decoration:none;">www.bodyease.cz</a></span>
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#251C14;padding:20px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;color:rgba(253,250,246,0.3);letter-spacing:1px;">
          © 2026 Lucie Linková · bodyease.cz
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

  GmailApp.sendEmail(email, subject, '', { htmlBody: html, name: LUCIE_NAME, replyTo: LUCIE_EMAIL });
}


// ═══════════════════════════════════════════════════════════════
//  EMAIL 2 – RECORDATORIO (día anterior)
// ═══════════════════════════════════════════════════════════════
function sendReminderEmail(name, email, slot, dateStr) {
  var displayDate = formatDateCzech(dateStr);
  var subject = 'Připomínka – zítra máte lekci s Lucií 🌿';

  var html = `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F6F1EB;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EB;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#FDFAF6;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(37,28,20,0.08);">

    <!-- HEADER -->
    <tr>
      <td style="background:#B8623A;padding:32px 40px;">
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Připomínka lekce</p>
        <h1 style="margin:8px 0 0;font-size:26px;font-weight:400;color:#ffffff;font-family:Georgia,serif;">Zítra máte lekci 🌿</h1>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:40px 40px 32px;">
        <p style="margin:0 0 20px;font-size:16px;color:#6B5B4A;font-weight:300;">Dobrý den, <strong style="color:#251C14;">${name}</strong>,</p>

        <p style="margin:0 0 28px;font-size:15px;color:#6B5B4A;line-height:1.8;font-weight:300;">
          připomínám, že zítra <strong style="color:#251C14;">${displayDate}</strong> máte lekci hypopresivní metody.<br>
          Těším se na vás! ✨
        </p>

        <!-- INFO BOX -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E4D8;border-left:4px solid #B8623A;border-radius:2px;margin-bottom:28px;">
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Detail lekce</p>
            <p style="margin:0 0 6px;font-size:15px;color:#251C14;">🕐 <strong>${slot}</strong></p>
            <p style="margin:0;font-size:15px;color:#251C14;">📍 Studio MotherGood, Sudoměřská 1243/25, Vinohrady</p>
          </td></tr>
        </table>

        <!-- NA CO SE PŘIPRAVIT -->
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Na co nezapomenout</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="font-size:14px;color:#6B5B4A;line-height:2;font-weight:300;padding-left:4px;">
            ⏰ Dorazte 5–10 minut před začátkem<br>
            🍽️ Nejezte alespoň 2 hodiny před lekcí<br>
            👟 Cvičíme bez bot<br>
            🎽 Pohodlné oblečení<br>
            💧 Nezapomeňte na vodu
          </td></tr>
        </table>

        <p style="margin:0 0 32px;font-size:14px;color:#9B8B78;line-height:1.7;font-weight:300;">
          Pokud se nemůžete zúčastnit, dejte mi prosím vědět co nejdříve — nejpozději 24 hodin předem.<br>
          Pokud nemůžete přijít, zašlu vám záznam z lekce.
        </p>

        <p style="margin:0;font-size:15px;color:#6B5B4A;line-height:1.8;">
          Těším se na vás ✨<br><br>
          <strong style="color:#251C14;">Lucie Linková</strong><br>
          <span style="font-size:13px;color:#9B8B78;">tel. 792 314 472 · <a href="https://www.bodyease.cz" style="color:#B8623A;text-decoration:none;">www.bodyease.cz</a></span>
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#251C14;padding:20px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;color:rgba(253,250,246,0.3);letter-spacing:1px;">
          © 2026 Lucie Linková · bodyease.cz
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

  GmailApp.sendEmail(email, subject, '', { htmlBody: html, name: LUCIE_NAME, replyTo: LUCIE_EMAIL });
}


// ═══════════════════════════════════════════════════════════════
//  WORKSHOP EMAIL 1 – CONFIRMACIÓN
// ═══════════════════════════════════════════════════════════════
function sendWorkshopConfirmationEmail(name, email, date) {
  var subject = 'Potvrzení přihlášky – Workshop hypopresivní metody | Lucie Linková';

  // Detalles específicos según fecha
  var wsDetails = getWorkshopDetails(date);

  var html = `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F6F1EB;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EB;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#FDFAF6;border-radius:4px;overflow:hidden;box-shadow:0 4px 24px rgba(37,28,20,0.08);">

    <!-- HEADER -->
    <tr>
      <td style="background:#B8623A;padding:32px 40px;">
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Workshop · Hypopresivní metoda</p>
        <h1 style="margin:8px 0 0;font-size:26px;font-weight:400;color:#ffffff;font-family:Georgia,serif;">Lucie Linková</h1>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:40px 40px 32px;">
        <p style="margin:0 0 20px;font-size:16px;color:#6B5B4A;font-weight:300;">Dobrý den, <strong style="color:#251C14;">${name}</strong>,</p>

        <p style="margin:0 0 16px;font-size:15px;color:#6B5B4A;line-height:1.8;font-weight:300;">
          děkuji za Vaši přihlášku na <strong style="color:#251C14;">workshop hypopresivní metody</strong> 🧡<br>
          Vybraný termín: <strong style="color:#B8623A;">${date}</strong>
        </p>

        <!-- PLATBA BOX -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E4D8;border-left:4px solid #B8623A;border-radius:2px;margin-bottom:28px;">
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Platební údaje</p>
            <p style="margin:0 0 6px;font-size:15px;color:#251C14;">• Cena: <strong>1 500 Kč</strong></p>
            <p style="margin:0 0 6px;font-size:15px;color:#251C14;">• Číslo účtu: <strong>212121381/5500</strong></p>
            <p style="margin:0;font-size:15px;color:#251C14;">• Zpráva pro příjemce: <strong>${name} workshop</strong></p>
          </td></tr>
        </table>

        <!-- MÍSTO A ČAS -->
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Místo a čas</p>
        <p style="margin:0 0 28px;font-size:15px;color:#251C14;line-height:1.7;">
          ${wsDetails.location}<br>
          <span style="color:#6B5B4A;">${wsDetails.time}</span>
        </p>

        <!-- PROGRAM -->
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Program</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td style="font-size:14px;color:#6B5B4A;line-height:1.8;font-weight:300;padding-left:4px;">
            • 1. hodina: hypopresivní metoda s Lucií<br>
            • 2. hodina: pranayama s Katkou<br>
            ${wsDetails.extra}
          </td></tr>
        </table>

        <!-- STORNO -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EB;border-radius:2px;margin-bottom:28px;">
          <tr><td style="padding:24px 28px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Storno podmínky</p>
            <p style="margin:0;font-size:13px;color:#6B5B4A;line-height:1.85;font-weight:300;">
              • Zrušení 48 hodin a více před workshopem – vracíme platbu v plné výši<br>
              • <strong style="color:#251C14;">Zrušení méně než 48 hodin předem – platba se nevrací</strong>
            </p>
          </td></tr>
        </table>

        <p style="margin:0;font-size:15px;color:#6B5B4A;line-height:1.8;">
          Těším se na vás ✨<br><br>
          <strong style="color:#251C14;">Lucie Linková</strong><br>
          <span style="font-size:13px;color:#9B8B78;">tel. 792 314 472 · <a href="https://www.bodyease.cz" style="color:#B8623A;text-decoration:none;">www.bodyease.cz</a></span>
        </p>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background:#251C14;padding:20px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;color:rgba(253,250,246,0.3);letter-spacing:1px;">
          © 2026 Lucie Linková · bodyease.cz
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

  GmailApp.sendEmail(email, subject, '', { htmlBody: html, name: LUCIE_NAME, replyTo: LUCIE_EMAIL });
}


// ═══════════════════════════════════════════════════════════════
//  WORKSHOP EMAIL 2 – RECORDATORIO (día anterior)
// ═══════════════════════════════════════════════════════════════
function sendWorkshopReminderEmails() {
  var tomorrow    = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var tomorrowStr = Utilities.formatDate(tomorrow, 'Europe/Prague', 'dd. MMMMM yyyy');

  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(WS_SHEET_NAME);
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row  = data[i];
    var name  = row[COL_WS_NAME];
    var email = row[COL_WS_EMAIL];
    var date  = row[COL_WS_DATE];

    // La fecha del workshop empieza con "26. dubna", "13. června", etc.
    // Comparamos si el inicio del string coincide con la fecha de mañana formateada
    if (date && date.toString().indexOf(tomorrowStr) === 0) {
      var wsDetails = getWorkshopDetails(date);
      var subject = 'Připomínka – zítra máte workshop s Lucií 🌿';
      var html = `
<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F6F1EB;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1EB;padding:32px 0;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#FDFAF6;border-radius:4px;overflow:hidden;">
    <tr><td style="background:#B8623A;padding:32px 40px;">
      <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Připomínka workshopu</p>
      <h1 style="margin:8px 0 0;font-size:26px;font-weight:400;color:#ffffff;font-family:Georgia,serif;">Zítra máte workshop 🌿</h1>
    </td></tr>
    <tr><td style="padding:40px 40px 32px;">
      <p style="margin:0 0 20px;font-size:16px;color:#6B5B4A;font-weight:300;">Dobrý den, <strong style="color:#251C14;">${name}</strong>,</p>
      <p style="margin:0 0 28px;font-size:15px;color:#6B5B4A;line-height:1.8;font-weight:300;">
        připomínám, že zítra máte workshop hypopresivní metody. Těším se na vás! ✨
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E4D8;border-left:4px solid #B8623A;border-radius:2px;margin-bottom:28px;">
        <tr><td style="padding:24px 28px;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8623A;font-weight:500;">Detail workshopu</p>
          <p style="margin:0 0 6px;font-size:15px;color:#251C14;">🕐 <strong>${wsDetails.time}</strong></p>
          <p style="margin:0;font-size:15px;color:#251C14;">📍 ${wsDetails.location}</p>
        </td></tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td style="font-size:14px;color:#6B5B4A;line-height:2;font-weight:300;padding-left:4px;">
          ⏰ Dorazte 10 minut před začátkem<br>
          🍽️ Nejezte alespoň 2 hodiny před workshopem<br>
          ${wsDetails.bring}<br>
          💧 Nezapomeňte na vodu
        </td></tr>
      </table>
      <p style="margin:0 0 12px;font-size:14px;color:#9B8B78;line-height:1.7;font-weight:300;">
        Pokud se nemůžete zúčastnit, dejte mi prosím vědět nejpozději 48 hodin předem.
      </p>
      <p style="margin:0;font-size:15px;color:#6B5B4A;line-height:1.8;">
        Těším se na vás ✨<br><br>
        <strong style="color:#251C14;">Lucie Linková</strong><br>
        <span style="font-size:13px;color:#9B8B78;">tel. 792 314 472 · <a href="https://www.bodyease.cz" style="color:#B8623A;text-decoration:none;">www.bodyease.cz</a></span>
      </p>
    </td></tr>
    <tr><td style="background:#251C14;padding:20px 40px;text-align:center;">
      <p style="margin:0;font-size:11px;color:rgba(253,250,246,0.3);letter-spacing:1px;">© 2026 Lucie Linková · bodyease.cz</p>
    </td></tr>
  </table>
  </td></tr>
</table>
</body>
</html>`;
      GmailApp.sendEmail(email, subject, '', { htmlBody: html, name: LUCIE_NAME, replyTo: LUCIE_EMAIL });
    }
  }
}


// ═══════════════════════════════════════════════════════════════
//  WORKSHOP: verificar capacidad
// ═══════════════════════════════════════════════════════════════
function checkWorkshopCapacity(date) {
  var maxCap = WS_CAPACITY[date];
  if (maxCap === undefined) return true; // fecha desconocida → dejar pasar

  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(WS_SHEET_NAME);
  if (!sheet) return true;

  var data  = sheet.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][COL_WS_DATE] === date) count++;
  }
  return count < maxCap;
}


// ═══════════════════════════════════════════════════════════════
//  WORKSHOP: detalles por fecha
// ═══════════════════════════════════════════════════════════════
function getWorkshopDetails(date) {
  if (date.indexOf('26. dubna') !== -1) {
    return {
      time:     '26. dubna 2026, 9:15–11:15',
      location: 'Studio jógy Charkovská 333/5, Praha – Vinohrady (vchod z Donská)',
      extra:    '• Po workshopu brunch v Koncept 0 (volitelně)',
      bring:    '🧘 Karimatka není nutná (k dispozici v studiu)'
    };
  }
  if (date.indexOf('13. června') !== -1) {
    return {
      time:     '13. června 2026, 9:15–11:15',
      location: 'Grébovka, Praha – venkovní prostory',
      extra:    '• Po workshopu brunch v Koncept 0 (volitelně)',
      bring:    '🧘 S sebou: karimatka (cvičíme venku)'
    };
  }
  if (date.indexOf('19. září') !== -1) {
    return {
      time:     '19. září 2026, 9:30–11:00',
      location: 'Solná jeskyně Praha (místo bude upřesněno)',
      extra:    '• Speciální prostředí solné jeskyně',
      bring:    '🧘 Karimatka není nutná'
    };
  }
  return {
    time:     date,
    location: 'Praha',
    extra:    '',
    bring:    '🧘 Pohodlné oblečení'
  };
}


// ═══════════════════════════════════════════════════════════════
//  NOTIFICACIÓN INTERNA PARA LUCIE (nueva inscripción)
// ═══════════════════════════════════════════════════════════════
function notifyLucie(name, email, slot, experience, notes) {
  var subject = '🆕 Nová přihláška: ' + name + ' – ' + slot;
  var body =
    'Nová přihláška na kurz:\n\n' +
    'Jméno: ' + name + '\n' +
    'E-mail: ' + email + '\n' +
    'Termín: ' + slot + '\n' +
    'Zkušenosti: ' + experience + '\n' +
    'Poznámka: ' + notes + '\n\n' +
    'Podívej se do Google Sheets pro přehled všech přihlášek.';

  GmailApp.sendEmail(LUCIE_EMAIL, subject, body, { name: 'Systém – bodyease.cz' });
}


// ═══════════════════════════════════════════════════════════════
//  NOTIFICACIÓN INTERNA PARA LUCIE (workshop)
// ═══════════════════════════════════════════════════════════════
function notifyLucieWorkshop(name, email, phone, date, notes) {
  var cap     = WS_CAPACITY[date] || '?';
  var sheet   = SpreadsheetApp.openById(SHEET_ID).getSheetByName(WS_SHEET_NAME);
  var current = 0;
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][COL_WS_DATE] === date) current++;
    }
  }
  var subject = '🆕 Workshop přihláška: ' + name + ' – ' + date;
  var body =
    'Nová přihláška na workshop:\n\n' +
    'Jméno: ' + name + '\n' +
    'E-mail: ' + email + '\n' +
    'Telefon: ' + phone + '\n' +
    'Termín: ' + date + '\n' +
    'Poznámka: ' + notes + '\n\n' +
    'Obsazenost: ' + current + ' / ' + cap + ' míst\n\n' +
    'Podívej se do Google Sheets pro přehled všech přihlášek.';

  GmailApp.sendEmail(LUCIE_EMAIL, subject, body, { name: 'Systém – bodyease.cz' });
}


// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
function getSlotDates(slot) {
  var dates = {
    'Úterý 16:30–17:25':  '14. dubna – 23. června 2026 (každé úterý)',
    'Úterý 17:40–18:35':  '14. dubna – 23. června 2026 (každé úterý)',
    'Středa 17:00–17:55': '15. dubna – 24. června 2026 (každou středu)',
    'Čtvrtek 7:00–7:55':  '16. dubna – 25. června 2026 (každý čtvrtek)',
    'Čtvrtek 12:15–13:10':'16. dubna – 25. června 2026 (každý čtvrtek)'
  };
  return dates[slot] || slot;
}

function formatDateCzech(dateStr) {
  var d = new Date(dateStr + 'T00:00:00');
  var days   = ['neděle','pondělí','úterý','středa','čtvrtek','pátek','sobota'];
  var months = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'];
  return days[d.getDay()] + ' ' + d.getDate() + '. ' + months[d.getMonth()] + ' ' + d.getFullYear();
}


// ═══════════════════════════════════════════════════════════════
//  SETUP — correr UNA SOLA VEZ para activar los triggers
// ═══════════════════════════════════════════════════════════════
function setup() {
  // Borrar triggers existentes para no duplicar
  ScriptApp.getProjectTriggers().forEach(function(t) {
    ScriptApp.deleteTrigger(t);
  });

  // Trigger 1: email de confirmación cuando alguien llena el form
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.openById(SHEET_ID))
    .onFormSubmit()
    .create();

  // Trigger 2: recordatorio diario kurzy (8am)
  ScriptApp.newTrigger('sendDayBeforeReminders')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .inTimezone('Europe/Prague')
    .create();

  // Trigger 3: recordatorio diario workshops (8am)
  ScriptApp.newTrigger('sendWorkshopReminderEmails')
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .inTimezone('Europe/Prague')
    .create();

  Logger.log('✅ Triggers activados correctamente.');
}
