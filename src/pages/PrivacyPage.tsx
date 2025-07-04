import React from 'react';

const PrivacyPage = () => {
  return (
    <div id="page-top-content"> {/* ID added for ScrollToTop */}
      <div id="top"></div> {/* ANKER-DIV HIER HINZUGEFÜGT */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Datenschutzerklärung für Wolkenkrümel</h1>
        <p>Letzte Aktualisierung: 1. Juni 2025</p>
      </div>
      <div className="prose prose-primary max-w-none dark:prose-invert">
        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
          Wolkenkrümel<br />
          Gesche Körner<br />
          Odenwaldstraße 34<br />
          64572 Büttelborn<br />
          E-Mail: <a href="mailto:info@tiergestuetztepaedagogik.de">info@tiergestuetztepaedagogik.de</a><br />
          Telefon: <a href="tel:+491732913535">+49 173 2913535</a>
        </p>

        <h2>2. Zugriffsdaten und Hosting</h2>
        <p>
          Beim Besuch unserer Website werden automatisch folgende Daten erfasst:
        </p>
        <ul>
          <li>IP-Adresse</li>
          <li>Datum und Uhrzeit der Anfrage</li>
          <li>Zeitzonendifferenz zur Greenwich Mean Time (GMT)</li>
          <li>Inhalt der Anforderung (konkrete Seite)</li>
          <li>Zugriffsstatus/HTTP-Statuscode</li>
          <li>jeweils übertragene Datenmenge</li>
          <li>Website, von der die Anforderung kommt</li>
          <li>Browser, Betriebssystem und dessen Oberfläche</li>
        </ul>
        <p>
          Diese Daten werden zur Gewährleistung eines störungsfreien Betriebs und zur Verbesserung unseres Angebots erhoben und temporär gespeichert. Eine Zusammenführung dieser Daten mit anderen Datenquellen erfolgt nicht.
        </p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</p>

        <h2>3. Registrierung und Nutzerkonto</h2>
        <p>Wenn Sie sich bei Wolkenkrümel registrieren, verarbeiten wir die folgenden personenbezogenen Daten:</p>
        <ul>
          <li>Vorname, Nachname (optional)</li>
          <li>E-Mail-Adresse</li>
          <li>Passwort (verschlüsselt gespeichert)</li>
          <li>ggf. Angaben zum Hund (Name, Alter, Rasse etc.)</li>
        </ul>
        <p>Diese Daten benötigen wir zur Einrichtung und Verwaltung Ihres Nutzerkontos.</p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</p>

        <h2>4. Nutzung der Dienste (inkl. Premium-Bereich)</h2>
        <p>Bei Nutzung des kostenpflichtigen Premium-Bereichs verarbeiten wir zusätzlich:</p>
        <ul>
          <li>Zahlungsdaten (z.&nbsp;B. über Stripe/PayPal; keine Speicherung bei uns)</li>
          <li>Rechnungsdaten</li>
        </ul>
        <p>
          Zahlungsabwicklungen erfolgen über externe Dienstleister, die eigenständig datenschutzrechtlich verantwortlich sind. Es gelten deren Datenschutzbestimmungen.
        </p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO</p>

        <h2>5. Cookies und Tracking-Technologien</h2>
        <p>Wir verwenden Cookies, um unsere Website nutzerfreundlich zu gestalten. Hierbei unterscheiden wir zwischen:</p>
        <ul>
          <li>Technisch notwendigen Cookies (z.&nbsp;B. Session-Cookies für Login)</li>
          <li>Analyse-Cookies (z.&nbsp;B. Google Analytics) Diese werden nur mit Ihrer Einwilligung gesetzt.</li>
        </ul>
        <p>Sie können Ihre Cookie-Einstellungen jederzeit über unser Consent-Tool ändern.</p>
        <p>Rechtsgrundlage:</p>
        <ul>
          <li>Notwendig: Art. 6 Abs. 1 lit. f DSGVO</li>
          <li>Analyse: Art. 6 Abs. 1 lit. a DSGVO</li>
        </ul>

        <h2>6. Kontaktaufnahme</h2>
        <p>
          Bei Kontaktaufnahme über E-Mail oder Kontaktformular verarbeiten wir Ihre Angaben zur Bearbeitung Ihrer Anfrage. Diese Daten werden nicht ohne Ihre Einwilligung weitergegeben.
        </p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b oder f DSGVO</p>

        <h2>7. Speicherdauer</h2>
        <p>
          Wir speichern personenbezogene Daten nur so lange, wie dies zur Erfüllung der jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen dies verlangen. Danach werden die Daten gelöscht.
        </p>

        <h2>8. Ihre Rechte</h2>
        <p>Sie haben jederzeit das Recht auf:</p>
        <ul>
          <li>Auskunft (Art.&nbsp;15 DSGVO)</li>
          <li>Berichtigung (Art.&nbsp;16 DSGVO)</li>
          <li>Löschung (Art.&nbsp;17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art.&nbsp;18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art.&nbsp;20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art.&nbsp;21 DSGVO)</li>
          <li>Widerruf einer Einwilligung (Art.&nbsp;7 Abs.&nbsp;3 DSGVO)</li>
        </ul>
        <p>Bitte richten Sie Ihre Anfrage an: info@tiergestuetztepaedagogik.de</p>

        <h2>9. Beschwerderecht</h2>
        <ul>
          <li>
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, wenn Sie der Meinung sind, dass Ihre Daten unrechtmäßig verarbeitet werden.
            Zuständig ist z.&nbsp;B. der Landesdatenschutzbeauftragte Ihres Wohnortes oder der des Unternehmenssitzes.
          </li>
        </ul>

        <h2>10. Änderungen dieser Datenschutzerklärung</h2>
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung jederzeit zu aktualisieren, um sie an geänderte Rechtslagen oder technische Entwicklungen anzupassen.
        </p>

        <h2>10. Kontakt zum Datenschutzbeauftragten</h2>
        <p>Bei Fragen zum Datenschutz können Sie uns unter info@tiergestuetztepaedagogik.de kontaktieren.</p>
      </div>
    </div>
  );
};

export default PrivacyPage;