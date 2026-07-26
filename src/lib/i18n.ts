import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      header: {
        login: "Sign in",
        menu: "User Menu",
        account: "Account",
        languages: "Languages",
        logout: "Log out",
        backHome: "Back to home",
      },
      hero: {
        title: "What do you want to create today?",
        subtitle: "Turn your ideas into complete web applications in seconds with AI.",
        promptPlaceholder: "Describe the website or app you want to build...",
        generate: "Generate",
        tryIdeas: "Or try one of these ideas:",
      },
      auth: {
        welcome: "Welcome to AXIA",
        subtitle: "Sign in with Google to access your creations and start building.",
        continueGoogle: "Continue with Google",
        signingIn: "Signing in...",
        acceptTerms1: "I accept the ",
        termsLink: "Terms and Conditions",
        acceptTerms2: " and the ",
        privacyLink: "Privacy Policy",
        acceptTerms3: " of AXIA.",
        errorTerms: "You must accept the Terms and Conditions to continue.",
      },
      account: {
        title: "My AXIA Account",
        userDefault: "AXIA User",
        statusLabel: "Account status",
        statusActive: "Active",
        memberSince: "Member since",
        confirmLogoutTitle: "Log out?",
        confirmLogoutText: "Are you sure you want to log out of your AXIA account?",
        cancel: "Cancel",
        accept: "Confirm",
        loggingOut: "Logging out...",
      },
      language: {
        title: "Select language",
      },
      chips: {
        coffeeTitle: "Coffee Shop",
        coffeePrompt:
          "Create a modern website for an artisanal coffee shop with an interactive menu, specialty gallery, and location map.",
        schoolTitle: "School Project",
        schoolPrompt:
          "Design an educational portal for school projects with homework submission, study resources, and exam schedule.",
        ecommerceTitle: "E-Commerce",
        ecommercePrompt:
          "Build an elegant online store with product catalog, shopping cart, and responsive checkout layout.",
        restaurantTitle: "Restaurant",
        restaurantPrompt:
          "Design an attractive page for a gourmet restaurant with interactive menu and online table reservation form.",
        mobileAppTitle: "Mobile App",
        mobileAppPrompt:
          "Create an interactive landing page to showcase a mobile app with screenshots, feature breakdown, and download links.",
        dashboardTitle: "SaaS Dashboard",
        dashboardPrompt:
          "Design a business control panel with real-time metrics, interactive performance charts, and data tables.",
        musicTitle: "Music & Audio",
        musicPrompt:
          "Create a music and podcast streaming platform with an interactive player, lyrics view, and playlists.",
        eventsTitle: "Event Manager",
        eventsPrompt:
          "Design a conference and event website with speaker schedule, ticket purchasing, and live countdown timer.",
        fitnessTitle: "Fitness Tracker",
        fitnessPrompt:
          "Build a workout and fitness tracking app to log daily routines, calorie burn, and weekly progress charts.",
        portfolioTitle: "Creative Portfolio",
        portfolioPrompt:
          "Create a professional portfolio for designers and developers with featured project showreels and a contact form.",
      },
      promptIdeas: [
        "Create an e-commerce for artisanal coffees...",
        "A SaaS dashboard for social media analytics...",
        "An interactive landing page for a mobile app...",
        "A restaurant website with online reservations...",
        "A fitness tracker with real-time charts...",
      ],
    },
  },
  es: {
    translation: {
      header: {
        login: "Iniciar sesión",
        menu: "Menú de usuario",
        account: "Cuenta",
        languages: "Idiomas",
        logout: "Cerrar sesión",
        backHome: "Volver al inicio",
      },
      hero: {
        title: "¿Qué deseas crear hoy?",
        subtitle: "Transforma tus ideas en aplicaciones web completas en segundos con IA.",
        promptPlaceholder: "Describe la página o app que quieres construir...",
        generate: "Generar",
        tryIdeas: "O prueba con una de estas ideas:",
      },
      auth: {
        welcome: "Bienvenido a AXIA",
        subtitle: "Inicia sesión con Google para acceder a tus creaciones y empezar a construir.",
        continueGoogle: "Continuar con Google",
        signingIn: "Iniciando sesión...",
        acceptTerms1: "Acepto los ",
        termsLink: "Términos y Condiciones",
        acceptTerms2: " y la ",
        privacyLink: "Política de Privacidad",
        acceptTerms3: " de AXIA.",
        errorTerms: "Debes aceptar los Términos y Condiciones para continuar.",
      },
      account: {
        title: "Mi Cuenta AXIA",
        userDefault: "Usuario AXIA",
        statusLabel: "Estado de cuenta",
        statusActive: "Activa",
        memberSince: "Miembro desde",
        confirmLogoutTitle: "¿Cerrar sesión?",
        confirmLogoutText: "¿Estás seguro de que deseas cerrar sesión en tu cuenta de AXIA?",
        cancel: "Cancelar",
        accept: "Aceptar",
        loggingOut: "Cerrando...",
      },
      language: {
        title: "Seleccionar idioma",
      },
      chips: {
        coffeeTitle: "Cafetería",
        coffeePrompt:
          "Crea un sitio web moderno para una cafetería artesanal con menú interactivo, galería de especialidades y ubicación.",
        schoolTitle: "Proyecto Escolar",
        schoolPrompt:
          "Diseña un portal educativo para proyectos escolares con presentación de tareas, recursos y calendario de exámenes.",
        ecommerceTitle: "E-Commerce",
        ecommercePrompt:
          "Construye una tienda en línea elegante con catálogo de productos, carrito de compras y diseño responsivo.",
        restaurantTitle: "Restaurante",
        restaurantPrompt:
          "Diseña una página atractiva para un restaurante gourmet con menú interactivo y formulario de reserva de mesas.",
        mobileAppTitle: "App Móvil",
        mobileAppPrompt:
          "Crea una landing page interactiva para presentar una aplicación móvil con capturas de pantalla y enlaces de descarga.",
        dashboardTitle: "Dashboard SaaS",
        dashboardPrompt:
          "Diseña un panel de control empresarial con métricas en tiempo real, gráficos de rendimiento y tablas de datos.",
        musicTitle: "Música & Audio",
        musicPrompt:
          "Crea una plataforma de reproducción de música y podcasts con reproductor interactivo y listas de reproducción.",
        eventsTitle: "Gestor de Eventos",
        eventsPrompt:
          "Diseña un sitio para conferencias y eventos con agenda de ponentes, venta de entradas y cuenta regresiva.",
        fitnessTitle: "Fitness Tracker",
        fitnessPrompt:
          "Construye una app de entrenamiento y fitness para registrar rutinas diarias, calorías y progreso semanal.",
        portfolioTitle: "Portafolio Creativo",
        portfolioPrompt:
          "Crea un portafolio profesional para diseñadores y desarrolladores con proyectos destacados y formulario de contacto.",
      },
      promptIdeas: [
        "Crea un e-commerce de cafés artesanales...",
        "Un dashboard SaaS para analíticas de redes...",
        "Una landing page interactiva para una app móvil...",
        "Un sitio web de restaurante con reservas online...",
        "Un rastreador de fitness con gráficos en tiempo real...",
      ],
    },
  },
  pt: {
    translation: {
      header: {
        login: "Entrar",
        menu: "Menu do usuário",
        account: "Conta",
        languages: "Idiomas",
        logout: "Sair",
        backHome: "Voltar ao início",
      },
      hero: {
        title: "O que você quer criar hoje?",
        subtitle: "Transforme suas ideias em aplicações web completas em segundos com IA.",
        promptPlaceholder: "Descreva o site ou app que você quer construir...",
        generate: "Gerar",
        tryIdeas: "Ou tente uma destas ideias:",
      },
      auth: {
        welcome: "Bem-vindo ao AXIA",
        subtitle: "Entre com o Google para acessar suas criações e começar a construir.",
        continueGoogle: "Continuar com o Google",
        signingIn: "Entrando...",
        acceptTerms1: "Eu aceito os ",
        termsLink: "Termos e Condições",
        acceptTerms2: " e a ",
        privacyLink: "Política de Privacidade",
        acceptTerms3: " do AXIA.",
        errorTerms: "Você deve aceitar os Termos e Condições para continuar.",
      },
      account: {
        title: "Minha Conta AXIA",
        userDefault: "Usuário AXIA",
        statusLabel: "Status da conta",
        statusActive: "Ativa",
        memberSince: "Membro desde",
        confirmLogoutTitle: "Sair da conta?",
        confirmLogoutText: "Tem certeza de que deseja sair da sua conta AXIA?",
        cancel: "Cancelar",
        accept: "Confirmar",
        loggingOut: "Saindo...",
      },
      language: {
        title: "Selecionar idioma",
      },
      chips: {
        coffeeTitle: "Cafeteria",
        coffeePrompt:
          "Crie um site moderno para uma cafeteria artesanal com menu interativo, galeria de especialidades e localização.",
        schoolTitle: "Projeto Escolar",
        schoolPrompt:
          "Desenvolva um portal educacional para projetos escolares com entrega de tarefas, recursos e calendário de provas.",
        ecommerceTitle: "E-Commerce",
        ecommercePrompt:
          "Construa uma loja online elegante com catálogo de produtos, carrinho de compras e design responsivo.",
        restaurantTitle: "Restaurante",
        restaurantPrompt:
          "Crie uma página atraente para um restaurante gourmet com menu interativo e formulário de reserva de mesas.",
        mobileAppTitle: "App Móvel",
        mobileAppPrompt:
          "Crie uma landing page interativa para apresentar um aplicativo móvel com capturas de tela e links para download.",
        dashboardTitle: "Painel SaaS",
        dashboardPrompt:
          "Desenvolva um painel de controle empresarial com métricas em tempo real, gráficos de desempenho e tabelas.",
        musicTitle: "Música & Áudio",
        musicPrompt:
          "Crie uma plataforma de streaming de música e podcasts com player interativo e listas de reprodução.",
        eventsTitle: "Gestor de Eventos",
        eventsPrompt:
          "Crie um site para conferências e eventos com programação de palestrantes, venda de ingressos e contagem regressiva.",
        fitnessTitle: "Fitness Tracker",
        fitnessPrompt:
          "Construa um app de treino e fitness para registrar rotinas diárias, calorias e progresso semanal.",
        portfolioTitle: "Portfólio Criativo",
        portfolioPrompt:
          "Crie um portfólio profissional para designers e desenvolvedores com projetos em destaque e formulário de contato.",
      },
      promptIdeas: [
        "Crie um e-commerce de cafés artesanais...",
        "Um painel SaaS para métricas de redes sociais...",
        "Uma landing page interativa para um app móvel...",
        "Um site de restaurante com reservas online...",
        "Um rastreador de fitness com gráficos em tempo real...",
      ],
    },
  },
  it: {
    translation: {
      header: {
        login: "Accedi",
        menu: "Menu utente",
        account: "Account",
        languages: "Lingue",
        logout: "Disconnettersi",
        backHome: "Torna alla home",
      },
      hero: {
        title: "Cosa vuoi creare oggi?",
        subtitle: "Trasforma le tue idee in applicazioni web complete in pochi secondi con l'IA.",
        promptPlaceholder: "Descrivi il sito web o l'app che vuoi costruire...",
        generate: "Genera",
        tryIdeas: "Oppure prova una di queste idee:",
      },
      auth: {
        welcome: "Benvenuto su AXIA",
        subtitle: "Accedi con Google per accedere alle tue creazioni e iniziare a costruire.",
        continueGoogle: "Continua con Google",
        signingIn: "Accesso in corso...",
        acceptTerms1: "Accetto i ",
        termsLink: "Termini e Condizioni",
        acceptTerms2: " e l'",
        privacyLink: "Informativa sulla Privacy",
        acceptTerms3: " di AXIA.",
        errorTerms: "Devi accettare i Termini e le Condizioni per continuare.",
      },
      account: {
        title: "Il mio account AXIA",
        userDefault: "Utente AXIA",
        statusLabel: "Stato dell'account",
        statusActive: "Attivo",
        memberSince: "Membro da",
        confirmLogoutTitle: "Disconnettersi?",
        confirmLogoutText: "Sei sicuro di voler uscire dal tuo account AXIA?",
        cancel: "Annulla",
        accept: "Conferma",
        loggingOut: "Disconnessione...",
      },
      language: {
        title: "Seleziona lingua",
      },
      chips: {
        coffeeTitle: "Caffetteria",
        coffeePrompt:
          "Crea un sito web moderno per una caffetteria artigianale con menu interattivo, galleria di specialità e mappa.",
        schoolTitle: "Progetto Scolastico",
        schoolPrompt:
          "Progetta un portale educativo per progetti scolastici con invio dei compiti, risorse di studio e calendario esami.",
        ecommerceTitle: "E-Commerce",
        ecommercePrompt:
          "Crea un elegante negozio online con catalogo prodotti, carrello e checkout reattivo.",
        restaurantTitle: "Ristorante",
        restaurantPrompt:
          "Progetta una pagina attraente per un ristorante gourmet con menu interattivo e modulo di prenotazione tavoli.",
        mobileAppTitle: "App Mobile",
        mobileAppPrompt:
          "Crea una landing page interattiva per presentare un'app mobile con screenshot, caratteristiche e link per il download.",
        dashboardTitle: "Dashboard SaaS",
        dashboardPrompt:
          "Progetta un pannello di controllo aziendale con metriche in tempo reale, grafici di prestazione e tabelle dati.",
        musicTitle: "Musica & Audio",
        musicPrompt:
          "Crea una piattaforma di streaming per musica e podcast con lettore interattivo e playlist.",
        eventsTitle: "Gestore Eventi",
        eventsPrompt:
          "Progetta un sito per conferenze ed eventi con programma dei relatori, vendita biglietti e conto alla rovescia.",
        fitnessTitle: "Fitness Tracker",
        fitnessPrompt:
          "Crea un'app di allenamento e fitness per registrare routine giornaliere, calorie e grafici di progresso.",
        portfolioTitle: "Portfolio Creativo",
        portfolioPrompt:
          "Crea un portfolio professionale per designer e sviluppatori con progetti in evidenza e modulo di contatto.",
      },
      promptIdeas: [
        "Crea un e-commerce per caffè artigianali...",
        "Una dashboard SaaS per analisi dei social media...",
        "Una landing page interattiva per un'app mobile...",
        "Un sito web per ristorante con prenotazioni online...",
        "Un tracker di fitness con grafici in tempo reale...",
      ],
    },
  },
  fr: {
    translation: {
      header: {
        login: "Se connecter",
        menu: "Menu utilisateur",
        account: "Compte",
        languages: "Langues",
        logout: "Se déconnecter",
        backHome: "Retour à l'accueil",
      },
      hero: {
        title: "Que voulez-vous créer aujourd'hui ?",
        subtitle:
          "Transformez vos idées en applications web complètes en quelques secondes avec l'IA.",
        promptPlaceholder: "Décrivez le site web ou l'application que vous souhaitez créer...",
        generate: "Générer",
        tryIdeas: "Ou essayez l'une de ces idées :",
      },
      auth: {
        welcome: "Bienvenue sur AXIA",
        subtitle:
          "Connectez-vous avec Google pour accéder à vos créations et commencer à construire.",
        continueGoogle: "Continuer avec Google",
        signingIn: "Connexion en cours...",
        acceptTerms1: "J'accepte les ",
        termsLink: "Conditions Générales",
        acceptTerms2: " et la ",
        privacyLink: "Politique de Confidentialité",
        acceptTerms3: " d'AXIA.",
        errorTerms: "Vous devez accepter les Conditions Générales pour continuer.",
      },
      account: {
        title: "Mon compte AXIA",
        userDefault: "Utilisateur AXIA",
        statusLabel: "Statut du compte",
        statusActive: "Actif",
        memberSince: "Membre depuis",
        confirmLogoutTitle: "Se déconnecter ?",
        confirmLogoutText: "Êtes-vous sûr de vouloir vous déconnecter de votre compte AXIA ?",
        cancel: "Annuler",
        accept: "Confirmer",
        loggingOut: "Déconnexion...",
      },
      language: {
        title: "Choisir la langue",
      },
      chips: {
        coffeeTitle: "Cafétéria",
        coffeePrompt:
          "Créez un site web moderne pour un café artisanal avec menu interactif, galerie de spécialités et localisation.",
        schoolTitle: "Projet Scolaire",
        schoolPrompt:
          "Concevez un portail éducatif pour les projets scolaires avec remise des devoirs, ressources et calendrier d'examens.",
        ecommerceTitle: "E-Commerce",
        ecommercePrompt:
          "Créez une boutique en ligne élégante avec catalogue de produits, panier d'achats et design réactif.",
        restaurantTitle: "Restaurant",
        restaurantPrompt:
          "Concevez une page attrayante pour un restaurant gastronomique avec menu interactif et réservation de tables.",
        mobileAppTitle: "App Mobile",
        mobileAppPrompt:
          "Créez une page d'atterrissage interactive pour présenter une application mobile avec captures d'écran et liens de téléchargement.",
        dashboardTitle: "Tableau de bord SaaS",
        dashboardPrompt:
          "Concevez un panneau de contrôle d'entreprise avec métriques en tempo réel, graphiques et tableaux de données.",
        musicTitle: "Musique & Audio",
        musicPrompt:
          "Créez une plateforme de streaming musical et de podcasts avec lecteur interactif et listes de lecture.",
        eventsTitle: "Gestion d'Événements",
        eventsPrompt:
          "Concevez un site pour conférences et événements avec programme des intervenants, billetterie et compte à rebours.",
        fitnessTitle: "Suivi Fitness",
        fitnessPrompt:
          "Créez une application d'entraînement pour enregistrer vos routines quotidiennes, calories et progrès hebdomadaires.",
        portfolioTitle: "Portfolio Créatif",
        portfolioPrompt:
          "Créez un portfolio professionnel pour designers et développeurs avec projets en vedette et formulaire de contact.",
      },
      promptIdeas: [
        "Créez un e-commerce de cafés artisanaux...",
        "Un tableau de bord SaaS pour l'analyse des réseaux sociaux...",
        "Une page d'atterrissage interactive pour une application mobile...",
        "Un site web de restaurant avec réservations en ligne...",
        "Un suivi de fitness avec des graphiques en temps réel...",
      ],
    },
  },
};

const savedLang = typeof window !== "undefined" ? localStorage.getItem("axia_lang") || "en" : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
