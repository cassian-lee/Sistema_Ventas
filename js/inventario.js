// ── INVENTARIO ──
var invSortField = null;
var invSortAsc = true;

function ordenarInventario(campo) {
  if (invSortField === campo) {
    invSortAsc = !invSortAsc;
  } else {
    invSortField = campo;
    invSortAsc = true;
  }
  renderInventario();
}

function renderInventario() {
  var inv    = getInventario();
  var q      = norm(document.getElementById('inv-search').value);
  var tbody  = document.getElementById('inv-tbody');
  var filtered = inv.filter(function(p) {
    return norm([p.tipo,p.marca,p.modelo,p.talla,p.color].join(' ')).includes(q);
  });

  // ordenar
  if (invSortField) {
    filtered.sort(function(a, b) {
      var va = a[invSortField], vb = b[invSortField];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return invSortAsc ? -1 : 1;
      if (va > vb) return invSortAsc ? 1 : -1;
      return 0;
    });
  }

  // indicadores de orden en headers
  ['tipo','marca','cantidad','compra','venta'].forEach(function(c) {
    var el = document.getElementById('sort-' + c);
    if (el) el.textContent = invSortField === c ? (invSortAsc ? '▲' : '▼') : '';
  });

  document.getElementById('inv-count').textContent = inv.length + ' prendas registradas';

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:28px">' +
      (inv.length ? 'Sin resultados para "'+q+'"' : 'No hay prendas. Agrega la primera.') + '</td></tr>';
  } else {
    tbody.innerHTML = filtered.map(function(p) {
      var estado = p.cantidad <= 0
        ? '<span class="badge badge-red"><span class="badge-dot"></span>Sin stock</span>'
        : p.cantidad <= 5
        ? '<span class="badge badge-red"><span class="badge-dot"></span>Stock bajo</span>'
        : p.cantidad <= 10
        ? '<span class="badge badge-amber"><span class="badge-dot"></span>Normal</span>'
        : '<span class="badge badge-green"><span class="badge-dot"></span>En stock</span>';
      var cantColor = p.cantidad <= 5 ? 'color:var(--red)' : '';
      return '<tr>' +
        '<td class="td-main">' + p.tipo + '</td>' +
        '<td>' + p.marca + '</td><td>' + p.modelo + '</td><td>' + p.talla + '</td><td>' + p.color + '</td>' +
        '<td><strong style="' + cantColor + '">' + p.cantidad + '</strong></td>' +
        '<td>' + fmt(p.compra) + '</td>' +
        '<td style="color:var(--green);font-weight:600">' + fmt(p.venta) + '</td>' +
        '<td>' + estado + '</td>' +
        '<td class="td-actions">' +
          '<button class="btn btn-sm btn-edit" onclick="editarPrenda(\'' + p.id + '\')">' +
            '<i data-lucide="pencil"></i> Editar' +
          '</button>' +
          '<button class="btn btn-sm btn-del" onclick="eliminarPrenda(\'' + p.id + '\')">' +
            '<i data-lucide="trash-2"></i>' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  actualizarStats();
  lucide.createIcons();
}

function actualizarStats() {
  var inv = getInventario();
  var total  = inv.reduce(function(s,p) { return s + p.cantidad; }, 0);
  var tipos  = new Set(inv.map(function(p) { return p.tipo; })).size;
  var valor  = inv.reduce(function(s,p) { return s + p.compra * p.cantidad; }, 0);
  var bajo   = inv.filter(function(p) { return p.cantidad <= 5; }).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-tipos').textContent = tipos;
  document.getElementById('stat-valor').textContent = fmt(valor);
  document.getElementById('stat-bajo').textContent  = bajo;
  document.getElementById('stat-bajo-sub').textContent = bajo + ' prendas con ≤5 unidades';

  // badge sidebar
  var badge = document.querySelector('#nav-inventario .nav-badge');
  if (badge) badge.textContent = bajo || '';
  if (badge) badge.style.display = bajo ? '' : 'none';
}

// ── MODAL PRENDA ──
function openModal(id) {
  var mo = document.getElementById('modal-overlay');
  mo.style.display = 'flex';

  // poblar sugerencias desde inventario existente
  var inv = getInventario();
  var modelos = [];
  var modeloSet = new Set();
  inv.forEach(function(p) { if (p.modelo && !modeloSet.has(p.modelo)) { modeloSet.add(p.modelo); modelos.push(p.modelo); } });
  var colores = [];
  var colorSet = new Set();
  inv.forEach(function(p) { if (p.color && !colorSet.has(p.color)) { colorSet.add(p.color); colores.push(p.color); } });
  document.getElementById('dl-modelos').innerHTML = modelos.map(function(m) { return '<option value="' + m + '">'; }).join('');
  document.getElementById('dl-colores').innerHTML = colores.map(function(c) { return '<option value="' + c + '">'; }).join('');
  if (id) {
    var p = getInventario().find(function(x) { return x.id === id; });
    document.getElementById('modal-title').textContent = 'Editar prenda';
    document.getElementById('f-id').value       = p.id;
    document.getElementById('f-tipo').value     = p.tipo;
    document.getElementById('f-marca').value    = p.marca;
    document.getElementById('f-modelo').value   = p.modelo;
    document.getElementById('f-talla').value    = p.talla;
    document.getElementById('f-color').value    = p.color;
    document.getElementById('f-cantidad').value = p.cantidad;
    document.getElementById('f-compra').value   = p.compra;
    document.getElementById('f-venta').value    = p.venta;
    document.getElementById('f-desc').value     = p.desc || '';
  } else {
    document.getElementById('modal-title').textContent = 'Nueva prenda';
    ['f-id','f-tipo','f-marca','f-modelo','f-talla','f-color','f-cantidad','f-compra','f-venta','f-desc']
      .forEach(function(fid) { document.getElementById(fid).value = ''; });
  }
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

function huella(p) {
  return [p.tipo, p.marca, p.modelo, p.talla, p.color].map(function(x) { return norm(x||''); }).join('|');
}

function guardarPrenda() {
  var tipo     = document.getElementById('f-tipo').value;
  var marca    = document.getElementById('f-marca').value.trim();
  var modelo   = document.getElementById('f-modelo').value.trim();
  var talla    = document.getElementById('f-talla').value;
  var color    = document.getElementById('f-color').value.trim();
  var cantidad = parseInt(document.getElementById('f-cantidad').value);
  var compra   = parseFloat(document.getElementById('f-compra').value);
  var venta    = parseFloat(document.getElementById('f-venta').value);
  var desc     = document.getElementById('f-desc').value.trim();

  if (!tipo || !marca || !talla || isNaN(cantidad) || isNaN(compra) || isNaN(venta)) {
    toast('Completa todos los campos obligatorios.', 'error'); return;
  }

  var inv = getInventario();
  var existingId = document.getElementById('f-id').value;

  // si es edición, no verificar duplicado contra sí mismo
  if (!existingId) {
    var clave = huella({ tipo: tipo, marca: marca, modelo: modelo, talla: talla, color: color });
    var duplicado = inv.find(function(p) { return huella(p) === clave; });
    if (duplicado) {
      closeModal();
      showDuplicado(duplicado, { tipo: tipo, marca: marca, modelo: modelo, talla: talla, color: color, cantidad: cantidad, compra: compra, venta: venta, desc: desc });
      return;
    }
  }

  _guardarPrendaFinal({ existingId: existingId, tipo: tipo, marca: marca, modelo: modelo, talla: talla, color: color, cantidad: cantidad, compra: compra, venta: venta, desc: desc });
}

function _guardarPrendaFinal(data) {
  var inv = getInventario();
  if (data.existingId) {
    var idx = inv.findIndex(function(p) { return p.id === data.existingId; });
    inv[idx] = Object.assign({}, inv[idx], { tipo: data.tipo, marca: data.marca, modelo: data.modelo, talla: data.talla, color: data.color, cantidad: data.cantidad, compra: data.compra, venta: data.venta, desc: data.desc });
  } else {
    inv.push({ id: uid(), tipo: data.tipo, marca: data.marca, modelo: data.modelo, talla: data.talla, color: data.color, cantidad: data.cantidad, compra: data.compra, venta: data.venta, desc: data.desc });
  }
  saveInventario(inv);
  closeModal();
  renderInventario();
  filtrarProductos();
  toast('Prenda guardada correctamente.');
}

function showDuplicado(existente, nueva) {
  document.getElementById('dup-info').innerHTML =
    '<strong>' + existente.tipo + ' ' + existente.marca + ' ' + existente.modelo + '</strong> · ' + existente.talla + ' · ' + existente.color +
    '<br><span style="color:var(--muted);font-size:12px">Stock actual: <strong style="color:var(--accent)">' + existente.cantidad + ' unidades</strong> · P. compra: ' + fmt(existente.compra) + '</span>';
  document.getElementById('dup-nueva-cant').textContent = nueva.cantidad;
  var modal = document.getElementById('dup-modal');
  modal.style.display = 'flex';

  document.getElementById('dup-sumar').onclick = function() {
    modal.style.display = 'none';
    var inv = getInventario();
    var idx = inv.findIndex(function(p) { return p.id === existente.id; });
    inv[idx].cantidad += nueva.cantidad;
    if (nueva.compra !== existente.compra) inv[idx].compra = nueva.compra;
    saveInventario(inv);
    var reps = getReposiciones();
    reps.unshift({ id: uid(), fecha: new Date().toLocaleDateString('es-PE'), prenda: (existente.tipo + ' ' + existente.marca + ' ' + existente.modelo).trim(), talla: existente.talla, cantidad: nueva.cantidad, compra: inv[idx].compra, notas: 'Ingresado desde "Nueva prenda"' });
    saveReposiciones(reps);
    renderInventario();
    renderReposiciones();
    filtrarProductos();
    toast('+' + nueva.cantidad + ' unidades sumadas al stock existente.');
  };

  document.getElementById('dup-crear').onclick = function() {
    modal.style.display = 'none';
    _guardarPrendaFinal({ existingId: null, tipo: nueva.tipo, marca: nueva.marca, modelo: nueva.modelo, talla: nueva.talla, color: nueva.color, cantidad: nueva.cantidad, compra: nueva.compra, venta: nueva.venta, desc: nueva.desc });
  };

  document.getElementById('dup-cancelar').onclick = function() {
    modal.style.display = 'none';
  };
}

function editarPrenda(id) { openModal(id); }

function eliminarPrenda(id) {
  showConfirm('¿Eliminar esta prenda del inventario?', function() {
    saveInventario(getInventario().filter(function(p) { return p.id !== id; }));
    renderInventario();
    filtrarProductos();
  });
}
