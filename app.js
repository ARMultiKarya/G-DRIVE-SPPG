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
  sortBy: 'newest',
  viewMode: 'grid', // 'grid' | 'list'
  deletingId: null,
  activeQrUrl: null,
  activeQrTitle: null,
  cloudStatus: 'offline', // 'offline' | 'connecting' | 'online'
  firebaseDb: null,
  firebaseConfig: null,
  firebaseUserLinksRef: null
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
  initUserSession();
  loadLinks();
  initEventListeners();
  renderApp();
  initFirebaseSync();
});

// Load stored links for CURRENT LOGGED IN USER only
function loadLinks() {
  const username = state.currentUser ? state.currentUser.username : 'admin';
  const userStorageKey = getUserLinksStorageKey(username);

  try {
    const rawData = localStorage.getItem(userStorageKey);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed)) {
        state.links = parsed;
        return;
      }
    }
  } catch (err) {
    console.error('Error loading stored links for user:', username, err);
  }

  // Jika akun admin pertama kali buka, berikan contoh bawaan SPPG
  if (username === 'admin') {
    state.links = [...DEFAULT_LINKS];
    saveToStorage();
  } else {
    // Akun pengguna baru dimulai dengan daftar bersih miliknya sendiri
    state.links = [];
    saveToStorage();
  }
}

function saveToStorage() {
  if (!state.currentUser) return;
  const username = state.currentUser.username;
  const userStorageKey = getUserLinksStorageKey(username);

  try {
    localStorage.setItem(userStorageKey, JSON.stringify(state.links));
  } catch (err) {
    console.error('Error saving links to localStorage for user:', username, err);
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
  btnBackup.addEventListener('click', (e) => {
    e.stopPropagation();
    dataMenu.classList.toggle('show');
    userMenu.classList.remove('show');
  });

  // User Profile Menu Toggle
  const btnUserAccount = document.getElementById('btnUserAccount');
  const userMenu = document.getElementById('userMenu');
  btnUserAccount.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('show');
    dataMenu.classList.remove('show');
  });

  document.addEventListener('click', () => {
    dataMenu.classList.remove('show');
    userMenu.classList.remove('show');
  });

  // Auth & Account Modal Triggers
  document.getElementById('btnOpenAuthModal').addEventListener('click', () => {
    userMenu.classList.remove('show');
    openAuthModal('login');
  });
  document.getElementById('btnBannerSwitchAccount').addEventListener('click', () => openAuthModal('login'));
  document.getElementById('btnLogout').addEventListener('click', () => {
    userMenu.classList.remove('show');
    handleLogout();
  });
  document.getElementById('btnCloseAuthModal').addEventListener('click', closeAuthModal);

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
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderApp();
  });

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
      dataMenu.classList.remove('show');
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

// Render dynamic Category Tags
function renderCategoryTags() {
  const container = document.getElementById('tagsContainer');
  const categoryCounts = {};

  state.links.forEach(l => {
    const cat = (l.category || 'Umum').trim();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categories = Object.keys(categoryCounts).sort();

  let html = `
    <button class="tag-filter-chip ${state.selectedTag === 'all' ? 'active' : ''}" data-tag="all">
      Semua (${state.links.length})
    </button>
  `;

  categories.forEach(cat => {
    const isActive = state.selectedTag === cat;
    html += `
      <button class="tag-filter-chip ${isActive ? 'active' : ''}" data-tag="${escapeHtml(cat)}">
        ${escapeHtml(cat)} (${categoryCounts[cat]})
      </button>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.tag-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.selectedTag = chip.getAttribute('data-tag');
      renderApp();
    });
  });
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
}

function renderLinkCard(link) {
  const type = link.type || 'file';
  const typeIcon = ICONS[type] || ICONS.file;
  const typeName = TYPE_NAMES[type] || 'File';
  const accentColor = TYPE_COLORS[type] || 'var(--brand-blue)';
  const isFavorite = !!link.favorite;
  const category = link.category || 'Umum';
  const clicks = link.clicks || 0;

  return `
    <article class="link-card ${isFavorite ? 'is-favorite' : ''}" style="--card-accent: ${accentColor};" data-card-id="${link.id}">
      
      <!-- Card Top: Badge & Quick Action -->
      <div class="card-top">
        <span class="card-type-badge badge-${type}">
          ${typeIcon}
          <span>${typeName}</span>
        </span>

        <div class="card-top-actions">
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
        <span class="card-category-tag">${escapeHtml(category)}</span>
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.links.unshift(newLink);
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
      } else {
        state.cloudStatus = 'offline';
        updateCloudStatusUI('offline', 'Sync Cloud (Offline)', 'Koneksi terputus. Menunggu jaringan tersambung kembali...');
      }
    });

    // Lepas listener lama jika ada
    if (state.firebaseUserLinksRef) {
      state.firebaseUserLinksRef.off();
    }

    // Pasang listener real-time KHUSUS untuk akun pengguna saat ini
    const userPath = 'sppg_multiusers/' + state.currentUser.username + '/links';
    state.firebaseUserLinksRef = state.firebaseDb.ref(userPath);

    state.firebaseUserLinksRef.on('value', (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const remoteList = Array.isArray(val) ? val : Object.values(val);
        state.links = remoteList;
        saveToStorage();
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
  if (!state.firebaseDb || state.cloudStatus !== 'online' || !state.currentUser) return;
  try {
    state.firebaseDb.ref(getUserCloudPath() + '/' + link.id).set(link);
  } catch (err) {
    console.warn('Sync save to cloud error:', err);
  }
}

function syncLinkDeleteFromCloud(id) {
  if (!state.firebaseDb || state.cloudStatus !== 'online' || !state.currentUser) return;
  try {
    state.firebaseDb.ref(getUserCloudPath() + '/' + id).remove();
  } catch (err) {
    console.warn('Sync delete from cloud error:', err);
  }
}

function syncLinkPatchToCloud(id, updates) {
  if (!state.firebaseDb || state.cloudStatus !== 'online' || !state.currentUser) return;
  try {
    state.firebaseDb.ref(getUserCloudPath() + '/' + id).update(updates);
  } catch (err) {
    console.warn('Sync patch to cloud error:', err);
  }
}

function uploadLinksToCloud(showToastMsg = true) {
  if (!state.firebaseDb || !state.currentUser) {
    showToast('Database Cloud belum terhubung.', 'error');
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
  if (!state.firebaseDb || !state.currentUser) {
    showToast('Database Cloud belum terhubung.', 'error');
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
// MULTI-ACCOUNT AUTHENTICATION & USER MANAGEMENT
// ===================================================================
const DEFAULT_ACCOUNTS = [
  {
    id: 'usr-admin',
    username: 'admin',
    fullName: 'Administrator SPPG',
    password: 'admin',
    role: 'SPPG Admin',
    createdAt: new Date().toISOString()
  }
];

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
    const matched = accounts.find(a => a.username.toLowerCase() === session.username.toLowerCase());
    state.currentUser = matched || session;
  } else {
    // Default session: akun pertama (admin)
    state.currentUser = accounts[0];
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state.currentUser));
  }

  updateUserUI();
}

function updateUserUI() {
  if (!state.currentUser) return;
  const user = state.currentUser;

  // Inisial avatar (misal 'A' atau 'BS')
  const initials = user.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user.username[0].toUpperCase();

  const userAvatar = document.getElementById('userAvatar');
  const navUserName = document.getElementById('navUserName');
  const navUserRole = document.getElementById('navUserRole');
  const menuUserFullName = document.getElementById('menuUserFullName');
  const menuUsername = document.getElementById('menuUsername');
  const scopeUserFullName = document.getElementById('scopeUserFullName');
  const scopeUsername = document.getElementById('scopeUsername');

  if (userAvatar) userAvatar.textContent = initials;
  if (navUserName) navUserName.textContent = user.fullName ? user.fullName.split(' ')[0] : user.username;
  if (navUserRole) navUserRole.textContent = user.role || 'SPPG User';
  if (menuUserFullName) menuUserFullName.textContent = user.fullName || user.username;
  if (menuUsername) menuUsername.textContent = '@' + user.username;
  if (scopeUserFullName) scopeUserFullName.textContent = user.fullName || user.username;
  if (scopeUsername) scopeUsername.textContent = '@' + user.username;
}

function openAuthModal(defaultTab = 'login') {
  const modal = document.getElementById('authModal');
  switchAuthTab(defaultTab);
  renderQuickAccountsList();

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  if (defaultTab === 'login') {
    setTimeout(() => document.getElementById('loginUsername').focus(), 80);
  } else {
    setTimeout(() => document.getElementById('regFullName').focus(), 80);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tabAuthLogin');
  const tabReg = document.getElementById('tabAuthRegister');
  const formLogin = document.getElementById('loginForm');
  const formReg = document.getElementById('registerForm');
  const modalTitle = document.getElementById('authModalTitle');

  if (tab === 'register') {
    tabLogin.classList.remove('active');
    tabReg.classList.add('active');
    formLogin.classList.add('hidden');
    formReg.classList.remove('hidden');
    modalTitle.textContent = 'Buat Akun Baru SPPG';
  } else {
    tabReg.classList.remove('active');
    tabLogin.classList.add('active');
    formReg.classList.add('hidden');
    formLogin.classList.remove('hidden');
    modalTitle.textContent = 'Masuk ke Akun Anda';
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
  switchUserAccount(found);
  closeAuthModal();
  showToast(`Selamat datang kembali, ${found.fullName}!`, 'success');
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

  if (!password || password.length < 4) {
    showToast('Password minimal 4 karakter', 'error');
    return;
  }

  const accounts = getRegisteredAccounts();
  if (accounts.some(a => a.username.toLowerCase() === username)) {
    showToast(`Username "${username}" sudah digunakan. Silakan gunakan username lain.`, 'error');
    document.getElementById('regUsername').focus();
    return;
  }

  // Buat akun baru
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

  // Jika terhubung ke Cloud, simpan info akun ke Firebase
  if (state.firebaseDb && state.cloudStatus === 'online') {
    try {
      state.firebaseDb.ref('sppg_accounts/' + username).set({
        username,
        fullName,
        role: 'SPPG Member',
        createdAt: newAccount.createdAt
      });
    } catch (err) {
      console.warn('Error registering account to Firebase:', err);
    }
  }

  // Otomatis login ke akun baru
  switchUserAccount(newAccount);
  closeAuthModal();
  showToast(`Akun @${username} berhasil dibuat! Ruang link pribadi Anda telah siap.`, 'success');
}

function switchUserAccount(user) {
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

function handleLogout() {
  const confirmed = confirm(`Apakah Anda yakin ingin keluar dari akun @${state.currentUser.username}?`);
  if (!confirmed) return;

  openAuthModal('login');
  showToast('Anda telah keluar. Silakan masuk atau pilih akun.', 'info');
}

function renderQuickAccountsList() {
  const container = document.getElementById('quickAccountsList');
  if (!container) return;

  const accounts = getRegisteredAccounts();
  const currentUsername = state.currentUser ? state.currentUser.username : '';

  let html = '';
  accounts.forEach(acc => {
    const isCurrent = acc.username.toLowerCase() === currentUsername.toLowerCase();
    const initials = acc.fullName
      ? acc.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
      : acc.username[0].toUpperCase();

    html += `
      <div class="quick-account-item ${isCurrent ? 'is-current' : ''}" data-username="${escapeHtml(acc.username)}">
        <div class="quick-acc-left">
          <div class="quick-acc-avatar">${initials}</div>
          <div class="quick-acc-names">
            <span class="quick-acc-name">${escapeHtml(acc.fullName)}</span>
            <span class="quick-acc-username">@${escapeHtml(acc.username)}</span>
          </div>
        </div>
        <span class="quick-acc-action">${isCurrent ? '● Sedang Aktif' : 'Ganti ke Akun Ini ➜'}</span>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.quick-account-item').forEach(item => {
    item.addEventListener('click', () => {
      const username = item.getAttribute('data-username');
      const targetUser = accounts.find(a => a.username === username);
      if (targetUser) {
        switchUserAccount(targetUser);
        closeAuthModal();
        showToast(`Beralih ke akun ${targetUser.fullName}`, 'success');
      }
    });
  });
}
