import React from 'react';

const ImprintPage: React.FC = () => {
  return (
    <div id="page-top-content" className="container mx-auto px-4 py-8">
      <div id="top"></div> {/* Anker für Scroll-Link */}
      <h1 className="text-3xl font-bold mb-6">Impressum</h1>

      <div className="prose max-w-none">
        <p className="mb-2">Gesche Körner</p>
        <p className="mb-2">Odenwaldstraße 34</p>
        <p className="mb-6">64572 Büttelborn</p>

        <p className="mb-2">
          E-Mail: <a href="mailto:info@tiergestuetztepaedagogik.de" className="text-blue-600 hover:underline">info@tiergestuetztepaedagogik.de</a>
        </p>
        <p>
          Telefon: <a href="tel:+491732913535" className="text-blue-600 hover:underline">+49 173 2913535</a>
        </p>
      </div>
    </div>
  );
};

export default ImprintPage;