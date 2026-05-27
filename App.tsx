import { useState, useEffect, useCallback } from "react";
import {
  Training, NewsItem, GalleryItem, Registration,
  SiteContent, OnlineExam, ExamSubmission
} from "./data/defaultData";
import {
  initializeApp,
  loadRegistrations, saveRegistrations,
  loadTrainings,    saveTrainings,
  loadNews,         saveNews,
  loadGallery,      saveGallery,
  loadExams,        saveExams,
  loadSubmissions,  saveSubmissions,
  loadSiteContent,  saveSiteContent,
  addRegistration,
  KEYS,
} from "./utils/persistenceManager";
import Navbar      from "./components/Navbar";
import Hero        from "./components/Hero";
import About       from "./components/About";
import Trainings   from "./components/Trainings";
import Gallery     from "./components/Gallery";
import Testimonials from "./components/Testimonials";
import News        from "./components/News";
import Contact     from "./components/Contact";
import RegisterModal from "./components/RegisterModal";
import AdminPanel  from "./components/AdminPanel";
import WhatsAppBubble from "./components/WhatsAppBubble";
import AdminLogin  from "./components/AdminLogin";
import StudentPortal from "./components/StudentPortal";
import Logo        from "./components/Logo";
import {
  MapPin, Phone, Mail, ArrowRight, ShieldCheck, Clock
} from "lucide-react";

// ── Initialisation unique au démarrage ───────────────────────────────────────
initializeApp();

export default function App() {
  // ── Navigation & UI ───────────────────────────────────────────────────────
  const [currentTab,       setCurrentTab]       = useState<string>("home");
  const [darkMode,         setDarkMode]         = useState<boolean>(() =>
    localStorage.getItem(KEYS.THEME) === "dark"
  );
  const [isAdminLoggedIn,  setIsAdminLoggedIn]  = useState<boolean>(() =>
    localStorage.getItem(KEYS.ADMIN_SESSION) === "true"
  );
  const [isRegisterOpen,   setIsRegisterOpen]   = useState<boolean>(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);

  // ── Data states — chargés via le gestionnaire de persistance ─────────────
  const [registrations, _setRegistrations] = useState<Registration[]>(() => loadRegistrations());
  const [trainings,     _setTrainings]     = useState<Training[]>  (() => loadTrainings());
  const [newsItems,     _setNewsItems]     = useState<NewsItem[]>  (() => loadNews());
  const [galleryItems,  _setGalleryItems]  = useState<GalleryItem[]>(() => loadGallery());
  const [siteContent,   _setSiteContent]  = useState<SiteContent> (() => loadSiteContent());
  const [exams,         _setExams]         = useState<OnlineExam[]>(() => loadExams());
  const [submissions,   _setSubmissions]   = useState<ExamSubmission[]>(() => loadSubmissions());

  // ── Setter des inscriptions : TOUJOURS fusionner, JAMAIS écraser ─────────
  const setRegistrations = useCallback((regs: Registration[]) => {
    // 1. Fusionner avec le localStorage (source de vérité)
    saveRegistrations(regs);
    // 2. Relire depuis le localStorage pour refléter la vraie donnée
    _setRegistrations(loadRegistrations());
  }, []);

  const setTrainings = useCallback((t: Training[]) => {
    saveTrainings(t);
    _setTrainings(t);
  }, []);

  const setNewsItems = useCallback((n: NewsItem[]) => {
    saveNews(n);
    _setNewsItems(n);
  }, []);

  const setGalleryItems = useCallback((g: GalleryItem[]) => {
    saveGallery(g);
    _setGalleryItems(loadGallery()); // Relit pour garantir les photos réelles
  }, []);

  const setSiteContent = useCallback((s: SiteContent) => {
    saveSiteContent(s);
    _setSiteContent(s);
  }, []);

  const setExams = useCallback((e: OnlineExam[]) => {
    saveExams(e);
    _setExams(e);
  }, []);

  const setSubmissions = useCallback((s: ExamSubmission[]) => {
    saveSubmissions(s);
    _setSubmissions(s);
  }, []);

  // ── Setter spécial pour les inscriptions — fusion intelligente ────────────
  /**
   * Quand RegisterModal crée une nouvelle inscription, on l'ajoute
   * sans toucher aux autres étudiants déjà inscrits.
   */
  const handleRegisterSuccess = useCallback((newReg: Registration) => {
    const updated = addRegistration(newReg);
    _setRegistrations(updated);
  }, []);



  // ── Thème ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(KEYS.THEME, darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // ── Synchronisation périodique (toutes les 30s) ───────────────────────────
  // Relit le localStorage pour récupérer les modifications faites par
  // d'autres composants (ExamStudentView, StudentProfileAdmin, etc.)
  useEffect(() => {
    const sync = () => {
      _setRegistrations(loadRegistrations());
      _setSubmissions(loadSubmissions());
    };
    const interval = setInterval(sync, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Synchronisation sur focus (retour à l'onglet) ─────────────────────────
  useEffect(() => {
    const onFocus = () => {
      _setRegistrations(loadRegistrations());
      _setSubmissions(loadSubmissions());
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ── Handlers Navigation ───────────────────────────────────────────────────
  const handleRegisterClick = (trainingId?: string) => {
    setSelectedTrainingId(trainingId || null);
    setIsRegisterOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem(KEYS.ADMIN_SESSION, "true");
    setCurrentTab("admin");
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem(KEYS.ADMIN_SESSION);
    setCurrentTab("home");
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-300 flex flex-col justify-between">

        {/* Navigation */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          openAdminLogin={() => setIsAdminLoginOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={handleLogout}
        />

        {/* Pages */}
        <main className="flex-grow">

          {/* ── ACCUEIL ─────────────────────────────────────────────────── */}
          {currentTab === "home" && (
            <div className="animate-fadeIn">
              <Hero
                siteContent={siteContent}
                onRegisterClick={() => handleRegisterClick()}
                onExploreClick={() => setCurrentTab("trainings")}
              />

              {/* Stats */}
              <section className="py-12 bg-sky-900 text-white border-y border-sky-850">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div className="space-y-1">
                    <p className="text-4xl font-extrabold font-serif text-amber-400">1 500+</p>
                    <p className="text-xs uppercase font-semibold text-sky-200">Étudiants Diplômés</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-extrabold font-serif text-amber-400">95%</p>
                    <p className="text-xs uppercase font-semibold text-sky-200">Taux d'insertion Pro</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-extrabold font-serif text-amber-400">7+</p>
                    <p className="text-xs uppercase font-semibold text-sky-200">Filières Pratiques</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-extrabold font-serif text-amber-400">100%</p>
                    <p className="text-xs uppercase font-semibold text-sky-200">Agréé par l'État</p>
                  </div>
                </div>
              </section>

              <About siteContent={siteContent} onExploreClick={() => setCurrentTab("trainings")} />

              {/* Formations populaires */}
              <section className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                  <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">Formations d'Excellence</span>
                    <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white font-serif">Nos Filières les Plus Populaires</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-amber-500 mx-auto rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {trainings.slice(0, 3).map((t) => (
                      <div key={t.id} className="group bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                        <div className="relative h-52 overflow-hidden">
                          <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs">
                            {t.price.toLocaleString()} FCFA
                          </div>
                        </div>
                        <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                          <div className="space-y-2">
                            <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">{t.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">{t.description}</p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button onClick={() => { setCurrentTab("trainings"); window.scrollTo({ top: 0 }); }}
                              className="flex-1 py-2 bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-xl hover:bg-sky-50 transition-colors">
                              Détails
                            </button>
                            <button onClick={() => handleRegisterClick(t.id)}
                              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all">
                              S'inscrire
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center pt-4">
                    <button onClick={() => setCurrentTab("trainings")}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-md transition-colors">
                      Voir tous nos programmes <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </section>

              <Testimonials />

              {/* Actualités */}
              <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                  <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">Actualités</span>
                    <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white font-serif">Dernières Annonces</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-amber-500 mx-auto rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {newsItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <img src={item.image} alt={item.title} className="w-full h-44 object-cover" />
                        <div className="p-5 space-y-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                            <Clock className="w-3.5 h-3.5 text-sky-500" /> {item.date}
                          </div>
                          <h3 className="font-serif font-bold text-base text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">{item.title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2">{item.excerpt}</p>
                          <button onClick={() => { setCurrentTab("news"); window.scrollTo({ top: 0 }); }}
                            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline pt-2 inline-block">
                            Lire l'article →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <Contact siteContent={siteContent} onRegisterClick={() => handleRegisterClick()} />
            </div>
          )}

          {/* ── AUTRES PAGES ─────────────────────────────────────────────── */}
          {currentTab === "about" && (
            <div className="animate-fadeIn">
              <About siteContent={siteContent} onExploreClick={() => setCurrentTab("trainings")} />
            </div>
          )}

          {currentTab === "trainings" && (
            <div className="animate-fadeIn">
              <Trainings trainings={trainings} onRegisterClick={handleRegisterClick} />
            </div>
          )}

          {currentTab === "gallery" && (
            <div className="animate-fadeIn">
              <Gallery galleryItems={galleryItems} />
            </div>
          )}

          {currentTab === "news" && (
            <div className="animate-fadeIn">
              <News newsItems={newsItems} />
            </div>
          )}

          {currentTab === "contact" && (
            <div className="animate-fadeIn">
              <Contact siteContent={siteContent} onRegisterClick={() => handleRegisterClick()} />
            </div>
          )}

          {/* ── ESPACE ÉTUDIANT ───────────────────────────────────────────── */}
          {currentTab === "student" && (
            <StudentPortal
              registrations={registrations}
              setRegistrations={(regs) => {
                // Fusion intelligente → jamais d'écrasement
                setRegistrations(regs);
              }}
              exams={exams}
              onBack={() => setCurrentTab("home")}
            />
          )}

          {/* ── PANEL ADMIN ───────────────────────────────────────────────── */}
          {currentTab === "admin" && isAdminLoggedIn && (
            <div className="animate-fadeIn">
              <AdminPanel
                trainings={trainings}
                setTrainings={setTrainings}
                newsItems={newsItems}
                setNewsItems={setNewsItems}
                galleryItems={galleryItems}
                setGalleryItems={setGalleryItems}
                siteContent={siteContent}
                setSiteContent={setSiteContent}
                registrations={registrations}
                setRegistrations={setRegistrations}
                exams={exams}
                setExams={setExams}
                submissions={submissions}
                setSubmissions={setSubmissions}
              />
            </div>
          )}
        </main>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-xl p-1 shadow-md flex-shrink-0">
                    <Logo size={56} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">Douala — Ndogbong (Baba Hotel)</p>
                    <p className="text-[9px] italic text-amber-400 font-semibold mt-0.5">"L'école des Maîtres"</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  L'Institut de Formation Professionnelle de référence à Douala. Transformez votre passion en un métier d'avenir.
                </p>
                <div className="inline-flex items-center gap-1.5 text-[10px] bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-amber-400 font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> Agréé par le Minefop Cameroun
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif font-bold text-white text-sm">Filières Populaires</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li><button onClick={() => { setCurrentTab("trainings"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Pâtisserie & Cake Design</button></li>
                  <li><button onClick={() => { setCurrentTab("trainings"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Cuisine Gastronomique & Traiteur</button></li>
                  <li><button onClick={() => { setCurrentTab("trainings"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Gestion Hôtelière Premium</button></li>
                  <li><button onClick={() => { setCurrentTab("trainings"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Management & Création d'Affaires</button></li>
                  <li><button onClick={() => { setCurrentTab("trainings"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Langues étrangères intensives</button></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-serif font-bold text-white text-sm">Navigation</h4>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li><button onClick={() => { setCurrentTab("home"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Accueil</button></li>
                  <li><button onClick={() => { setCurrentTab("about"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Qui sommes-nous</button></li>
                  <li><button onClick={() => { setCurrentTab("gallery"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Galerie Activités</button></li>
                  <li><button onClick={() => { setCurrentTab("news"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Actualités & Événements</button></li>
                  <li><button onClick={() => { setCurrentTab("student"); window.scrollTo({ top: 0 }); }} className="hover:text-amber-400 transition-colors">Espace Étudiant</button></li>
                </ul>
              </div>

              <div className="space-y-4 text-xs text-slate-400">
                <h4 className="font-serif font-bold text-white text-sm">Secrétariat</h4>
                <div className="space-y-3">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-sky-500 flex-shrink-0" />
                    <span>{siteContent.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-500" />
                    <span>{siteContent.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-500" />
                    <span className="select-all">{siteContent.email}</span>
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-8 border-t border-slate-800 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} IFPCAMSHG Douala. Tous droits réservés.</p>
              <div className="flex gap-4">
                <button onClick={() => setIsAdminLoginOpen(true)} className="hover:text-amber-500 transition-colors text-[10px] uppercase font-bold tracking-wider">
                  Accès Administration sécurisé
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* ── MODALS ────────────────────────────────────────────────────── */}
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          trainings={trainings}
          selectedTrainingId={selectedTrainingId}
          onRegisterSuccess={handleRegisterSuccess}
        />

        <AdminLogin
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Bouton WhatsApp flottant */}
        <WhatsAppBubble whatsappNumber={siteContent.whatsapp} />

      </div>
    </div>
  );
}
