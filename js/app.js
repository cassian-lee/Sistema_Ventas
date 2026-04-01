// ── TOAST ──
function toast(msg, type='success') {
  var icons = { success:'check-circle', error:'alert-circle', info:'info' };
  var el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.innerHTML = '<i data-lucide="' + (icons[type]||'info') + '"></i><span>' + msg + '</span>';
  document.getElementById('toast-container').appendChild(el);
  lucide.createIcons();
  setTimeout(function() { el.remove(); }, 3200);
}

// ── CONFIRM MODAL ──
function showConfirm(msg, onOk, opts) {
  opts = opts || {};
  document.getElementById('confirm-title').textContent = opts.title || 'Confirmar';
  document.getElementById('confirm-msg').textContent = msg;
  var okBtn = document.getElementById('confirm-ok');
  okBtn.textContent = opts.okLabel || 'Confirmar';
  okBtn.className = 'btn ' + (opts.okClass || 'btn-del');
  var modal = document.getElementById('confirm-modal');
  modal.style.display = 'flex';
  okBtn.onclick = function() { modal.style.display = 'none'; onOk(); };
  document.getElementById('confirm-cancel').onclick = function() { modal.style.display = 'none'; };
}

// ── NAV ──
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'reportes') renderReportes();
  window.scrollTo(0, 0);
  closeSidebar();
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ── THEME ──
function toggleTheme() {
  var html  = document.documentElement;
  var isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('juth_theme', isDark ? 'light' : 'dark');
  updateThemeIcons(!isDark);
}
function updateThemeIcons(isDark) {
  var icon = isDark ? 'moon' : 'sun';
  document.getElementById('theme-label-sidebar').textContent = isDark ? 'Modo oscuro' : 'Modo claro';
  document.getElementById('theme-icon-sidebar').setAttribute('data-lucide', icon);
  document.getElementById('theme-icon-top').setAttribute('data-lucide', icon);
  lucide.createIcons();
}

// ── INIT ──
function init() {
  // restaurar tema
  var savedTheme = localStorage.getItem('juth_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') updateThemeIcons(true);
  }

  // datos de ejemplo al primer arranque
  if (!localStorage.getItem('juth_seeded')) {
    var ejemploInv = [
      { id: uid(), tipo:'Camiseta', marca:'Nike', modelo:'Dri-Fit', talla:'M', color:'Negro', cantidad:12, compra:35, venta:65, desc:'' },
      { id: uid(), tipo:'Camiseta', marca:'Adidas', modelo:'Classic', talla:'L', color:'Blanco', cantidad:8, compra:30, venta:55, desc:'' },
      { id: uid(), tipo:'Pantalón', marca:'Levi\'s', modelo:'511 Slim', talla:'32', color:'Azul', cantidad:5, compra:80, venta:150, desc:'' },
      { id: uid(), tipo:'Pantalón', marca:'Zara', modelo:'Chino', talla:'30', color:'Beige', cantidad:3, compra:60, venta:110, desc:'' },
      { id: uid(), tipo:'Chaqueta', marca:'Adidas', modelo:'Track', talla:'XL', color:'Negro', cantidad:4, compra:120, venta:220, desc:'' },
      { id: uid(), tipo:'Shorts', marca:'Nike', modelo:'Flex', talla:'S', color:'Gris', cantidad:2, compra:25, venta:50, desc:'' },
      { id: uid(), tipo:'Vestido', marca:'Zara', modelo:'Floral', talla:'M', color:'Rojo', cantidad:6, compra:55, venta:100, desc:'' },
    ];
    var ejemploVentas = [
      { id: uid(), fecha: new Date().toLocaleDateString('es-PE'), prenda:'Camiseta Nike Dri-Fit', talla:'M', cantidad:2, compra:35, venta:65, total:130, ganancia:60, notas:'Cliente frecuente' },
      { id: uid(), fecha: new Date().toLocaleDateString('es-PE'), prenda:'Pantalón Levi\'s 511 Slim', talla:'32', cantidad:1, compra:80, venta:150, total:150, ganancia:70, notas:'' },
    ];
    saveInventario(ejemploInv);
    saveVentas(ejemploVentas);
    localStorage.setItem('juth_seeded', '1');
  }

  lucide.createIcons();
  renderInventario();
  renderVentas();
  renderCarrito();
  renderReposiciones();
  filtrarProductos();
  filtrarReposicion();
  setFiltroReporte('todo');
}

document.addEventListener('DOMContentLoaded', init);
