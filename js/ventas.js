// ── VENTAS / CARRITO ──
var ventaProductoId = null;
var carrito = []; // [{id, prenda, talla, cantidad, compra, venta, descMonto, total, ganancia}]

function filtrarProductos() {
  var q   = norm(document.getElementById('v-search').value);
  var inv = getInventario().filter(function(p) { return p.cantidad > 0; });
  var res = q ? inv.filter(function(p) {
    return norm([p.tipo,p.marca,p.modelo,p.talla,p.color].join(' ')).includes(norm(q));
  }) : inv;

  var lista = document.getElementById('v-lista');
  if (!res.length) {
    lista.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:16px 0;text-align:center;">' +
      (inv.length ? 'Sin resultados.' : 'No hay prendas con stock disponible.') + '</p>';
    return;
  }

  lista.innerHTML =
    '<div style="display:grid;grid-template-columns:1fr auto auto auto;gap:0;border:1px solid var(--border);border-radius:10px;overflow:hidden;">' +
      '<div style="padding:8px 14px;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;background:var(--surface2);border-bottom:1px solid var(--border);">Prenda</div>' +
      '<div style="padding:8px 14px;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;background:var(--surface2);border-bottom:1px solid var(--border);text-align:center;">Talla</div>' +
      '<div style="padding:8px 14px;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;background:var(--surface2);border-bottom:1px solid var(--border);text-align:right;">Precio</div>' +
      '<div style="padding:8px 14px;font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;background:var(--surface2);border-bottom:1px solid var(--border);text-align:center;">Stock</div>' +
      res.map(function(p,i) {
        var bb = i<res.length-1 ? '1px solid var(--border)' : 'none';
        return '' +
          '<div onclick="seleccionarProducto(\'' + p.id + '\')" style="padding:11px 14px;border-bottom:' + bb + ';cursor:pointer;transition:background .15s;" onmouseover="this.parentElement.querySelectorAll(\'[data-row=\\x27' + p.id + '\\x27]\').forEach(function(e){e.style.background=\'var(--surface2)\'})" onmouseout="this.parentElement.querySelectorAll(\'[data-row=\\x27' + p.id + '\\x27]\').forEach(function(e){e.style.background=\'\'})" data-row="' + p.id + '">' +
            '<div style="font-weight:600;font-size:13px;color:var(--text);">' + p.tipo + ' ' + p.marca + '</div>' +
            '<div style="font-size:11.5px;color:var(--muted);margin-top:1px;">' + (p.modelo||'') + (p.color?' · '+p.color:'') + '</div>' +
          '</div>' +
          '<div onclick="seleccionarProducto(\'' + p.id + '\')" style="padding:11px 14px;border-bottom:' + bb + ';cursor:pointer;transition:background .15s;text-align:center;vertical-align:middle;display:flex;align-items:center;justify-content:center;" onmouseover="this.parentElement.querySelectorAll(\'[data-row=\\x27' + p.id + '\\x27]\').forEach(function(e){e.style.background=\'var(--surface2)\'})" onmouseout="this.parentElement.querySelectorAll(\'[data-row=\\x27' + p.id + '\\x27]\').forEach(function(e){e.style.background=\'\'})" data-row="' + p.id + '">' +
            '<span style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:2px 10px;font-size:12px;font-weight:600;color:var(--text2);">' + p.talla + '</span>' +
          '</div>' +
          '<div onclick="seleccionarProducto(\'' + p.id + '\')" style="padding:11px 14px;border-bottom:' + bb + ';cursor:pointer;transition:background .15s;text-align:right;display:flex;align-items:center;justify-content:flex-end;" onmouseover="this.parentElement.querySelectorAll(\'[data-row=\\x27' + p.id + '\\x27]\').forEach(function(e){e.style.background=\'var(--surface2)\'})" onmouseout="this.parentElement.querySelectorAll(\'[data-row=\\x27' + p.id + '\\x27]\').forEach(function(e){e.style.background=\'\'})" data-row="' + p.id + '">' +
            '<span style="font-weight:700;color:var(--green);font-size:13px;">' + fmt(p.venta) + '</span>' +
          '</div>' +
          '<div onclick="seleccionarProducto(\'' + p.id + '\')" style="padding:11px 14px;border-bottom:' + bb + ';cursor:pointer;transition:background .15s;display:flex;align-items:center;justify-content:center;" onmouseover="this.parentElement.querySelectorAll(\'[data-row=\\x27' + p.id + '\\x27]\').forEach(function(e){e.style.background=\'var(--surface2)\'})" onmouseout="this.parentElement.querySelectorAll(\'[data-row=\\x27' + p.id + '\\x27]\').forEach(function(e){e.style.background=\'\'})" data-row="' + p.id + '">' +
            '<span class="badge ' + (p.cantidad<=5?'badge-red':'badge-green') + '"><span class="badge-dot"></span>' + p.cantidad + '</span>' +
          '</div>';
      }).join('') +
    '</div>';
  lucide.createIcons();
}

function seleccionarProducto(id) {
  ventaProductoId = id;
  var p = getInventario().find(function(x) { return x.id === id; });
  document.getElementById('v-producto-panel').style.display = 'block';
  document.getElementById('v-producto-titulo').textContent = (p.tipo + ' ' + p.marca + ' ' + (p.modelo||'')).trim();
  document.getElementById('v-producto-info').innerHTML =
    '<div><div class="pi-label">Talla</div><div class="pi-val">' + p.talla + '</div></div>' +
    '<div><div class="pi-label">Color</div><div class="pi-val">' + p.color + '</div></div>' +
    '<div><div class="pi-label">Stock</div><div class="pi-val" style="color:var(--green)">' + p.cantidad + ' uds</div></div>' +
    '<div><div class="pi-label">P. Venta sugerido</div><div class="pi-val">' + fmt(p.venta) + '</div></div>';
  document.getElementById('v-costo-text').innerHTML = 'Precio de compra: <strong>' + fmt(p.compra) + '</strong>';
  document.getElementById('v-cantidad').value = 1;
  document.getElementById('v-cantidad').max   = p.cantidad;
  document.getElementById('v-precio').value   = p.venta;
  document.getElementById('v-descuento-banner').style.display = 'none';
  calcularVenta();
  lucide.createIcons();
  document.getElementById('v-producto-panel').scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function calcularVenta() {
  if (!ventaProductoId) return;
  var p    = getInventario().find(function(x) { return x.id === ventaProductoId; });
  var qty  = parseFloat(document.getElementById('v-cantidad').value) || 0;
  var pv   = parseFloat(document.getElementById('v-precio').value)   || 0;
  var descMonto = Math.max(0, (p.venta - pv) * qty);
  var total     = Math.max(0, qty * pv);
  document.getElementById('v-total').textContent = fmt(total);
  var banner = document.getElementById('v-descuento-banner');
  if (descMonto > 0) {
    banner.style.display = 'flex';
    document.getElementById('v-descuento-text').innerHTML =
      'Descuento aplicado: <strong>-' + fmt(descMonto) + '</strong> (precio sugerido ' + fmt(p.venta) + ' × ' + qty + ')';
  } else {
    banner.style.display = 'none';
  }
}

function agregarAlCarrito() {
  if (!ventaProductoId) return;
  var inv  = getInventario();
  var p    = inv.find(function(x) { return x.id === ventaProductoId; });
  var qty  = parseInt(document.getElementById('v-cantidad').value);
  var pv   = parseFloat(document.getElementById('v-precio').value);
  if (!qty || qty < 1)  { toast('Cantidad inválida.', 'error'); return; }
  if (!pv || pv <= 0)   { toast('Precio de venta inválido.', 'error'); return; }

  var enCarrito = carrito.filter(function(c) { return c.productoId === p.id; }).reduce(function(s,c) { return s + c.cantidad; }, 0);
  if (qty + enCarrito > p.cantidad) { toast('Stock insuficiente.', 'error'); return; }

  var subtotal  = qty * pv;
  var descMonto = Math.max(0, (p.venta - pv) * qty);
  var total     = Math.max(0, subtotal);
  var ganancia  = total - qty * p.compra;

  carrito.push({
    id: uid(),
    productoId: p.id,
    prenda: (p.tipo + ' ' + p.marca + ' ' + p.modelo).trim(),
    talla: p.talla,
    cantidad: qty,
    compra: p.compra,
    venta: pv,
    descMonto: descMonto,
    total: total,
    ganancia: ganancia
  });

  cancelarSeleccion();
  renderCarrito();
  toast(p.tipo + ' ' + p.marca + ' agregado al carrito.');
}

function renderCarrito() {
  var el = document.getElementById('carrito-items');
  document.getElementById('carrito-count').textContent = carrito.length + ' producto' + (carrito.length !== 1 ? 's' : '');
  if (!carrito.length) {
    el.innerHTML = '<p style="color:var(--muted);font-size:13px;padding:12px 0;text-align:center">El carrito está vacío</p>';
  } else {
    el.innerHTML = carrito.map(function(c) {
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + c.prenda + '</div>' +
          '<div style="font-size:11.5px;color:var(--muted)">' + c.talla + ' · ' + c.cantidad + ' ud' + (c.cantidad>1?'s':'') + ' · ' + fmt(c.venta) + (c.descMonto>0?' <span style="color:var(--red)">-' + fmt(c.descMonto) + '</span>':'') + '</div>' +
        '</div>' +
        '<div style="font-weight:700;color:var(--green);white-space:nowrap">' + fmt(c.total) + '</div>' +
        '<button onclick="quitarDelCarrito(\'' + c.id + '\')" style="border:none;background:var(--red-bg);color:var(--red);border-radius:6px;width:26px;height:26px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
          '<i data-lucide="x" style="width:13px;height:13px;"></i>' +
        '</button>' +
      '</div>';
    }).join('');
  }
  var subtotal  = carrito.reduce(function(s,c) { return s + c.cantidad * c.venta; }, 0);
  var descTotal = carrito.reduce(function(s,c) { return s + c.descMonto; }, 0);
  var total     = carrito.reduce(function(s,c) { return s + c.total; }, 0);
  var ganancia  = carrito.reduce(function(s,c) { return s + c.ganancia; }, 0);
  document.getElementById('carrito-subtotal').textContent  = fmt(subtotal);
  document.getElementById('carrito-descuentos').textContent = '-' + fmt(descTotal);
  document.getElementById('carrito-total').textContent     = fmt(total);
  document.getElementById('carrito-ganancia').textContent  = fmt(ganancia);
  lucide.createIcons();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(function(c) { return c.id !== id; });
  renderCarrito();
}

function limpiarCarrito() {
  if (!carrito.length) return;
  showConfirm('¿Limpiar el carrito?', function() { carrito = []; renderCarrito(); });
}

function cancelarSeleccion() {
  ventaProductoId = null;
  document.getElementById('v-producto-panel').style.display = 'none';
  document.getElementById('v-search').value = '';
  filtrarProductos();
}

function cancelarVenta() {
  carrito = [];
  cancelarSeleccion();
  renderCarrito();
}

function confirmarVenta() {
  if (!carrito.length) { toast('El carrito está vacío.', 'error'); return; }
  var notas = document.getElementById('v-notas').value.trim();
  var total = carrito.reduce(function(s,c) { return s + c.total; }, 0);
  showConfirm('Confirmar venta de ' + carrito.length + ' producto(s) por ' + fmt(total), function() {
    _procesarVenta(notas);
  }, { title: 'Confirmar venta', okLabel: 'Confirmar', okClass: 'btn-success' });
}

function _procesarVenta(notas) {
  var inv    = getInventario();
  var ventas = getVentas();
  var ticketId = uid();
  var fecha    = new Date().toLocaleDateString('es-PE');

  for (var i = 0; i < carrito.length; i++) {
    var c = carrito[i];
    var p = inv.find(function(x) { return x.id === c.productoId; });
    if (!p || p.cantidad < c.cantidad) {
      toast('Stock insuficiente para ' + c.prenda + '.', 'error'); return;
    }
  }

  for (var j = 0; j < carrito.length; j++) {
    var c2 = carrito[j];
    var idx = inv.findIndex(function(x) { return x.id === c2.productoId; });
    inv[idx].cantidad -= c2.cantidad;
    ventas.unshift({
      id: uid(), ticketId: ticketId, fecha: fecha,
      prenda: c2.prenda, talla: c2.talla,
      cantidad: c2.cantidad, compra: c2.compra,
      venta: c2.venta, descuento: c2.descMonto,
      total: c2.total, ganancia: c2.ganancia, notas: notas
    });
  }

  var n = carrito.length;
  saveInventario(inv);
  saveVentas(ventas);
  cancelarVenta();
  renderInventario();
  renderVentas();
  renderReportes();
  filtrarProductos();
  toast('Venta de ' + n + ' producto(s) registrada.');
  verComprobante(ticketId);
}

function renderVentas() {
  var ventas  = getVentas();
  var q       = norm(document.getElementById('ventas-search').value);
  var desde   = document.getElementById('ventas-desde').value;
  var hasta   = document.getElementById('ventas-hasta').value;
  var estado  = document.getElementById('ventas-estado').value;

  var filtered = ventas.filter(function(v) {
    if (q && !norm([v.prenda, v.talla, v.fecha, v.notas||''].join(' ')).includes(q)) return false;
    if (estado === 'activa'  &&  v.anulada) return false;
    if (estado === 'anulada' && !v.anulada) return false;
    if (desde || hasta) {
      var partes = v.fecha.split('/');
      var fechaISO = partes.length === 3 ? partes[2] + '-' + partes[1].padStart(2,'0') + '-' + partes[0].padStart(2,'0') : v.fecha;
      if (desde && fechaISO < desde) return false;
      if (hasta && fechaISO > hasta) return false;
    }
    return true;
  });

  document.getElementById('ventas-count').textContent = filtered.length + ' de ' + ventas.length + ' ventas';
  var tbody = document.getElementById('ventas-tbody');
  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:28px">' +
      (ventas.length ? 'Sin resultados para los filtros aplicados.' : 'No hay ventas registradas aún.') + '</td></tr>';
  } else {
    var lastTicket = null;
    tbody.innerHTML = filtered.map(function(v) {
      var ticketShort = v.ticketId ? v.ticketId.slice(-6).toUpperCase() : v.id.slice(-6).toUpperCase();
      var isNewTicket = v.ticketId && v.ticketId !== lastTicket;
      lastTicket = v.ticketId || v.id;
      var ticketRow = isNewTicket ? '<tr><td colspan="9" style="background:var(--accent-soft);padding:7px 14px;border-left:3px solid var(--accent);">' +
        '<button onclick="verComprobante(\'' + v.ticketId + '\')" style="border:none;background:none;cursor:pointer;display:flex;align-items:center;gap:8px;color:var(--accent);font-size:12px;font-weight:700;font-family:inherit;padding:0;">' +
          '<i data-lucide="receipt" style="width:14px;height:14px;"></i> Ticket #' + ticketShort + ' — Ver comprobante' +
        '</button></td></tr>' : '';
      return ticketRow + '<tr style="' + (v.anulada?'opacity:.45;text-decoration:line-through;':'') + '">' +
        '<td style="color:var(--muted)">' + v.fecha + '</td>' +
        '<td class="td-main">' + v.prenda + '</td>' +
        '<td>' + v.talla + '</td><td>' + v.cantidad + '</td>' +
        '<td>' + fmt(v.compra) + '</td><td>' + fmt(v.venta) + '</td>' +
        '<td style="font-weight:600">' + fmt(v.total) + '</td>' +
        '<td style="color:' + (v.anulada?'var(--muted)':'var(--green)') + ';font-weight:700">' + (v.anulada?'Anulada':'+'+fmt(v.ganancia)) + '</td>' +
        '<td>' + (v.anulada
          ? '<span class="badge badge-red"><span class="badge-dot"></span>Anulada</span>'
          : '<button class="btn btn-sm btn-del" onclick="anularVenta(\'' + v.id + '\')"><i data-lucide="x-circle"></i> Anular</button>'
        ) + '</td></tr>';
    }).join('');
  }
  lucide.createIcons();
}

function anularVenta(id) {
  showConfirm('¿Anular esta venta? Se devolverá el stock al inventario.', function() {
    var ventas = getVentas();
    var idx    = ventas.findIndex(function(v) { return v.id === id; });
    if (idx === -1) return;
    var v = ventas[idx];
    var inv = getInventario();
    var pi = inv.findIndex(function(p) {
      return norm((p.tipo + ' ' + p.marca + ' ' + p.modelo).trim()) === norm(v.prenda) && p.talla === v.talla;
    });
    if (pi !== -1) {
      inv[pi].cantidad += v.cantidad;
      saveInventario(inv);
    }
    ventas[idx].anulada = true;
    saveVentas(ventas);
    renderVentas();
    renderInventario();
    renderReportes();
    filtrarProductos();
    toast('Venta anulada y stock devuelto.', 'info');
  });
}

function limpiarFiltrosVentas() {
  document.getElementById('ventas-search').value = '';
  document.getElementById('ventas-desde').value  = '';
  document.getElementById('ventas-hasta').value  = '';
  document.getElementById('ventas-estado').value = '';
  renderVentas();
}

function verComprobante(ticketId) {
  var items = getVentas().filter(function(v) { return v.ticketId === ticketId; });
  if (!items.length) return;
  var v0       = items[0];
  var subtotal = items.reduce(function(s,v) { return s + v.cantidad * v.venta; }, 0);
  var descTotal= items.reduce(function(s,v) { return s + (v.descuento||0); }, 0);
  var total    = items.reduce(function(s,v) { return s + v.total; }, 0);
  var ticketShort = ticketId.slice(-6).toUpperCase();

  document.getElementById('comp-content').innerHTML =
    '<div style="text-align:center;margin-bottom:18px;">' +
      '<div style="font-size:18px;font-weight:800;color:var(--text)">Juth Sales</div>' +
      '<div style="font-size:12px;color:var(--muted)">Sistema de Ventas</div>' +
      '<div style="margin-top:8px;font-size:12px;color:var(--text2)">Ticket #' + ticketShort + '</div>' +
      '<div style="font-size:12px;color:var(--muted)">' + v0.fecha + '</div>' +
      (v0.notas ? '<div style="font-size:12px;color:var(--accent);margin-top:4px">' + v0.notas + '</div>' : '') +
    '</div>' +
    '<div style="border-top:1px dashed var(--border2);border-bottom:1px dashed var(--border2);padding:12px 0;margin-bottom:14px;">' +
      items.map(function(v) {
        return '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;font-size:13px;">' +
          '<div>' +
            '<div style="font-weight:600;color:var(--text)">' + v.prenda + '</div>' +
            '<div style="color:var(--muted);font-size:11.5px">' + v.talla + ' · ' + v.cantidad + ' ud' + (v.cantidad>1?'s':'') + ' × ' + fmt(v.venta) + (v.descuento>0?' <span style="color:var(--red)">-' + fmt(v.descuento) + '</span>':'') + '</div>' +
          '</div>' +
          '<div style="font-weight:700;color:var(--text);white-space:nowrap;margin-left:12px">' + fmt(v.total) + '</div>' +
        '</div>';
      }).join('') +
    '</div>' +
    '<div style="font-size:13px;">' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0;color:var(--text2)"><span>Subtotal</span><span>' + fmt(subtotal) + '</span></div>' +
      (descTotal > 0 ? '<div style="display:flex;justify-content:space-between;padding:4px 0;color:var(--red)"><span>Descuentos</span><span>-' + fmt(descTotal) + '</span></div>' : '') +
      '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:15px;font-weight:800;color:var(--text);border-top:1px solid var(--border);margin-top:4px"><span>TOTAL</span><span style="color:var(--green)">' + fmt(total) + '</span></div>' +
    '</div>' +
    '<div style="text-align:center;margin-top:16px;font-size:11px;color:var(--muted);border-top:1px dashed var(--border2);padding-top:12px;">' +
      '© 2026 Juth Morales · Gracias por su compra' +
    '</div>';

  document.getElementById('comp-modal').style.display = 'flex';
  lucide.createIcons();
}

function imprimirComprobante() {
  var contenido = document.getElementById('comp-content').innerHTML;
  var win = window.open('','_blank','width=420,height=620');
  win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Comprobante</title>' +
    '<style>body{font-family:sans-serif;padding:24px;max-width:360px;margin:0 auto;font-size:13px;color:#111;}' +
    '.r-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee;}' +
    'strong{font-weight:700;}</style></head><body>' + contenido +
    '<script>window.onload=function(){window.print();window.close();}<\/script></body></html>');
  win.document.close();
}
