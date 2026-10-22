/* =====================================================================
   TARIEVEN VOOR DE PRIJSINDICATIE IN DE 3D-ONTWERPTOOL
   ---------------------------------------------------------------------
   Pas hier jullie eigen prijzen aan. Alle bedragen zijn in euro's,
   exclusief btw. De tool toont altijd "indicatie"; de offerte is leidend.

   LET OP: de bedragen hieronder zijn VOORBEELDWAARDEN.
   Vervang ze door jullie eigen tarieven voordat de site live gaat,
   of zet toonPrijzen op false om de prijsindicatie te verbergen.
   ===================================================================== */
window.IG_TARIEVEN = {
  toonPrijzen: false,
  btwPercentage: 21,

  // Basisprijs per kledingstuk (per stuk, excl. btw)
  kledingstuk: {
    tshirt: 8.50,
    polo:   17.50,
    hoodie: 29.50,
    qzip:   27.50
  },

  // Per bedrukkingspositie
  techniek: {
    // DTF-transfer: prijs per cm² (breedte × hoogte), met een minimum per positie
    dtf:  { perCm2: 0.012, minimumPerStuk: 2.50, opstartkosten: 0 },
    // Zeefdruk: per drukkleur per stuk, plus eenmalige zeefkosten per kleur
    zeef: { perKleurPerStuk: 0.85, zeefPerKleur: 30.00, minimumAantal: 25 },
    // Borduren: prijs per 1.000 steken; aantal steken wordt geschat uit het oppervlak
    bord: { per1000Steken: 0.85, stekenPerCm2: 110, minimumPerStuk: 4.50, programmeerkosten: 25.00 }
  },

  // Naam en nummer per speler (per stuk)
  speler: { naam: 4.00, nummer: 4.00 },

  // Staffelkorting op het totaal, op basis van het aantal kledingstukken
  staffel: [
    { vanaf: 1,   korting: 0 },
    { vanaf: 25,  korting: 5 },
    { vanaf: 50,  korting: 10 },
    { vanaf: 100, korting: 15 }
  ]
};
