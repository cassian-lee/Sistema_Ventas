// ── localStorage helpers ──
var LS_INV = 'juth_inventario';
var LS_VEN = 'juth_ventas';
var LS_REP = 'juth_reposicion';

function getInventario() { return JSON.parse(localStorage.getItem(LS_INV) || '[]'); }
function getVentas()     { return JSON.parse(localStorage.getItem(LS_VEN) || '[]'); }
function saveInventario(d) { localStorage.setItem(LS_INV, JSON.stringify(d)); }
function saveVentas(d)     { localStorage.setItem(LS_VEN, JSON.stringify(d)); }
function getReposiciones() { return JSON.parse(localStorage.getItem(LS_REP) || '[]'); }
function saveReposiciones(d) { localStorage.setItem(LS_REP, JSON.stringify(d)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function fmt(n) { return 'S/ ' + parseFloat(n||0).toFixed(2); }
function norm(s) { return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
