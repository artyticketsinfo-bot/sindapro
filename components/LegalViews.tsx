
import React from 'react';

export const PrivacyView: React.FC = () => (
  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-4xl mx-auto animate-fadeIn leading-relaxed">
    <h1 className="text-3xl font-black text-blue-950 mb-8">Normativa sulla Privacy</h1>
    
    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">1. Informativa sul trattamento dei dati</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Gestione Sindacale si impegna a proteggere la privacy degli utenti e dei loro associati. Ai sensi del Regolamento (UE) 2016/679 (GDPR), questa informativa descrive come raccogliamo, utilizziamo e proteggiamo i dati personali.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">2. Tipologia di dati raccolti</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Raccogliamo dati anagrafici degli operatori (nome, email, sede) e dati degli iscritti sindacali (codice fiscale, telefono, stato quota) inseriti dagli operatori stessi. La piattaforma funge da Responsabile del Trattamento per i dati degli iscritti.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">3. Finalità del trattamento</h2>
      <ul className="list-disc list-inside text-gray-600 text-sm space-y-2">
        <li>Erogazione dei servizi di gestione amministrativa sindacale.</li>
        <li>Monitoraggio delle scadenze legali e delle pratiche.</li>
        <li>Comunicazioni di servizio e alert di sistema.</li>
        <li>Sicurezza e prevenzione delle frodi.</li>
      </ul>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">4. Conservazione dei dati</h2>
      <p className="text-gray-600 mb-4 text-sm">
        I dati vengono conservati per il tempo strettamente necessario all'erogazione del servizio o fino alla richiesta di cancellazione da parte del Titolare (l'amministratore della sede). Tutti i dati sono criptati e ospitati su server sicuri all'interno dell'UE.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">5. Diritti dell'utente</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Gli utenti hanno il diritto di accedere, rettificare o cancellare i propri dati, nonché di limitarne il trattamento o opporvisi. Le richieste possono essere inviate al nostro servizio di supporto.
      </p>
    </section>

    <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
      <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Contatti Titolare</p>
      <p className="text-sm text-gray-700"><strong>Gestione Sindacale S.r.l.</strong><br/>Via delle Istituzioni, 1 - Roma (RM)<br/>Email: privacy@gestionesindacale.it</p>
    </div>
  </div>
);

export const TermsView: React.FC = () => (
  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 max-w-4xl mx-auto animate-fadeIn leading-relaxed">
    <h1 className="text-3xl font-black text-blue-950 mb-8">Termini di Servizio</h1>
    
    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">1. Condizioni di utilizzo</h2>
      <p className="text-gray-600 mb-4 text-sm">
        L'accesso e l'uso della piattaforma Gestione Sindacale sono soggetti ai presenti termini. L'utente si impegna a utilizzare il sistema esclusivamente per finalità lecite legate all'attività sindacale.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">2. Responsabilità dell'utente</h2>
      <p className="text-gray-600 mb-4 text-sm">
        L'utente è l'unico responsabile della veridicità dei dati inseriti e della custodia delle proprie credenziali di accesso. È vietato l'uso della piattaforma da parte di personale non autorizzato dalla sede sindacale.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">3. Limitazioni di responsabilità</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Gestione Sindacale non risponde di eventuali perdite di dati dovute a negligenza dell'utente o a interruzioni di servizio indipendenti dalla propria volontà. Il software viene fornito "così com'è" senza garanzie implicite di idoneità a scopi specifici non dichiarati.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">4. Proprietà del software</h2>
      <p className="text-gray-600 mb-4 text-sm">
        Ogni diritto di proprietà intellettuale relativo alla piattaforma, al design e al codice sorgente appartiene esclusivamente a Gestione Sindacale S.r.l. È vietata la riproduzione o la decompilazione del software.
      </p>
    </section>

    <section className="mb-8">
      <h2 className="text-xl font-bold text-blue-900 mb-4">5. Eliminazione dei dati</h2>
      <p className="text-gray-600 mb-4 text-sm">
        In caso di cessazione del servizio, l'utente avrà 30 giorni per esportare i propri dati. Trascorso tale termine, i dati potrebbero essere permanentemente rimossi dai nostri sistemi di produzione.
      </p>
    </section>

    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
      <p className="text-xs text-gray-400">Ultimo aggiornamento: 20 Maggio 2024</p>
    </div>
  </div>
);
