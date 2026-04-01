// ── REPORTES ──
var chartIngresos = null;
var chartTipos = null;
var filtroReporte = 'todo';

function setFiltroReporte(f) {
  filtroReporte = f;
  ['hoy','semana','mes','todo'].forEach(function(k) {
    var b = document.getElementById('rfil-'+k);
    if (b) b.className = 'btn btn-sm ' + (k === f ? 'btn-primary' : 'btn-ghost');
  });

  var desdeEl = document.getElementById('rfil-desde');
  var hastaEl = document.getElementById('rfil-hasta');
  var toISO = function(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  };

  if (f === 'hoy') {
    var h = new Date();
    desdeEl.value = toISO(h);
    hastaEl.value = toISO(h);
  } else if (f === 'semana') {
    var now = new Date();
    var day = now.getDay();
    var diffToMon = (day === 0) ? -6 : 1 - day;
    var lunes = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMon);
    var domingo = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + 6);
    desdeEl.value = toISO(lunes);
    hastaEl.value = toISO(domingo);
  } else if (f === 'mes') {
    var n = new Date();
    var primerDia = new Date(n.getFullYear(), n.getMonth(), 1);
    var ultimoDia = new Date(n.getFullYear(), n.getMonth() + 1, 0);
    desdeEl.value = toISO(primerDia);
    hastaEl.value = toISO(ultimoDia);
  } else if (f === 'todo') {
    desdeEl.value = '';
    hastaEl.value = '';
  } else if (f === 'custom') {
    ['hoy','semana','mes','todo'].forEach(function(k) {
      var b = document.getElementById('rfil-'+k);
      if (b) b.className = 'btn btn-sm btn-ghost';
    });
  }

  renderReportes();
}

function filtrarVentasPorPeriodo(ventas) {
  var desde = document.getElementById('rfil-desde') ? document.getElementById('rfil-desde').value : '';
  var hasta = document.getElementById('rfil-hasta') ? document.getElementById('rfil-hasta').value : '';
  if (!desde && !hasta) return ventas;
  return ventas.filter(function(v) {
    var p = v.fecha.split('/');
    if (p.length !== 3) return true;
    var fechaISO = p[2] + '-' + p[1].padStart(2,'0') + '-' + p[0].padStart(2,'0');
    if (desde && fechaISO < desde) return false;
    if (hasta && fechaISO > hasta) return false;
    return true;
  });
}

function renderReportes() {
  var todasVentas = getVentas().filter(function(v) { return !v.anulada; });
  var inv = getInventario();

  // resumen del día (siempre hoy)
  var hoyStr = new Date().toLocaleDateString('es-PE');
  var ventasHoy = todasVentas.filter(function(v) { return v.fecha === hoyStr; });
  var ticketsHoy = {};
  ventasHoy.forEach(function(v) { ticketsHoy[v.ticketId || v.id] = true; });
  document.getElementById('r-hoy-fecha').textContent    = 'Hoy, ' + hoyStr;
  document.getElementById('r-hoy-ventas').textContent   = Object.keys(ticketsHoy).length;
  document.getElementById('r-hoy-ingresos').textContent = fmt(ventasHoy.reduce(function(s,v){return s+v.total;},0));
  document.getElementById('r-hoy-ganancia').textContent = fmt(ventasHoy.reduce(function(s,v){return s+v.ganancia;},0));
  document.getElementById('r-hoy-uds').textContent      = ventasHoy.reduce(function(s,v){return s+v.cantidad;},0);

  // ventas del período seleccionado
  var ventas   = filtrarVentasPorPeriodo(todasVentas);
  var ingresos = ventas.reduce(function(s,v){return s+v.total;},0);
  var costo    = ventas.reduce(function(s,v){return s+v.compra*v.cantidad;},0);
  var ganancia = ingresos - costo;
  var uds      = ventas.reduce(function(s,v){return s+v.cantidad;},0);
  var margen   = ingresos>0 ? Math.round((ganancia/ingresos)*100) : 0;
  var ticket   = ventas.length>0 ? ingresos/ventas.length : 0;

  var periodoLabel = {hoy:'Hoy',semana:'Esta semana',mes:'Este mes',todo:'Todo el tiempo',custom:'Rango personalizado'};
  var pl = document.getElementById('chart-periodo-label');
  if (pl) pl.textContent = periodoLabel[filtroReporte]||'';

  // banner de período con fechas
  var desdeVal = document.getElementById('rfil-desde') ? document.getElementById('rfil-desde').value : '';
  var hastaVal = document.getElementById('rfil-hasta') ? document.getElementById('rfil-hasta').value : '';
  var banner = document.getElementById('r-periodo-banner');
  var textoEl = document.getElementById('r-periodo-texto');
  if (banner && textoEl) {
    if (filtroReporte === 'todo' || (!desdeVal && !hastaVal)) {
      banner.style.display = 'none';
    } else {
      var fmtFecha = function(iso) { var p=iso.split('-'); return p[2]+'/'+p[1]+'/'+p[0]; };
      textoEl.textContent = (periodoLabel[filtroReporte]||'Personalizado') + ' — ' + (desdeVal?fmtFecha(desdeVal):'') + ' al ' + (hastaVal?fmtFecha(hastaVal):'');
      banner.style.display = 'block';
    }
  }

  document.getElementById('r-ingresos').textContent  = fmt(ingresos);
  document.getElementById('r-costo').textContent     = fmt(costo);
  document.getElementById('r-ganancia').textContent  = fmt(ganancia);
  document.getElementById('r-uds').textContent       = uds + ' unidades';
  document.getElementById('r-margen').textContent    = 'Margen ' + margen + '%';
  document.getElementById('rf-ingresos').textContent = fmt(ingresos);
  document.getElementById('rf-costo').textContent    = fmt(costo);
  document.getElementById('rf-ganancia').textContent = fmt(ganancia);
  document.getElementById('rf-margen').textContent   = margen + '%';
  document.getElementById('rf-ticket').textContent   = fmt(ticket);

  // top productos
  var porProd = {};
  ventas.forEach(function(v) { porProd[v.prenda] = (porProd[v.prenda]||0) + v.cantidad; });
  var topEl = document.getElementById('r-top-productos');
  var topEntries = Object.entries(porProd).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
  topEl.innerHTML = topEntries.length
    ? topEntries.map(function(entry,i) { return '<div class="r-row"><span class="r-label"><span class="rank ' + (i<3?'gold':'') + '">' + (i+1) + '</span> ' + entry[0] + '</span><span class="r-val" style="' + (i===0?'color:var(--amber)':'') + '">' + entry[1] + ' uds</span></div>'; }).join('')
    : '<p style="color:var(--muted);font-size:13px;padding:8px 0">Sin ventas registradas</p>';

  // stock crítico
  var criticos = inv.filter(function(p){return p.cantidad<=5;}).sort(function(a,b){return a.cantidad-b.cantidad;});
  document.getElementById('r-stock-critico').innerHTML = criticos.length
    ? criticos.map(function(p){return '<div class="r-row"><span class="r-label">' + p.tipo + ' ' + p.marca + ' ' + p.modelo + ' ' + p.talla + '</span><span class="badge ' + (p.cantidad<=3?'badge-red':'badge-amber') + '"><span class="badge-dot"></span>' + p.cantidad + ' uds</span></div>';}).join('')
    : '<p style="color:var(--muted);font-size:13px;padding:8px 0">Sin prendas en stock crítico</p>';

  // ── GRÁFICOS ──
  var isDark    = document.documentElement.getAttribute('data-theme') === 'dark';
  var gridColor = isDark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
  var textColor = isDark ? '#a0a0c0' : '#9090aa';

  // Barras: últimos 7 días
  var dias=[],dataIng=[],dataGan=[];
  for (var i=6;i>=0;i--) {
    var d=new Date(); d.setDate(d.getDate()-i);
    dias.push(d.toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit'}));
    var dv=todasVentas.filter(function(v){return v.fecha===d.toLocaleDateString('es-PE');});
    dataIng.push(+dv.reduce(function(s,v){return s+v.total;},0).toFixed(2));
    dataGan.push(+dv.reduce(function(s,v){return s+v.ganancia;},0).toFixed(2));
  }
  if (chartIngresos) { chartIngresos.destroy(); chartIngresos=null; }
  chartIngresos = new Chart(document.getElementById('chart-ingresos'), {
    type:'bar',
    data:{labels:dias,datasets:[
      {label:'Ingresos',data:dataIng,backgroundColor:'rgba(108,99,255,.75)',borderRadius:6},
      {label:'Ganancia',data:dataGan,backgroundColor:'rgba(22,163,74,.65)',borderRadius:6}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{labels:{color:textColor,font:{size:11}}}},
      scales:{x:{ticks:{color:textColor},grid:{color:gridColor}},
              y:{ticks:{color:textColor,callback:function(v){return 'S/'+v;}},grid:{color:gridColor}}}}
  });

  // Dona: por tipo
  var porTipo={};
  ventas.forEach(function(v){var t=v.prenda.split(' ')[0];porTipo[t]=(porTipo[t]||0)+v.total;});
  var tLabels=Object.keys(porTipo),tData=Object.values(porTipo);
  var colors=['#6c63ff','#16a34a','#dc2626','#d97706','#0ea5e9','#ec4899','#8b5cf6'];
  if (chartTipos) { chartTipos.destroy(); chartTipos=null; }
  if (tLabels.length) {
    chartTipos = new Chart(document.getElementById('chart-tipos'), {
      type:'doughnut',
      data:{labels:tLabels,datasets:[{data:tData,backgroundColor:colors,borderWidth:2,borderColor:isDark?'#16161f':'#fff'}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'62%',
        plugins:{legend:{position:'bottom',labels:{color:textColor,font:{size:11},padding:12}}}}
    });
  }
}

// ── EXPORTAR PDF ──
function exportarPDF() {
  window.print();
}
