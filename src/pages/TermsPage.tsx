import React from 'react';

const TermsPage = () => {
 return (
    <> {/* JSX-Fragment als übergeordnetes Element */}
      <div id="top"></div> {/* Anchor point */}
      <div id="page-top-content" className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Nutzungsbedingungen für Wolkenkrümel</h1>

        <p>
          Willkommen bei Wolkenkrümel. Bitte lesen Sie diese Nutzungsbedingungen sorgfältig durch, bevor Sie unsere Website und Dienste nutzen.
        </p>

        <h2>1. Geltungsbereich und Zustimmung</h2>
        <p>
          Mit dem Zugriff auf die Dienste von Wolkenkrümel oder deren Nutzung erklären Sie sich mit diesen Nutzungsbedingungen einverstanden. Wenn Sie diesen Bedingungen nicht zustimmen, dürfen Sie die Dienste nicht nutzen.
        </p>

        <h2>2. Registrierung und Nutzerkonto</h2>
        <p>
          Für den Zugriff auf bestimmte Funktionen von Wolkenkrümel ist eine Registrierung erforderlich. Sie verpflichten sich, bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen und Ihre Zugangsdaten sicher aufzubewahren. Für sämtliche Aktivitäten in Ihrem Nutzerkonto sind Sie selbst verantwortlich.
        </p>

        <h2>3. Datenschutz</h2>
        <p>
          Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Informationen zur Erhebung, Verarbeitung und Nutzung Ihrer Daten finden Sie in unserer <a href="/privacy">Datenschutzerklärung</a>. Mit der Nutzung unserer Dienste stimmen Sie den dort beschriebenen Praktiken zu.
        </p>

        <h2>4. Abonnements und kostenpflichtige Inhalte</h2>
        <p>
          Wolkenkrümel bietet sowohl kostenfreie Inhalte als auch erweiterte Inhalte im Rahmen eines kostenpflichtigen Premium-Abonnements an. Mit Abschluss eines Abonnements verpflichten Sie sich zur Zahlung der angegebenen Gebühren. Das Abonnement verlängert sich automatisch, sofern es nicht rechtzeitig gekündigt wird. Die Kündigung kann über Ihr Nutzerkonto erfolgen.
        </p>

        <h2>5. Verantwortliches Nutzerverhalten</h2>
        <p>
          Sie verpflichten sich, Wolkenkrümel nicht für rechtswidrige oder missbräuchliche Zwecke zu verwenden. Inhalte, die Sie über unsere Plattform hochladen oder teilen, dürfen keine Rechte Dritter verletzen und müssen den geltenden Gesetzen entsprechen.
        </p>

        <h2>6. Urheberrecht und geistiges Eigentum</h2>
        <p>
          Alle auf Wolkenkrümel veröffentlichten Inhalte – einschließlich Texte, Bilder, Logos, Videos und Software – sind urheberrechtlich geschützt. Ohne unsere ausdrückliche Zustimmung dürfen diese Inhalte weder kopiert, verbreitet noch kommerziell genutzt werden.
        </p>

        <h2>7. Haftungsausschluss</h2>
        <p>
          Die Inhalte von Wolkenkrümel dienen ausschließlich zu Informations- und Trainingszwecken im Bereich Hundetraining und ersetzen keine professionelle Beratung. Die Nutzung erfolgt auf eigenes Risiko. Eine Haftung für Schäden, die aus der Nutzung unserer Inhalte entstehen, ist – soweit gesetzlich zulässig – ausgeschlossen.
        </p>

        <h2>8. Änderungen der Nutzungsbedingungen</h2>
        <p>
          Wolkenkrümel behält sich das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Über wesentliche Änderungen informieren wir Sie rechtzeitig per E-Mail oder durch Hinweise auf unserer Website.
        </p>

        <h2>9. Kündigung des Nutzerkontos</h2>
        <p>
          Wir behalten uns das Recht vor, Nutzerkonten bei Verstößen gegen diese Nutzungsbedingungen mit sofortiger Wirkung zu sperren oder zu löschen. Nutzer können ihr Konto jederzeit über die Kontoeinstellungen oder per E-Mail an uns kündigen.
        </p>

        <h2>10. Kontakt</h2>
        <p>
          Bei Fragen zu diesen Nutzungsbedingungen erreichen Sie uns per E-Mail unter: info@tiergestuetztepaedagogik.de
        </p>

        <p className="font-medium mt-8">
          Letzte Aktualisierung: 1. Juni 2025
        </p>
      </div>
    </> // Ende des Fragments
 );
};

export default TermsPage;