/* ==========================================================================
   MOVIEFLIX LOGIC (USER PROFILES, FAVORITES, SEARCH, CUSTOM PLAYER)
   ========================================================================== */

// 1. DATO SEMILLA DE PELÍCULAS Y TRÁILERS
const DEFAULT_VIDEOS = [];

// 2. PALETA DE COLORES PARA AVATARES
const AVATAR_COLORS = {
    purple: "linear-gradient(135deg, #a855f7, #6b21a8)",
    blue: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    red: "linear-gradient(135deg, #ef4444, #b91c1c)",
    green: "linear-gradient(135deg, #10b981, #047857)",
    yellow: "linear-gradient(135deg, #f59e0b, #b45309)",
    pink: "linear-gradient(135deg, #ec4899, #be185d)"
};

// 3. ESTADOS DE LA APLICACIÓN
let profiles = [];
let activeProfile = null;
let customVideos = []; // Representa customMovies
let isManagingProfiles = false;
let currentSelectedAvatarColor = "purple";
let sessionVideoBlobs = {};
let formSeasons = []; // Temporadas y capítulos en el formulario actual
let editingVideoId = null; // ID del video siendo editado (null si estamos agregando)

// Elementos DOM
const loginScreen = document.getElementById("login-screen");
const loginForm = document.getElementById("login-form");
const loginPasswordInput = document.getElementById("login-password");
const loginErrorMsg = document.getElementById("login-error-msg");
const profileScreen = document.getElementById("profile-selector-screen");
const mainDashboard = document.getElementById("main-dashboard");
const profilesGrid = document.getElementById("profiles-grid");
const manageProfilesBtn = document.getElementById("manage-profiles-btn");
const profileLinkGoogle = document.getElementById("profile-link-google");
const profileLogoutLink = document.getElementById("profile-logout-link");
const dropdownLinkGoogle = document.getElementById("dropdown-link-google");
const dropdownLogoutApp = document.getElementById("dropdown-logout-app");

// DOM Navbar
const navbar = document.getElementById("navbar");
const navProfileAvatar = document.getElementById("nav-profile-avatar");
const navProfileName = document.getElementById("nav-profile-name");
const currentProfileTrigger = document.getElementById("current-profile-trigger");
const profileDropdown = document.getElementById("profile-dropdown");
const dropdownProfilesList = document.getElementById("dropdown-profiles-list");
const dropdownManageProfiles = document.getElementById("dropdown-manage-profiles");
const dropdownExitProfile = document.getElementById("dropdown-exit-profile");

// DOM Menú de Hamburguesa Móvil (Sidebar)
const hamburgerMenuBtn = document.getElementById("hamburger-menu-btn");
const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
const mobileMenuCloseBtn = document.getElementById("mobile-menu-close");
const mobileMenuBackdrop = document.getElementById("mobile-menu-backdrop");
const mobileNavAddSidebar = document.getElementById("mobile-nav-add-sidebar");
const sidebarProfileAvatar = document.getElementById("sidebar-profile-avatar");
const sidebarProfileName = document.getElementById("sidebar-profile-name");

// DOM Buscador
const searchToggleBtn = document.getElementById("search-toggle-btn");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search-btn");

// DOM Hero
const heroBanner = document.getElementById("hero-banner");
const heroBgContainer = document.getElementById("hero-bg-container");
const heroTitle = document.getElementById("hero-title");
const heroDescription = document.getElementById("hero-description");
const heroYear = document.getElementById("hero-year");
const heroDuration = document.getElementById("hero-duration");
const heroCategory = document.getElementById("hero-category");
const heroPlayBtn = document.getElementById("hero-play-btn");
const heroInfoBtn = document.getElementById("hero-info-btn");

// DOM Content
const mainContent = document.getElementById("main-content");

// DOM Modales
const videoDetailsModal = document.getElementById("video-details-modal");
const detailsCloseBtn = document.getElementById("details-close-btn");
const detailsBackdrop = document.getElementById("details-backdrop");
const detailsPlayBtn = document.getElementById("details-play-btn");
const detailsEpisodesBtn = document.getElementById("details-episodes-btn");
const detailsBackToInfoBtn = document.getElementById("details-back-to-info-btn");
const episodesScrollDownBtn = document.getElementById("episodes-scroll-down-btn");
const episodesScrollUpBtn = document.getElementById("episodes-scroll-up-btn");
const detailsFavoriteBtn = document.getElementById("details-favorite-btn");
const detailsDeleteBtn = document.getElementById("details-delete-btn");
const detailsEditBtn = document.getElementById("details-edit-btn");
const detailsHero = document.getElementById("details-hero");
const detailsTitle = document.getElementById("details-title");
const detailsYear = document.getElementById("details-year");
const detailsDuration = document.getElementById("details-duration");
const detailsCategory = document.getElementById("details-category");
const detailsDescription = document.getElementById("details-description");
const detailsAuthor = document.getElementById("details-author");
const detailsPeople = document.getElementById("details-people");
const detailsTags = document.getElementById("details-tags");
const detailsMatch = document.getElementById("details-match");
const similarGrid = document.getElementById("similar-grid");

// Modal Agregar Video (Película)
const navAddVideo = document.getElementById("nav-add-video");
const addVideoModal = document.getElementById("add-video-modal");
const addVideoCloseBtn = document.getElementById("add-video-close-btn");
const addVideoBackdrop = document.getElementById("add-video-backdrop");
const addVideoForm = document.getElementById("add-video-form");
const addVideoCancel = document.getElementById("add-video-cancel");

// Selectores para Series (Temporadas y Capítulos)
const videoTypeSelect = document.getElementById("video-type");
const formMovieVideoSection = document.getElementById("form-movie-video-section");
const formSeriesEpisodesSection = document.getElementById("form-series-episodes-section");
const seasonsContainer = document.getElementById("seasons-container");
const btnAddSeason = document.getElementById("btn-add-season");

const modalSeriesEpisodesSection = document.getElementById("modal-series-episodes-section");
const seasonSelector = document.getElementById("season-selector");
const episodesList = document.getElementById("episodes-list");

// Modal Perfil
const profileModal = document.getElementById("profile-modal");
const profileModalCloseBtn = document.getElementById("profile-modal-close-btn");
const profileModalBackdrop = document.getElementById("profile-modal-backdrop");
const profileForm = document.getElementById("profile-form");
const profileNameInput = document.getElementById("profile-name");
const profileEditIdInput = document.getElementById("profile-edit-id");
const profileModalSubmitBtn = document.getElementById("profile-modal-submit-btn");
const profileModalCancelBtn = document.getElementById("profile-modal-cancel");
const avatarOpts = document.querySelectorAll(".avatar-opt");

// Reproductor de Video Customizado
const playerContainer = document.getElementById("fullscreen-video-player");
const videoElement = document.getElementById("main-html5-video");
const playerLoader = document.getElementById("player-loader");
const playerControls = document.getElementById("player-controls-overlay");
const playerBackBtn = document.getElementById("player-back-btn");
const playerTitleDisplay = document.getElementById("player-title-display");
const playerSubtitleDisplay = document.getElementById("player-subtitle-display");
const centerPlayBtn = document.getElementById("center-play-btn");
const centerPlayIcon = document.getElementById("center-play-icon");

const playerProgressContainer = document.getElementById("player-progress-container");
const playerCurrentProgress = document.getElementById("player-current-progress");
const playerBuffer = document.getElementById("player-buffer");
const playerHoverTime = document.getElementById("player-hover-time");

const ctrlPlayBtn = document.getElementById("ctrl-play-btn");
const ctrlRewindBtn = document.getElementById("ctrl-rewind-btn");
const ctrlForwardBtn = document.getElementById("ctrl-forward-btn");
const ctrlVolumeBtn = document.getElementById("ctrl-volume-btn");
const ctrlVolumeSlider = document.getElementById("ctrl-volume-slider");
const timeCurrent = document.getElementById("time-current");
const timeDuration = document.getElementById("time-duration");

const ctrlSpeedBtn = document.getElementById("ctrl-speed-btn");
const speedOptionsContainer = document.getElementById("speed-options");
const ctrlFullscreenBtn = document.getElementById("ctrl-fullscreen-btn");

// Variable auxiliar de video abierto actualmente
let currentActiveVideo = null;
let controlsTimeout = null;

// Mapa legible de géneros para las filas
const GENDER_NAMES = {
    Accion: "Acción y Aventura",
    SciFi: "Ciencia Ficción y Fantasía",
    Drama: "Drama",
    Romance: "Romance",
    Comedia: "Comedia",
    Terror: "Terror y Suspenso",
    Documental: "Documental",
    Animacion: "Animación y Anime",
    Infantil: "Familiar e Infantil"
};

// ==========================================================================
// 4. FUNCIONES DE INICIALIZACIÓN
// ==========================================================================

async function initApp() {
    // Inicializar iconos
    lucide.createIcons();
    
    // Cargar base de datos local
    loadFromLocalStorage();

    // Lógica de autenticación del sitio (contraseña maestra erison2)
    setupSiteAuthentication();

    // Eventos globales
    setupGlobalEvents();

    // Sincronizar con el servidor de forma asíncrona
    await syncWithServer();

    // Registrar Service Worker para soporte PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado con éxito:', reg.scope))
            .catch(err => console.error('Error al registrar el Service Worker:', err));
    }
}

function setupSiteAuthentication() {
    const isAuth = localStorage.getItem("movieflix_login_auth") === "true";
    if (isAuth) {
        loginScreen.classList.add("hidden");
        loginScreen.classList.remove("active");
        profileScreen.classList.remove("hidden");
        profileScreen.classList.add("active");
        renderProfilesScreen();
    } else {
        loginScreen.classList.remove("hidden");
        loginScreen.classList.add("active");
        profileScreen.classList.remove("active");
        profileScreen.classList.add("hidden");
        if (loginPasswordInput) loginPasswordInput.focus();
    }

    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const password = loginPasswordInput.value;
            if (password === "erison2") {
                localStorage.setItem("movieflix_login_auth", "true");
                loginScreen.classList.add("hidden");
                loginScreen.classList.remove("active");
                profileScreen.classList.remove("hidden");
                profileScreen.classList.add("active");
                renderProfilesScreen();
            } else {
                loginErrorMsg.classList.remove("hidden");
                loginPasswordInput.value = "";
                loginPasswordInput.focus();
            }
        };
    }
}

async function syncWithServer() {
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
        return;
    }
    try {
        // 1. Cargar películas del servidor (de manera relativa para ser compatible con GitHub Pages)
        const responseMovies = await fetch('movies_db.json');
        if (responseMovies.status === 200) {
            const serverMovies = await responseMovies.json();
            if (Array.isArray(serverMovies)) {
                customVideos = serverMovies;
                localStorage.setItem("movieflix_custom_movies", JSON.stringify(customVideos));
            }
        } else if (responseMovies.status === 404) {
            // El archivo no existe en el servidor. Inicializar el servidor si tenemos datos locales.
            if (customVideos.length > 0) {
                saveCustomVideos();
            }
        }

        // 2. Cargar perfiles del servidor (de manera relativa)
        const responseProfiles = await fetch('profiles_db.json');
        if (responseProfiles.status === 200) {
            const serverProfiles = await responseProfiles.json();
            if (Array.isArray(serverProfiles)) {
                profiles = serverProfiles;
                localStorage.setItem("movieflix_profiles", JSON.stringify(profiles));
            }
        } else if (responseProfiles.status === 404) {
            // El archivo no existe en el servidor. Inicializar el servidor si tenemos datos locales.
            if (profiles.length > 0) {
                saveProfiles();
            }
        }

        // 3. Volver a renderizar la vista actual con los datos frescos
        if (currentProfile) {
            renderVideoRows();
            setupHeroBanner();
        } else {
            renderProfilesScreen();
        }
    } catch (err) {
        console.warn("La sincronización asíncrona con el servidor falló (servidor estático o sin API):", err);
    }
}

function checkMasterPassword(promptMessage) {
    if (localStorage.getItem("movieflix_master_auth") === "true") {
        return true;
    }
    const password = prompt(promptMessage);
    if (password === "erison1") {
        localStorage.setItem("movieflix_master_auth", "true");
        return true;
    }
    if (password !== null) {
        alert("Contraseña incorrecta. Acción cancelada.");
    }
    return false;
}

function loadFromLocalStorage() {
    // Cargar perfiles (con prefijo de movieflix)
    const savedProfiles = localStorage.getItem("movieflix_profiles");
    if (savedProfiles) {
        profiles = JSON.parse(savedProfiles);
        // Garantizar que todos los perfiles tengan favoritos e historial inicializados
        profiles.forEach(p => {
            if (!p.favorites) p.favorites = [];
            if (!p.history) p.history = [];
        });
    } else {
        // Perfiles iniciales por defecto
        profiles = [
            { id: "p1", name: "Cinefilo", color: "purple", favorites: [], history: [] },
            { id: "p2", name: "Invitado", color: "blue", favorites: [], history: [] }
        ];
        saveProfiles();
    }

    // Cargar películas añadidas por usuario (con prefijo de movieflix)
    const savedCustomVideos = localStorage.getItem("movieflix_custom_movies");
    if (savedCustomVideos) {
        customVideos = JSON.parse(savedCustomVideos);
    }
}

function saveProfiles() {
    localStorage.setItem("movieflix_profiles", JSON.stringify(profiles));
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        fetch('/api/save-profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profiles)
        }).catch(err => console.warn("Error al guardar perfiles en el servidor:", err));
    }
}

function saveCustomVideos() {
    localStorage.setItem("movieflix_custom_movies", JSON.stringify(customVideos));
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
        fetch('/api/save-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customVideos)
        }).catch(err => console.warn("Error al guardar películas en el servidor:", err));
    }
}

// Obtiene todas las películas actuales (Semilla + Usuario)
function getAllVideos() {
    return [...DEFAULT_VIDEOS, ...customVideos].map(video => {
        if (video.isLocalFile) {
            // Resolver URL de sesión
            video.url = sessionVideoBlobs[video.id] || "";
        }
        return video;
    });
}

// ==========================================================================
// 5. GESTIÓN DE PERFILES Y EVENTOS DE PERFIL
// ==========================================================================

function renderProfilesScreen() {
    profilesGrid.innerHTML = "";
    isManagingProfiles = false;
    manageProfilesBtn.innerText = "Administrar perfiles";
    manageProfilesBtn.classList.remove("primary");
    manageProfilesBtn.classList.add("secondary");

    profiles.forEach(profile => {
        const card = document.createElement("div");
        card.className = "profile-card";
        card.innerHTML = `
            <div class="avatar-wrapper" style="background: ${AVATAR_COLORS[profile.color] || AVATAR_COLORS.purple}">
                <div class="avatar-display">${profile.name.charAt(0).toUpperCase()}</div>
                <div class="profile-action-overlay">
                    <button class="profile-action-btn edit-btn" data-id="${profile.id}">
                        <i data-lucide="pencil" style="width:16px;height:16px;"></i>
                    </button>
                    <button class="profile-action-btn delete-btn" data-id="${profile.id}">
                        <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                    </button>
                </div>
            </div>
            <div class="profile-name">${profile.name}</div>
        `;

        // Entrar al perfil o editarlo
        card.addEventListener("click", (e) => {
            if (isManagingProfiles) {
                // Si hace clic en borrar o editar
                const isDelete = e.target.closest(".delete-btn");
                const isEdit = e.target.closest(".edit-btn");
                if (isDelete) {
                    deleteProfile(profile.id);
                } else if (isEdit) {
                    openProfileModal(profile);
                }
            } else {
                selectProfile(profile.id);
            }
        });

        profilesGrid.appendChild(card);
    });

    // Agregar tarjeta de "Crear perfil"
    const addCard = document.createElement("div");
    addCard.className = "profile-card add-profile-card";
    addCard.innerHTML = `
        <div class="avatar-wrapper flex-center-col" style="background: rgba(255,255,255,0.05); border: 2px dashed rgba(255,255,255,0.2);">
            <i data-lucide="plus" style="width: 40px; height: 40px; color: var(--text-muted)"></i>
        </div>
        <div class="profile-name" style="color: var(--text-muted)">Agregar Perfil</div>
    `;
    addCard.addEventListener("click", () => openProfileModal());
    profilesGrid.appendChild(addCard);

    lucide.createIcons();
}

function selectProfile(profileId) {
    activeProfile = profiles.find(p => p.id === profileId);
    if (!activeProfile) return;

    // Configurar la interfaz principal
    navProfileName.innerText = activeProfile.name;
    navProfileAvatar.style.background = AVATAR_COLORS[activeProfile.color] || AVATAR_COLORS.purple;
    navProfileAvatar.innerHTML = `<span style="color:white; font-size: 0.9rem; font-weight:700; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">${activeProfile.name.charAt(0).toUpperCase()}</span>`;

    // Configurar la interfaz del sidebar móvil
    if (sidebarProfileName && sidebarProfileAvatar) {
        sidebarProfileName.innerText = activeProfile.name;
        sidebarProfileAvatar.style.background = AVATAR_COLORS[activeProfile.color] || AVATAR_COLORS.purple;
        sidebarProfileAvatar.innerHTML = `<span style="color:white; font-size: 1.1rem; font-weight:700; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">${activeProfile.name.charAt(0).toUpperCase()}</span>`;
    }

    // Cambiar pantalla
    profileScreen.classList.remove("active");
    profileScreen.classList.add("hidden");
    mainDashboard.classList.remove("hidden");
    mainDashboard.classList.add("active");

    // Limpiar buscador al entrar
    searchInput.value = "";
    document.getElementById("search-box").classList.remove("active");
    clearSearchBtn.classList.add("hidden");

    // Cargar Hero y Filas de Videos
    setupHeroBanner();
    renderVideoRows();
    updateDropdownProfiles();
}

function deleteProfile(id) {
    if (profiles.length <= 1) {
        alert("Debe existir al menos un perfil en la cuenta.");
        return;
    }
    if (confirm("¿Estás seguro de que deseas eliminar este perfil? Se perderán todos sus favoritos.")) {
        profiles = profiles.filter(p => p.id !== id);
        saveProfiles();
        renderProfilesScreen();
    }
}

function openProfileModal(profile = null) {
    if (profile) {
        // Editar
        document.getElementById("profile-modal-title").innerText = "Editar Perfil";
        profileNameInput.value = profile.name;
        profileEditIdInput.value = profile.id;
        currentSelectedAvatarColor = profile.color;
    } else {
        // Crear nuevo
        document.getElementById("profile-modal-title").innerText = "Crear Perfil";
        profileNameInput.value = "";
        profileEditIdInput.value = "";
        currentSelectedAvatarColor = "purple";
    }

    // Actualizar selección visual de colores de avatar
    avatarOpts.forEach(opt => {
        if (opt.dataset.color === currentSelectedAvatarColor) {
            opt.classList.add("selected");
        } else {
            opt.classList.remove("selected");
        }
    });

    profileModal.classList.remove("hidden");
    profileNameInput.focus();
}

function closeProfileModal() {
    profileModal.classList.add("hidden");
}

function handleProfileSubmit(e) {
    e.preventDefault();
    const name = profileNameInput.value.trim();
    const editId = profileEditIdInput.value;

    if (!name) return;

    if (editId) {
        // Actualizar existente
        const profile = profiles.find(p => p.id === editId);
        if (profile) {
            profile.name = name;
            profile.color = currentSelectedAvatarColor;
        }
    } else {
        // Crear nuevo
        const newProfile = {
            id: "p_" + Date.now(),
            name: name,
            color: currentSelectedAvatarColor,
            favorites: [],
            history: []
        };
        profiles.push(newProfile);
    }

    saveProfiles();
    closeProfileModal();
    renderProfilesScreen();

    // Si modificamos el perfil activo, actualizar UI
    if (activeProfile && activeProfile.id === editId) {
        selectProfile(editId);
    }
}

function updateDropdownProfiles() {
    dropdownProfilesList.innerHTML = "";
    const otherProfiles = profiles.filter(p => p.id !== activeProfile.id);

    otherProfiles.forEach(profile => {
        const item = document.createElement("div");
        item.className = "dropdown-profile-item";
        item.innerHTML = `
            <div class="dropdown-avatar" style="background: ${AVATAR_COLORS[profile.color]}">
                <span style="color:white; font-size: 0.75rem; font-weight:700; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">${profile.name.charAt(0).toUpperCase()}</span>
            </div>
            <span>${profile.name}</span>
        `;
        item.addEventListener("click", () => {
            profileDropdown.classList.add("hidden");
            selectProfile(profile.id);
        });
        dropdownProfilesList.appendChild(item);
    });
}

// Toggle administrador de perfiles
function toggleProfileManagement() {
    isManagingProfiles = !isManagingProfiles;
    
    const cards = document.querySelectorAll(".profile-card:not(.add-profile-card)");
    cards.forEach(card => {
        if (isManagingProfiles) {
            card.classList.add("managing");
        } else {
            card.classList.remove("managing");
        }
    });

    if (isManagingProfiles) {
        manageProfilesBtn.innerText = "Listo";
        manageProfilesBtn.classList.remove("secondary");
        manageProfilesBtn.classList.add("primary");
    } else {
        manageProfilesBtn.innerText = "Administrar perfiles";
        manageProfilesBtn.classList.remove("primary");
        manageProfilesBtn.classList.add("secondary");
    }
}

// ==========================================================================
// 6. MOTOR DE RECOMENDACIÓN E INYECCIÓN DE PORTADA (HERO BANNER)
// ==========================================================================

function getRecommendations() {
    const allVideos = getAllVideos();
    if (!activeProfile || !activeProfile.favorites || activeProfile.favorites.length === 0) {
        // Sin favoritos: Recomendaciones por defecto
        return allVideos.slice(0, 4); 
    }

    // Contar las categorías favoritas del usuario
    const favCategories = {};
    activeProfile.favorites.forEach(favId => {
        const video = allVideos.find(v => v.id === favId);
        if (video) {
            favCategories[video.category] = (favCategories[video.category] || 0) + 1;
        }
    });

    // Ordenar categorías por popularidad
    const sortedCategories = Object.keys(favCategories).sort((a, b) => favCategories[b] - favCategories[a]);

    // Filtrar videos que no sean ya favoritos, priorizando las categorías preferidas
    let recommended = allVideos.filter(v => !activeProfile.favorites.includes(v.id));

    recommended.sort((a, b) => {
        const indexA = sortedCategories.indexOf(a.category);
        const indexB = sortedCategories.indexOf(b.category);

        // Si están en categorías favoritas, priorizar la de mayor peso
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        } else if (indexA !== -1) {
            return -1; // Priorizar A
        } else if (indexB !== -1) {
            return 1; // Priorizar B
        }
        return 0; // Sin prioridad específica
    });

    return recommended.slice(0, 6);
}

const AGE_RATINGS = {
    m1: "13+",
    m2: "16+",
    m3: "Apto",
    m4: "13+",
    m5: "Apto",
    m6: "7+",
    m7: "16+",
    m8: "13+"
};

function setupHeroBanner() {
    const allVideos = getAllVideos();
    if (allVideos.length === 0) {
        heroBanner.classList.add("hidden");
        return;
    }
    
    // Elegir una película aleatoria
    const randomIndex = Math.floor(Math.random() * allVideos.length);
    const featured = allVideos[randomIndex];
    currentActiveVideo = featured;

    // Miniatura de fondo
    heroBgContainer.innerHTML = "";
    if (featured.poster) {
        const bgImg = document.createElement("img");
        bgImg.src = featured.poster;
        bgImg.alt = featured.title;
        bgImg.className = "hero-bg-img";
        heroBgContainer.appendChild(bgImg);
    } else {
        // Gradiente decorativo si no hay imagen
        const gradientBg = document.createElement("div");
        gradientBg.style.width = "100%";
        gradientBg.style.height = "100%";
        gradientBg.style.background = `linear-gradient(135deg, ${getRandomHexColor()}, ${getRandomHexColor()})`;
        heroBgContainer.appendChild(gradientBg);
    }

    heroTitle.innerText = featured.title;
    heroDescription.innerText = featured.description;
    heroYear.innerText = featured.year;
    heroDuration.innerText = featured.duration;
    heroCategory.innerText = GENDER_NAMES[featured.category] || featured.category;

    // Agregar el badge de edad (Rating) a la derecha al estilo Netflix
    const oldRating = heroBanner.querySelector(".hero-age-rating");
    if (oldRating) oldRating.remove();

    const ratingBadge = document.createElement("div");
    ratingBadge.className = "hero-age-rating";
    ratingBadge.innerText = AGE_RATINGS[featured.id] || "13+";
    heroBanner.appendChild(ratingBadge);

    // Play / Info Actions
    heroPlayBtn.onclick = () => playVideo(featured);
    heroInfoBtn.onclick = () => openDetailsModal(featured);
}

function getRandomHexColor() {
    const colors = ["#1e1b4b", "#311042", "#111827", "#3b0764", "#0f172a", "#1e293b", "#0f766e", "#1c1917"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ==========================================================================
// 7. RENDERIZACIÓN DE FILAS (ROWS) DE VIDEOS (PELÍCULAS)
// ==========================================================================

function renderVideoRows(filterType = "all") {
    mainContent.innerHTML = "";
    let allVideos = getAllVideos();

    if (filterType === "series") {
        allVideos = allVideos.filter(v => v.type === "series");
    } else if (filterType === "movie") {
        allVideos = allVideos.filter(v => v.type === "movie" || !v.type);
    }

    if (allVideos.length === 0) {
        const emptyRow = document.createElement("div");
        emptyRow.className = "video-row";
        let message = "Aún no hay contenidos agregados en esta sección.";
        if (filterType === "series") message = "Aún no has agregado ninguna serie al catálogo. ¡Haz clic en 'Añadir Contenido' para agregar tu primera serie!";
        if (filterType === "movie") message = "Aún no has agregado ninguna película al catálogo. ¡Haz clic en 'Añadir Contenido' para agregar tu primera película!";
        emptyRow.innerHTML = `
            <h2 class="row-title"><i data-lucide="info"></i> Catálogo Vacío</h2>
            <div class="row-empty-message">${message}</div>
        `;
        mainContent.appendChild(emptyRow);
        lucide.createIcons();
        return;
    }

    // 0. Fila: Continuar viendo (Historial, aplicando filtro de tipo)
    if (activeProfile && activeProfile.history && activeProfile.history.length > 0) {
        const historyVideos = [];
        activeProfile.history.forEach(h => {
            if (filterType === "series" && h.type !== "series") return;
            if (filterType === "movie" && h.type !== "movie") return;
            
            const catalogVideo = allVideos.find(v => v.id === h.id);
            if (catalogVideo) {
                const displayVideo = { ...catalogVideo };
                displayVideo.progress = h.progress;
                displayVideo.episodeId = h.episodeId;
                displayVideo.episodeTitle = h.episodeTitle;
                displayVideo.currentTime = h.currentTime;
                displayVideo.duration = h.duration;
                historyVideos.push(displayVideo);
            }
        });
        
        if (historyVideos.length > 0) {
            createVideoRow("Continuar viendo", historyVideos, "play-circle");
        }
    }

    // 1. Fila de Recomendados para ti (aplicando filtro de tipo)
    const recommended = getRecommendations().filter(v => {
        if (filterType === "series") return v.type === "series";
        if (filterType === "movie") return v.type === "movie" || !v.type;
        return true;
    });
    if (recommended.length > 0) {
        createVideoRow("Recomendados para ti", recommended, "sparkles");
    }

    // 2. Fila: Mi Lista (Favoritos, aplicando filtro)
    const favoriteVideos = allVideos.filter(v => activeProfile.favorites.includes(v.id));
    if (favoriteVideos.length > 0) {
        createVideoRow("Mi Lista", favoriteVideos, "check-circle");
    }

    // 3. Filas por categorías de Cine
    const categories = [
        { name: "Acción y Aventura", key: "Accion", icon: "flame" },
        { name: "Ciencia Ficción y Fantasía", key: "SciFi", icon: "rocket" },
        { name: "Drama", key: "Drama", icon: "film" },
        { name: "Romance", key: "Romance", icon: "heart" },
        { name: "Comedia", key: "Comedia", icon: "smile" },
        { name: "Terror y Suspenso", key: "Terror", icon: "ghost" },
        { name: "Documental", key: "Documental", icon: "compass" },
        { name: "Animación y Anime", key: "Animacion", icon: "clapperboard" },
        { name: "Familiar e Infantil", key: "Infantil", icon: "baby" }
    ];

    categories.forEach(cat => {
        const catVideos = allVideos.filter(v => v.category === cat.key);
        if (catVideos.length > 0) {
            createVideoRow(cat.name, catVideos, cat.icon);
        }
    });

    lucide.createIcons();
}

function createVideoRow(title, videosList, iconName) {
    const row = document.createElement("div");
    row.className = "video-row";

    const titleHTML = `
        <h2 class="row-title">
            <i data-lucide="${iconName}"></i> ${title}
        </h2>
    `;

    const rowContainer = document.createElement("div");
    rowContainer.className = "row-container";

    const btnLeft = document.createElement("button");
    btnLeft.className = "row-nav-btn left";
    btnLeft.innerHTML = `<i data-lucide="chevron-left"></i>`;

    const btnRight = document.createElement("button");
    btnRight.className = "row-nav-btn right";
    btnRight.innerHTML = `<i data-lucide="chevron-right"></i>`;

    const rowInner = document.createElement("div");
    rowInner.className = "row-inner";

    videosList.forEach(video => {
        const card = document.createElement("div");
        card.className = "video-card";

        // Poster
        let posterHTML = "";
        if (video.poster) {
            posterHTML = `<img src="${video.poster}" class="card-poster" alt="${video.title}" loading="lazy">`;
        } else {
            posterHTML = `
                <div class="card-gradient-bg" style="background: linear-gradient(135deg, ${getRandomHexColor()}, #1e293b)">
                    <span>${video.title}</span>
                </div>
            `;
        }

        const isFav = activeProfile.favorites.includes(video.id);

        let progressBarHTML = "";
        if (video.progress !== undefined && video.progress > 0) {
            const percent = Math.min(Math.max(video.progress * 100, 2), 100);
            progressBarHTML = `
                <div class="card-progress-bar">
                    <div class="card-progress-fill" style="width: ${percent}%"></div>
                </div>
            `;
        }

        card.innerHTML = `
            ${posterHTML}
            ${progressBarHTML}
            <div class="card-overlay">
                <div class="card-title">${video.title}</div>
                <div class="card-meta">
                    <span class="match">${video.match || 90}% Coincidencia</span>
                    <span>${video.year}</span>
                    <span>${video.duration}</span>
                </div>
                <div class="card-controls">
                    <button class="card-ctrl-btn play-card-btn" title="Reproducir Tráiler">
                        <i data-lucide="play"></i>
                    </button>
                    <button class="card-ctrl-btn fav-card-btn ${isFav ? 'active-favorite' : ''}" title="${isFav ? 'Quitar de Mi Lista' : 'Añadir a Mi Lista'}">
                        <i data-lucide="${isFav ? 'check' : 'plus'}"></i>
                    </button>
                    <button class="card-ctrl-btn info-card-btn" title="Más Información">
                        <i data-lucide="chevron-down"></i>
                    </button>
                </div>
            </div>
        `;

        // Eventos en tarjetas
        card.querySelector(".play-card-btn").onclick = (e) => {
            e.stopPropagation();
            playVideo(video);
        };

        card.querySelector(".fav-card-btn").onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(video.id);
        };

        card.querySelector(".info-card-btn").onclick = (e) => {
            e.stopPropagation();
            openDetailsModal(video);
        };

        card.onclick = () => openDetailsModal(video);

        rowInner.appendChild(card);
    });

    // Control deslizador
    btnLeft.onclick = () => {
        rowInner.scrollLeft -= 500;
    };
    btnRight.onclick = () => {
        rowInner.scrollLeft += 500;
    };

    rowContainer.appendChild(btnLeft);
    rowContainer.appendChild(rowInner);
    rowContainer.appendChild(btnRight);

    row.innerHTML = titleHTML;
    row.appendChild(rowContainer);

    mainContent.appendChild(row);
}

function toggleFavorite(videoId) {
    if (!activeProfile) return;

    const favIndex = activeProfile.favorites.indexOf(videoId);
    if (favIndex !== -1) {
        // Quitar
        activeProfile.favorites.splice(favIndex, 1);
    } else {
        // Añadir
        activeProfile.favorites.push(videoId);
    }

    saveProfiles();
    renderVideoRows();
    
    // Si el modal de detalles está abierto para este video, refrescar su botón
    if (!videoDetailsModal.classList.contains("hidden") && currentActiveVideo && currentActiveVideo.id === videoId) {
        updateDetailsFavoriteBtn(videoId);
    }
}

function updateDetailsFavoriteBtn(videoId) {
    const isFav = activeProfile.favorites.includes(videoId);
    if (isFav) {
        detailsFavoriteBtn.innerHTML = `<i data-lucide="check"></i>`;
        detailsFavoriteBtn.title = "Quitar de Mi Lista";
        detailsFavoriteBtn.style.backgroundColor = "var(--primary)";
        detailsFavoriteBtn.style.borderColor = "var(--primary)";
    } else {
        detailsFavoriteBtn.innerHTML = `<i data-lucide="plus"></i>`;
        detailsFavoriteBtn.title = "Añadir a Mi Lista";
        detailsFavoriteBtn.style.backgroundColor = "rgba(0,0,0,0.5)";
        detailsFavoriteBtn.style.borderColor = "rgba(255,255,255,0.5)";
    }
    lucide.createIcons();
}

// ==========================================================================
// 8. BUSCADOR INTERACTIVO
// ==========================================================================

function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query === "") {
        renderVideoRows();
        return;
    }

    const allVideos = getAllVideos();
    const results = allVideos.filter(video => {
        const catName = GENDER_NAMES[video.category] || video.category;
        return (
            video.title.toLowerCase().includes(query) ||
            video.description.toLowerCase().includes(query) ||
            video.people.toLowerCase().includes(query) ||
            video.tags.toLowerCase().includes(query) ||
            catName.toLowerCase().includes(query) ||
            (video.author && video.author.toLowerCase().includes(query))
        );
    });

    mainContent.innerHTML = "";

    const searchRow = document.createElement("div");
    searchRow.className = "video-row";
    
    const resultsTitle = `
        <h2 class="row-title">
            <i data-lucide="search"></i> Resultados de búsqueda para: "${searchInput.value}"
        </h2>
    `;
    searchRow.innerHTML = resultsTitle;

    if (results.length === 0) {
        const noResults = document.createElement("div");
        noResults.className = "row-empty-message";
        noResults.innerHTML = `
            <i data-lucide="frown" style="width: 40px; height: 40px; margin-bottom: 0.5rem; display: block; margin-left: auto; margin-right: auto;"></i>
            No encontramos películas o tráilers que coincidan con tu búsqueda. Intenta con directores, actores o géneros.
        `;
        searchRow.appendChild(noResults);
    } else {
        const grid = document.createElement("div");
        grid.className = "similar-grid";
        grid.style.padding = "20px 0";

        results.forEach(video => {
            const card = document.createElement("div");
            card.className = "video-card";
            card.style.width = "100%";

            let posterHTML = "";
            if (video.poster) {
                posterHTML = `<img src="${video.poster}" class="card-poster" alt="${video.title}">`;
            } else {
                posterHTML = `
                    <div class="card-gradient-bg" style="background: linear-gradient(135deg, ${getRandomHexColor()}, #1e293b)">
                        <span>${video.title}</span>
                    </div>
                `;
            }

            const isFav = activeProfile.favorites.includes(video.id);

            card.innerHTML = `
                ${posterHTML}
                <div class="card-overlay">
                    <div class="card-title">${video.title}</div>
                    <div class="card-meta">
                        <span class="match">${video.match || 90}% Coincidencia</span>
                        <span>${video.year}</span>
                    </div>
                    <div class="card-controls">
                        <button class="card-ctrl-btn play-card-btn">
                            <i data-lucide="play"></i>
                        </button>
                        <button class="card-ctrl-btn fav-card-btn ${isFav ? 'active-favorite' : ''}">
                            <i data-lucide="${isFav ? 'check' : 'plus'}"></i>
                        </button>
                        <button class="card-ctrl-btn info-card-btn">
                            <i data-lucide="chevron-down"></i>
                        </button>
                    </div>
                </div>
            `;

            card.querySelector(".play-card-btn").onclick = (e) => {
                e.stopPropagation();
                playVideo(video);
            };

            card.querySelector(".fav-card-btn").onclick = (e) => {
                e.stopPropagation();
                toggleFavorite(video.id);
                performSearch();
            };

            card.querySelector(".info-card-btn").onclick = (e) => {
                e.stopPropagation();
                openDetailsModal(video);
            };

            card.onclick = () => openDetailsModal(video);

            grid.appendChild(card);
        });

        searchRow.appendChild(grid);
    }

    mainContent.appendChild(searchRow);
    lucide.createIcons();
}

// ==========================================================================
// 9. MODALES: DETALLES, AGREGAR PELÍCULAS
// ==========================================================================

function openDetailsModal(video) {
    currentActiveVideo = video;
    videoDetailsModal.classList.remove("episodes-only-mode");
    
    // Configurar imagen de fondo en el modal
    if (video.poster) {
        detailsHero.style.backgroundImage = `url('${video.poster}')`;
    } else {
        detailsHero.style.backgroundImage = 'none';
        detailsHero.style.backgroundColor = '#18181b';
    }

    detailsTitle.innerText = video.title;
    detailsYear.innerText = video.year;
    detailsDuration.innerText = video.duration;
    detailsCategory.innerText = GENDER_NAMES[video.category] || video.category;
    detailsDescription.innerText = video.description;
    detailsAuthor.innerText = video.author || "Desconocido";
    detailsPeople.innerText = video.people || "No especificado";
    detailsTags.innerText = video.tags || "Ninguna";
    detailsMatch.innerText = `${video.match || 90}% de coincidencia`;

    // Configurar botón favorito
    updateDetailsFavoriteBtn(video.id);

    // Botones de acción del modal
    detailsPlayBtn.onclick = () => {
        closeDetailsModal();
        playVideo(video);
    };

    if (video.type === "series") {
        detailsEpisodesBtn.classList.remove("hidden");
        detailsEpisodesBtn.onclick = () => {
            videoDetailsModal.classList.add("episodes-only-mode");
            const wrapper = document.querySelector(".modal-content-wrapper");
            if (wrapper) wrapper.scrollTop = 0;
            const selector = document.getElementById("season-selector");
            if (selector) selector.focus();
        };
    } else {
        detailsEpisodesBtn.classList.add("hidden");
    }

    detailsBackToInfoBtn.onclick = () => {
        videoDetailsModal.classList.remove("episodes-only-mode");
        detailsEpisodesBtn.focus();
    };

    detailsFavoriteBtn.onclick = () => {
        toggleFavorite(video.id);
    };

function checkMasterPassword(promptMessage) {
    if (localStorage.getItem("movieflix_master_auth") === "true") {
        return true;
    }
    const password = prompt(promptMessage);
    if (password === "erison1") {
        localStorage.setItem("movieflix_master_auth", "true");
        return true;
    }
    if (password !== null) {
        alert("Contraseña incorrecta. Acción cancelada.");
    }
    return false;
}

    // Botón eliminar (sólo visible para películas agregadas por el usuario)
    const isCustom = customVideos.some(v => v.id === video.id);
    if (isCustom) {
        detailsDeleteBtn.style.display = "flex";
        detailsEditBtn.style.display = "flex";
        
        detailsDeleteBtn.onclick = () => {
            if (!checkMasterPassword("Introduce la contraseña maestra para eliminar este contenido:")) return;
            if (confirm(`¿Estás seguro de que deseas eliminar "${video.title}" de tu videoteca?`)) {
                deleteVideo(video.id);
            }
        };

        detailsEditBtn.onclick = () => {
            if (!checkMasterPassword("Introduce la contraseña maestra para editar este contenido:")) return;

            editingVideoId = video.id;
            closeDetailsModal();

            // Rellenar formulario con los datos actuales del video
            document.getElementById("video-title").value = video.title;
            document.getElementById("video-type").value = video.type;
            document.getElementById("video-category").value = video.category;
            document.getElementById("video-year").value = video.year;
            document.getElementById("video-duration").value = video.duration;
            document.getElementById("video-author").value = video.author || "";
            document.getElementById("video-people").value = video.people || "";
            document.getElementById("video-tags").value = video.tags || "";
            document.getElementById("video-description").value = video.description || "";

            // Toggle de secciones de formulario según el tipo
            if (video.type === "series") {
                formMovieVideoSection.classList.add("hidden");
                formSeriesEpisodesSection.classList.remove("hidden");
                // Copia profunda de las temporadas para editar en memoria temporal
                formSeasons = JSON.parse(JSON.stringify(video.seasons || []));
                renderFormSeasons();
            } else {
                formMovieVideoSection.classList.remove("hidden");
                formSeriesEpisodesSection.classList.add("hidden");
                
                // Rellenar origen de video
                document.getElementById("tab-video-url").click();
                if (video.isLocalFile) {
                    document.getElementById("video-url").value = `[Mantener archivo local: ${video.fileName}]`;
                } else {
                    document.getElementById("video-url").value = video.url;
                }
            }

            // Rellenar póster
            document.getElementById("tab-poster-url").click();
            if (video.poster && video.poster.startsWith("data:image")) {
                document.getElementById("video-poster").value = "[Mantener póster cargado]";
            } else {
                document.getElementById("video-poster").value = video.poster || "";
            }

            // Cambiar título del modal
            document.querySelector(".form-modal-title").innerText = `Editar "${video.title}"`;
            
            // Abrir modal de añadir/editar
            addVideoModal.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        };
    } else {
        detailsDeleteBtn.style.display = "none";
        detailsEditBtn.style.display = "none";
    }

    // Configurar temporadas si es serie
    setupSeasonDropdown(video);

    // Renderizar similares
    renderSimilarVideos(video);

    videoDetailsModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeDetailsModal() {
    videoDetailsModal.classList.add("hidden");
    document.body.style.overflow = "auto";
}

function renderSimilarVideos(currentVideo) {
    similarGrid.innerHTML = "";
    const allVideos = getAllVideos();

    // Filtrar videos de la misma categoría, excluyendo el actual
    const similar = allVideos
        .filter(v => v.category === currentVideo.category && v.id !== currentVideo.id)
        .slice(0, 4);

    if (similar.length === 0) {
        similarGrid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-muted); font-size:0.85rem;">No hay más películas del género ${GENDER_NAMES[currentVideo.category] || currentVideo.category}.</p>`;
        return;
    }

    similar.forEach(video => {
        const card = document.createElement("div");
        card.className = "similar-card";
        
        let posterHTML = "";
        if (video.poster) {
            posterHTML = `<img src="${video.poster}" class="similar-poster" alt="${video.title}">`;
        } else {
            posterHTML = `
                <div class="card-gradient-bg" style="background: linear-gradient(135deg, ${getRandomHexColor()}, #1e293b); height: 100%;">
                    <span style="font-size:0.8rem; padding:0.5rem;">${video.title}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="similar-poster-container">
                ${posterHTML}
                <div class="similar-play-badge">
                    <i data-lucide="play" style="width: 16px; height: 16px; fill: white;"></i>
                </div>
            </div>
            <div class="similar-info">
                <div class="similar-meta-row">
                    <span class="match-badge">${video.match || 90}% coincidencia</span>
                    <span>${video.year}</span>
                </div>
                <div style="font-size:0.85rem; font-weight:600; margin-bottom: 0.2rem;" class="card-title">${video.title}</div>
                <p class="similar-desc">${video.description}</p>
            </div>
        `;

        card.onclick = () => {
            openDetailsModal(video);
        };

        similarGrid.appendChild(card);
    });

    lucide.createIcons();
}

function openAddVideoModal() {
    addVideoForm.reset();
    
    // Inicializar estados de series por defecto
    formSeasons = [];
    if (videoTypeSelect) {
        videoTypeSelect.value = "movie";
    }
    if (formMovieVideoSection) {
        formMovieVideoSection.classList.remove("hidden");
    }
    if (formSeriesEpisodesSection) {
        formSeriesEpisodesSection.classList.add("hidden");
    }

    // Resetear título del modal
    const formTitleEl = document.querySelector(".form-modal-title");
    if (formTitleEl) {
        formTitleEl.innerText = "Añadir Nueva Película al Catálogo";
    }

    addVideoModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeAddVideoModal() {
    addVideoModal.classList.add("hidden");
    document.body.style.overflow = "auto";
}

// Función para redimensionar y comprimir imágenes locales para no exceder LocalStorage (5MB)
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            
            // Redimensionar si excede 800px
            const maxDim = 800;
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = (maxDim / width) * height;
                    width = maxDim;
                } else {
                    width = (maxDim / height) * width;
                    height = maxDim;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            
            // Comprimir como JPEG al 60%
            const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ==========================================================================
// SECCIONES DE TEMPORADAS Y EPISODIOS (SERIES)
// ==========================================================================

function renderFormSeasons() {
    const container = document.getElementById("seasons-container");
    if (!container) return;
    container.innerHTML = "";

    formSeasons.forEach((season, sIndex) => {
        const seasonBox = document.createElement("div");
        seasonBox.className = "form-season-box";
        seasonBox.innerHTML = `
            <div class="form-season-header">
                <input type="text" class="form-season-title-input" value="${season.name}" placeholder="Ej. Temporada 1" data-sindex="${sIndex}">
                <button type="button" class="btn-icon-danger btn-remove-season" data-sindex="${sIndex}" title="Eliminar Temporada">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
            <div class="form-episodes-list" id="form-episodes-list-${sIndex}">
                <!-- Episodios aquí -->
            </div>
            <button type="button" class="btn-add-episode" data-sindex="${sIndex}">
                <i data-lucide="plus"></i> Añadir Capítulo
            </button>
        `;

        const episodesListElement = seasonBox.querySelector(`#form-episodes-list-${sIndex}`);
        season.episodes.forEach((episode, eIndex) => {
            const episodeRow = document.createElement("div");
            episodeRow.className = "form-episode-row";
            
            if (!episode.id) {
                episode.id = "ep_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
            }

            episodeRow.innerHTML = `
                <div class="form-episode-main-inputs">
                    <input type="text" class="episode-title-input" placeholder="Capítulo (ej. Cap. 1: El comienzo)" value="${episode.name}" data-sindex="${sIndex}" data-eindex="${eIndex}" required>
                    <input type="text" class="episode-duration-input" placeholder="Ej. 15 min" value="${episode.duration || ''}" data-sindex="${sIndex}" data-eindex="${eIndex}" required>
                    <input type="text" class="episode-url-input" placeholder="Ruta del video / URL" value="${episode.isLocalFile ? '[Archivo Local] ' + episode.fileName : episode.url}" data-sindex="${sIndex}" data-eindex="${eIndex}" ${episode.isLocalFile ? 'readonly' : ''} required>
                    
                    <label class="episode-file-label" title="Seleccionar archivo local">
                        <i data-lucide="upload-cloud"></i>
                        <input type="file" class="episode-file-input hidden" accept="video/*" data-sindex="${sIndex}" data-eindex="${eIndex}">
                    </label>
                    
                    <button type="button" class="btn-icon-danger btn-remove-episode" data-sindex="${sIndex}" data-eindex="${eIndex}" title="Eliminar Capítulo">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;

            // Vincular el cargador de archivos del capítulo
            const fileInput = episodeRow.querySelector(".episode-file-input");
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    episode.isLocalFile = true;
                    episode.fileName = file.name;
                    episode.file = file;
                    const blobUrl = URL.createObjectURL(file);
                    episode.url = blobUrl;
                    renderFormSeasons();
                }
            };

            episodesListElement.appendChild(episodeRow);
        });

        container.appendChild(seasonBox);
    });

    // Registrar cambios en los inputs para guardarlos en memoria
    container.querySelectorAll(".form-season-title-input").forEach(input => {
        input.oninput = (e) => {
            const sIndex = parseInt(e.target.dataset.sindex);
            formSeasons[sIndex].name = e.target.value;
        };
    });

    container.querySelectorAll(".episode-title-input").forEach(input => {
        input.oninput = (e) => {
            const sIndex = parseInt(e.target.dataset.sindex);
            const eIndex = parseInt(e.target.dataset.eindex);
            formSeasons[sIndex].episodes[eIndex].name = e.target.value;
        };
    });

    container.querySelectorAll(".episode-duration-input").forEach(input => {
        input.oninput = (e) => {
            const sIndex = parseInt(e.target.dataset.sindex);
            const eIndex = parseInt(e.target.dataset.eindex);
            formSeasons[sIndex].episodes[eIndex].duration = e.target.value;
        };
    });

    container.querySelectorAll(".episode-url-input").forEach(input => {
        input.oninput = (e) => {
            if (input.readOnly) return;
            const sIndex = parseInt(e.target.dataset.sindex);
            const eIndex = parseInt(e.target.dataset.eindex);
            formSeasons[sIndex].episodes[eIndex].url = e.target.value;
            formSeasons[sIndex].episodes[eIndex].isLocalFile = false;
            formSeasons[sIndex].episodes[eIndex].fileName = "";
        };
    });

    // Botones de eliminación y adición
    container.querySelectorAll(".btn-remove-season").forEach(btn => {
        btn.onclick = (e) => {
            const sIndex = parseInt(btn.dataset.sindex);
            formSeasons.splice(sIndex, 1);
            renderFormSeasons();
        };
    });

    container.querySelectorAll(".btn-remove-episode").forEach(btn => {
        btn.onclick = (e) => {
            const sIndex = parseInt(btn.dataset.sindex);
            const eIndex = parseInt(btn.dataset.eindex);
            
            if (formSeasons[sIndex].episodes.length <= 1) {
                alert("Una temporada debe tener al menos un capítulo.");
                return;
            }
            
            formSeasons[sIndex].episodes.splice(eIndex, 1);
            renderFormSeasons();
        };
    });

    container.querySelectorAll(".btn-add-episode").forEach(btn => {
        btn.onclick = (e) => {
            const sIndex = parseInt(btn.dataset.sindex);
            formSeasons[sIndex].episodes.push({
                id: "ep_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
                name: "Capítulo " + (formSeasons[sIndex].episodes.length + 1),
                duration: "",
                url: "",
                isLocalFile: false,
                fileName: ""
            });
            renderFormSeasons();
        };
    });

    lucide.createIcons();
}

function setupSeasonDropdown(video) {
    if (!seasonSelector || !modalSeriesEpisodesSection) return;
    
    if (video.type === "series" && video.seasons && video.seasons.length > 0) {
        modalSeriesEpisodesSection.classList.remove("hidden");
        seasonSelector.innerHTML = "";
        
        video.seasons.forEach((season, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.innerText = season.name;
            seasonSelector.appendChild(option);
        });
        
        seasonSelector.onchange = () => {
            const selectedIndex = parseInt(seasonSelector.value);
            renderEpisodesList(video, selectedIndex);
        };
        
        renderEpisodesList(video, 0);
    } else {
        modalSeriesEpisodesSection.classList.add("hidden");
    }
}

function renderEpisodesList(video, seasonIndex) {
    if (!episodesList) return;
    episodesList.innerHTML = "";
    
    const season = video.seasons[seasonIndex];
    if (!season || !season.episodes) return;
    
    season.episodes.forEach((episode, index) => {
        const row = document.createElement("div");
        row.className = "episode-row";
        row.tabIndex = 0; // Hacer enfocable por teclado/control remoto
        row.innerHTML = `
            <span class="episode-number">${index + 1}</span>
            <div class="episode-play-icon" title="Reproducir capítulo">
                <i data-lucide="play"></i>
            </div>
            <div class="episode-info">
                <span class="episode-title">${episode.name}</span>
                <span class="episode-duration">${episode.duration || (episode.isLocalFile ? 'Archivo Local' : 'Enlace Web')}</span>
            </div>
        `;
        
        row.onclick = () => {
            closeDetailsModal();
            
            // Construir un pseudo-video reproducible
            const playableEpisode = {
                id: episode.id,
                title: episode.name,
                url: episode.isLocalFile ? (sessionVideoBlobs[episode.id] || "") : episode.url,
                isLocalFile: episode.isLocalFile,
                fileName: episode.fileName,
                author: video.author,
                category: video.category,
                seriesTitle: video.title,
                seriesId: video.id
            };
            playVideo(playableEpisode);
        };
        
        row.onkeydown = (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                row.click();
            }
        };
        
        row.onfocus = () => {
            row.scrollIntoView({ behavior: "smooth", block: "nearest" });
        };
        
        episodesList.appendChild(row);
    });
    
    lucide.createIcons();
}

function handleAddVideoSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("video-title").value.trim();
    const type = document.getElementById("video-type").value; // Leer tipo (película o serie)
    const category = document.getElementById("video-category").value;
    const year = parseInt(document.getElementById("video-year").value);
    const duration = document.getElementById("video-duration").value.trim();
    const author = document.getElementById("video-author").value.trim() || null; // Director
    const people = document.getElementById("video-people").value.trim() || ""; // Reparto
    const tags = document.getElementById("video-tags").value.trim() || "";
    const description = document.getElementById("video-description").value.trim(); // Sinopsis

    if (!title || !category || !year || !duration || !description) return;

    // Buscar video original en caso de edición
    let originalVideo = null;
    if (editingVideoId) {
        originalVideo = customVideos.find(v => v.id === editingVideoId);
    }

    // Determinar origen del video (solo para películas)
    let url = "";
    let isLocalFile = false;
    let fileName = "";
    
    if (type !== "series") {
        const videoUrlInputVal = document.getElementById("video-url").value.trim();
        
        // Comprobar si se mantiene el archivo local previo sin cambios
        if (editingVideoId && originalVideo && videoUrlInputVal.startsWith("[Mantener archivo local:")) {
            isLocalFile = originalVideo.isLocalFile;
            fileName = originalVideo.fileName;
            url = sessionVideoBlobs[editingVideoId] || originalVideo.url;
        } else {
            const tabVideoFileActive = document.getElementById("tab-video-file").classList.contains("active");
            if (tabVideoFileActive) {
                const fileInput = document.getElementById("video-file-input");
                const file = fileInput.files[0];
                if (!file) {
                    alert("Por favor selecciona un archivo de video local.");
                    return;
                }
                isLocalFile = true;
                fileName = file.name;
                // Crear blob temporal para esta sesión
                const blobUrl = URL.createObjectURL(file);
                url = blobUrl;
            } else {
                url = videoUrlInputVal;
                if (!url) {
                    alert("Por favor introduce un enlace o ruta de video.");
                    return;
                }
            }
        }
    } else {
        // Validar que haya temporadas y capítulos en formSeasons
        if (formSeasons.length === 0) {
            alert("Por favor añade al menos una temporada.");
            return;
        }
        for (let season of formSeasons) {
            if (!season.name.trim()) {
                alert("Por favor completa los nombres de todas las temporadas.");
                return;
            }
            if (season.episodes.length === 0) {
                alert(`La temporada "${season.name}" debe tener al menos un capítulo.`);
                return;
            }
            for (let ep of season.episodes) {
                if (!ep.name.trim()) {
                    alert("Por favor completa los nombres de todos los capítulos.");
                    return;
                }
                if (!ep.duration.trim()) {
                    alert(`Por favor especifica la duración para el capítulo "${ep.name}".`);
                    return;
                }
                if (!ep.url) {
                    alert(`Por favor especifica el video o archivo para el capítulo "${ep.name}".`);
                    return;
                }
            }
        }
    }

    const newVideoId = editingVideoId || ("cust_" + Date.now());

    // Determinar origen del póster (imagen)
    const tabPosterFileActive = document.getElementById("tab-poster-file").classList.contains("active");
    
    const saveMovie = (posterData) => {
        let finalPoster = posterData;
        
        // Conservar póster previo si se seleccionó la opción de mantener
        if (editingVideoId && originalVideo && document.getElementById("video-poster").value === "[Mantener póster cargado]") {
            finalPoster = originalVideo.poster;
        }

        let savedSeasons = [];
        if (type === "series") {
            savedSeasons = formSeasons.map(season => {
                return {
                    name: season.name,
                    episodes: season.episodes.map(ep => {
                        const epId = ep.id || ("ep_" + Date.now() + "_" + Math.floor(Math.random() * 10000));
                        
                        let finalUrl = ep.url;
                        let finalIsLocal = ep.isLocalFile;
                        let finalFileName = ep.fileName;
                        
                        // Si es archivo local y el campo de texto es el placeholder sin cambios
                        if (ep.isLocalFile && !ep.file && originalVideo && originalVideo.seasons) {
                            let origEp = null;
                            originalVideo.seasons.forEach(origS => {
                                origS.episodes.forEach(origE => {
                                    if (origE.id === epId) origEp = origE;
                                });
                            });
                            if (origEp) {
                                finalUrl = sessionVideoBlobs[epId] || origEp.url;
                                finalIsLocal = origEp.isLocalFile;
                                finalFileName = origEp.fileName;
                            }
                        } else if (ep.isLocalFile && ep.file) {
                            // Si se subió un nuevo archivo local para este episodio
                            sessionVideoBlobs[epId] = ep.url;
                        }
                        
                        return {
                            id: epId,
                            name: ep.name,
                            duration: ep.duration,
                            url: finalIsLocal ? "" : finalUrl,
                            isLocalFile: finalIsLocal,
                            fileName: finalFileName
                        };
                    })
                };
            });
        }

        const newVideo = {
            id: newVideoId,
            title,
            type, // Guardar el tipo
            category,
            year,
            url: type === "series" ? "" : (isLocalFile ? "" : url),
            isLocalFile: type === "series" ? false : isLocalFile,
            fileName: type === "series" ? "" : fileName,
            poster: finalPoster,
            duration,
            author,
            people,
            tags,
            description,
            seasons: type === "series" ? savedSeasons : null,
            match: originalVideo ? originalVideo.match : (Math.floor(Math.random() * 15) + 85)
        };

        // Si es local y estamos reproduciendo inmediatamente, guardar la referencia temporal
        if (type !== "series" && isLocalFile) {
            sessionVideoBlobs[newVideoId] = url; // guardar blobUrl
        }

        if (editingVideoId) {
            const index = customVideos.findIndex(v => v.id === editingVideoId);
            if (index !== -1) {
                customVideos[index] = newVideo;
            }
            editingVideoId = null; // Resetear bandera de edición
        } else {
            customVideos.push(newVideo);
        }

        saveCustomVideos();
        closeAddVideoModal();
        renderVideoRows();
        setupHeroBanner();
    };

    if (tabPosterFileActive) {
        const fileInput = document.getElementById("poster-file-input");
        const file = fileInput.files[0];
        if (file) {
            compressImage(file, (compressedBase64) => {
                saveMovie(compressedBase64);
            });
        } else {
            saveMovie(null); // Sin póster
        }
    } else {
        const posterUrl = document.getElementById("video-poster").value.trim() || null;
        saveMovie(posterUrl);
    }
}

function deleteVideo(videoId) {
    customVideos = customVideos.filter(v => v.id !== videoId);
    saveCustomVideos();

    profiles.forEach(p => {
        p.favorites = p.favorites.filter(id => id !== videoId);
    });
    saveProfiles();

    closeDetailsModal();
    renderVideoRows();
    setupHeroBanner();
}

// ==========================================================================
// 10. REPRODUCTOR DE VIDEO A PANTALLA COMPLETA PERSONALIZADO
// ==========================================================================

function relinkLocalVideo(video) {
    let relinkInput = document.getElementById("relink-file-input");
    if (!relinkInput) {
        relinkInput = document.createElement("input");
        relinkInput.type = "file";
        relinkInput.id = "relink-file-input";
        relinkInput.accept = "video/*";
        relinkInput.className = "hidden";
        document.body.appendChild(relinkInput);
    }
    
    alert(`Por seguridad del navegador, selecciona el archivo original del video "${video.fileName}" para reproducirlo en esta sesión.`);
    
    relinkInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const blobUrl = URL.createObjectURL(file);
            sessionVideoBlobs[video.id] = blobUrl;
            video.url = blobUrl;
            playVideo(video);
        }
    };
    
    relinkInput.click();
}

function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function getGoogleDriveEmbedUrl(url) {
    if (!url) return null;
    
    // Formato estándar de compartir: /file/d/[ID]/view o /file/d/[ID]/preview
    const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    
    // Formato alternativo de API de descarga: ?id=[ID]
    const idRegex = /[?&]id=([a-zA-Z0-9_-]+)/;
    const idMatch = url.match(idRegex);
    if (url.includes("drive.google.com") && idMatch && idMatch[1]) {
        return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
    
    return null;
}

function getDirectStreamUrl(url) {
    if (!url) return "";
    
    // Convertir enlaces de Dropbox a enlaces de streaming directo
    if (url.includes("dropbox.com")) {
        return url.replace("dl=0", "raw=1").replace("dl=1", "raw=1");
    }
    
    // Convertir enlaces de OneDrive a enlaces de streaming directo
    if (url.includes("onedrive.live.com") && url.includes("resid=")) {
        if (!url.includes("authkey=")) {
            return url.replace("redir?", "download?").replace("embed?", "download?");
        }
    }
    
    return url;
}

function playVideo(video) {
    // Si es una serie, reproducir el primer capítulo por defecto o el último visto
    if (video.type === "series") {
        if (video.seasons && video.seasons.length > 0 && video.seasons[0].episodes && video.seasons[0].episodes.length > 0) {
            // Comprobar si hay un capítulo guardado en el historial de este perfil
            let historyItem = activeProfile && activeProfile.history && activeProfile.history.find(h => h.id === video.id);
            let targetEpisode = null;
            if (historyItem && historyItem.episodeId) {
                // Buscar el episodio en las temporadas
                for (let season of video.seasons) {
                    let ep = season.episodes.find(e => e.id === historyItem.episodeId);
                    if (ep) {
                        targetEpisode = ep;
                        break;
                    }
                }
            }
            
            const episodeToPlay = targetEpisode || video.seasons[0].episodes[0];
            const playableEpisode = {
                id: episodeToPlay.id,
                title: episodeToPlay.name,
                url: episodeToPlay.isLocalFile ? (sessionVideoBlobs[episodeToPlay.id] || "") : episodeToPlay.url,
                isLocalFile: episodeToPlay.isLocalFile,
                fileName: episodeToPlay.fileName,
                author: video.author,
                category: video.category,
                seriesTitle: video.title,
                seriesId: video.id
            };
            playVideo(playableEpisode);
        } else {
            alert("Esta serie no tiene capítulos disponibles.");
        }
        return;
    }

    currentActiveVideo = video;
    
    // REGISTRAR INICIO EN EL HISTORIAL
    recordHistoryStart(video);
    
    const iframeContainer = document.getElementById("universal-iframe-container");
    const youtubeId = getYouTubeId(video.url);
    const driveEmbedUrl = getGoogleDriveEmbedUrl(video.url);

    if (youtubeId || driveEmbedUrl) {
        // Modo YouTube o Google Drive Embed / Universal
        const embedSrc = youtubeId 
            ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1&rel=0` 
            : driveEmbedUrl;
            
        playerContainer.classList.add("iframe-mode");
        iframeContainer.innerHTML = `
            <iframe 
                src="${embedSrc}" 
                frameborder="0" 
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen 
                style="width: 100%; height: 100%;">
            </iframe>
        `;
        
        if (video.seriesTitle) {
            playerTitleDisplay.innerText = video.seriesTitle;
            playerSubtitleDisplay.innerText = video.title;
        } else {
            playerTitleDisplay.innerText = video.title;
            const catName = GENDER_NAMES[video.category] || video.category;
            playerSubtitleDisplay.innerText = `${catName} • Dirigido por ${video.author || 'Desconocido'}`;
        }
        
        playerContainer.classList.remove("hidden");
        playerLoader.style.display = "none";
        
        // Mostrar cabecera de salida con desvanecimiento automático
        resetControlsTimeout();
        return;
    }

    // Modo Video Local / Directo
    playerContainer.classList.remove("iframe-mode");
    iframeContainer.innerHTML = "";

    // Si es un archivo local y no se ha vinculado en esta sesión, pedir vinculación
    if (video.isLocalFile && (!video.url || !sessionVideoBlobs[video.id])) {
        relinkLocalVideo(video);
        return;
    }

    videoElement.src = getDirectStreamUrl(video.url);
    
    // REANUDAR POSICIÓN DE REPRODUCCIÓN (solo para HTML5 directo/local)
    const targetId = video.seriesId ? video.seriesId : video.id;
    let historyItem = activeProfile && activeProfile.history && activeProfile.history.find(h => h.id === targetId);
    if (historyItem && historyItem.currentTime > 5 && historyItem.progress < 0.95) {
        const shouldResume = !video.seriesId || (historyItem.episodeId === video.id);
        if (shouldResume) {
            const onLoadedMetadata = () => {
                videoElement.currentTime = historyItem.currentTime;
                videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
            };
            videoElement.addEventListener('loadedmetadata', onLoadedMetadata);
        }
    }
    
    if (video.seriesTitle) {
        playerTitleDisplay.innerText = video.seriesTitle;
        playerSubtitleDisplay.innerText = video.title;
    } else {
        playerTitleDisplay.innerText = video.title;
        const catName = GENDER_NAMES[video.category] || video.category;
        playerSubtitleDisplay.innerText = `${catName} • Dirigido por ${video.author || 'Desconocido'}`;
    }

    playerContainer.classList.remove("hidden");
    playerContainer.classList.add("controls-active");
    
    playerLoader.style.display = "flex";
    
    videoElement.play()
        .then(() => {
            updatePlayPauseButton(true);
        })
        .catch(err => {
            console.log("Error al autoreproducir:", err);
            updatePlayPauseButton(false);
        });

    resetControlsTimeout();
}

// ==========================================================================
// FUNCIONES AUXILIARES DE HISTORIAL
// ==========================================================================

let lastProfileServerSave = 0;

function recordHistoryStart(video) {
    if (!activeProfile) return;
    
    const targetId = video.seriesId ? video.seriesId : video.id;
    activeProfile.history = activeProfile.history || [];
    
    let historyItem = activeProfile.history.find(h => h.id === targetId);
    if (!historyItem) {
        historyItem = {
            id: targetId,
            type: video.seriesId ? "series" : "movie"
        };
        activeProfile.history.unshift(historyItem);
    } else {
        // Mover al inicio (más recientemente visto)
        activeProfile.history = activeProfile.history.filter(h => h.id !== targetId);
        activeProfile.history.unshift(historyItem);
    }
    
    historyItem.episodeId = video.seriesId ? video.id : null;
    historyItem.episodeTitle = video.seriesId ? video.title : null;
    historyItem.timestamp = Date.now();
    
    if (historyItem.progress === undefined) {
        historyItem.progress = 0.05; // 5% de progreso inicial para marcar que empezó
        historyItem.currentTime = 0;
        historyItem.duration = 0;
    }
    
    saveProfiles();
}

function updatePlaybackHistory() {
    if (!activeProfile || !currentActiveVideo) return;
    
    // Ignorar si el reproductor está oculto u omitir si es modo iframe
    if (playerContainer.classList.contains("hidden") || playerContainer.classList.contains("iframe-mode")) return;
    
    const targetId = currentActiveVideo.seriesId ? currentActiveVideo.seriesId : currentActiveVideo.id;
    activeProfile.history = activeProfile.history || [];
    
    let historyItem = activeProfile.history.find(h => h.id === targetId);
    if (!historyItem) {
        historyItem = {
            id: targetId,
            type: currentActiveVideo.seriesId ? "series" : "movie"
        };
        activeProfile.history.unshift(historyItem);
    } else {
        // Asegurar que esté al inicio
        activeProfile.history = activeProfile.history.filter(h => h.id !== targetId);
        activeProfile.history.unshift(historyItem);
    }
    
    historyItem.episodeId = currentActiveVideo.seriesId ? currentActiveVideo.id : null;
    historyItem.episodeTitle = currentActiveVideo.seriesId ? currentActiveVideo.title : null;
    historyItem.currentTime = videoElement.currentTime;
    historyItem.duration = videoElement.duration || 0;
    historyItem.progress = historyItem.duration > 0 ? (historyItem.currentTime / historyItem.duration) : 0;
    historyItem.timestamp = Date.now();
    
    // Guardar en almacenamiento local
    localStorage.setItem("movieflix_profiles", JSON.stringify(profiles));
    
    // Guardar diferido en el servidor cada 15 segundos
    const now = Date.now();
    if (now - lastProfileServerSave > 15000) {
        saveProfiles();
        lastProfileServerSave = now;
    }
}

function getNextEpisode(seriesId, currentEpisodeId) {
    const allVideos = getAllVideos();
    const series = allVideos.find(v => v.id === seriesId);
    if (!series || !series.seasons) return null;
    
    let foundCurrent = false;
    for (let s = 0; s < series.seasons.length; s++) {
        const season = series.seasons[s];
        for (let e = 0; e < season.episodes.length; e++) {
            const ep = season.episodes[e];
            if (foundCurrent) {
                return {
                    episode: ep,
                    seasonIndex: s,
                    episodeIndex: e
                };
            }
            if (ep.id === currentEpisodeId) {
                foundCurrent = true;
            }
        }
    }
    return null;
}

function handleVideoEnded() {
    if (!activeProfile || !currentActiveVideo) return;
    
    const targetId = currentActiveVideo.seriesId ? currentActiveVideo.seriesId : currentActiveVideo.id;
    
    if (currentActiveVideo.seriesId) {
        // Buscar el siguiente capítulo
        const next = getNextEpisode(currentActiveVideo.seriesId, currentActiveVideo.id);
        if (next) {
            // Actualizar historial al siguiente capítulo al 0%
            let historyItem = activeProfile.history && activeProfile.history.find(h => h.id === targetId);
            if (historyItem) {
                historyItem.episodeId = next.episode.id;
                historyItem.episodeTitle = next.episode.name;
                historyItem.currentTime = 0;
                historyItem.progress = 0;
                historyItem.timestamp = Date.now();
            }
            saveProfiles();
            exitVideoPlayer();
            renderVideoRows();
            return;
        }
    }
    
    // Si es película o el último capítulo de la serie, remover del historial
    if (activeProfile.history) {
        activeProfile.history = activeProfile.history.filter(h => h.id !== targetId);
    }
    saveProfiles();
    exitVideoPlayer();
    renderVideoRows();
}

function exitVideoPlayer() {
    videoElement.pause();
    videoElement.src = "";
    
    // Detener e iframe si existe para apagar el sonido de YouTube
    const iframeContainer = document.getElementById("universal-iframe-container");
    iframeContainer.innerHTML = "";
    
    playerContainer.classList.add("hidden");
    playerContainer.classList.remove("iframe-mode");
    clearTimeout(controlsTimeout);
    document.body.style.overflow = "auto";
    
    // Guardar historial al salir y refrescar filas del dashboard
    saveProfiles();
    renderVideoRows();
}

function togglePlayPause() {
    if (videoElement.paused) {
        videoElement.play();
        updatePlayPauseButton(true);
        showCenterPlayIcon("play");
    } else {
        videoElement.pause();
        updatePlayPauseButton(false);
        showCenterPlayIcon("pause");
    }
}

function updatePlayPauseButton(isPlaying) {
    if (isPlaying) {
        ctrlPlayBtn.innerHTML = `<i data-lucide="pause"></i>`;
    } else {
        ctrlPlayBtn.innerHTML = `<i data-lucide="play"></i>`;
    }
    lucide.createIcons();
}

function showCenterPlayIcon(state) {
    centerPlayBtn.classList.remove("show-pop");
    void centerPlayBtn.offsetWidth;
    
    if (state === "play") {
        centerPlayIcon.setAttribute("data-lucide", "play");
    } else {
        centerPlayIcon.setAttribute("data-lucide", "pause");
    }
    lucide.createIcons();
    centerPlayBtn.classList.add("show-pop");
}

function skipTime(amount) {
    videoElement.currentTime += amount;
}

function handleVolumeChange() {
    videoElement.volume = ctrlVolumeSlider.value;
    videoElement.muted = (videoElement.volume === 0);
    updateVolumeIcon();
}

function toggleMute() {
    if (videoElement.muted) {
        videoElement.muted = false;
        videoElement.volume = ctrlVolumeSlider.value || 1;
    } else {
        videoElement.muted = true;
    }
    updateVolumeIcon();
}

function updateVolumeIcon() {
    if (videoElement.muted || videoElement.volume === 0) {
        ctrlVolumeBtn.innerHTML = `<i data-lucide="volume-x"></i>`;
        ctrlVolumeSlider.value = 0;
    } else if (videoElement.volume < 0.5) {
        ctrlVolumeBtn.innerHTML = `<i data-lucide="volume-1"></i>`;
        ctrlVolumeSlider.value = videoElement.volume;
    } else {
        ctrlVolumeBtn.innerHTML = `<i data-lucide="volume-2"></i>`;
        ctrlVolumeSlider.value = videoElement.volume;
    }
    lucide.createIcons();
}

function updateTimeDisplay() {
    const curTime = formatTime(videoElement.currentTime);
    const durTime = formatTime(videoElement.duration || 0);

    timeCurrent.innerText = curTime;
    timeDuration.innerText = durTime;

    if (videoElement.duration) {
        const percent = (videoElement.currentTime / videoElement.duration) * 100;
        playerCurrentProgress.style.width = `${percent}%`;
    }
}

function formatTime(seconds) {
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);

    const pad = (num) => num.toString().padStart(2, "0");

    if (h > 0) {
        return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${m}:${pad(s)}`;
}

function updateBufferDisplay() {
    if (videoElement.buffered.length > 0 && videoElement.duration) {
        const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
        const percent = (bufferedEnd / videoElement.duration) * 100;
        playerBuffer.style.width = `${percent}%`;
    }
}

function setVideoProgress(e) {
    const rect = playerProgressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoElement.currentTime = pos * videoElement.duration;
}

function handleProgressBarHover(e) {
    const rect = playerProgressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const hoverSeconds = pos * videoElement.duration;

    if (!isNaN(hoverSeconds)) {
        playerHoverTime.innerText = formatTime(hoverSeconds);
        playerHoverTime.style.left = `${e.clientX - rect.left}px`;
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        playerContainer.requestFullscreen()
            .then(() => {
                ctrlFullscreenBtn.innerHTML = `<i data-lucide="minimize"></i>`;
                lucide.createIcons();
            })
            .catch(err => {
                console.log("Error al activar pantalla completa:", err);
            });
    } else {
        document.exitFullscreen();
        ctrlFullscreenBtn.innerHTML = `<i data-lucide="maximize"></i>`;
        lucide.createIcons();
    }
}

function selectPlaybackSpeed(speedBtn) {
    const speed = parseFloat(speedBtn.dataset.speed);
    videoElement.playbackRate = speed;

    document.querySelectorAll(".speed-opt").forEach(opt => {
        opt.classList.remove("active");
    });
    speedBtn.classList.add("active");
    
    ctrlSpeedBtn.querySelector("span").innerText = speed === 1 ? "Normal" : `${speed}x`;
    speedOptionsContainer.classList.add("hidden");
}

function resetControlsTimeout() {
    playerContainer.classList.add("controls-active");
    playerContainer.style.cursor = "default";
    clearTimeout(controlsTimeout);

    const isIframeMode = playerContainer.classList.contains("iframe-mode");
    if (isIframeMode || !videoElement.paused) {
        controlsTimeout = setTimeout(() => {
            playerContainer.classList.remove("controls-active");
            playerContainer.style.cursor = "none";
            speedOptionsContainer.classList.add("hidden");
        }, 3000);
    }
}

// ==========================================================================
// 11. MANEJADORES DE EVENTOS GLOBALES
// ==========================================================================

function setupGlobalEvents() {
    // Auxiliar para auto-desplazar elementos al enfocarse en Smart TV
    const makeElementAutoScrollOnFocus = (el) => {
        if (!el) return;
        el.addEventListener("focus", () => {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    };

    // Registrar elementos enfocables del modal de detalles para auto-scroll
    makeElementAutoScrollOnFocus(detailsCloseBtn);
    makeElementAutoScrollOnFocus(detailsPlayBtn);
    makeElementAutoScrollOnFocus(detailsEpisodesBtn);
    makeElementAutoScrollOnFocus(detailsBackToInfoBtn);
    makeElementAutoScrollOnFocus(detailsFavoriteBtn);
    makeElementAutoScrollOnFocus(detailsEditBtn);
    makeElementAutoScrollOnFocus(detailsDeleteBtn);
    makeElementAutoScrollOnFocus(seasonSelector);

    if (episodesScrollDownBtn) {
        episodesScrollDownBtn.onclick = (e) => {
            e.preventDefault();
            const wrapper = document.querySelector(".modal-content-wrapper");
            if (wrapper) {
                wrapper.scrollBy({ top: 350, behavior: "smooth" });
            }
        };
        makeElementAutoScrollOnFocus(episodesScrollDownBtn);
    }

    if (episodesScrollUpBtn) {
        episodesScrollUpBtn.onclick = (e) => {
            e.preventDefault();
            const wrapper = document.querySelector(".modal-content-wrapper");
            if (wrapper) {
                wrapper.scrollTo({ top: 0, behavior: "smooth" });
            }
        };
        makeElementAutoScrollOnFocus(episodesScrollUpBtn);
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    currentProfileTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => {
        profileDropdown.classList.add("hidden");
    });

    dropdownManageProfiles.onclick = () => {
        mainDashboard.classList.add("hidden");
        mainDashboard.classList.remove("active");
        profileScreen.classList.remove("hidden");
        profileScreen.classList.add("active");
        renderProfilesScreen();
        toggleProfileManagement();
    };

    dropdownExitProfile.onclick = () => {
        mainDashboard.classList.add("hidden");
        mainDashboard.classList.remove("active");
        profileScreen.classList.remove("hidden");
        profileScreen.classList.add("active");
        renderProfilesScreen();
    };

    // Acciones de Vinculación de Cuenta de Google (Drive)
    const handleGoogleLinkClick = (e) => {
        e.preventDefault();
        // Abrir en una pestaña nueva del navegador principal para evitar el bloqueo de seguridad de Google en WebView/PWA
        window.open("https://accounts.google.com", "_blank");
    };

    if (profileLinkGoogle) {
        profileLinkGoogle.onclick = handleGoogleLinkClick;
    }

    if (dropdownLinkGoogle) {
        dropdownLinkGoogle.onclick = handleGoogleLinkClick;
    }

    if (profileLogoutLink) {
        profileLogoutLink.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem("movieflix_login_auth");
            loginErrorMsg.classList.add("hidden");
            loginPasswordInput.value = "";
            setupSiteAuthentication();
        };
    }

    if (dropdownLogoutApp) {
        dropdownLogoutApp.onclick = (e) => {
            e.preventDefault();
            localStorage.removeItem("movieflix_login_auth");
            loginErrorMsg.classList.add("hidden");
            loginPasswordInput.value = "";
            mainDashboard.classList.add("hidden");
            mainDashboard.classList.remove("active");
            setupSiteAuthentication();
        };
    }

    manageProfilesBtn.onclick = toggleProfileManagement;

    profileModalCloseBtn.onclick = closeProfileModal;
    profileModalBackdrop.onclick = closeProfileModal;
    profileModalCancelBtn.onclick = closeProfileModal;
    profileForm.onsubmit = handleProfileSubmit;

    avatarOpts.forEach(opt => {
        opt.addEventListener("click", () => {
            avatarOpts.forEach(o => o.classList.remove("selected"));
            opt.classList.add("selected");
            currentSelectedAvatarColor = opt.dataset.color;
        });
    });

    searchToggleBtn.addEventListener("click", () => {
        const box = document.getElementById("search-box");
        box.classList.toggle("active");
        if (box.classList.contains("active")) {
            searchInput.focus();
        } else {
            searchInput.value = "";
            clearSearchBtn.classList.add("hidden");
            renderVideoRows();
        }
    });

    searchInput.addEventListener("input", () => {
        if (searchInput.value.trim() !== "") {
            clearSearchBtn.classList.remove("hidden");
        } else {
            clearSearchBtn.classList.add("hidden");
        }
        performSearch();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.focus();
        clearSearchBtn.classList.add("hidden");
        performSearch();
    });

    // Navegación unificada para escritorio y móvil
    document.querySelectorAll(".nav-link, .mobile-menu-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            
            // Cerrar menú lateral en móvil al navegar
            mobileMenuOverlay.classList.add("hidden");

            // Desmarcar todos los enlaces activos
            document.querySelectorAll(".nav-link, .mobile-menu-link").forEach(l => l.classList.remove("active"));
            
            const target = link.dataset.target;
            
            // Marcar activos los enlaces correspondientes al target en ambos menús
            document.querySelectorAll(`[data-target="${target}"]`).forEach(l => l.classList.add("active"));

            // Limpiar buscador si se cambia de sección
            searchInput.value = "";
            clearSearchBtn.classList.add("hidden");
            document.getElementById("search-box").classList.remove("active");

            const allVideos = getAllVideos();

            if (target === "my-list") {
                const favoriteVideos = allVideos.filter(v => activeProfile.favorites.includes(v.id));
                mainContent.innerHTML = "";
                if (favoriteVideos.length === 0) {
                    const row = document.createElement("div");
                    row.className = "video-row";
                    row.innerHTML = `
                        <h2 class="row-title"><i data-lucide="check-circle"></i> Mi Lista</h2>
                        <div class="row-empty-message">
                            No has agregado ningún contenido a tu lista todavía. Explora el catálogo y presiona el botón (+) para agregarlo.
                        </div>
                    `;
                    mainContent.appendChild(row);
                    lucide.createIcons();
                } else {
                    createVideoRow("Mi Lista", favoriteVideos, "check-circle");
                }
            } else if (target === "series") {
                renderVideoRows("series");
            } else if (target === "movies") {
                renderVideoRows("movie");
            } else if (target === "home") {
                renderVideoRows("all");
            }
        });
    });

    // Controladores de apertura y cierre del Menú de Hamburguesa Móvil
    if (hamburgerMenuBtn) {
        hamburgerMenuBtn.onclick = () => {
            mobileMenuOverlay.classList.remove("hidden");
        };
    }
    if (mobileMenuCloseBtn) {
        mobileMenuCloseBtn.onclick = () => {
            mobileMenuOverlay.classList.add("hidden");
        };
    }
    if (mobileMenuBackdrop) {
        mobileMenuBackdrop.onclick = () => {
            mobileMenuOverlay.classList.add("hidden");
        };
    }

    detailsCloseBtn.onclick = closeDetailsModal;
    detailsBackdrop.onclick = closeDetailsModal;

    // Vinculación de Tipo de Contenido (Película vs Serie)
    if (videoTypeSelect) {
        videoTypeSelect.onchange = () => {
            if (videoTypeSelect.value === "series") {
                if (formMovieVideoSection) formMovieVideoSection.classList.add("hidden");
                if (formSeriesEpisodesSection) formSeriesEpisodesSection.classList.remove("hidden");
                
                // Inicializar serie por defecto si está vacía
                if (formSeasons.length === 0) {
                    formSeasons = [
                        {
                            id: Date.now(),
                            name: "Temporada 1",
                            episodes: [
                                {
                                    id: "ep_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
                                    name: "Capítulo 1",
                                    duration: "",
                                    url: "",
                                    isLocalFile: false,
                                    fileName: ""
                                }
                            ]
                        }
                    ];
                }
                renderFormSeasons();
            } else {
                if (formMovieVideoSection) formMovieVideoSection.classList.remove("hidden");
                if (formSeriesEpisodesSection) formSeriesEpisodesSection.classList.add("hidden");
            }
        };
    }

    if (btnAddSeason) {
        btnAddSeason.onclick = () => {
            formSeasons.push({
                id: Date.now(),
                name: "Temporada " + (formSeasons.length + 1),
                episodes: [
                    {
                        id: "ep_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
                        name: "Capítulo 1",
                        duration: "",
                        url: "",
                        isLocalFile: false,
                        fileName: ""
                    }
                ]
            });
            renderFormSeasons();
        };
    }

    // Tabs para agregar película (URL vs Archivo)
    const tabVideoUrl = document.getElementById("tab-video-url");
    const tabVideoFile = document.getElementById("tab-video-file");
    const contentVideoUrl = document.getElementById("content-video-url");
    const contentVideoFile = document.getElementById("content-video-file");

    tabVideoUrl.onclick = () => {
        tabVideoUrl.classList.add("active");
        tabVideoFile.classList.remove("active");
        contentVideoUrl.classList.remove("hidden");
        contentVideoFile.classList.add("hidden");
    };
    tabVideoFile.onclick = () => {
        tabVideoFile.classList.add("active");
        tabVideoUrl.classList.remove("active");
        contentVideoFile.classList.remove("hidden");
        contentVideoUrl.classList.add("hidden");
    };

    const tabPosterUrl = document.getElementById("tab-poster-url");
    const tabPosterFile = document.getElementById("tab-poster-file");
    const contentPosterUrl = document.getElementById("content-poster-url");
    const contentPosterFile = document.getElementById("content-poster-file");

    tabPosterUrl.onclick = () => {
        tabPosterUrl.classList.add("active");
        tabPosterFile.classList.remove("active");
        contentPosterUrl.classList.remove("hidden");
        contentPosterFile.classList.add("hidden");
    };
    tabPosterFile.onclick = () => {
        tabPosterFile.classList.add("active");
        tabPosterUrl.classList.remove("active");
        contentPosterFile.classList.remove("hidden");
        contentPosterUrl.classList.add("hidden");
    };

    // Lógica para añadir contenido (escritorio y móvil) protegido por contraseña maestra
    const handleAddVideoClick = (e) => {
        if (e) e.preventDefault();
        
        if (!checkMasterPassword("Introduce la contraseña maestra para añadir contenido:")) return;

        mobileMenuOverlay.classList.add("hidden"); // Asegurar cerrar el menú móvil
        tabVideoUrl.click();
        tabPosterUrl.click();
        openAddVideoModal();
    };
    navAddVideo.onclick = handleAddVideoClick;
    if (mobileNavAddSidebar) {
        mobileNavAddSidebar.onclick = handleAddVideoClick;
    }
    addVideoCloseBtn.onclick = closeAddVideoModal;
    addVideoBackdrop.onclick = closeAddVideoModal;
    addVideoCancel.onclick = closeAddVideoModal;
    addVideoForm.onsubmit = handleAddVideoSubmit;

    playerBackBtn.onclick = exitVideoPlayer;
    ctrlPlayBtn.onclick = togglePlayPause;
    centerPlayBtn.onclick = togglePlayPause;
    
    videoElement.onclick = (e) => {
        if (e.target === videoElement) {
            togglePlayPause();
        }
    };

    ctrlRewindBtn.onclick = () => skipTime(-10);
    ctrlForwardBtn.onclick = () => skipTime(10);
    
    ctrlVolumeBtn.onclick = toggleMute;
    ctrlVolumeSlider.addEventListener("input", handleVolumeChange);

    videoElement.addEventListener("waiting", () => {
        playerLoader.style.display = "flex";
    });
    videoElement.addEventListener("canplay", () => {
        playerLoader.style.display = "none";
    });
    videoElement.addEventListener("error", () => {
        // Ignorar el error si el reproductor está oculto (evita falsas alarmas al inicializar con src vacía)
        if (playerContainer.classList.contains("hidden")) return;

        playerLoader.style.display = "none";
        alert("Error de reproducción: No se pudo cargar el archivo de video.\n\nPor favor verifica:\n1. Que la ruta esté escrita con barras diagonales ('/') y no invertidas ('\\').\n2. Que el archivo esté dentro de la carpeta del proyecto (ej: 'assets/video.mp4') y estés ejecutando un servidor local (ej: npx serve).\n3. Si abriste la página con doble clic (file://), los navegadores bloquean la carga de otros archivos locales por seguridad. Debes usar un servidor local.\n4. Que el formato de video sea compatible (se recomienda .mp4 en codec H.264).");
        exitVideoPlayer();
    });
    
    videoElement.addEventListener("timeupdate", updateTimeDisplay);
    videoElement.addEventListener("timeupdate", updatePlaybackHistory);
    videoElement.addEventListener("progress", updateBufferDisplay);
    videoElement.addEventListener("ended", handleVideoEnded);
    
    playerProgressContainer.addEventListener("click", setVideoProgress);
    playerProgressContainer.addEventListener("mousemove", handleProgressBarHover);

    ctrlFullscreenBtn.onclick = toggleFullscreen;
    document.addEventListener("fullscreenchange", () => {
        if (!document.fullscreenElement) {
            ctrlFullscreenBtn.innerHTML = `<i data-lucide="maximize"></i>`;
        } else {
            ctrlFullscreenBtn.innerHTML = `<i data-lucide="minimize"></i>`;
        }
        lucide.createIcons();
    });

    ctrlSpeedBtn.onclick = (e) => {
        e.stopPropagation();
        speedOptionsContainer.classList.toggle("hidden");
    };

    document.querySelectorAll(".speed-opt").forEach(opt => {
        opt.onclick = () => selectPlaybackSpeed(opt);
    });

    document.addEventListener("click", () => {
        speedOptionsContainer.classList.add("hidden");
    });

    playerContainer.addEventListener("mousemove", resetControlsTimeout);
    playerContainer.addEventListener("click", resetControlsTimeout);

    document.addEventListener("keydown", (e) => {
        if (playerContainer.classList.contains("hidden")) return;

        switch (e.key.toLowerCase()) {
            case " ":
            case "k":
                e.preventDefault();
                togglePlayPause();
                break;
            case "arrowleft":
            case "j":
                e.preventDefault();
                skipTime(-10);
                break;
            case "arrowright":
            case "l":
                e.preventDefault();
                skipTime(10);
                break;
            case "arrowup":
                e.preventDefault();
                videoElement.volume = Math.min(videoElement.volume + 0.1, 1);
                ctrlVolumeSlider.value = videoElement.volume;
                handleVolumeChange();
                break;
            case "arrowdown":
                e.preventDefault();
                videoElement.volume = Math.max(videoElement.volume - 0.1, 0);
                ctrlVolumeSlider.value = videoElement.volume;
                handleVolumeChange();
                break;
            case "m":
                e.preventDefault();
                toggleMute();
                break;
            case "f":
                e.preventDefault();
                toggleFullscreen();
                break;
            case "escape":
                if (!playerContainer.classList.contains("hidden")) {
                    exitVideoPlayer();
                }
                break;
        }
        resetControlsTimeout();
    });
}

document.addEventListener("DOMContentLoaded", initApp);
