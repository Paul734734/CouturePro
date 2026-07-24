import { useState } from "react";

const utilisatrices = [
  {
    id: 1,
    nom: "Aminata Couture",
    email: "aminata@atelier.cm",
    ville: "Yaoundé",
    plan: "trimestriel",
    dateExpiration: "15 sept 2026",
    joursRestants: 96,
    statut: "actif",
    clientes: 12,
    commandes: 28,
    dateInscription: "1 mars 2026",
    initiale: "A",
    couleur: "bg-gold-100 text-gold-600",
  },
  {
    id: 2,
    nom: "Fatoumata Style",
    email: "fato@style.sn",
    ville: "Dakar",
    plan: "trimestriel",
    dateExpiration: "3 juil 2026",
    joursRestants: 22,
    statut: "actif",
    clientes: 8,
    commandes: 15,
    dateInscription: "3 avr 2026",
    initiale: "F",
    couleur: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    nom: "Nadia Broderie",
    email: "nadia.b@gmail.com",
    ville: "Abidjan",
    plan: "trimestriel",
    dateExpiration: "28 juin 2026",
    joursRestants: 5,
    statut: "grace",
    clientes: 21,
    commandes: 44,
    dateInscription: "28 janv 2026",
    initiale: "N",
    couleur: "bg-green-100 text-green-600",
  },
  {
    id: 4,
    nom: "Mariam Fashion",
    email: "mariam.f@atelier.ml",
    ville: "Bamako",
    plan: "trimestriel",
    dateExpiration: "20 juin 2026",
    joursRestants: -2,
    statut: "suspendu",
    clientes: 5,
    commandes: 9,
    dateInscription: "20 mars 2026",
    initiale: "M",
    couleur: "bg-purple-100 text-purple-600",
  },
  {
    id: 5,
    nom: "Kadiatou Atelier",
    email: "kadi@couture.gn",
    ville: "Conakry",
    plan: "essai",
    dateExpiration: "25 juin 2026",
    joursRestants: 14,
    statut: "essai",
    clientes: 2,
    commandes: 3,
    dateInscription: "25 mai 2026",
    initiale: "K",
    couleur: "bg-yellow-100 text-yellow-600",
  },
];

const statutBadge: Record<string, string> = {
  actif: "bg-green-100 text-green-700",
  grace: "bg-yellow-100 text-yellow-700",
  suspendu: "bg-red-100 text-red-700",
  essai: "bg-blue-100 text-blue-700",
};

const statutLabel: Record<string, string> = {
  actif: "Actif",
  grace: "Grâce",
  suspendu: "Suspendu",
  essai: "Essai",
};

export default function Admin() {
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [selected, setSelected] = useState<(typeof utilisatrices)[0] | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtres = ["Tous", "Actifs", "En grâce", "Suspendus", "Essai"];
  const filtered = utilisatrices
    .filter((u) => {
      if (filtreStatut === "Actifs") return u.statut === "actif";
      if (filtreStatut === "En grâce") return u.statut === "grace";
      if (filtreStatut === "Suspendus") return u.statut === "suspendu";
      if (filtreStatut === "Essai") return u.statut === "essai";
      return true;
    })
    .filter((u) =>
      u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.ville.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: utilisatrices.length,
    actifs: utilisatrices.filter((u) => u.statut === "actif").length,
    grace: utilisatrices.filter((u) => u.statut === "grace").length,
    suspendus: utilisatrices.filter((u) => u.statut === "suspendu").length,
    essai: utilisatrices.filter((u) => u.statut === "essai").length,
    revenuMensuel: utilisatrices.filter((u) => u.statut === "actif" || u.statut === "grace").length * 5000,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar admin */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 fixed h-full z-10">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
          <img src="/eureka-logo.png" alt="Eureka" className="w-9 h-9 rounded-xl object-contain" />
          <div>
            <span className="font-bold text-white text-base">Eureka</span>
            <p className="text-xs text-gray-400">Administration</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { icon: "📊", label: "Vue d'ensemble", active: true },
            { icon: "👩‍💼", label: "Utilisatrices" },
            { icon: "💳", label: "Abonnements" },
            { icon: "💰", label: "Revenus" },
            { icon: "📣", label: "Notifications" },
            { icon: "⚙️", label: "Paramètres" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                item.active ? "bg-gold-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-sm">AD</div>
            <div>
              <p className="text-sm font-semibold text-white">Administrateur</p>
              <p className="text-xs text-gray-400">admin@couturepro.app</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Panneau Admin</h1>
            <p className="text-sm text-gray-400">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-500">En ligne</span>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-6">
          {/* KPI admin */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Total inscrites</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-green-500 mt-1">+2 ce mois</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Comptes actifs</p>
              <p className="text-3xl font-bold text-green-600">{stats.actifs}</p>
              <p className="text-xs text-gray-400 mt-1">abonnements valides</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">En période grâce</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.grace}</p>
              <p className="text-xs text-gray-400 mt-1">à relancer</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Revenu mensuel</p>
              <p className="text-3xl font-bold text-gold-500">{stats.revenuMensuel.toLocaleString("fr-FR")}</p>
              <p className="text-xs text-gray-400 mt-1">FCFA estimé</p>
            </div>
          </div>

          {/* Alerte suspension imminente */}
          {stats.grace > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  {stats.grace} compte(s) en période de grâce
                </p>
                <p className="text-xs text-yellow-600 mt-0.5">
                  Ces comptes seront automatiquement suspendus dans moins de 7 jours si le paiement n'est pas reçu.
                </p>
              </div>
            </div>
          )}

          {/* Barre de recherche */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email ou ville..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300 shadow-sm"
            />
          </div>

          {/* Filtres */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filtres.map((f) => (
              <button
                key={f}
                onClick={() => setFiltreStatut(f)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  filtreStatut === f
                    ? "bg-gold-500 text-white border-gold-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gold-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Liste utilisatrices */}
          <div className="space-y-3">
            {filtered.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${u.couleur}`}>
                    {u.initiale}
                  </div>

                  {/* Info principale */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{u.nom}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                        <p className="text-xs text-gray-400">📍 {u.ville}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statutBadge[u.statut]}`}>
                        {statutLabel[u.statut]}
                      </span>
                    </div>

                    {/* Stats rapides */}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs text-gray-500">👩 {u.clientes} clientes</span>
                      <span className="text-xs text-gray-500">📋 {u.commandes} commandes</span>
                      <span className="text-xs text-gray-400">Inscrite le {u.dateInscription}</span>
                    </div>

                    {/* Abonnement */}
                    <div className={`mt-2 flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-lg w-fit ${
                      u.joursRestants <= 0
                        ? "bg-red-50 text-red-600"
                        : u.joursRestants <= 7
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-green-50 text-green-600"
                    }`}>
                      <span>
                        {u.joursRestants <= 0
                          ? `⛔ Expiré il y a ${Math.abs(u.joursRestants)} jour(s)`
                          : u.joursRestants <= 7
                          ? `⚠️ Expire dans ${u.joursRestants} jour(s)`
                          : `✓ Expire le ${u.dateExpiration}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-gray-50">
                  <button
                    onClick={() => { setSelected(u); setShowDetail(true); }}
                    className="flex-1 py-2.5 text-xs text-gray-500 font-medium hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    👁 Détails
                  </button>
                  <div className="w-px bg-gray-100" />
                  {u.statut === "suspendu" ? (
                    <button className="flex-1 py-2.5 text-xs text-green-600 font-semibold hover:bg-green-50 flex items-center justify-center gap-1.5 transition-colors">
                      ✅ Réactiver
                    </button>
                  ) : (
                    <button className="flex-1 py-2.5 text-xs text-gold-600 font-semibold hover:bg-gold-50 flex items-center justify-center gap-1.5 transition-colors">
                      🔄 Renouveler
                    </button>
                  )}
                  <div className="w-px bg-gray-100" />
                  {u.statut !== "suspendu" ? (
                    <button className="flex-1 py-2.5 text-xs text-red-500 font-medium hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors">
                      ⛔ Suspendre
                    </button>
                  ) : (
                    <button className="flex-1 py-2.5 text-xs text-gray-400 font-medium hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors">
                      🗑 Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Section abonnements - config */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">⚙️ Configuration abonnements</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">Prix trimestriel</p>
                  <p className="text-xs text-gray-400">Facturation tous les 3 mois</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={15000} className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right font-medium focus:outline-none focus:ring-2 focus:ring-gold-300" />
                  <span className="text-xs text-gray-400">FCFA</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">Durée période de grâce</p>
                  <p className="text-xs text-gray-400">Jours après expiration avant blocage</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={7} className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right font-medium focus:outline-none focus:ring-2 focus:ring-gold-300" />
                  <span className="text-xs text-gray-400">jours</span>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">Durée essai gratuit</p>
                  <p className="text-xs text-gray-400">Jours d'essai pour les nouveaux comptes</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" defaultValue={30} className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right font-medium focus:outline-none focus:ring-2 focus:ring-gold-300" />
                  <span className="text-xs text-gray-400">jours</span>
                </div>
              </div>
            </div>
            <button className="mt-4 w-full bg-gold-500 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-gold-600 transition-colors">
              Enregistrer les paramètres
            </button>
          </div>
        </div>
      </main>

      {/* Modal détail utilisatrice */}
      {showDetail && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Détails du compte</h2>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            {/* Profil */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${selected.couleur}`}>
                {selected.initiale}
              </div>
              <div>
                <p className="font-bold text-gray-900">{selected.nom}</p>
                <p className="text-sm text-gray-500">{selected.email}</p>
                <p className="text-sm text-gray-400">📍 {selected.ville}</p>
              </div>
            </div>

            {/* Détails abonnement */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Abonnement</h3>
              {[
                { label: "Plan", value: "Trimestriel (15 000 FCFA/3 mois)" },
                { label: "Date expiration", value: selected.dateExpiration },
                { label: "Statut", value: statutLabel[selected.statut] },
                { label: "Jours restants", value: selected.joursRestants > 0 ? `${selected.joursRestants} jours` : `Expiré` },
                { label: "Date inscription", value: selected.dateInscription },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Statistiques */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Activité</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gold-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gold-600">{selected.clientes}</p>
                  <p className="text-xs text-gray-500">Clientes</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selected.commandes}</p>
                  <p className="text-xs text-gray-500">Commandes</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {selected.statut !== "suspendu" ? (
                <button className="py-2.5 text-sm text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-50 transition-colors">
                  ⛔ Suspendre
                </button>
              ) : (
                <button className="py-2.5 text-sm text-green-600 border border-green-200 rounded-xl font-medium hover:bg-green-50 transition-colors">
                  ✅ Réactiver
                </button>
              )}
              <button className="py-2.5 text-sm text-gold-600 bg-gold-500 text-white rounded-xl font-semibold hover:bg-gold-600 transition-colors">
                🔄 Renouveler
              </button>
            </div>

            <button
              onClick={() => setShowDetail(false)}
              className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
