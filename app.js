/**
 * LINK G-DRIVE SPPG - APPLICATION LOGIC
 * Penyimpan dan Pengelola Link Google Drive Terpadu
 */

// Storage Keys
const BASE_STORAGE_KEY = 'sppg_gdrive_links_v1';
const ACCOUNTS_STORAGE_KEY = 'sppg_registered_accounts_v1';
const SESSION_STORAGE_KEY = 'sppg_active_session_v1';
const THEME_STORAGE_KEY = 'sppg_gdrive_theme_pref';
const VIEW_STORAGE_KEY = 'sppg_gdrive_view_pref';
const SORT_STORAGE_KEY = 'sppg_gdrive_sort_pref';
const LAYOUT_HINT_DISMISSED_KEY = 'sppg_layout_hint_dismissed_v1';
const CLOUD_CONFIG_STORAGE_KEY = 'sppg_firebase_config_v1';

// Initial Starter Data
const DEFAULT_LINKS = [
  {
    id: 'sppg-link-1',
    title: 'Folder Utama Berkas & Dokumen SPPG',
    url: 'https://drive.google.com/drive/folders/1SPPG-MainArchive-SampleFolderDrive2026',
    type: 'folder',
    category: 'SPPG Utama',
    description: 'Pusat penyimpanan seluruh berkas, arsip kerja, dan dokumen legalitas SPPG.',
    favorite: true,
    clicks: 48,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'sppg-link-2',
    title: 'Buku Kas & Rekapitulasi Keuangan SPPG 2026',
    url: 'https://docs.google.com/spreadsheets/d/1SPPG-FinanceSpreadsheet-Budget2026/edit',
    type: 'spreadsheet',
    category: 'Laporan Keuangan',
    description: 'Catatan anggaran, realisasi pengeluaran bulanan, dan rekap bukti transaksi SPPG.',
    favorite: true,
    clicks: 86,
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'sppg-link-3',
    title: 'Standar Operasional Prosedur (SOP) SPPG',
    url: 'https://docs.google.com/document/d/1SPPG-SOP-Guidelines-ManualStandard/edit',
    type: 'document',
    category: 'Operasional',
    description: 'Buku panduan alur kerja harian, regulasi operasional, dan pedoman teknis SPPG.',
    favorite: false,
    clicks: 19,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'sppg-link-4',
    title: 'Formulir Pelaporan Logistik & Kegiatan Harian',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc-SPPG-DailyReportForm/viewform',
    type: 'form',
    category: 'Operasional',
    description: 'Formulir online pengisian laporan berkala dan mutasi barang harian untuk staf SPPG.',
    favorite: true,
    clicks: 64,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'sppg-link-5',
    title: 'Paparan Evaluasi & Kinerja SPPG Triwulan',
    url: 'https://docs.google.com/presentation/d/1SPPG-PerformanceSlideDeck-Quarterly/edit',
    type: 'presentation',
    category: 'Arsip',
    description: 'Slide materi presentasi pencapaian target kerja dan tinjauan berkala SPPG.',
    favorite: false,
    clicks: 12,
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'sppg-link-6',
    title: 'Surat Keputusan (SK) & Legalitas Pengurus SPPG',
    url: 'https://drive.google.com/file/d/1SPPG-LegalDecreeOfficialDoc-PDF/view',
    type: 'pdf',
    category: 'Surat & Administrasi',
    description: 'Salinan SK penetapan, surat tugas, dan berkas pengesahan struktur tim SPPG.',
    favorite: false,
    clicks: 27,
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  }
];

// App State
let state = {
  currentUser: null, // { id, username, fullName, role }
  links: [],
  searchQuery: '',
  selectedType: 'all',
  selectedTag: 'all',
  sortBy: 'custom', // 'custom' | 'category' | 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'clicks'
  viewMode: 'grid', // 'grid' | 'list'
  deletingId: null,
  activeQrUrl: null,
  activeQrTitle: null,
  cloudStatus: 'offline', // 'offline' | 'connecting' | 'online'
  firebaseDb: null,
  firebaseConfig: null,
  firebaseUserLinksRef: null,
  adminViewScope: '__all__', // '__all__' | 'admin' | specific username
  categoryOrder: [],
  customCategories: [],
  categoryColors: {}
};

// SVG Icon Definitions
const ICONS = {
  folder: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>`,
  spreadsheet: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="8" y1="13" x2="16" y2="13"></line>
    <line x1="8" y1="17" x2="16" y2="17"></line>
    <line x1="12" y1="9" x2="12" y2="21"></line>
  </svg>`,
  document: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>`,
  form: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 11l3 3L22 4"></path>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>`,
  presentation: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>`,
  pdf: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <path d="M9 15h2a1.5 1.5 0 0 0 1.5-1.5V13A1.5 1.5 0 0 0 11 11.5H9V17"></path>
  </svg>`,
  file: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>`,
  externalLink: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>`,
  copy: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>`,
  qr: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>`,
  edit: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>`,
  trash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`,
  starSolid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>`,
  starOutline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>`
};

const TYPE_NAMES = {
  folder: 'Folder Drive',
  spreadsheet: 'Google Sheets',
  document: 'Google Docs',
  form: 'Google Forms',
  presentation: 'Google Slides',
  pdf: 'Berkas PDF',
  file: 'File Drive'
};

const TYPE_COLORS = {
  folder: 'var(--drive-folder)',
  spreadsheet: 'var(--drive-sheets)',
  document: 'var(--drive-docs)',
  form: 'var(--drive-forms)',
  presentation: 'var(--drive-slides)',
  pdf: 'var(--drive-pdf)',
  file: 'var(--brand-blue)'
};

// Helper to get user-specific storage key
function getUserLinksStorageKey(username) {
  const safeUser = (username || 'admin').toLowerCase().trim();
  return `sppg_user_links_${safeUser}`;
}

// ===================================================================
// INITIALIZATION
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadThemePreference();
  loadViewPreference();
  loadSortPreference();
  initUserSession();
  loadLinks();
  initEventListeners();
  renderApp();
  initFirebaseSync();

  // Jika belum ada akun aktif (kunjungan pertama kali ke link), wajib buat akun Anda dulu atau masuk!
  if (!state.currentUser) {
    openAuthModal('register', true);
  }
});

// Load stored links (Admin can view all users' links or specific user; members only view their own; demo loads sample links)
function loadLinks() {
  if (!state.currentUser) {
    state.links = [];
    return;
  }
  loadCategoryData();

  // Jika Pengunjung Mode Demo: muat data contoh SPPG untuk dieksplorasi
  if (state.currentUser.username === 'demo') {
    try {
      const raw = localStorage.getItem('sppg_user_links_demo');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          state.links = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading demo links:', e);
    }

    state.links = DEFAULT_LINKS.map(item => ({
      ...item,
      ownerUsername: 'demo',
      ownerFullName: 'Mode Demo (Tamu SPPG)'
    }));
    return;
  }

  const isAdm = isAdminUser(state.currentUser);

  // Jika Administrator & mode Akses Semua Link aktif
  if (isAdm && state.adminViewScope === '__all__') {
    const allAccounts = getRegisteredAccounts();
    let combinedLinks = [];
    allAccounts.forEach(acc => {
      const uKey = getUserLinksStorageKey(acc.username);
      try {
        const raw = localStorage.getItem(uKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              combinedLinks.push({
                ...item,
                ownerUsername: acc.username,
                ownerFullName: acc.fullName
              });
            });
          }
        } else if (acc.username.toLowerCase() === 'admin') {
          DEFAULT_LINKS.forEach(item => {
            combinedLinks.push({
              ...item,
              ownerUsername: 'admin',
              ownerFullName: 'Administrator SPPG'
            });
          });
        }
      } catch (e) {
        console.warn('Error reading links for', acc.username, e);
      }
    });
    state.links = combinedLinks;
    return;
  }

  // Jika admin memilih akun tertentu, atau pengguna biasa
  const targetUsername = (isAdm && state.adminViewScope && state.adminViewScope !== '__all__')
    ? state.adminViewScope
    : state.currentUser.username;

  const userStorageKey = getUserLinksStorageKey(targetUsername);

  try {
    const rawData = localStorage.getItem(userStorageKey);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        state.links = parsed.map(item => ({
          ...item,
          ownerUsername: targetUsername,
          ownerFullName: targetUsername === 'admin' ? 'Administrator SPPG' : targetUsername
        }));
        return;
      }
    }
  } catch (err) {
    console.error('Error loading stored links for user:', targetUsername, err);
  }

  // Jika akun admin pertama kali buka, berikan contoh bawaan SPPG
  if (targetUsername === 'admin') {
    state.links = DEFAULT_LINKS.map(item => ({
      ...item,
      ownerUsername: 'admin',
      ownerFullName: 'Administrator SPPG'
    }));
    saveToStorage();
  } else {
    // Akun pengguna baru dimulai dengan daftar bersih miliknya sendiri
    state.links = [];
    saveToStorage();
  }
}

function saveToStorage() {
  if (!state.currentUser) return;

  // Jika mode demo, simpan ke memori demo lokal tanpa sentuh cloud atau akun lain
  if (state.currentUser.username === 'demo') {
    try {
      localStorage.setItem('sppg_user_links_demo', JSON.stringify(state.links));
    } catch (err) {
      console.error('Save demo links error:', err);
    }
    return;
  }

  const isAdm = isAdminUser(state.currentUser);

  if (isAdm && state.adminViewScope === '__all__') {
    const grouped = {};
    state.links.forEach(link => {
      const owner = link.ownerUsername || 'admin';
      if (!grouped[owner]) grouped[owner] = [];
      grouped[owner].push(link);
    });

    Object.keys(grouped).forEach(uName => {
      const uKey = getUserLinksStorageKey(uName);
      try {
        localStorage.setItem(uKey, JSON.stringify(grouped[uName]));
      } catch (err) {
        console.error('Save error for', uName, err);
      }
    });
    return;
  }

  const targetUsername = (isAdm && state.adminViewScope && state.adminViewScope !== '__all__')
    ? state.adminViewScope
    : state.currentUser.username;

  const userStorageKey = getUserLinksStorageKey(targetUsername);

  try {
    localStorage.setItem(userStorageKey, JSON.stringify(state.links));
  } catch (err) {
    console.error('Error saving links to localStorage for user:', targetUsername, err);
    showToast('Gagal menyimpan ke penyimpanan lokal browser', 'error');
  }
}

// ===================================================================
// EVENT LISTENERS & SHORTCUTS
// ===================================================================
function initEventListeners() {
  // Theme Toggle
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Backup / Restore Menu Toggle
  const btnBackup = document.getElementById('btnBackup');
  const dataMenu = document.getElementById('dataMenu');
  if (btnBackup) {
    btnBackup.addEventListener('click', (e) => {
      e.stopPropagation();
      dataMenu.classList.toggle('show');
      if (userMenu) userMenu.classList.remove('show');
    });
  }

  // User Profile Menu Toggle
  const btnUserAccount = document.getElementById('btnUserAccount');
  const userMenu = document.getElementById('userMenu');
  if (btnUserAccount) {
    btnUserAccount.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleUserMenu(e);
    });
  }

  // Prevent dropdown menu click from bubbling to document (closing menu prematurely)
  if (userMenu) {
    userMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  if (dataMenu) {
    dataMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  document.addEventListener('click', () => {
    if (dataMenu) dataMenu.classList.remove('show');
    if (userMenu) userMenu.classList.remove('show');
  });

  // Auth & Account Modal Triggers
  const btnOpenAuthModal = document.getElementById('btnOpenAuthModal');
  if (btnOpenAuthModal) {
    btnOpenAuthModal.addEventListener('click', () => {
      if (userMenu) userMenu.classList.remove('show');
      openAuthModal('login');
    });
  }

  const btnBannerSwitchAccount = document.getElementById('btnBannerSwitchAccount');
  if (btnBannerSwitchAccount) {
    btnBannerSwitchAccount.addEventListener('click', () => openAuthModal('login'));
  }

  const btnBannerCreateAccount = document.getElementById('btnBannerCreateAccount');
  if (btnBannerCreateAccount) {
    btnBannerCreateAccount.addEventListener('click', () => openAuthModal('register'));
  }

  const btnOpenRegisterModal = document.getElementById('btnOpenRegisterModal');
  if (btnOpenRegisterModal) {
    btnOpenRegisterModal.addEventListener('click', () => {
      if (userMenu) userMenu.classList.remove('show');
      openAuthModal('register');
    });
  }

  // LOGOUT BUTTONS (Navbar, Banner, Dropdown, Admin Modal)
  const btnNavLogout = document.getElementById('btnNavLogout');
  if (btnNavLogout) {
    btnNavLogout.addEventListener('click', handleLogout);
  }

  const btnBannerLogout = document.getElementById('btnBannerLogout');
  if (btnBannerLogout) {
    btnBannerLogout.addEventListener('click', handleLogout);
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      if (userMenu) userMenu.classList.remove('show');
      handleLogout();
    });
  }

  const btnAdminModalLogout = document.getElementById('btnAdminModalLogout');
  if (btnAdminModalLogout) {
    btnAdminModalLogout.addEventListener('click', handleAdminModalLogout);
  }

  const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
  if (btnCloseAuthModal) {
    btnCloseAuthModal.addEventListener('click', closeAuthModal);
  }

  // Switch tabs inside Auth Modal
  const btnSwitchToRegister = document.getElementById('btnSwitchToRegister');
  if (btnSwitchToRegister) {
    btnSwitchToRegister.addEventListener('click', () => switchAuthTab('register'));
  }

  const btnSwitchToLogin = document.getElementById('btnSwitchToLogin');
  if (btnSwitchToLogin) {
    btnSwitchToLogin.addEventListener('click', () => switchAuthTab('login'));
  }

  const btnGateDemoMode = document.getElementById('btnGateDemoMode');
  if (btnGateDemoMode) {
    btnGateDemoMode.addEventListener('click', enterDemoMode);
  }

  // Admin Modal & Trigger Event Listeners
  const btnCloseAdminModal = document.getElementById('btnCloseAdminModal');
  if (btnCloseAdminModal) btnCloseAdminModal.addEventListener('click', closeAdminModal);

  const btnAdminPanel = document.getElementById('btnAdminPanel');
  if (btnAdminPanel) btnAdminPanel.addEventListener('click', handleAdminClick);

  const btnMenuAdminPanel = document.getElementById('btnMenuAdminPanel');
  if (btnMenuAdminPanel) {
    btnMenuAdminPanel.addEventListener('click', () => {
      if (userMenu) userMenu.classList.remove('show');
      handleAdminClick();
    });
  }

  const btnBannerAdminPanel = document.getElementById('btnBannerAdminPanel');
  if (btnBannerAdminPanel) btnBannerAdminPanel.addEventListener('click', handleAdminClick);

  const scopeUserFullNameClickable = document.getElementById('scopeUserFullNameClickable');
  if (scopeUserFullNameClickable) scopeUserFullNameClickable.addEventListener('click', handleAdminClick);

  const btnScopeBadge = document.getElementById('btnScopeBadge');
  if (btnScopeBadge) btnScopeBadge.addEventListener('click', handleAdminClick);

  const scopeAdminBadge = document.getElementById('scopeAdminBadge');
  if (scopeAdminBadge) scopeAdminBadge.addEventListener('click', handleAdminClick);

  const btnToolbarManageAccounts = document.getElementById('btnToolbarManageAccounts');
  if (btnToolbarManageAccounts) btnToolbarManageAccounts.addEventListener('click', openAdminModal);

  // Admin Password Modal Listeners
  const adminPasswordForm = document.getElementById('adminPasswordForm');
  if (adminPasswordForm) adminPasswordForm.addEventListener('submit', handleAdminPasswordSubmit);

  const btnCloseAdminPassModal = document.getElementById('btnCloseAdminPassModal');
  if (btnCloseAdminPassModal) btnCloseAdminPassModal.addEventListener('click', closeAdminPasswordModal);

  const btnCancelAdminPassModal = document.getElementById('btnCancelAdminPassModal');
  if (btnCancelAdminPassModal) btnCancelAdminPassModal.addEventListener('click', closeAdminPasswordModal);

  const btnToggleAdminPass = document.getElementById('btnToggleAdminPass');
  if (btnToggleAdminPass) {
    btnToggleAdminPass.addEventListener('click', function() {
      toggleInputPasswordVisibility('adminInputPassword', this);
    });
  }

  const adminSearchUsers = document.getElementById('adminSearchUsers');
  if (adminSearchUsers) {
    adminSearchUsers.addEventListener('input', renderAdminUsersTable);
  }

  // Auth Form Tabs
  document.getElementById('tabAuthLogin').addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tabAuthRegister').addEventListener('click', () => switchAuthTab('register'));

  // Auth Form Submits
  document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
  document.getElementById('registerForm').addEventListener('submit', handleRegisterSubmit);

  document.getElementById('btnExportJson').addEventListener('click', exportDataJson);
  document.getElementById('importFileInput').addEventListener('change', handleImportJson);
  document.getElementById('btnResetDefault').addEventListener('click', resetToDefaultLinks);

  // Add Link Modal Triggers
  document.getElementById('btnOpenAddModal').addEventListener('click', openAddModal);
  document.getElementById('btnEmptyAdd').addEventListener('click', openAddModal);
  document.getElementById('btnCloseModal').addEventListener('click', closeModal);
  document.getElementById('btnCancelModal').addEventListener('click', closeModal);

  // Form submission
  document.getElementById('linkForm').addEventListener('submit', handleFormSubmit);

  // Smart URL Auto-detection on input/change
  const linkUrlInput = document.getElementById('linkUrl');
  linkUrlInput.addEventListener('input', handleUrlInputAutoDetect);

  // Paste from clipboard button
  document.getElementById('btnPasteUrl').addEventListener('click', async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        linkUrlInput.value = clipText.trim();
        handleUrlInputAutoDetect();
        showToast('Link berhasil ditempel dari clipboard!', 'success');
      }
    } catch {
      showToast('Gunakan Ctrl+V untuk menempelkan link', 'info');
      linkUrlInput.focus();
    }
  });

  // Search input & clear button
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery.trim().length > 0) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
    renderApp();
  });

  clearSearchBtn.addEventListener('click', () => {
    state.searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    searchInput.focus();
    renderApp();
  });

  // Filter tabs
  const filterTabs = document.getElementById('filterTabs');
  filterTabs.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.filter-tab');
    if (!tabBtn) return;
    const filterType = tabBtn.getAttribute('data-type');
    setFilterType(filterType);
  });

  // Sort dropdown
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.value = state.sortBy || 'custom';
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      saveSortPreference(state.sortBy);
      renderApp();
    });
  }

  // Layout Hint Banner Dismiss
  const layoutHintBanner = document.getElementById('layoutHintBanner');
  const btnDismissLayoutHint = document.getElementById('btnDismissLayoutHint');
  if (layoutHintBanner && btnDismissLayoutHint) {
    if (localStorage.getItem(LAYOUT_HINT_DISMISSED_KEY) === 'true') {
      layoutHintBanner.classList.add('hidden');
    }
    btnDismissLayoutHint.addEventListener('click', () => {
      layoutHintBanner.classList.add('hidden');
      try { localStorage.setItem(LAYOUT_HINT_DISMISSED_KEY, 'true'); } catch (e) {}
    });
  }

  // View mode toggles
  document.getElementById('viewGridBtn').addEventListener('click', () => setViewMode('grid'));
  document.getElementById('viewListBtn').addEventListener('click', () => setViewMode('list'));

  // Stat cards filter clicks
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.getAttribute('data-stat-filter');
      if (filter) setFilterType(filter);
    });
  });

  // Reset Filters Link
  document.getElementById('btnResetFilters').addEventListener('click', resetAllFilters);

  // QR Modal Buttons
  document.getElementById('btnCloseQrModal').addEventListener('click', closeQrModal);
  document.getElementById('btnOpenQrDirect').addEventListener('click', () => {
    if (state.activeQrUrl) {
      window.open(state.activeQrUrl, '_blank', 'noopener,noreferrer');
      closeQrModal();
    }
  });
  document.getElementById('btnCopyQrUrl').addEventListener('click', () => {
    if (state.activeQrUrl) {
      copyToClipboard(state.activeQrUrl, state.activeQrTitle || 'Link Drive');
    }
  });

  // Delete Confirm Modal Buttons
  document.getElementById('btnCloseConfirmModal').addEventListener('click', closeDeleteModal);
  document.getElementById('btnCancelDelete').addEventListener('click', closeDeleteModal);
  document.getElementById('btnConfirmDelete').addEventListener('click', executeDelete);

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    // Esc to close any open modal
    if (e.key === 'Escape') {
      closeModal();
      closeQrModal();
      closeDeleteModal();
      closeCloudModal();
      closeManageCategoryModal();
      if (state.currentUser) closeAuthModal();
      closeAdminModal();
      closeAdminPasswordModal();
      if (dataMenu) dataMenu.classList.remove('show');
      if (userMenu) userMenu.classList.remove('show');
    }

    // Ctrl+K or '/' to focus search (when not in an input/textarea)
    const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) && !isEditing) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }

    // Ctrl+N or Alt+N to open add modal
    if ((e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'n' && !isEditing) {
      e.preventDefault();
      openAddModal();
    }
  });

  // Cloud Sync Modal Triggers
  document.getElementById('btnCloudSync').addEventListener('click', openCloudModal);
  document.getElementById('btnCloseCloudModal').addEventListener('click', closeCloudModal);
  document.getElementById('btnSaveCloudConfig').addEventListener('click', handleSaveCloudConfig);
  document.getElementById('btnDisconnectCloud').addEventListener('click', handleDisconnectCloud);
  document.getElementById('btnForceUploadCloud').addEventListener('click', () => uploadLinksToCloud(true));
  document.getElementById('btnForceFetchCloud').addEventListener('click', fetchLinksFromCloud);

  // Click outside modal content to close
  document.getElementById('linkModal').addEventListener('click', (e) => {
    if (e.target.id === 'linkModal') closeModal();
  });
  document.getElementById('qrModal').addEventListener('click', (e) => {
    if (e.target.id === 'qrModal') closeQrModal();
  });
  document.getElementById('confirmModal').addEventListener('click', (e) => {
    if (e.target.id === 'confirmModal') closeDeleteModal();
  });
  document.getElementById('cloudModal').addEventListener('click', (e) => {
    if (e.target.id === 'cloudModal') closeCloudModal();
  });
  document.getElementById('authModal').addEventListener('click', (e) => {
    if (e.target.id === 'authModal') closeAuthModal();
  });
  const adminModal = document.getElementById('adminModal');
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target.id === 'adminModal') closeAdminModal();
    });
  }
  const adminPassModal = document.getElementById('adminPasswordModal');
  if (adminPassModal) {
    adminPassModal.addEventListener('click', (e) => {
      if (e.target.id === 'adminPasswordModal') closeAdminPasswordModal();
    });
  }

  // Manage Categories Modal & Scroll Controls
  const btnManageCats = document.getElementById('btnManageCategories');
  if (btnManageCats) {
    btnManageCats.addEventListener('click', openManageCategoryModal);
  }
  const btnCloseManageCat = document.getElementById('btnCloseManageCategoryModal');
  if (btnCloseManageCat) {
    btnCloseManageCat.addEventListener('click', closeManageCategoryModal);
  }
  const btnDoneManageCat = document.getElementById('btnDoneManageCategory');
  if (btnDoneManageCat) {
    btnDoneManageCat.addEventListener('click', closeManageCategoryModal);
  }
  const manageCatModal = document.getElementById('manageCategoryModal');
  if (manageCatModal) {
    manageCatModal.addEventListener('click', (e) => {
      if (e.target.id === 'manageCategoryModal') closeManageCategoryModal();
    });
  }
  const formAddCat = document.getElementById('formAddCategory');
  if (formAddCat) {
    formAddCat.addEventListener('submit', handleAddNewCategory);
  }
  const btnSortAlpha = document.getElementById('btnSortCategoriesAlpha');
  if (btnSortAlpha) {
    btnSortAlpha.addEventListener('click', sortCategoriesAlphabetically);
  }
  const btnAutoCat = document.getElementById('btnAutoCategorizeLinks');
  if (btnAutoCat) {
    btnAutoCat.addEventListener('click', autoCategorizeLinksFromTitles);
  }

  initCategoryScrollControls();
}

// ===================================================================
// URL INTELLIGENT AUTO-DETECTOR
// ===================================================================
function detectGoogleDriveType(url) {
  if (!url) return null;
  const lower = url.toLowerCase();

  if (lower.includes('/folders/') || lower.includes('drive.google.com/drive/u/') || lower.includes('drive.google.com/drive/folders')) {
    return 'folder';
  }
  if (lower.includes('docs.google.com/spreadsheets') || lower.includes('/spreadsheets/d/')) {
    return 'spreadsheet';
  }
  if (lower.includes('docs.google.com/document') || lower.includes('/document/d/')) {
    return 'document';
  }
  if (lower.includes('docs.google.com/forms') || lower.includes('/forms/d/')) {
    return 'form';
  }
  if (lower.includes('docs.google.com/presentation') || lower.includes('/presentation/d/')) {
    return 'presentation';
  }
  if (lower.includes('.pdf') || lower.includes('drive.google.com/file/d/')) {
    return 'pdf';
  }
  return 'file';
}

function handleUrlInputAutoDetect() {
  const urlInput = document.getElementById('linkUrl');
  const typeSelect = document.getElementById('linkType');
  const urlHint = document.getElementById('urlHint');
  const val = urlInput.value.trim();

  if (!val) {
    urlHint.innerHTML = '💡 Tip: Masukkan link sharing Google Drive (Folder, Docs, Sheets, Forms, Slides, atau File).';
    urlHint.style.color = 'var(--text-muted)';
    return;
  }

  const detected = detectGoogleDriveType(val);
  if (detected) {
    typeSelect.value = detected;
    const typeLabel = TYPE_NAMES[detected] || 'File';
    urlHint.innerHTML = `✨ Terdeteksi otomatis sebagai: <strong>${typeLabel}</strong>`;
    urlHint.style.color = 'var(--brand-blue)';
  }
}

// ===================================================================
// RENDERING FUNCTIONS
// ===================================================================
function renderApp() {
  renderStats();
  renderCategoryTags();
  renderLinks();
  updateFilterTabsUI();
}

// Render Header & Top Stats
function renderStats() {
  const total = state.links.length;
  const folders = state.links.filter(l => l.type === 'folder').length;
  const docs = state.links.filter(l => ['document', 'spreadsheet', 'presentation', 'form'].includes(l.type)).length;
  const favorites = state.links.filter(l => !!l.favorite).length;

  document.getElementById('statTotalLinks').textContent = total;
  document.getElementById('statFolderLinks').textContent = folders;
  document.getElementById('statDocLinks').textContent = docs;
  document.getElementById('statFavoriteLinks').textContent = favorites;
}

// ===================================================================
// CATEGORY MANAGEMENT & DYNAMIC DRAGGABLE TAGS
// ===================================================================

// Default SPPG Categories
const DEFAULT_SPPG_CATEGORIES = [
  'SPPG Utama',
  'Laporan Keuangan',
  'Operasional',
  'Surat & Administrasi',
  'Dokumentasi & Media',
  'Master Data',
  'SDM & Personalia',
  'Arsip'
];

// Curated 12-color Vibrant Palette for Categories
const CATEGORY_PALETTE = [
  { name: 'Hijau Emerald', hex: '#10b981' },
  { name: 'Merah Ruby', hex: '#ef4444' },
  { name: 'Biru Safir', hex: '#2563eb' },
  { name: 'Kuning Amber', hex: '#f59e0b' },
  { name: 'Ungu Violet', hex: '#8b5cf6' },
  { name: 'Oranye Sunset', hex: '#f97316' },
  { name: 'Toska Teal', hex: '#06b6d4' },
  { name: 'Merah Muda Pink', hex: '#ec4899' },
  { name: 'Hijau Mint', hex: '#14b8a6' },
  { name: 'Indigo Modern', hex: '#6366f1' },
  { name: 'Hijau Lime', hex: '#84cc16' },
  { name: 'Abu-abu Netral', hex: '#64748b' }
];

function getUserCategoryOrderKey(username) {
  const safeUser = (username || 'admin').toLowerCase().trim();
  return `sppg_category_order_${safeUser}`;
}

function getUserCustomCategoriesKey(username) {
  const safeUser = (username || 'admin').toLowerCase().trim();
  return `sppg_custom_categories_${safeUser}`;
}

function getUserCategoryColorsKey(username) {
  const safeUser = (username || 'admin').toLowerCase().trim();
  return `sppg_category_colors_${safeUser}`;
}

function getCategoryColor(catName) {
  if (!catName) return '#2563eb';
  const cleanName = catName.trim();
  if (state.categoryColors && state.categoryColors[cleanName]) {
    return state.categoryColors[cleanName];
  }
  // Deterministic color assignment based on category name
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CATEGORY_PALETTE.length;
  return CATEGORY_PALETTE[index].hex;
}

function setCategoryColor(catName, color) {
  if (!catName || !color) return;
  const clean = catName.trim();
  if (!state.categoryColors) state.categoryColors = {};
  state.categoryColors[clean] = color;
  saveCategoryData(true);
  renderCategoryTags();
  renderLinks();
  renderCategoryManageList();
  showToast(`Warna kategori "${clean}" berhasil diatur!`, 'success');
}

function loadCategoryData() {
  if (!state.currentUser) {
    state.categoryOrder = [...DEFAULT_SPPG_CATEGORIES];
    state.customCategories = [];
    state.categoryColors = {};
    return;
  }

  const user = state.currentUser.username;
  try {
    const rawOrder = localStorage.getItem(getUserCategoryOrderKey(user));
    if (rawOrder) {
      const parsed = JSON.parse(rawOrder);
      if (Array.isArray(parsed) && parsed.length > 0) {
        state.categoryOrder = parsed;
      } else {
        state.categoryOrder = [...DEFAULT_SPPG_CATEGORIES];
      }
    } else {
      state.categoryOrder = [...DEFAULT_SPPG_CATEGORIES];
    }
  } catch (e) {
    state.categoryOrder = [...DEFAULT_SPPG_CATEGORIES];
  }

  try {
    const rawCustom = localStorage.getItem(getUserCustomCategoriesKey(user));
    if (rawCustom) {
      const parsed = JSON.parse(rawCustom);
      state.customCategories = Array.isArray(parsed) ? parsed : [];
    } else {
      state.customCategories = [];
    }
  } catch (e) {
    state.customCategories = [];
  }

  try {
    const rawColors = localStorage.getItem(getUserCategoryColorsKey(user));
    if (rawColors) {
      const parsed = JSON.parse(rawColors);
      state.categoryColors = (parsed && typeof parsed === 'object') ? parsed : {};
    } else {
      state.categoryColors = {};
    }
  } catch (e) {
    state.categoryColors = {};
  }
}

function saveCategoryData(syncToCloud = true) {
  if (!state.currentUser) return;
  const user = state.currentUser.username;
  try {
    localStorage.setItem(getUserCategoryOrderKey(user), JSON.stringify(state.categoryOrder || []));
    localStorage.setItem(getUserCustomCategoriesKey(user), JSON.stringify(state.customCategories || []));
    localStorage.setItem(getUserCategoryColorsKey(user), JSON.stringify(state.categoryColors || {}));
  } catch (e) {
    console.error('Error saving category data:', e);
  }

  // Realtime Sync to Firebase if connected
  if (syncToCloud && state.firebaseDb && state.cloudStatus === 'online' && user !== 'demo') {
    try {
      state.firebaseDb.ref(`sppg_multiusers/${user}/categoryOrder`).set(state.categoryOrder || []);

      // Convert colors object to array of { name, color } so keys with '/' are supported
      const colorArray = Object.keys(state.categoryColors || {}).map(k => ({
        name: k,
        color: state.categoryColors[k]
      }));
      state.firebaseDb.ref(`sppg_multiusers/${user}/categoryColors`).set(colorArray);
    } catch (e) {
      console.warn('Could not sync category data to cloud:', e);
    }
  }
}

// Get all active unique categories in user's custom sequence
function getAllCategories() {
  const set = new Set();

  // 1. Categories present in actual links
  if (Array.isArray(state.links)) {
    state.links.forEach(l => {
      const cat = (l.category || 'Umum').trim();
      if (cat) set.add(cat);
    });
  }

  // 2. Custom categories added by user
  if (Array.isArray(state.customCategories)) {
    state.customCategories.forEach(c => {
      if (c && c.trim()) set.add(c.trim());
    });
  }

  // 3. Ensure defaults exist if set is empty
  DEFAULT_SPPG_CATEGORIES.forEach(c => set.add(c));

  const allAvailable = Array.from(set);

  // Reorder based on state.categoryOrder
  const ordered = [];
  const orderList = Array.isArray(state.categoryOrder) ? state.categoryOrder : [];

  orderList.forEach(c => {
    if (set.has(c) && !ordered.includes(c)) {
      ordered.push(c);
    }
  });

  // Remaining categories not yet in categoryOrder
  const remaining = allAvailable.filter(c => !ordered.includes(c)).sort((a, b) => a.localeCompare(b, 'id'));
  const finalCategories = [...ordered, ...remaining];

  // Update datalist in form modal
  updateCategoryPresetsDatalist(finalCategories);

  return finalCategories;
}

function updateCategoryPresetsDatalist(categories) {
  const datalist = document.getElementById('categoryPresets');
  if (!datalist) return;
  datalist.innerHTML = categories.map(cat => `<option value="${escapeHtml(cat)}">`).join('');
}

// Render dynamic Category Tags with Drag-and-Drop Reorder and Drag-to-move-link
function renderCategoryTags() {
  const container = document.getElementById('tagsContainer');
  if (!container) return;

  const categoryCounts = {};
  state.links.forEach(l => {
    const cat = (l.category || 'Umum').trim();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categories = getAllCategories();

  let html = `
    <button class="tag-filter-chip ${state.selectedTag === 'all' ? 'active' : ''}" data-tag="all" title="Tampilkan semua link">
      Semua (${state.links.length})
    </button>
  `;

  categories.forEach(cat => {
    const isActive = state.selectedTag === cat;
    const count = categoryCounts[cat] || 0;
    const catColor = getCategoryColor(cat);
    html += `
      <button 
        class="tag-filter-chip ${isActive ? 'active' : ''}" 
        data-tag="${escapeHtml(cat)}" 
        draggable="true" 
        style="--tag-color: ${catColor};"
        title="Klik untuk filter, tahan & geser untuk mengubah urutan"
      >
        <span class="tag-drag-handle" title="Tarik untuk menggeser posisi">⋮⋮</span>
        <span class="tag-color-dot" style="background-color: ${catColor};" title="Warna Kategori: ${escapeHtml(cat)}"></span>
        <span class="tag-label-text">${escapeHtml(cat)}</span>
        <span class="tag-count">(${count})</span>
      </button>
    `;
  });

  container.innerHTML = html;

  // Click & Drag Events on Category Chips
  container.querySelectorAll('.tag-filter-chip').forEach(chip => {
    const tag = chip.getAttribute('data-tag');

    // Filter click
    chip.addEventListener('click', () => {
      state.selectedTag = tag;
      renderApp();
    });

    if (tag === 'all') return; // 'Semua' button is pinned at start

    // Drag Category Chip to Reorder
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/category-drag', tag);
      e.dataTransfer.effectAllowed = 'move';
      chip.classList.add('is-dragging');
    });

    chip.addEventListener('dragend', () => {
      chip.classList.remove('is-dragging');
      container.querySelectorAll('.tag-filter-chip').forEach(c => {
        c.classList.remove('drag-over');
        c.classList.remove('drop-target-active');
      });
    });

    chip.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer.types.includes('text/category-drag')) {
        e.dataTransfer.dropEffect = 'move';
        chip.classList.add('drag-over');
      } else if (e.dataTransfer.types.includes('text/link-id')) {
        e.dataTransfer.dropEffect = 'copy';
        chip.classList.add('drop-target-active');
      }
    });

    chip.addEventListener('dragleave', () => {
      chip.classList.remove('drag-over');
      chip.classList.remove('drop-target-active');
    });

    chip.addEventListener('drop', (e) => {
      e.preventDefault();
      chip.classList.remove('drag-over');
      chip.classList.remove('drop-target-active');

      // Case 1: Geser urutan kategori (Reorder Categories)
      if (e.dataTransfer.types.includes('text/category-drag')) {
        const sourceCat = e.dataTransfer.getData('text/category-drag');
        const targetCat = tag;
        if (sourceCat && targetCat && sourceCat !== targetCat) {
          reorderCategory(sourceCat, targetCat);
        }
      }
      // Case 2: Geser Link Card ke Kategori ini (Move Link to Category)
      else if (e.dataTransfer.types.includes('text/link-id')) {
        const linkId = e.dataTransfer.getData('text/link-id');
        if (linkId) {
          moveLinkToCategory(linkId, tag);
        }
      }
    });
  });

  updateCategoryScrollButtons();
}

function reorderCategory(sourceCat, targetCat) {
  let categories = [...getAllCategories()];
  const fromIndex = categories.indexOf(sourceCat);
  const toIndex = categories.indexOf(targetCat);

  if (fromIndex < 0 || toIndex < 0) return;

  // Move source to target position
  categories.splice(fromIndex, 1);
  categories.splice(toIndex, 0, sourceCat);

  state.categoryOrder = categories;
  saveCategoryData();
  renderCategoryTags();
  showToast(`Urutan kategori berhasil diubah: "${sourceCat}" digeser.`, 'success');
}

function moveLinkToCategory(linkId, newCategory) {
  const link = state.links.find(l => l.id === linkId);
  if (!link) return;

  const oldCategory = link.category || 'Umum';
  if (oldCategory === newCategory) {
    showToast(`Link sudah berada di kategori "${newCategory}".`, 'info');
    return;
  }

  link.category = newCategory;
  link.updatedAt = new Date().toISOString();
  saveToStorage();
  syncLinkPatchToCloud(linkId, { category: newCategory, updatedAt: link.updatedAt });
  renderApp();
  showToast(`Kategori link "${truncate(link.title, 26)}" berhasil diubah ke "${newCategory}"!`, 'success');
}

// Horizontal Scroll Controls
function updateCategoryScrollButtons() {
  const container = document.getElementById('tagsContainer');
  const btnLeft = document.getElementById('btnScrollTagsLeft');
  const btnRight = document.getElementById('btnScrollTagsRight');
  if (!container || !btnLeft || !btnRight) return;

  const hasOverflow = container.scrollWidth > container.clientWidth + 5;
  if (!hasOverflow) {
    btnLeft.classList.add('hidden');
    btnRight.classList.add('hidden');
    return;
  }

  if (container.scrollLeft > 10) {
    btnLeft.classList.remove('hidden');
  } else {
    btnLeft.classList.add('hidden');
  }

  if (container.scrollLeft < container.scrollWidth - container.clientWidth - 10) {
    btnRight.classList.remove('hidden');
  } else {
    btnRight.classList.add('hidden');
  }
}

function initCategoryScrollControls() {
  const container = document.getElementById('tagsContainer');
  const btnLeft = document.getElementById('btnScrollTagsLeft');
  const btnRight = document.getElementById('btnScrollTagsRight');
  if (!container) return;

  if (btnLeft) {
    btnLeft.addEventListener('click', () => {
      container.scrollBy({ left: -220, behavior: 'smooth' });
    });
  }

  if (btnRight) {
    btnRight.addEventListener('click', () => {
      container.scrollBy({ left: 220, behavior: 'smooth' });
    });
  }

  container.addEventListener('scroll', () => {
    updateCategoryScrollButtons();
  });

  // Mouse Drag / Pan to scroll sideways on desktop
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener('mousedown', (e) => {
    // Only pan if not clicking directly on a button's drag handle or text input
    if (e.target.closest('.tag-drag-handle')) return;
    isDown = true;
    container.classList.add('is-panning');
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      container.classList.remove('is-panning');
    }
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  window.addEventListener('resize', () => {
    updateCategoryScrollButtons();
  });
}

// Modal Kelola Kategori
function openManageCategoryModal() {
  const modal = document.getElementById('manageCategoryModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  renderCategoryManageList();
  const input = document.getElementById('newCategoryInput');
  if (input) input.value = '';
}

function closeManageCategoryModal() {
  const modal = document.getElementById('manageCategoryModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  renderCategoryTags();
}

function renderCategoryManageList() {
  const listContainer = document.getElementById('categoryManageList');
  const countEl = document.getElementById('totalCategoriesCount');
  if (!listContainer) return;

  const categories = getAllCategories();
  if (countEl) countEl.textContent = categories.length;

  const categoryCounts = {};
  state.links.forEach(l => {
    const cat = (l.category || 'Umum').trim();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  if (categories.length === 0) {
    listContainer.innerHTML = `<div class="empty-state-text" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">Belum ada kategori yang tersedia.</div>`;
    return;
  }

  listContainer.innerHTML = categories.map((cat, idx) => {
    const count = categoryCounts[cat] || 0;
    const isFirst = idx === 0;
    const isLast = idx === categories.length - 1;
    const catColor = getCategoryColor(cat);

    return `
      <div class="cat-manage-item" data-cat="${escapeHtml(cat)}" data-index="${idx}" draggable="true">
        <div class="cat-manage-left">
          <span class="cat-drag-handle" title="Tarik ke atas atau ke bawah untuk menggeser posisi">⋮⋮</span>
          
          <div class="cat-color-badge-wrap">
            <button 
              type="button" 
              class="btn-cat-color-swatch" 
              data-cat="${escapeHtml(cat)}" 
              style="background-color: ${catColor};" 
              title="Klik untuk memilih warna kategori (Kajoran, Ngadiharjo, dll)"
            ></button>
          </div>

          <span class="cat-name-badge">${escapeHtml(cat)}</span>
          <span class="cat-count-badge">${count} link</span>
        </div>
        <div class="cat-manage-right">
          <button type="button" class="btn-cat-order btn-move-cat-up" data-cat="${escapeHtml(cat)}" ${isFirst ? 'disabled' : ''} title="Geser ke Atas (ke Kiri)">
            ⬆️
          </button>
          <button type="button" class="btn-cat-order btn-move-cat-down" data-cat="${escapeHtml(cat)}" ${isLast ? 'disabled' : ''} title="Geser ke Bawah (ke Kanan)">
            ⬇️
          </button>
          <button type="button" class="btn-cat-action btn-edit-cat-name" data-cat="${escapeHtml(cat)}" title="Ubah Nama Kategori">
            ✏️
          </button>
          <button type="button" class="btn-cat-action btn-cat-delete text-danger" data-cat="${escapeHtml(cat)}" data-count="${count}" title="Hapus Kategori">
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach buttons inside modal
  listContainer.querySelectorAll('.btn-cat-color-swatch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cat = btn.getAttribute('data-cat');
      openColorPickerPopover(btn, cat);
    });
  });

  listContainer.querySelectorAll('.btn-move-cat-up').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      moveCategoryStep(cat, -1);
    });
  });

  listContainer.querySelectorAll('.btn-move-cat-down').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      moveCategoryStep(cat, 1);
    });
  });

  listContainer.querySelectorAll('.btn-edit-cat-name').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      startInlineCategoryEdit(cat);
    });
  });

  listContainer.querySelectorAll('.btn-cat-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      const count = parseInt(btn.getAttribute('data-count') || '0', 10);
      deleteCategory(cat, count);
    });
  });

  initModalListDragReorder(listContainer);
}

function moveCategoryStep(cat, step) {
  const categories = [...getAllCategories()];
  const idx = categories.indexOf(cat);
  if (idx < 0) return;
  const newIdx = idx + step;
  if (newIdx < 0 || newIdx >= categories.length) return;

  categories.splice(idx, 1);
  categories.splice(newIdx, 0, cat);

  state.categoryOrder = categories;
  saveCategoryData();
  renderCategoryManageList();
  renderCategoryTags();
}

function startInlineCategoryEdit(cat) {
  const item = document.querySelector(`.cat-manage-item[data-cat="${CSS.escape(cat)}"]`);
  if (!item) return;

  item.innerHTML = `
    <form class="cat-manage-edit-row" onsubmit="return false;">
      <input type="text" class="form-control form-control-sm input-edit-cat" value="${escapeHtml(cat)}" maxlength="40" required>
      <button type="button" class="btn btn-sm btn-primary btn-save-cat-edit">Simpan</button>
      <button type="button" class="btn btn-sm btn-secondary btn-cancel-cat-edit">Batal</button>
    </form>
  `;

  const input = item.querySelector('.input-edit-cat');
  input.focus();
  input.select();

  const handleSave = () => {
    const newName = input.value.trim();
    if (!newName) {
      showToast('Nama kategori tidak boleh kosong.', 'warning');
      return;
    }
    if (newName === cat) {
      renderCategoryManageList();
      return;
    }
    renameCategory(cat, newName);
  };

  item.querySelector('.btn-save-cat-edit').addEventListener('click', handleSave);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      renderCategoryManageList();
    }
  });

  item.querySelector('.btn-cancel-cat-edit').addEventListener('click', () => {
    renderCategoryManageList();
  });
}

function renameCategory(oldName, newName) {
  let affectedLinks = 0;
  state.links.forEach(l => {
    if ((l.category || '').trim() === oldName) {
      l.category = newName;
      l.updatedAt = new Date().toISOString();
      affectedLinks++;
    }
  });

  if (Array.isArray(state.categoryOrder)) {
    const orderIdx = state.categoryOrder.indexOf(oldName);
    if (orderIdx >= 0) {
      state.categoryOrder[orderIdx] = newName;
    } else {
      state.categoryOrder.push(newName);
    }
  }

  if (Array.isArray(state.customCategories)) {
    const cIdx = state.customCategories.indexOf(oldName);
    if (cIdx >= 0) {
      state.customCategories[cIdx] = newName;
    } else {
      state.customCategories.push(newName);
    }
  }

  if (state.selectedTag === oldName) {
    state.selectedTag = newName;
  }

  // Transfer color to new name
  if (state.categoryColors && state.categoryColors[oldName]) {
    state.categoryColors[newName] = state.categoryColors[oldName];
    delete state.categoryColors[oldName];
  }

  saveToStorage();
  saveCategoryData();
  uploadLinksToCloud(false);
  renderCategoryManageList();
  renderApp();
  showToast(`Kategori "${oldName}" diubah menjadi "${newName}" (${affectedLinks} link diperbarui).`, 'success');
}

function deleteCategory(cat, count) {
  let confirmMsg = `Yakin ingin menghapus kategori "${cat}"?`;
  if (count > 0) {
    confirmMsg = `Kategori "${cat}" digunakan oleh ${count} link. Jika dihapus, link akan dialihkan ke kategori "Umum". Lanjutkan?`;
  }

  if (!confirm(confirmMsg)) return;

  if (count > 0) {
    state.links.forEach(l => {
      if ((l.category || '').trim() === cat) {
        l.category = 'Umum';
        l.updatedAt = new Date().toISOString();
      }
    });
    saveToStorage();
    uploadLinksToCloud(false);
  }

  state.categoryOrder = (state.categoryOrder || []).filter(c => c !== cat);
  state.customCategories = (state.customCategories || []).filter(c => c !== cat);

  if (state.categoryColors && state.categoryColors[cat]) {
    delete state.categoryColors[cat];
  }

  if (state.selectedTag === cat) {
    state.selectedTag = 'all';
  }

  saveCategoryData();
  renderCategoryManageList();
  renderApp();
  showToast(`Kategori "${cat}" berhasil dihapus.`, 'info');
}

function initModalListDragReorder(listContainer) {
  let draggedItem = null;

  listContainer.querySelectorAll('.cat-manage-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      e.dataTransfer.effectAllowed = 'move';
      item.classList.add('cat-item-dragging');
    });

    item.addEventListener('dragend', () => {
      if (draggedItem) draggedItem.classList.remove('cat-item-dragging');
      listContainer.querySelectorAll('.cat-manage-item').forEach(i => i.classList.remove('cat-item-drag-over'));
      draggedItem = null;
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggedItem || draggedItem === item) return;
      e.dataTransfer.dropEffect = 'move';
      item.classList.add('cat-item-drag-over');
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('cat-item-drag-over');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('cat-item-drag-over');
      if (!draggedItem || draggedItem === item) return;

      const sourceCat = draggedItem.getAttribute('data-cat');
      const targetCat = item.getAttribute('data-cat');
      if (sourceCat && targetCat && sourceCat !== targetCat) {
        reorderCategory(sourceCat, targetCat);
        renderCategoryManageList();
      }
    });
  });
}

function handleAddNewCategory(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('newCategoryInput');
  if (!input) return;

  const newCat = input.value.trim();
  if (!newCat) {
    showToast('Silakan ketik nama kategori baru.', 'warning');
    input.focus();
    return;
  }

  const existing = getAllCategories();
  const duplicate = existing.find(c => c.toLowerCase() === newCat.toLowerCase());
  if (duplicate) {
    showToast(`Kategori "${duplicate}" sudah ada.`, 'warning');
    input.focus();
    return;
  }

  if (!Array.isArray(state.categoryOrder)) state.categoryOrder = [];
  if (!Array.isArray(state.customCategories)) state.customCategories = [];

  const colorInput = document.getElementById('newCategoryColor');
  const pickedColor = colorInput ? colorInput.value : getCategoryColor(newCat);

  state.categoryOrder.push(newCat);
  state.customCategories.push(newCat);
  if (!state.categoryColors) state.categoryColors = {};
  state.categoryColors[newCat] = pickedColor;

  saveCategoryData(true);
  input.value = '';
  renderCategoryManageList();
  renderCategoryTags();
  showToast(`Kategori "${newCat}" berhasil ditambahkan!`, 'success');
}

function openColorPickerPopover(anchorBtn, cat) {
  // Remove existing popover if any
  document.querySelectorAll('.cat-color-popover').forEach(p => p.remove());

  const currentColor = getCategoryColor(cat);
  const popover = document.createElement('div');
  popover.className = 'cat-color-popover';

  let paletteHtml = CATEGORY_PALETTE.map(p => `
    <button 
      type="button" 
      class="palette-swatch-btn ${p.hex.toLowerCase() === currentColor.toLowerCase() ? 'is-selected' : ''}" 
      data-color="${p.hex}" 
      style="background-color: ${p.hex};" 
      title="${p.name}"
    ></button>
  `).join('');

  popover.innerHTML = `
    <div class="color-palette-title">Warna: ${escapeHtml(cat)}</div>
    <div class="color-palette-grid">
      ${paletteHtml}
    </div>
    <label class="palette-custom-row">
      <input type="color" class="palette-custom-input" value="${currentColor}">
      <span>Warna Lainnya...</span>
    </label>
  `;

  anchorBtn.parentElement.appendChild(popover);

  popover.querySelectorAll('.palette-swatch-btn').forEach(swBtn => {
    swBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const chosenColor = swBtn.getAttribute('data-color');
      setCategoryColor(cat, chosenColor);
      popover.remove();
    });
  });

  const customInput = popover.querySelector('.palette-custom-input');
  customInput.addEventListener('input', (e) => {
    setCategoryColor(cat, e.target.value);
  });
  customInput.addEventListener('change', () => {
    popover.remove();
  });

  // Close when clicking outside
  const handleOutsideClick = (e) => {
    if (!popover.contains(e.target) && e.target !== anchorBtn) {
      popover.remove();
      document.removeEventListener('click', handleOutsideClick);
    }
  };
  setTimeout(() => document.addEventListener('click', handleOutsideClick), 10);
}

function autoCategorizeLinksFromTitles() {
  if (!state.links || state.links.length === 0) {
    showToast('Tidak ada link untuk dikategorikan.', 'info');
    return;
  }

  // Pre-configured recognized regions and their default theme colors
  const REGION_KEYWORDS = [
    { keyword: 'KAJORAN', category: 'KAJORAN', color: '#10b981' }, // Hijau Emerald
    { keyword: 'NGADIHARJO', category: 'NGADIHARJO', color: '#ef4444' }, // Merah Ruby
    { keyword: 'MENOREH', category: 'MENOREH/KALISALAK', color: '#2563eb' }, // Biru Safir
    { keyword: 'KALISALAK', category: 'MENOREH/KALISALAK', color: '#2563eb' },
    { keyword: 'BESERAN', category: 'BESERAN', color: '#f59e0b' }, // Kuning Amber
    { keyword: 'DAPUR', category: 'DAPUR HARIAN', color: '#8b5cf6' }, // Ungu Violet
    { keyword: 'SEWA DAPUR', category: 'DAPUR HARIAN', color: '#8b5cf6' }
  ];

  let changedCount = 0;
  state.links.forEach(link => {
    const title = (link.title || '').toUpperCase();
    for (const item of REGION_KEYWORDS) {
      if (title.includes(item.keyword)) {
        if (link.category !== item.category) {
          link.category = item.category;
          link.updatedAt = new Date().toISOString();
          changedCount++;
        }
        if (!state.categoryColors[item.category]) {
          state.categoryColors[item.category] = item.color;
        }
        if (!state.categoryOrder.includes(item.category)) {
          state.categoryOrder.push(item.category);
        }
        if (!state.customCategories.includes(item.category)) {
          state.customCategories.push(item.category);
        }
        break;
      }
    }
  });

  if (changedCount === 0) {
    showToast('Semua link sudah sesuai dengan kategori wilayahnya.', 'info');
    return;
  }

  saveToStorage();
  saveCategoryData(true);
  uploadLinksToCloud(false);
  renderCategoryManageList();
  renderApp();
  showToast(`Berhasil! ${changedCount} link otomatis dikelompokkan ke kategori wilayah (Kajoran, Ngadiharjo, dll)!`, 'success');
}

function sortCategoriesAlphabetically() {
  const current = [...getAllCategories()];
  current.sort((a, b) => a.localeCompare(b, 'id'));
  state.categoryOrder = current;
  saveCategoryData();
  renderCategoryManageList();
  renderCategoryTags();
  showToast('Urutan kategori direset ke alfabetik (A-Z).', 'info');
}

// Filter, Sort, and Render Links List
function getFilteredAndSortedLinks() {
  let list = [...state.links];

  // 1. Search Query
  if (state.searchQuery && state.searchQuery.trim().length > 0) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(item => {
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchCat = (item.category || '').toLowerCase().includes(q);
      const matchUrl = (item.url || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat || matchUrl;
    });
  }

  // 2. Type Filter
  if (state.selectedType === 'favorite') {
    list = list.filter(item => item.favorite === true);
  } else if (state.selectedType !== 'all') {
    list = list.filter(item => item.type === state.selectedType);
  }

  // 3. Category Tag Filter
  if (state.selectedTag !== 'all') {
    list = list.filter(item => (item.category || 'Umum').trim() === state.selectedTag);
  }

  // 4. Sorting
  list.sort((a, b) => {
    // 1. Custom Free Layout: Respect user manual order
    if (state.sortBy === 'custom') {
      const ordA = (typeof a.order === 'number') ? a.order : 999999;
      const ordB = (typeof b.order === 'number') ? b.order : 999999;
      if (ordA !== ordB) return ordA - ordB;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }

    // 2. Group by Category / Wilayah: Cards of same category cluster side-by-side
    if (state.sortBy === 'category') {
      const catList = getAllCategories();
      const catA = (a.category || 'Umum').trim();
      const catB = (b.category || 'Umum').trim();
      const idxA = catList.indexOf(catA);
      const idxB = catList.indexOf(catB);
      const posA = idxA === -1 ? 9999 : idxA;
      const posB = idxB === -1 ? 9999 : idxB;
      if (posA !== posB) return posA - posB;

      // Within same category, maintain custom order or title
      const ordA = (typeof a.order === 'number') ? a.order : 999999;
      const ordB = (typeof b.order === 'number') ? b.order : 999999;
      if (ordA !== ordB) return ordA - ordB;
      return a.title.localeCompare(b.title, 'id', { sensitivity: 'base' });
    }

    // Favorites always pinned to top if sort is by newest or oldest
    if (a.favorite !== b.favorite && (state.sortBy === 'newest' || state.sortBy === 'oldest')) {
      return a.favorite ? -1 : 1;
    }

    if (state.sortBy === 'newest') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (state.sortBy === 'oldest') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    if (state.sortBy === 'name_asc') {
      return a.title.localeCompare(b.title, 'id', { sensitivity: 'base' });
    }
    if (state.sortBy === 'name_desc') {
      return b.title.localeCompare(a.title, 'id', { sensitivity: 'base' });
    }
    if (state.sortBy === 'clicks') {
      return (b.clicks || 0) - (a.clicks || 0);
    }
    return 0;
  });

  return list;
}

function renderLinks() {
  const container = document.getElementById('linksGrid');
  const emptyState = document.getElementById('emptyState');
  const filterStatusInfo = document.getElementById('filterStatusInfo');
  const filterStatusCount = document.getElementById('filterStatusCount');

  const filteredLinks = getFilteredAndSortedLinks();

  // Update filter status bar
  const isFiltered = state.searchQuery.trim().length > 0 || state.selectedType !== 'all' || state.selectedTag !== 'all';
  if (isFiltered) {
    filterStatusInfo.classList.remove('hidden');
    filterStatusCount.textContent = filteredLinks.length;
  } else {
    filterStatusInfo.classList.add('hidden');
  }

  if (filteredLinks.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  container.innerHTML = filteredLinks.map(link => renderLinkCard(link)).join('');

  // Attach card event listeners
  container.querySelectorAll('.btn-open-gdrive').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      handleOpenDriveDirect(id);
    });
  });

  container.querySelectorAll('.btn-copy-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.getAttribute('data-url');
      const title = btn.getAttribute('data-title');
      copyToClipboard(url, title);
    });
  });

  container.querySelectorAll('.btn-qr-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openQrModal(id);
    });
  });

  container.querySelectorAll('.btn-star-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      toggleFavorite(id);
    });
  });

  // Card Nudge Buttons (◀ / ▶)
  container.querySelectorAll('.btn-nudge-prev').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      nudgeCardPosition(id, -1);
    });
  });

  container.querySelectorAll('.btn-nudge-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      nudgeCardPosition(id, 1);
    });
  });

  container.querySelectorAll('.btn-edit-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openEditModal(id);
    });
  });

  container.querySelectorAll('.btn-delete-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openDeleteModal(id);
    });
  });

  // Card Drag-and-Drop (Reorder cards directly on the grid & drag to category chips)
  let activeDraggedCardId = null;

  container.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('dragstart', (e) => {
      // Don't drag card if user is clicking interactive buttons or links
      if (['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.closest('button') || e.target.closest('a')) {
        e.preventDefault();
        return;
      }
      const id = card.getAttribute('data-card-id');
      activeDraggedCardId = id;
      const title = card.querySelector('.card-title')?.textContent || 'Link Drive';
      e.dataTransfer.setData('text/card-drag', id);
      e.dataTransfer.setData('text/link-id', id);
      e.dataTransfer.setData('text/plain', title);
      e.dataTransfer.effectAllowed = 'copyMove';
      card.classList.add('card-is-dragging');
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      const draggedId = activeDraggedCardId || e.dataTransfer.getData('text/card-drag') || e.dataTransfer.getData('text/link-id');
      const targetId = card.getAttribute('data-card-id');
      if (!draggedId || draggedId === targetId) return;

      e.dataTransfer.dropEffect = 'move';
      const rect = card.getBoundingClientRect();
      const isList = state.viewMode === 'list';
      let placeAfter = false;

      if (isList) {
        placeAfter = e.clientY > (rect.top + rect.height / 2);
      } else {
        if (e.clientY > rect.top + rect.height * 0.7) {
          placeAfter = true;
        } else if (e.clientY < rect.top + rect.height * 0.3) {
          placeAfter = false;
        } else {
          placeAfter = e.clientX > (rect.left + rect.width / 2);
        }
      }

      if (placeAfter) {
        card.classList.add('drop-target-after');
        card.classList.remove('drop-target-before');
      } else {
        card.classList.add('drop-target-before');
        card.classList.remove('drop-target-after');
      }
    });

    card.addEventListener('dragleave', (e) => {
      if (!card.contains(e.relatedTarget)) {
        card.classList.remove('drop-target-before', 'drop-target-after');
      }
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      const placeAfter = card.classList.contains('drop-target-after');
      card.classList.remove('drop-target-before', 'drop-target-after');

      const sourceId = activeDraggedCardId || e.dataTransfer.getData('text/card-drag') || e.dataTransfer.getData('text/link-id');
      const targetId = card.getAttribute('data-card-id');

      if (!sourceId || !targetId || sourceId === targetId) return;
      reorderCardToPosition(sourceId, targetId, placeAfter);
    });

    card.addEventListener('dragend', () => {
      activeDraggedCardId = null;
      card.classList.remove('card-is-dragging');
      container.querySelectorAll('.link-card').forEach(c => {
        c.classList.remove('drop-target-before', 'drop-target-after');
      });
      document.querySelectorAll('.tag-filter-chip').forEach(c => {
        c.classList.remove('drop-target-active');
      });
    });
  });
}

function renderLinkCard(link) {
  const type = link.type || 'file';
  const typeIcon = ICONS[type] || ICONS.file;
  const typeName = TYPE_NAMES[type] || 'File';
  const category = (link.category || 'Umum').trim();
  const catColor = getCategoryColor(category);
  const isFavorite = !!link.favorite;
  const clicks = link.clicks || 0;
  const ownerBadge = (isAdminUser() && link.ownerUsername)
    ? `<span class="badge-owner" title="Pemilik Link">👤 @${escapeHtml(link.ownerUsername)}</span>`
    : '';

  return `
    <article 
      class="link-card ${isFavorite ? 'is-favorite' : ''}" 
      style="--card-accent: ${catColor};" 
      data-card-id="${link.id}" 
      draggable="true" 
      title="Tahan & geser untuk mengatur tata letak kartu berdampingan, atau tarik ke tag kategori di atas"
    >
      
      <!-- Card Top: Badge, Drag Handle & Quick Actions -->
      <div class="card-top">
        <div class="card-top-left">
          <span class="card-drag-handle" title="Tahan & geser untuk memindahkan posisi kartu" aria-label="Geser posisi kartu">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="9" cy="5" r="1.5"></circle>
              <circle cx="15" cy="5" r="1.5"></circle>
              <circle cx="9" cy="12" r="1.5"></circle>
              <circle cx="15" cy="12" r="1.5"></circle>
              <circle cx="9" cy="19" r="1.5"></circle>
              <circle cx="15" cy="19" r="1.5"></circle>
            </svg>
          </span>
          <span class="card-type-badge badge-${type}">
            ${typeIcon}
            <span>${typeName}</span>
          </span>
        </div>
        ${ownerBadge}

        <div class="card-top-actions">
          <div class="card-nudge-group" title="Geser posisi kartu">
            <button 
              type="button" 
              class="btn-card-nudge btn-nudge-prev" 
              data-id="${link.id}" 
              title="Geser 1 posisi ke kiri/sebelumnya"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button 
              type="button" 
              class="btn-card-nudge btn-nudge-next" 
              data-id="${link.id}" 
              title="Geser 1 posisi ke kanan/berikutnya"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>

          <button 
            type="button" 
            class="btn-star-fav ${isFavorite ? 'active' : ''}" 
            data-id="${link.id}" 
            title="${isFavorite ? 'Hapus dari Favorit' : 'Tandai sebagai Favorit'}"
          >
            ${isFavorite ? ICONS.starSolid : ICONS.starOutline}
          </button>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <span class="card-category-tag" style="--cat-tag-color: ${catColor}; background: color-mix(in srgb, ${catColor} 14%, transparent); color: ${catColor}; border: 1px solid color-mix(in srgb, ${catColor} 30%, transparent);">
          <span class="cat-badge-dot" style="background-color: ${catColor};"></span>
          ${escapeHtml(category)}
        </span>
        <h3 class="card-title">${escapeHtml(link.title)}</h3>
        
        ${link.description ? `<p class="card-desc">${escapeHtml(link.description)}</p>` : ''}

        <div class="card-url-preview" title="${escapeHtml(link.url)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span class="url-truncate">${escapeHtml(link.url)}</span>
        </div>
      </div>

      <!-- Card Bottom / Footer Actions -->
      <div class="card-footer">
        <div class="card-footer-meta">
          <span class="click-counter" title="Jumlah kali link ini dibuka">
            👁️ ${clicks}x dibuka
          </span>
        </div>

        <div class="card-action-buttons">
          <!-- Direct Open Google Drive CTA -->
          <a 
            href="${escapeHtml(link.url)}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn-open-gdrive" 
            data-id="${link.id}"
            title="Klik untuk langsung membuka di Google Drive"
          >
            <span>Buka Google Drive</span>
            ${ICONS.externalLink}
          </a>

          <!-- Copy Link -->
          <button 
            type="button" 
            class="btn-card-action btn-copy-link" 
            data-url="${escapeHtml(link.url)}" 
            data-title="${escapeHtml(link.title)}" 
            title="Salin Link Google Drive"
          >
            ${ICONS.copy}
          </button>

          <!-- QR Code -->
          <button 
            type="button" 
            class="btn-card-action btn-qr-link" 
            data-id="${link.id}" 
            title="Tampilkan QR Code untuk HP"
          >
            ${ICONS.qr}
          </button>

          <!-- Edit -->
          <button 
            type="button" 
            class="btn-card-action btn-edit-link" 
            data-id="${link.id}" 
            title="Edit Data Link"
          >
            ${ICONS.edit}
          </button>

          <!-- Delete -->
          <button 
            type="button" 
            class="btn-card-action btn-delete-link" 
            data-id="${link.id}" 
            title="Hapus Link"
          >
            ${ICONS.trash}
          </button>
        </div>
      </div>

    </article>
  `;
}

function updateFilterTabsUI() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    const type = tab.getAttribute('data-type');
    if (type === state.selectedType) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

function setFilterType(type) {
  state.selectedType = type;
  renderApp();
}

function resetAllFilters() {
  state.searchQuery = '';
  state.selectedType = 'all';
  state.selectedTag = 'all';
  document.getElementById('searchInput').value = '';
  document.getElementById('clearSearchBtn').classList.add('hidden');
  renderApp();
  showToast('Semua filter berhasil direset.', 'info');
}

// ===================================================================
// LINK ACTIONS: OPEN, COPY, FAVORITE
// ===================================================================
function handleOpenDriveDirect(id) {
  const item = state.links.find(l => l.id === id);
  if (!item) return;

  // Increment clicks counter
  item.clicks = (item.clicks || 0) + 1;
  item.lastOpenedAt = new Date().toISOString();
  saveToStorage();
  syncLinkPatchToCloud(id, { clicks: item.clicks, lastOpenedAt: item.lastOpenedAt });

  // Fast UI update of the click counter without re-rendering everything
  const card = document.querySelector(`[data-card-id="${id}"] .click-counter`);
  if (card) {
    card.textContent = `👁️ ${item.clicks}x dibuka`;
  }
}

async function copyToClipboard(text, title = 'Link') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
    showToast(`Link "${truncate(title, 32)}" berhasil disalin ke clipboard!`, 'success');
  } catch (err) {
    console.error('Copy failed:', err);
    showToast('Gagal menyalin link otomatis.', 'error');
  }
}

function toggleFavorite(id) {
  const item = state.links.find(l => l.id === id);
  if (!item) return;

  item.favorite = !item.favorite;
  saveToStorage();
  syncLinkPatchToCloud(id, { favorite: item.favorite });
  renderApp();

  const msg = item.favorite 
    ? `"${truncate(item.title, 30)}" ditambahkan ke Favorit ★` 
    : `"${truncate(item.title, 30)}" dihapus dari Favorit`;
  showToast(msg, 'info');
}

// ===================================================================
// MODAL: TAMBAH & EDIT LINK
// ===================================================================
function openAddModal() {
  if (!state.currentUser) {
    showToast('Harap buat akun Anda dulu atau masuk terlebih dahulu untuk menambah link', 'warning');
    openAuthModal('register', true);
    return;
  }

  const modal = document.getElementById('linkModal');
  const form = document.getElementById('linkForm');
  form.reset();

  document.getElementById('linkId').value = '';
  document.getElementById('modalTitle').textContent = 'Tambah Link Google Drive Baru';
  document.getElementById('linkType').value = 'folder';
  document.getElementById('linkCategory').value = 'SPPG Utama';
  document.getElementById('urlHint').innerHTML = '💡 Tip: Masukkan link sharing Google Drive (Folder, Docs, Sheets, Forms, Slides, atau File).';
  document.getElementById('urlHint').style.color = 'var(--text-muted)';

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => document.getElementById('linkUrl').focus(), 80);
}

function openEditModal(id) {
  if (!state.currentUser) {
    showToast('Harap masuk terlebih dahulu untuk mengedit link', 'warning');
    openAuthModal('login', true);
    return;
  }

  const item = state.links.find(l => l.id === id);
  if (!item) return;

  const modal = document.getElementById('linkModal');
  document.getElementById('linkId').value = item.id;
  document.getElementById('modalTitle').textContent = 'Edit Data Link Google Drive';
  document.getElementById('linkUrl').value = item.url;
  document.getElementById('linkTitle').value = item.title;
  document.getElementById('linkType').value = item.type || 'file';
  document.getElementById('linkCategory').value = item.category || 'SPPG Utama';
  document.getElementById('linkDescription').value = item.description || '';
  document.getElementById('linkFavorite').checked = !!item.favorite;

  handleUrlInputAutoDetect();

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => document.getElementById('linkTitle').focus(), 80);
}

function closeModal() {
  const modal = document.getElementById('linkModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('linkId').value;
  const url = document.getElementById('linkUrl').value.trim();
  const title = document.getElementById('linkTitle').value.trim();
  const type = document.getElementById('linkType').value;
  const category = document.getElementById('linkCategory').value.trim() || 'Umum';
  const description = document.getElementById('linkDescription').value.trim();
  const favorite = document.getElementById('linkFavorite').checked;

  if (!url) {
    showToast('Harap masukkan URL Google Drive', 'error');
    document.getElementById('linkUrl').focus();
    return;
  }

  if (!title) {
    showToast('Harap masukkan Nama Berkas / Folder', 'error');
    document.getElementById('linkTitle').focus();
    return;
  }

  // URL basic validation
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showToast('URL harus diawali dengan http:// atau https://', 'error');
    document.getElementById('linkUrl').focus();
    return;
  }

  if (id) {
    // Edit existing
    const index = state.links.findIndex(l => l.id === id);
    if (index !== -1) {
      state.links[index] = {
        ...state.links[index],
        url,
        title,
        type,
        category,
        description,
        favorite,
        updatedAt: new Date().toISOString()
      };
      syncLinkSaveToCloud(state.links[index]);
      showToast('Link Google Drive berhasil diperbarui!', 'success');
    }
  } else {
    // Add new
    const newLink = {
      id: 'gdrive-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      url,
      title,
      type,
      category,
      description,
      favorite,
      clicks: 0,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.links.unshift(newLink);
    state.links.forEach((l, idx) => { l.order = idx; });
    syncLinkSaveToCloud(newLink);
    showToast('Link Google Drive baru berhasil disimpan!', 'success');
  }

  saveToStorage();
  closeModal();
  renderApp();
}

// ===================================================================
// MODAL: QR CODE GENERATOR
// ===================================================================
function openQrModal(id) {
  const item = state.links.find(l => l.id === id);
  if (!item) return;

  state.activeQrUrl = item.url;
  state.activeQrTitle = item.title;

  document.getElementById('qrItemTitle').textContent = item.title;
  const container = document.getElementById('qrCanvasContainer');
  container.innerHTML = '';

  if (typeof QRCode !== 'undefined') {
    try {
      new QRCode(container, {
        text: item.url,
        width: 190,
        height: 190,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (err) {
      console.error('QR code generation error:', err);
      container.innerHTML = `<p class="text-danger">Gagal membuat QR Code</p>`;
    }
  } else {
    container.innerHTML = `<p class="text-muted">Modul QR Code belum siap</p>`;
  }

  const modal = document.getElementById('qrModal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeQrModal() {
  const modal = document.getElementById('qrModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  state.activeQrUrl = null;
  state.activeQrTitle = null;
}

// ===================================================================
// MODAL: DELETE CONFIRMATION
// ===================================================================
function openDeleteModal(id) {
  const item = state.links.find(l => l.id === id);
  if (!item) return;

  state.deletingId = id;
  document.getElementById('deleteItemTitle').textContent = item.title;
  document.getElementById('deleteItemUrl').textContent = item.url;

  const modal = document.getElementById('confirmModal');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  const modal = document.getElementById('confirmModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  state.deletingId = null;
}

function executeDelete() {
  if (!state.deletingId) return;

  const item = state.links.find(l => l.id === state.deletingId);
  const title = item ? item.title : 'Link';
  const delId = state.deletingId;

  state.links = state.links.filter(l => l.id !== delId);
  syncLinkDeleteFromCloud(delId);
  saveToStorage();
  closeDeleteModal();
  renderApp();

  showToast(`Link "${truncate(title, 28)}" berhasil dihapus.`, 'info');
}

// ===================================================================
// BACKUP & RESTORE (EXPORT & IMPORT JSON)
// ===================================================================
function exportDataJson() {
  try {
    const dataStr = JSON.stringify(state.links, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];

    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_link_gdrive_sppg_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showToast(`Data cadangan berhasil diunduh (${state.links.length} link)`, 'success');
  } catch (err) {
    console.error('Export error:', err);
    showToast('Gagal mengekspor data', 'error');
  }
}

function handleImportJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        throw new Error('Format file tidak valid. Harus berupa array data JSON.');
      }

      // Validate items have title and url
      const validItems = imported.filter(item => item && item.title && item.url);
      if (validItems.length === 0) {
        showToast('Tidak ada data link valid di dalam file JSON', 'error');
        return;
      }

      const shouldMerge = confirm(
        `Ditemukan ${validItems.length} link dalam file.\n\n` +
        `Klik OK untuk MENGGABUNGKAN dengan data saat ini.\n` +
        `Klik CANCEL untuk MENGGANTIKAN seluruh data lama.`
      );

      if (shouldMerge) {
        // Merge without duplicate IDs
        const existingUrls = new Set(state.links.map(l => l.url.trim()));
        let addedCount = 0;
        validItems.forEach(item => {
          if (!existingUrls.has(item.url.trim())) {
            item.id = item.id || ('gdrive-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6));
            state.links.push(item);
            addedCount++;
          }
        });
        showToast(`Berhasil menggabungkan ${addedCount} link baru!`, 'success');
      } else {
        // Replace all
        state.links = validItems.map(item => ({
          ...item,
          id: item.id || ('gdrive-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6))
        }));
        showToast(`Berhasil memulihkan ${validItems.length} link dari file cadangan!`, 'success');
      }

      saveToStorage();
      renderApp();
    } catch (err) {
      console.error('Import parse error:', err);
      showToast('Gagal membaca file JSON: ' + err.message, 'error');
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

function resetToDefaultLinks() {
  const confirmed = confirm('Apakah Anda yakin ingin memuat ulang contoh awal link SPPG? Tindakan ini akan mengembalikan data bawaan.');
  if (confirmed) {
    state.links = [...DEFAULT_LINKS];
    saveToStorage();
    renderApp();
    showToast('Data berhasil dimuat ulang ke contoh awal bawaan.', 'success');
  }
}

// ===================================================================
// THEME & VIEW MODE PREFERENCES
// ===================================================================
function loadThemePreference() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  applyTheme(saved);
}

function toggleTheme() {
  const current = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem(THEME_STORAGE_KEY, newTheme);
}

function applyTheme(theme) {
  const moonIcon = document.getElementById('moonIcon');
  const sunIcon = document.getElementById('sunIcon');

  if (theme === 'dark') {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  } else {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  }
}

function loadViewPreference() {
  const saved = localStorage.getItem(VIEW_STORAGE_KEY) || 'grid';
  setViewMode(saved, false);
}

function setViewMode(mode, save = true) {
  state.viewMode = mode;
  const gridContainer = document.getElementById('linksGrid');
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewListBtn = document.getElementById('viewListBtn');

  if (mode === 'list') {
    gridContainer.classList.add('list-layout');
    viewGridBtn.classList.remove('active');
    viewListBtn.classList.add('active');
  } else {
    gridContainer.classList.remove('list-layout');
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
  }

  if (save) {
    localStorage.setItem(VIEW_STORAGE_KEY, mode);
  }
}

function loadSortPreference() {
  const saved = localStorage.getItem(SORT_STORAGE_KEY) || 'custom';
  state.sortBy = saved;
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = saved;
}

function saveSortPreference(val) {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, val);
  } catch (e) {
    console.warn(e);
  }
}

// Reorder card to a new position relative to target card
function reorderCardToPosition(sourceId, targetId, placeAfter) {
  if (!Array.isArray(state.links) || state.links.length < 2) return;

  const currentViewLinks = getFilteredAndSortedLinks();
  const sourceInView = currentViewLinks.find(l => l.id === sourceId);
  const targetInView = currentViewLinks.find(l => l.id === targetId);

  if (!sourceInView || !targetInView) return;

  const sourceIdx = state.links.findIndex(l => l.id === sourceId);
  if (sourceIdx === -1) return;
  const [movedItem] = state.links.splice(sourceIdx, 1);

  const targetIdx = state.links.findIndex(l => l.id === targetId);
  if (targetIdx === -1) {
    state.links.splice(sourceIdx, 0, movedItem);
    return;
  }

  const insertIdx = placeAfter ? targetIdx + 1 : targetIdx;
  state.links.splice(insertIdx, 0, movedItem);

  // Normalize sequential order numbers
  state.links.forEach((l, idx) => {
    l.order = idx;
    l.updatedAt = new Date().toISOString();
  });

  // Switch to custom sort so custom layout is immediately active
  state.sortBy = 'custom';
  saveSortPreference('custom');
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = 'custom';

  saveToStorage();
  uploadLinksToCloud(false);
  renderApp();

  showToast(`Tata letak diatur: "${truncate(movedItem.title, 22)}" ${placeAfter ? 'setelah' : 'sebelum'} "${truncate(targetInView.title, 18)}"`, 'success');
}

// Nudge card position one step earlier (-1) or later (+1)
function nudgeCardPosition(id, offset) {
  if (!Array.isArray(state.links) || state.links.length < 2) return;

  const currentViewLinks = getFilteredAndSortedLinks();
  const viewIndex = currentViewLinks.findIndex(l => l.id === id);
  if (viewIndex === -1) return;

  const targetViewIndex = viewIndex + offset;
  if (targetViewIndex < 0 || targetViewIndex >= currentViewLinks.length) {
    showToast(offset < 0 ? 'Kartu sudah berada di posisi paling awal.' : 'Kartu sudah berada di posisi paling akhir.', 'info');
    return;
  }

  const targetItem = currentViewLinks[targetViewIndex];
  reorderCardToPosition(id, targetItem.id, offset > 0);
}

// ===================================================================
// TOAST NOTIFICATIONS SYSTEM
// ===================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="toast-icon text-success" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="toast-icon text-danger" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else {
    iconSvg = `<svg class="toast-icon text-info" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ===================================================================
// UTILITIES
// ===================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function truncate(text, maxLen = 30) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.substr(0, maxLen) + '...';
}

// ===================================================================
// FIREBASE REALTIME CLOUD SYNCHRONIZATION (5+ PENGGUNA)
// ===================================================================
function getActiveFirebaseConfig() {
  // 1. Prioritaskan konfigurasi di localStorage jika ada
  try {
    const saved = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.databaseURL) return parsed;
    }
  } catch (err) {
    console.warn('Error reading saved cloud config:', err);
  }

  // 2. Cek berkas firebase-config.js (window.FIREBASE_CONFIG)
  if (typeof window.FIREBASE_CONFIG === 'object' && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.databaseURL) {
    return window.FIREBASE_CONFIG;
  }

  return null;
}

function initFirebaseSync() {
  const config = getActiveFirebaseConfig();
  if (!config || !config.databaseURL) {
    updateCloudStatusUI('offline', 'Sync Cloud', 'Data tersimpan di browser ini. Hubungkan Firebase agar 5 orang atau lebih dapat melihat & menambah link secara bersamaan.');
    return;
  }

  updateCloudStatusUI('connecting', 'Menghubungkan...', 'Sedang menyambungkan ke Cloud Database...');

  // Pastikan library Firebase SDK telah terunduh
  if (typeof firebase === 'undefined') {
    setTimeout(initFirebaseSync, 800);
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    state.firebaseDb = firebase.database();
    state.firebaseConfig = config;

    // Pantau status koneksi real-time Firebase
    state.firebaseDb.ref('.info/connected').on('value', (snap) => {
      const isOnline = snap.val() === true;
      if (isOnline) {
        state.cloudStatus = 'online';
        updateCloudStatusUI('online', 'Online (5+ User)', 'Terhubung ke Firebase Realtime Database. Semua perubahan akan langsung sinkron otomatis ke seluruh perangkat.');

        // Sinkronisasi daftar akun dari Cloud agar akun seperti rofiq otomatis tersedia
        state.firebaseDb.ref('sppg_accounts').once('value').then(s => {
          const accs = s.val();
          if (accs) {
            const remoteList = Object.values(accs);
            const local = getRegisteredAccounts();
            remoteList.forEach(r => {
              if (r && r.username) {
                const idx = local.findIndex(l => l.username.toLowerCase() === r.username.toLowerCase());
                if (idx >= 0) local[idx] = { ...local[idx], ...r };
                else local.push(r);
              }
            });
            saveRegisteredAccounts(local);
          }
        }).catch(e => console.warn('Sync accounts error:', e));
      } else {
        state.cloudStatus = 'offline';
        updateCloudStatusUI('offline', 'Sync Cloud (Offline)', 'Koneksi terputus. Menunggu jaringan tersambung kembali...');
      }
    });

    // Lepas listener lama jika ada
    if (state.firebaseUserLinksRef) {
      state.firebaseUserLinksRef.off();
      state.firebaseUserLinksRef = null;
    }

    if (!state.currentUser || state.currentUser.username === 'demo') {
      return;
    }

    // Pasang listener real-time KHUSUS untuk akun pengguna saat ini
    const userPath = 'sppg_multiusers/' + state.currentUser.username;
    state.firebaseUserLinksRef = state.firebaseDb.ref(userPath);

    state.firebaseUserLinksRef.on('value', (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // 1. Links
        if (val.links) {
          const rawList = Array.isArray(val.links) ? val.links : Object.values(val.links);
          rawList.sort((a, b) => ((typeof a.order === 'number') ? a.order : 999999) - ((typeof b.order === 'number') ? b.order : 999999));
          state.links = rawList;
          saveToStorage();
        } else if (Array.isArray(val)) {
          val.sort((a, b) => ((typeof a.order === 'number') ? a.order : 999999) - ((typeof b.order === 'number') ? b.order : 999999));
          state.links = val;
          saveToStorage();
        }

        // 2. Category Colors
        if (val.categoryColors) {
          if (Array.isArray(val.categoryColors)) {
            val.categoryColors.forEach(item => {
              if (item && item.name && item.color) {
                state.categoryColors[item.name] = item.color;
              }
            });
          } else if (typeof val.categoryColors === 'object') {
            state.categoryColors = { ...state.categoryColors, ...val.categoryColors };
          }
          saveCategoryData(false);
        }

        // 3. Category Order
        if (val.categoryOrder && Array.isArray(val.categoryOrder)) {
          state.categoryOrder = val.categoryOrder;
          saveCategoryData(false);
        }

        renderApp();
      } else {
        // Jika cloud akun ini masih kosong dan kita punya data lokal, sinkronkan
        if (state.links.length > 0) {
          uploadLinksToCloud(false);
        }
      }
    }, (err) => {
      console.error('Firebase listen error:', err);
      updateCloudStatusUI('offline', 'Sync Error', 'Gagal memuat dari Cloud: ' + err.message);
    });

  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    updateCloudStatusUI('offline', 'Sync Error', 'Konfigurasi Firebase tidak valid: ' + err.message);
  }
}

function updateCloudStatusUI(status, label, modalDesc) {
  state.cloudStatus = status;

  const dot = document.getElementById('cloudStatusDot');
  const text = document.getElementById('cloudStatusText');
  const modalDot = document.getElementById('cloudModalDot');
  const modalTitle = document.getElementById('cloudModalStatusTitle');
  const modalDescEl = document.getElementById('cloudModalStatusDesc');
  const actionsRow = document.getElementById('cloudSyncActions');
  const btnDisconnect = document.getElementById('btnDisconnectCloud');

  // Bersihkan kelas dot
  [dot, modalDot].forEach(d => {
    if (!d) return;
    d.className = 'status-dot';
    if (status === 'online') d.classList.add('dot-online');
    else if (status === 'connecting') d.classList.add('dot-connecting');
    else d.classList.add('dot-offline');
  });

  if (text) text.textContent = label || 'Sync Cloud';

  if (modalTitle) {
    if (status === 'online') modalTitle.textContent = '🟢 Cloud Realtime Aktif (Sinkron 5+ Pengguna)';
    else if (status === 'connecting') modalTitle.textContent = '🟡 Sedang Menghubungkan ke Cloud...';
    else modalTitle.textContent = '⚪ Mode Lokal (Hanya di Browser Ini)';
  }

  if (modalDescEl && modalDesc) {
    modalDescEl.textContent = modalDesc;
  }

  if (actionsRow) {
    if (status === 'online') actionsRow.classList.remove('hidden');
    else actionsRow.classList.add('hidden');
  }

  if (btnDisconnect) {
    if (status === 'online') btnDisconnect.classList.remove('hidden');
    else btnDisconnect.classList.add('hidden');
  }
}

function openCloudModal() {
  const modal = document.getElementById('cloudModal');
  const config = getActiveFirebaseConfig();

  if (config) {
    document.getElementById('firebaseDbUrlInput').value = config.databaseURL || '';
    document.getElementById('firebaseApiKeyInput').value = config.apiKey || '';
    document.getElementById('firebaseProjectIdInput').value = config.projectId || '';
  }

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeCloudModal() {
  const modal = document.getElementById('cloudModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function handleSaveCloudConfig() {
  const dbUrl = document.getElementById('firebaseDbUrlInput').value.trim();
  const apiKey = document.getElementById('firebaseApiKeyInput').value.trim();
  const projectId = document.getElementById('firebaseProjectIdInput').value.trim();

  if (!dbUrl) {
    showToast('Harap masukkan URL Firebase Realtime Database', 'error');
    document.getElementById('firebaseDbUrlInput').focus();
    return;
  }

  if (!dbUrl.includes('.firebasedatabase.app') && !dbUrl.includes('.firebaseio.com')) {
    showToast('URL database harus berupa alamat Firebase (contoh: https://xxx.asia-southeast1.firebasedatabase.app)', 'error');
    return;
  }

  const newConfig = {
    databaseURL: dbUrl,
    apiKey: apiKey || 'AIzaSyPlaceholder',
    projectId: projectId || dbUrl.split('//')[1]?.split('.')[0] || 'sppg-gdrive'
  };

  try {
    localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    showToast('Pengaturan Cloud berhasil disimpan. Menghubungkan...', 'info');
    closeCloudModal();
    initFirebaseSync();
  } catch (err) {
    showToast('Gagal menyimpan pengaturan: ' + err.message, 'error');
  }
}

function handleDisconnectCloud() {
  const confirmed = confirm('Apakah Anda yakin ingin memutuskan sinkronisasi Cloud? Aplikasi akan kembali ke mode lokal.');
  if (!confirmed) return;

  try {
    localStorage.removeItem(CLOUD_CONFIG_STORAGE_KEY);
    if (state.firebaseDb) {
      state.firebaseDb.goOffline();
      state.firebaseDb = null;
    }
    updateCloudStatusUI('offline', 'Sync Cloud', 'Data tersimpan di browser ini.');
    showToast('Koneksi Cloud diputuskan. Aplikasi berjalan dalam mode lokal.', 'info');
    closeCloudModal();
  } catch (err) {
    console.error('Disconnect error:', err);
  }
}

// Sinkronisasi data ke Cloud KHUSUS akun aktif
function getUserCloudPath() {
  const username = state.currentUser ? state.currentUser.username : 'admin';
  return 'sppg_multiusers/' + username + '/links';
}

function syncLinkSaveToCloud(link) {
  if (!state.firebaseDb || state.cloudStatus !== 'online' || !state.currentUser || state.currentUser.username === 'demo') return;
  try {
    state.firebaseDb.ref(getUserCloudPath() + '/' + link.id).set(link);
  } catch (err) {
    console.warn('Sync save to cloud error:', err);
  }
}

function syncLinkDeleteFromCloud(id) {
  if (!state.firebaseDb || state.cloudStatus !== 'online' || !state.currentUser || state.currentUser.username === 'demo') return;
  try {
    state.firebaseDb.ref(getUserCloudPath() + '/' + id).remove();
  } catch (err) {
    console.warn('Sync delete from cloud error:', err);
  }
}

function syncLinkPatchToCloud(id, updates) {
  if (!state.firebaseDb || state.cloudStatus !== 'online' || !state.currentUser || state.currentUser.username === 'demo') return;
  try {
    state.firebaseDb.ref(getUserCloudPath() + '/' + id).update(updates);
  } catch (err) {
    console.warn('Sync patch to cloud error:', err);
  }
}

function uploadLinksToCloud(showToastMsg = true) {
  if (!state.firebaseDb || !state.currentUser || state.currentUser.username === 'demo') {
    showToast('Database Cloud belum terhubung atau sedang dalam Mode Demo.', 'error');
    return;
  }

  const dataMap = {};
  state.links.forEach(item => {
    dataMap[item.id] = item;
  });

  state.firebaseDb.ref(getUserCloudPath()).set(dataMap)
    .then(() => {
      if (showToastMsg) {
        showToast(`Berhasil mengunggah ${state.links.length} link akun @${state.currentUser.username} ke Cloud!`, 'success');
      }
    })
    .catch(err => {
      showToast('Gagal mengunggah ke Cloud: ' + err.message, 'error');
    });
}

function fetchLinksFromCloud() {
  if (!state.firebaseDb || !state.currentUser || state.currentUser.username === 'demo') {
    showToast('Database Cloud belum terhubung atau sedang dalam Mode Demo.', 'error');
    return;
  }

  state.firebaseDb.ref(getUserCloudPath()).once('value')
    .then(snap => {
      const val = snap.val();
      if (val) {
        const remoteList = Array.isArray(val) ? val : Object.values(val);
        state.links = remoteList;
        saveToStorage();
        renderApp();
        showToast(`Berhasil menarik ${remoteList.length} link akun @${state.currentUser.username} dari Cloud!`, 'success');
      } else {
        showToast('Database Cloud akun ini masih kosong.', 'info');
      }
    })
    .catch(err => {
      showToast('Gagal mengambil data dari Cloud: ' + err.message, 'error');
    });
}

// ===================================================================
// ===================================================================
// MULTI-ACCOUNT AUTHENTICATION & USER MANAGEMENT
// ===================================================================
const DEFAULT_ACCOUNTS = [
  {
    id: 'usr-admin',
    username: 'admin',
    fullName: 'Administrator SPPG',
    password: 'admin',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

const DEMO_ACCOUNT = {
  id: 'usr-demo',
  username: 'demo',
  fullName: 'Pengunjung Demo SPPG',
  role: 'Demo Tamu'
};

function isAdminUser(user = state.currentUser) {
  if (!user) return false;
  const username = (user.username || '').toLowerCase();
  const role = (user.role || '').toLowerCase();
  if (username === 'demo') return false; // Demo bukan Admin
  return username === 'admin' || role === 'admin' || role === 'sppg admin';
}

function getRegisteredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('Error reading accounts:', err);
  }
  // Simpan akun bawaan
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  return DEFAULT_ACCOUNTS;
}

function saveRegisteredAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Error saving accounts:', err);
  }
}

function initUserSession() {
  let session = null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) session = JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading session:', err);
  }

  const accounts = getRegisteredAccounts();

  if (session && session.username) {
    if (session.username.toLowerCase() === 'demo') {
      state.currentUser = DEMO_ACCOUNT;
    } else {
      const matched = accounts.find(a => a.username.toLowerCase() === session.username.toLowerCase());
      state.currentUser = matched || session;
    }
  } else {
    // Pengguna belum login atau baru pertama kali membuka link!
    state.currentUser = null;
  }

  updateUserUI();
}

function updateUserUI() {
  const user = state.currentUser;

  const mainAppContent = document.getElementById('mainAppContent');
  const userAvatar = document.getElementById('userAvatar');
  const navUserName = document.getElementById('navUserName');
  const navUserRole = document.getElementById('navUserRole');
  const btnNavLogout = document.getElementById('btnNavLogout');
  const btnBannerLogout = document.getElementById('btnBannerLogout');
  const menuUserFullName = document.getElementById('menuUserFullName');
  const menuUsername = document.getElementById('menuUsername');
  const menuScopeBadge = document.getElementById('menuScopeBadge');
  const scopeUserFullName = document.getElementById('scopeUserFullName');
  const scopeUsername = document.getElementById('scopeUsername');
  const scopeBadgeText = document.getElementById('scopeBadgeText');
  const scopeAdminBadge = document.getElementById('scopeAdminBadge');
  const btnAdminPanel = document.getElementById('btnAdminPanel');
  const navAdminBtnText = document.getElementById('navAdminBtnText');
  const btnMenuAdminPanel = document.getElementById('btnMenuAdminPanel');
  const btnBannerAdminPanel = document.getElementById('btnBannerAdminPanel');
  const bannerAdminBtnText = document.getElementById('bannerAdminBtnText');
  const adminAccessToolbar = document.getElementById('adminAccessToolbar');

  if (!user) {
    if (userAvatar) userAvatar.textContent = '?';
    if (navUserName) navUserName.textContent = 'Belum Masuk';
    if (navUserRole) navUserRole.textContent = 'Wajib Buat Akun';
    if (menuUserFullName) menuUserFullName.textContent = 'Pengunjung';
    if (menuUsername) menuUsername.textContent = '@tamu';
    if (menuScopeBadge) menuScopeBadge.textContent = '🔒 Wajib Buat Akun Dulu';
    if (scopeUserFullName) scopeUserFullName.textContent = 'Wajib Buat Akun Terlebih Dahulu';
    if (scopeUsername) scopeUsername.textContent = '@belum_masuk';
    if (scopeBadgeText) scopeBadgeText.textContent = '🔒 Akses Terkunci';
    if (scopeAdminBadge) scopeAdminBadge.classList.add('hidden');
    if (adminAccessToolbar) adminAccessToolbar.classList.add('hidden');

    // Sembunyikan SEMUA tombol admin & logout saat belum login
    if (btnNavLogout) btnNavLogout.classList.add('hidden');
    if (btnBannerLogout) btnBannerLogout.classList.add('hidden');
    if (btnAdminPanel) btnAdminPanel.classList.add('hidden');
    if (btnBannerAdminPanel) btnBannerAdminPanel.classList.add('hidden');
    if (btnMenuAdminPanel) btnMenuAdminPanel.classList.add('hidden');

    // Kunci / blur tampilan daftar link & statistik agar wajib buat akun dulu
    if (mainAppContent) mainAppContent.classList.add('auth-gated-blur');
    return;
  }

  // Pengguna aktif (baik anggota, demo, maupun admin) -> buka blur tampilan link & statistik
  if (mainAppContent) mainAppContent.classList.remove('auth-gated-blur');

  // Tampilkan tombol logout di navbar dan banner
  if (btnNavLogout) btnNavLogout.classList.remove('hidden');
  if (btnBannerLogout) btnBannerLogout.classList.remove('hidden');

  const isAdm = isAdminUser(user);
  const isDemo = user.username === 'demo';

  const initials = isDemo ? '👁️' : (user.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user.username[0].toUpperCase());

  if (userAvatar) userAvatar.textContent = initials;
  if (navUserName) {
    navUserName.textContent = isDemo ? 'Mode Demo' : (user.fullName ? user.fullName.split(' ')[0] : user.username);
  }
  if (navUserRole) {
    navUserRole.textContent = isAdm ? 'Admin SPPG' : (isDemo ? 'Tamu Demo' : (user.role || 'Member'));
  }
  if (menuUserFullName) {
    menuUserFullName.textContent = isDemo ? 'Mode Demo (Tamu SPPG)' : (user.fullName || user.username);
  }
  if (menuUsername) {
    menuUsername.textContent = '@' + user.username;
  }
  if (menuScopeBadge) {
    if (isAdm) {
      menuScopeBadge.textContent = '👑 Administrator (Akses Penuh)';
    } else if (isDemo) {
      menuScopeBadge.textContent = '👁️ Eksplorasi Mode Demo';
    } else {
      menuScopeBadge.textContent = '🔒 Ruang Link Pribadi';
    }
  }
  if (scopeUserFullName) {
    scopeUserFullName.textContent = isDemo ? 'Pengunjung Mode Demo (Tamu SPPG)' : (user.fullName || user.username);
  }
  if (scopeUsername) {
    scopeUsername.textContent = '@' + user.username;
  }

  const scopeUserFullNameClickable = document.getElementById('scopeUserFullNameClickable');
  if (scopeUserFullNameClickable) {
    if (isAdm) {
      scopeUserFullNameClickable.style.cursor = 'pointer';
      scopeUserFullNameClickable.title = '👑 Administrator SPPG (Klik untuk Kelola Akun)';
    } else {
      scopeUserFullNameClickable.style.cursor = 'default';
      scopeUserFullNameClickable.title = isDemo ? 'Mode Eksplorasi Demo' : 'Ruang Link Pribadi Anda';
    }
  }

  if (scopeBadgeText) {
    if (isAdm) {
      scopeBadgeText.textContent = '👑 Ruang Administrator';
    } else if (isDemo) {
      scopeBadgeText.textContent = '👁️ Mode Demo (Tamu)';
    } else {
      scopeBadgeText.textContent = 'Ruang Akun Pribadi';
    }
  }

  if (scopeAdminBadge) {
    if (isAdm) scopeAdminBadge.classList.remove('hidden');
    else scopeAdminBadge.classList.add('hidden');
  }

  // Toolbar Akses Penuh Admin (Lihat semua link / filter per user) - HANYA ADMIN
  if (adminAccessToolbar) {
    if (isAdm) {
      adminAccessToolbar.classList.remove('hidden');
      populateAdminLinkScopeSelect();
    } else {
      adminAccessToolbar.classList.add('hidden');
    }
  }

  // Tombol & Menu Admin: HANYA DITAMPILKAN JIKA YANG LOGIN ADALAH ADMIN!
  // Jika akun biasa/anggota atau Demo, sembunyikan total agar tidak bisa mengakses admin!
  if (btnAdminPanel) {
    if (isAdm) {
      btnAdminPanel.classList.remove('hidden');
      if (navAdminBtnText) navAdminBtnText.textContent = '👑 Kelola Akun Admin';
    } else {
      btnAdminPanel.classList.add('hidden');
    }
  }

  if (btnBannerAdminPanel) {
    if (isAdm) {
      btnBannerAdminPanel.classList.remove('hidden');
      if (bannerAdminBtnText) bannerAdminBtnText.textContent = '👑 Kelola Akun Admin';
    } else {
      btnBannerAdminPanel.classList.add('hidden');
    }
  }

  if (btnMenuAdminPanel) {
    if (isAdm) {
      btnMenuAdminPanel.classList.remove('hidden');
    } else {
      btnMenuAdminPanel.classList.add('hidden');
    }
  }
}

function openAuthModal(defaultTab = 'login', isMandatory = false) {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  const btnClose = document.getElementById('btnCloseAuthModal');
  const gateNotice = document.getElementById('authGateNotice');

  // Jika belum ada user aktif atau dipaksa wajib, sembunyikan tombol close & tampilkan pesan sambutan awal
  const isEnforced = !state.currentUser || isMandatory;
  if (btnClose) {
    if (isEnforced) {
      btnClose.classList.add('hidden');
    } else {
      btnClose.classList.remove('hidden');
    }
  }

  if (gateNotice) {
    if (isEnforced) {
      gateNotice.classList.remove('hidden');
    } else {
      gateNotice.classList.add('hidden');
    }
  }

  switchAuthTab(defaultTab);
  renderQuickAccountsList();

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  if (defaultTab === 'login') {
    setTimeout(() => {
      const el = document.getElementById('loginUsername');
      if (el) el.focus();
    }, 80);
  } else {
    setTimeout(() => {
      const el = document.getElementById('regFullName');
      if (el) el.focus();
    }, 80);
  }
}

function closeAuthModal() {
  if (!state.currentUser) {
    showToast('Harap buat akun baru, masuk ke akun Anda, atau pilih Mode Demo untuk mencoba aplikasi.', 'warning');
    return;
  }
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tabAuthLogin');
  const tabReg = document.getElementById('tabAuthRegister');
  const formLogin = document.getElementById('loginForm');
  const formReg = document.getElementById('registerForm');
  const modalTitle = document.getElementById('authModalTitle');

  if (tab === 'register') {
    if (tabLogin) tabLogin.classList.remove('active');
    if (tabReg) tabReg.classList.add('active');
    if (formLogin) formLogin.classList.add('hidden');
    if (formReg) formReg.classList.remove('hidden');
    if (modalTitle) modalTitle.textContent = 'Buat Akun Anda Dulu';
    setTimeout(() => {
      const el = document.getElementById('regFullName');
      if (el) el.focus();
    }, 50);
  } else {
    if (tabReg) tabReg.classList.remove('active');
    if (tabLogin) tabLogin.classList.add('active');
    if (formReg) formReg.classList.add('hidden');
    if (formLogin) formLogin.classList.remove('hidden');
    if (modalTitle) modalTitle.textContent = 'Masuk ke Akun Anda';
    setTimeout(() => {
      const el = document.getElementById('loginUsername');
      if (el) el.focus();
    }, 50);
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  if (!username) {
    showToast('Masukkan username Anda', 'error');
    return;
  }

  const accounts = getRegisteredAccounts();
  const found = accounts.find(a => a.username.toLowerCase() === username);

  if (!found) {
    // Jika tidak ditemukan di lokal dan Cloud Firebase aktif, coba periksa dari Cloud
    if (state.firebaseDb && state.cloudStatus === 'online') {
      state.firebaseDb.ref('sppg_accounts/' + username).once('value').then(snap => {
        const remoteAcc = snap.val();
        if (remoteAcc) {
          accounts.push(remoteAcc);
          saveRegisteredAccounts(accounts);
          if (remoteAcc.password && remoteAcc.password !== password) {
            showToast('Password yang Anda masukkan salah.', 'error');
            document.getElementById('loginPassword').focus();
          } else {
            switchUserAccount(remoteAcc, true);
            closeAuthModal();
            showToast(`Selamat datang kembali, ${remoteAcc.fullName}!`, 'success');
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
          }
        } else {
          showToast(`Akun dengan username "${username}" belum terdaftar. Silakan buat akun baru.`, 'error');
          switchAuthTab('register');
          document.getElementById('regUsername').value = username;
        }
      }).catch(() => {
        showToast(`Akun dengan username "${username}" belum terdaftar. Silakan buat akun baru.`, 'error');
        switchAuthTab('register');
        document.getElementById('regUsername').value = username;
      });
      return;
    }

    showToast(`Akun dengan username "${username}" belum terdaftar. Silakan buat akun baru.`, 'error');
    switchAuthTab('register');
    document.getElementById('regUsername').value = username;
    return;
  }

  if (found.password && found.password !== password) {
    showToast('Password yang Anda masukkan salah.', 'error');
    document.getElementById('loginPassword').focus();
    return;
  }

  // Login Berhasil
  switchUserAccount(found, true);
  closeAuthModal();
  showToast(`Selamat datang kembali, ${found.fullName}!`, 'success');
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginPassword').value = '';
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('regFullName').value.trim();
  const username = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;

  if (!fullName) {
    showToast('Harap isi Nama Lengkap Anda', 'error');
    return;
  }

  if (!username || username.length < 3) {
    showToast('Username minimal 3 karakter (tanpa spasi)', 'error');
    return;
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    showToast('Username hanya boleh huruf kecil, angka, atau garis bawah (_)', 'error');
    return;
  }

  if (!password || password.length < 3) {
    showToast('Password minimal 3 karakter', 'error');
    return;
  }

  const accounts = getRegisteredAccounts();
  if (accounts.some(a => a.username.toLowerCase() === username)) {
    showToast(`Username "${username}" sudah digunakan. Silakan gunakan username lain atau login.`, 'error');
    document.getElementById('regUsername').focus();
    return;
  }

  // Buat akun baru (disimpan beserta sandinya agar Admin bisa melihat/meresetnya)
  const newAccount = {
    id: 'usr-' + Date.now(),
    username,
    fullName,
    password,
    role: 'SPPG Member',
    createdAt: new Date().toISOString()
  };

  accounts.push(newAccount);
  saveRegisteredAccounts(accounts);

  // Jika terhubung ke Cloud, simpan info akun ke Firebase Realtime Database
  if (state.firebaseDb && state.cloudStatus === 'online') {
    try {
      state.firebaseDb.ref('sppg_accounts/' + username).set(newAccount);
    } catch (err) {
      console.warn('Error registering account to Firebase:', err);
    }
  }

  // Otomatis login ke akun baru
  switchUserAccount(newAccount, true);
  closeAuthModal();
  showToast(`Selamat datang, ${fullName}! Akun @${username} berhasil dibuat. Ruang link pribadi Anda telah siap.`, 'success');

  document.getElementById('regFullName').value = '';
  document.getElementById('regUsername').value = '';
  document.getElementById('regPassword').value = '';
}

function switchUserAccount(user, isPreAuthenticated = false) {
  // Cegah pengalihan tak berizin ke Administrator tanpa kata sandi
  if (!isPreAuthenticated && user && user.username && user.username.toLowerCase() === 'admin' && (!state.currentUser || state.currentUser.username.toLowerCase() !== 'admin')) {
    switchAuthTab('login');
    const uInput = document.getElementById('loginUsername');
    if (uInput) uInput.value = 'admin';
    const pInput = document.getElementById('loginPassword');
    if (pInput) pInput.focus();
    showToast('Akun Administrator wajib memasukkan password.', 'warning');
    return;
  }

  state.currentUser = user;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  updateUserUI();

  // Muat link khusus akun ini
  loadLinks();
  renderApp();

  // Sambungkan ulang ke Firebase pada path akun ini
  if (state.firebaseDb) {
    initFirebaseSync();
  }
}

// Mode Demo (Tamu): Akses eksplorasi untuk pengunjung yang belum memiliki akun
function enterDemoMode() {
  state.currentUser = DEMO_ACCOUNT;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(DEMO_ACCOUNT));
  updateUserUI();
  loadLinks();
  renderApp();
  closeAuthModal();
  showToast('Selamat datang! Anda masuk dalam Mode Demo (Tamu). Anda dapat melihat dan mencoba fitur link SPPG.', 'info');
}
window.enterDemoMode = enterDemoMode;

function handleLogout() {
  const userMenu = document.getElementById('userMenu');
  if (userMenu) userMenu.classList.remove('show');

  const isDemo = state.currentUser && state.currentUser.username === 'demo';
  const currentName = state.currentUser ? state.currentUser.fullName : 'akun Anda';

  if (!isDemo) {
    const confirmed = confirm(`Apakah Anda yakin ingin keluar dari akun ${currentName}?`);
    if (!confirmed) return;
  }

  state.currentUser = null;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  loadLinks();
  renderApp();
  updateUserUI();

  openAuthModal('register', true);
  if (isDemo) {
    showToast('Keluar dari Mode Demo. Silakan buat akun baru untuk memiliki ruang link pribadi atau masuk jika sudah punya.', 'info');
  } else {
    showToast('Anda telah keluar. Silakan buat akun baru atau masuk ke akun Anda.', 'info');
  }
}

function handleAdminModalLogout() {
  closeAdminModal();
  handleLogout();
}

function toggleUserMenu(e) {
  if (e) {
    e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
  }
  const userMenu = document.getElementById('userMenu');
  const dataMenu = document.getElementById('dataMenu');
  if (dataMenu) dataMenu.classList.remove('show');
  if (userMenu) userMenu.classList.toggle('show');
}

function renderQuickAccountsList() {
  const container = document.getElementById('quickAccountsList');
  if (!container) return;

  const accounts = getRegisteredAccounts();
  const currentUsername = state.currentUser ? state.currentUser.username : '';

  // KEAMANAN TINGKAT TINGGI:
  // Akun Administrator DILARANG KERAS tampil di daftar beralih akun 1-klik di perangkat ini!
  // Administrator harus login manual dengan username 'admin' & password pada tab 'Masuk'.
  // Pengunjung yang belum punya akun diarahkan masuk ke Mode Demo dulu.
  const memberAccounts = accounts.filter(acc => {
    const u = (acc.username || '').toLowerCase();
    return u !== 'admin' && u !== 'demo' && !isAdminUser(acc);
  });

  let html = '';

  if (memberAccounts.length === 0) {
    html += `
      <div class="quick-acc-empty" style="text-align: center; padding: 1.1rem 0.85rem; background: var(--bg-hover, rgba(0,0,0,0.02)); border: 1px dashed var(--border-color); border-radius: 8px; color: var(--text-muted); font-size: 0.83rem; margin-bottom: 0.8rem;">
        <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">👤</div>
        <div style="font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">Belum Ada Akun Anggota di Perangkat Ini</div>
        <div>Jika Anda belum punya akun, Anda dapat masuk ke <strong>Mode Demo</strong> terlebih dahulu atau buat akun baru di atas.</div>
      </div>
    `;
  } else {
    memberAccounts.forEach(acc => {
      const isCurrent = currentUsername && acc.username.toLowerCase() === currentUsername.toLowerCase();
      const initials = acc.fullName
        ? acc.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
        : acc.username[0].toUpperCase();

      html += `
        <div class="quick-account-item ${isCurrent ? 'is-current' : ''}" data-username="${escapeHtml(acc.username)}" style="cursor: pointer;">
          <div class="quick-acc-left">
            <div class="quick-acc-avatar">${initials}</div>
            <div class="quick-acc-names">
              <span class="quick-acc-name">${escapeHtml(acc.fullName)}</span>
              <span class="quick-acc-username">@${escapeHtml(acc.username)}</span>
            </div>
          </div>
          <span class="quick-acc-action">${isCurrent ? '● Sedang Aktif' : 'Beralih ke Akun Ini ➜'}</span>
        </div>
      `;
    });
  }

  // Tombol Coba Mode Demo Dulu & Tambah Akun Baru
  html += `
    <div style="display: flex; flex-direction: column; gap: 0.55rem; margin-top: 0.75rem;">
      <button type="button" class="btn btn-secondary btn-block btn-sm" id="btnQuickDemoMode" onclick="enterDemoMode()" style="background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); color: var(--brand-blue); font-weight: 600; padding: 0.6rem; border-radius: 8px; cursor: pointer;">
        👁️ Coba Mode Demo Dulu (Tanpa Akun)
      </button>
      <button type="button" class="btn btn-secondary btn-block btn-sm" onclick="switchAuthTab('register')" style="border-radius: 8px;">
        ➕ Tambah / Buat Akun Baru
      </button>
    </div>
  `;

  container.innerHTML = html;

  container.querySelectorAll('.quick-account-item').forEach(item => {
    item.addEventListener('click', () => {
      const username = item.getAttribute('data-username');
      const targetUser = memberAccounts.find(a => a.username === username);
      if (targetUser) {
        if (currentUsername && targetUser.username.toLowerCase() === currentUsername.toLowerCase()) {
          showToast(`Akun @${targetUser.username} (${targetUser.fullName}) sedang aktif digunakan.`, 'info');
        } else {
          switchUserAccount(targetUser);
          closeAuthModal();
          showToast(`Berhasil beralih ke akun ${targetUser.fullName}!`, 'success');
        }
      }
    });
  });
}

// ===================================================================
// ADMIN MANAGEMENT PANEL (LIHAT & GANTI PASSWORD PENGGUNA)
// ===================================================================
function openAdminModal() {
  const userMenu = document.getElementById('userMenu');
  if (userMenu) userMenu.classList.remove('show');

  if (!isAdminUser()) {
    showToast('Akses ditolak: Hanya Administrator SPPG yang memiliki akses ke panel ini.', 'error');
    return;
  }
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  renderAdminUsersTable();
  syncAccountsFromCloud();
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function syncAccountsFromCloud() {
  if (!state.firebaseDb || state.cloudStatus !== 'online') return;
  state.firebaseDb.ref('sppg_accounts').once('value').then(snap => {
    const cloudAccs = snap.val();
    if (cloudAccs) {
      const localAccs = getRegisteredAccounts();
      let changed = false;
      Object.values(cloudAccs).forEach(cAcc => {
        if (!cAcc || !cAcc.username) return;
        const idx = localAccs.findIndex(a => a.username.toLowerCase() === cAcc.username.toLowerCase());
        if (idx >= 0) {
          if (cAcc.password && localAccs[idx].password !== cAcc.password) {
            localAccs[idx].password = cAcc.password;
            changed = true;
          }
          if (cAcc.fullName && localAccs[idx].fullName !== cAcc.fullName) {
            localAccs[idx].fullName = cAcc.fullName;
            changed = true;
          }
        } else {
          localAccs.push(cAcc);
          changed = true;
        }
      });
      if (changed) {
        saveRegisteredAccounts(localAccs);
        renderAdminUsersTable();
      }
    }
  }).catch(err => {
    console.warn('Sync accounts error:', err);
  });
}

function renderAdminUsersTable() {
  const tbody = document.getElementById('adminUsersTbody');
  const countEl = document.getElementById('adminTotalUsers');
  const searchInput = document.getElementById('adminSearchUsers');
  if (!tbody) return;

  const accounts = getRegisteredAccounts();
  const query = (searchInput?.value || '').toLowerCase().trim();

  const filtered = accounts.filter(acc => {
    if (!query) return true;
    const name = (acc.fullName || '').toLowerCase();
    const uname = (acc.username || '').toLowerCase();
    return name.includes(query) || uname.includes(query);
  });

  if (countEl) countEl.textContent = `${filtered.length} dari ${accounts.length} Akun`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Tidak ditemukan akun dengan kata kunci "${escapeHtml(query)}"
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  filtered.forEach(acc => {
    const isAdm = isAdminUser(acc);
    const initials = acc.fullName
      ? acc.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
      : acc.username[0].toUpperCase();

    const encodedPassword = encodeURIComponent(acc.password || '');
    const safeUsername = escapeHtml(acc.username);
    const safeFullName = escapeHtml(acc.fullName);
    const accId = acc.id || ('usr_' + acc.username);

    html += `
      <tr>
        <td>
          <div class="admin-user-cell">
            <div class="admin-user-avatar" style="${isAdm ? 'background: #10b981;' : ''}">${initials}</div>
            <div>
              <strong>${safeFullName}</strong>
              ${state.currentUser && acc.username.toLowerCase() === state.currentUser.username.toLowerCase() ? '<span style="font-size: 0.72rem; color: #10b981; font-weight: 700; margin-left: 0.4rem;">(Anda)</span>' : ''}
            </div>
          </div>
        </td>
        <td><code>@${safeUsername}</code></td>
        <td>
          <span class="badge ${isAdm ? 'badge-role-admin' : 'badge-role-member'}">
            ${isAdm ? '👑 Admin' : '👤 Anggota'}
          </span>
        </td>
        <td>
          <div class="pwd-chip">
            <span id="pwdText_${accId}">••••••••</span>
            <button type="button" class="btn-pwd-eye" id="btnEye_${accId}" onclick="togglePasswordPeek('${accId}', '${encodedPassword}')" title="Klik untuk melihat / sembunyikan password">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </td>
        <td>
          <div class="admin-action-btns">
            <button type="button" class="btn btn-secondary btn-sm" onclick="adminPromptChangePassword('${safeUsername}')" title="Ganti kata sandi akun ini">
              🔑 Ganti Sandi
            </button>
            ${!isAdm ? `
              <button type="button" class="btn btn-secondary btn-sm text-danger" onclick="adminDeleteAccount('${safeUsername}')" title="Hapus akun pengguna ini">
                🗑️ Hapus
              </button>
            ` : `
              <span style="font-size: 0.76rem; color: var(--text-muted); padding: 0.2rem 0.5rem;">(Utama)</span>
            `}
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function togglePasswordPeek(id, encodedRawPassword) {
  const span = document.getElementById(`pwdText_${id}`);
  const eyeBtn = document.getElementById(`btnEye_${id}`);
  if (!span) return;

  const rawPassword = decodeURIComponent(encodedRawPassword);

  if (span.getAttribute('data-revealed') === 'true') {
    // Sembunyikan kembali
    span.textContent = '••••••••';
    span.removeAttribute('data-revealed');
    span.style.color = '';
    span.style.fontWeight = '';
    if (eyeBtn) {
      eyeBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  } else {
    // Tampilkan password asli
    span.textContent = rawPassword || '(kosong)';
    span.setAttribute('data-revealed', 'true');
    span.style.color = '#10b981';
    span.style.fontWeight = '700';
    if (eyeBtn) {
      eyeBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    }
  }
}

function adminPromptChangePassword(username) {
  if (!isAdminUser()) {
    showToast('Hanya Administrator yang berhak mengubah sandi pengguna.', 'error');
    return;
  }

  const accounts = getRegisteredAccounts();
  const target = accounts.find(a => a.username.toLowerCase() === username.toLowerCase());
  if (!target) {
    showToast(`Akun @${username} tidak ditemukan.`, 'error');
    return;
  }

  const newPass = prompt(
    `[ADMIN SPPG] Ubah Sandi Pengguna\n\nNama: ${target.fullName}\nUsername: @${target.username}\nSandi Saat Ini: ${target.password}\n\nMasukkan Kata Sandi Baru:`,
    ''
  );

  if (newPass === null) return; // Batal klik Cancel

  const trimmed = newPass.trim();
  if (trimmed.length < 3) {
    showToast('Kata sandi baru minimal 3 karakter!', 'error');
    return;
  }

  // Update di daftar akun lokal
  target.password = trimmed;
  saveRegisteredAccounts(accounts);

  // Jika yang diubah adalah akun yang sedang aktif, update sesi aktif
  if (state.currentUser && state.currentUser.username.toLowerCase() === username.toLowerCase()) {
    state.currentUser.password = trimmed;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state.currentUser));
  }

  // Jika online dengan Firebase, update ke database cloud
  if (state.firebaseDb && state.cloudStatus === 'online') {
    state.firebaseDb.ref(`sppg_accounts/${username}/password`).set(trimmed)
      .then(() => {
        console.log(`Password @${username} synced to Firebase Cloud.`);
      })
      .catch(err => console.warn('Cloud password update error:', err));
  }

  showToast(`✅ Berhasil! Sandi akun @${username} (${target.fullName}) telah diubah menjadi: "${trimmed}"`, 'success');
  renderAdminUsersTable();
}

function adminDeleteAccount(username) {
  if (!isAdminUser()) {
    showToast('Hanya Administrator yang berhak menghapus akun.', 'error');
    return;
  }

  if (username.toLowerCase() === 'admin') {
    showToast('Akun Administrator utama tidak boleh dihapus.', 'warning');
    return;
  }

  const accounts = getRegisteredAccounts();
  const target = accounts.find(a => a.username.toLowerCase() === username.toLowerCase());
  if (!target) {
    showToast(`Akun @${username} tidak ditemukan.`, 'error');
    return;
  }

  const confirmed = confirm(
    `Apakah Anda yakin ingin menghapus akun @${username} (${target.fullName})?\n\nSeluruh data link Google Drive yang tersimpan di akun ini juga akan dihapus permanen.`
  );
  if (!confirmed) return;

  const updated = accounts.filter(a => a.username.toLowerCase() !== username.toLowerCase());
  saveRegisteredAccounts(updated);

  const userStorageKey = getUserLinksStorageKey(username);
  localStorage.removeItem(userStorageKey);

  if (state.firebaseDb && state.cloudStatus === 'online') {
    state.firebaseDb.ref(`sppg_accounts/${username}`).remove().catch(e => console.warn(e));
    state.firebaseDb.ref(`sppg_multiusers/${username}`).remove().catch(e => console.warn(e));
  }

  showToast(`Akun @${username} beserta data link miliknya berhasil dihapus.`, 'info');
  renderAdminUsersTable();
}

// ===================================================================
// ADMIN ACCESS CONTROLLER & PASSWORD GATEWAY
// ===================================================================
function handleAdminClick() {
  const userMenu = document.getElementById('userMenu');
  if (userMenu) userMenu.classList.remove('show');

  if (isAdminUser()) {
    openAdminModal();
  } else {
    showToast('Akses ditolak: Menu ini hanya untuk akun Administrator SPPG.', 'error');
  }
}

function openAdminPasswordModal() {
  const userMenu = document.getElementById('userMenu');
  if (userMenu) userMenu.classList.remove('show');

  const authModal = document.getElementById('authModal');
  if (authModal) authModal.classList.add('hidden');

  const modal = document.getElementById('adminPasswordModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    const input = document.getElementById('adminInputPassword');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 80);
    }
  }
}

function closeAdminPasswordModal() {
  const modal = document.getElementById('adminPasswordModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
  // Jika belum login ke akun manapun, kembalikan ke modal buat akun / login wajib
  if (!state.currentUser) {
    openAuthModal('register', true);
  }
}

function handleAdminPasswordSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('adminInputPassword');
  const pass = (input?.value || '').trim();

  const accounts = getRegisteredAccounts();
  const adminAcc = accounts.find(a => a.username.toLowerCase() === 'admin') || DEFAULT_ACCOUNTS[0];

  if (pass === adminAcc.password) {
    closeAdminPasswordModal();
    switchUserAccount(adminAcc, true);
    showToast('👑 Password Benar! Anda sekarang memiliki SEMUA AKSES Administrator.', 'success');
    openAdminModal();
  } else {
    showToast('❌ Password Administrator salah! Akses ditolak.', 'error');
    if (input) {
      input.focus();
      input.select();
    }
  }
}

function toggleInputPasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
}

function handleAdminLinkScopeChange(val) {
  state.adminViewScope = val;
  loadLinks();
  renderApp();
  if (val === '__all__') {
    showToast('👑 Menampilkan semua link dari seluruh pengguna & admin', 'info');
  } else {
    showToast(`👑 Menampilkan ruang link khusus @${val}`, 'info');
  }
}

function populateAdminLinkScopeSelect() {
  const select = document.getElementById('adminLinkScopeSelect');
  if (!select) return;

  const accounts = getRegisteredAccounts();
  let html = `
    <option value="__all__" ${state.adminViewScope === '__all__' ? 'selected' : ''}>🌐 SEMUA LINK (Seluruh Anggota & Admin)</option>
    <option value="admin" ${state.adminViewScope === 'admin' ? 'selected' : ''}>👤 Khusus Link Admin (@admin)</option>
  `;

  accounts.forEach(acc => {
    if (acc.username.toLowerCase() !== 'admin') {
      const selected = state.adminViewScope === acc.username ? 'selected' : '';
      html += `<option value="${escapeHtml(acc.username)}" ${selected}>👤 Link Milik: ${escapeHtml(acc.fullName)} (@${escapeHtml(acc.username)})</option>`;
    }
  });

  select.innerHTML = html;
}

// Expose functions globally for HTML onclick attributes
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.switchUserAccount = switchUserAccount;
window.handleLogout = handleLogout;
window.toggleUserMenu = toggleUserMenu;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.renderAdminUsersTable = renderAdminUsersTable;
window.togglePasswordPeek = togglePasswordPeek;
window.adminPromptChangePassword = adminPromptChangePassword;
window.adminDeleteAccount = adminDeleteAccount;
window.handleAdminClick = handleAdminClick;
window.openAdminPasswordModal = openAdminPasswordModal;
window.closeAdminPasswordModal = closeAdminPasswordModal;
window.handleAdminPasswordSubmit = handleAdminPasswordSubmit;
window.toggleInputPasswordVisibility = toggleInputPasswordVisibility;
window.handleAdminLinkScopeChange = handleAdminLinkScopeChange;
window.populateAdminLinkScopeSelect = populateAdminLinkScopeSelect;
window.handleAdminModalLogout = handleAdminModalLogout;



