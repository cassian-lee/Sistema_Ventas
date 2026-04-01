// ── REPOSICIÓN ──
var repProductoId = null;

function filtrarReposicion() {
  var q   = norm(document.getElementById('rep-search').value);
  var inv = getInventario();
  var res = q ? inv.filter(function(p) { return norm([p.tipo,p.marca,p.modelo,p.talla,p.color].join(' ')).includes(norm(q)); }) : inv;
  var lista = document.getElementById('rep-lista');
  if (!res.length) {
    lista.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:16px 0;text-align:center;">Sin resultados.</p>';
    return;
  }
  lista.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr auto auto auto;gap:0;border:1px solid var(--border);border-radius:10px;overflow:hidden;">' +
    '<div style="padding:8px 14px;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;background:var(--surface2);border-bottom:1px solid var(--border);">Prenda</div>' +
    '<div style="padding:8px 14px;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;background:var(--surface2);border-bottom:1px solid var(--border);text-align:center;">Talla</div>' +
    '<div style="padding:8px 14px;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;background:var(--surface2);border-bottom:1px solid var(--border);text-align:right;">P. Compra</div>' +
    '<div style="padding:8px 14px;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;background:var(--surface2);border-bottom:1px solid var(--border);text-align:center;">Stock</div>' +
    res.map(function(p, i) {
      var bb = i < res.length-1 ? 'border-bottom:1px solid var(--border);' : '';
      var hover = "onmouseover=\"this.parentElement.querySelectorAll('[data-rrow=\\'" + p.id + "\\']').forEach(function(e){e.style.background='var(--surface2)'})\" onmouseout=\"this.parentElement.querySelectorAll('[data-rrow=\\'" + p.id + "\\']').forEach(function(e){e.style.background=''})\"";
      return '<div onclick="seleccionarReposicion(\'' + p.id + '\')" style="padding:11px 14px;' + bb + 'cursor:pointer;transition:background .15s;" ' + hover + ' data-rrow="' + p.id + '">' +
          '<div style="font-weight:600;font-size:13px;color:var(--text);">' + p.tipo + ' ' + p.marca + '</div>' +
          '<div style="font-size:11.5px;color:var(--muted);margin-top:1px;">' + (p.modelo||'') + (p.color?' · '+p.color:'') + '</div>' +
        '</div>' +
        '<div onclick="seleccionarReposicion(\'' + p.id + '\')" style="padding:11px 14px;' + bb + 'cursor:pointer;transition:background .15s;display:flex;align-items:center;justify-content:center;" ' + hover + ' data-rrow="' + p.id + '">' +
          '<span style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:2px 10px;font-size:12px;font-weight:600;color:var(--text2);">' + p.talla + '</span>' +
        '</div>' +
        '<div onclick="seleccionarReposicion(\'' + p.id + '\')" style="padding:11px 14px;' + bb + 'cursor:pointer;transition:background .15s;display:flex;align-items:center;justify-content:flex-end;" ' + hover + ' data-rrow="' + p.id + '">' +
          '<span style="font-weight:600;color:var(--text2);font-size:13px;">' + fmt(p.compra) + '</span>' +
        '</div>' +
        '<div onclick="seleccionarReposicion(\'' + p.id + '\')" style="padding:11px 14px;' + bb + 'cursor:pointer;transition:background .15s;display:flex;align-items:center;justify-content:center;" ' + hover + ' data-rrow="' + p.id + '">' +
          '<span class="badge ' + (p.cantidad<=5?'badge-red':'badge-green') + '"><span class="badge-dot"></span>' + p.cantidad + '</span>' +
        '</div>';
    }).join('') + '</div>';
  lucide.createIcons();
}

function seleccionarReposicion(id) {
  repProductoId = id;
  var p = getInventario().find(function(x) { return x.id === id; });
  document.getElementById('rep-panel').style.display = 'block';
  document.getElementById('rep-info').innerHTML =
    '<div><div class="pi-label">Prenda</div><div class="pi-val">' + p.tipo + ' ' + p.marca + '</div></div>' +
    '<div><div class="pi-label">Modelo</div><div class="pi-val">' + (p.modelo||'—') + '</div></div>' +
    '<div><div class="pi-label">Talla / Color</div><div class="pi-val">' + p.talla + ' / ' + p.color + '</div></div>' +
    '<div><div class="pi-label">Stock actual</div><div class="pi-val" style="color:var(--accent)">' + p.cantidad + ' unidades</div></div>';
  document.getElementById('rep-cantidad').value = 1;
  document.getElementById('rep-compra').value   = '';
  document.getElementById('rep-notas').value    = '';
  lucide.createIcons();
}

function confirmarReposicion() {
  if (!repProductoId) { toast('Selecciona una prenda primero.', 'error'); return; }
  var inv = getInventario();
  var idx = inv.findIndex(function(x) { return x.id === repProductoId; });
  var p   = inv[idx];
  var qty = parseInt(document.getElementById('rep-cantidad').value);
  var nuevoPrecio = parseFloat(document.getElementById('rep-compra').value);
  var notas = document.getElementById('rep-notas').value.trim();

  if (!qty || qty < 1) { toast('Ingresa una cantidad válida.', 'error'); return; }

  inv[idx].cantidad += qty;
  if (!isNaN(nuevoPrecio) && nuevoPrecio > 0) inv[idx].compra = nuevoPrecio;
  saveInventario(inv);

  var reps = getReposiciones();
  reps.unshift({ id: uid(), fecha: new Date().toLocaleDateString('es-PE'), prenda: (p.tipo + ' ' + p.marca + ' ' + p.modelo).trim(), talla: p.talla, cantidad: qty, compra: inv[idx].compra, notas: notas });
  saveReposiciones(reps);

  renderInventario();
  renderReposiciones();
  cancelarReposicion();
  toast('+' + qty + ' unidades ingresadas a ' + p.tipo + ' ' + p.marca);
}

function cancelarReposicion() {
  repProductoId = null;
  document.getElementById('rep-panel').style.display = 'none';
  document.getElementById('rep-search').value = '';
  filtrarReposicion();
}

function renderReposiciones() {
  var reps  = getReposiciones();
  var tbody = document.getElementById('rep-tbody');
  if (!reps.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:28px">Sin reposiciones registradas aún.</td></tr>';
    return;
  }
  tbody.innerHTML = reps.map(function(r) {
    return '<tr>' +
      '<td style="color:var(--muted)">' + r.fecha + '</td>' +
      '<td class="td-main">' + r.prenda + '</td>' +
      '<td>' + r.talla + '</td>' +
      '<td style="color:var(--green);font-weight:700">+' + r.cantidad + '</td>' +
      '<td>' + fmt(r.compra) + '</td>' +
      '<td style="color:var(--muted)">' + (r.notas||'—') + '</td>' +
    '</tr>';
  }).join('');
}
