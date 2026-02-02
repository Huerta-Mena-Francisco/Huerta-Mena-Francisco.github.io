// js/reports.js - Reportes simples y prácticos

console.log("Módulo Reportes cargado");

async function loadReports(container) {
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h3>Reportes del Sistema</h3>
            <p style="color: var(--text-secondary);">Genera reportes para impresión y seguimiento</p>
        </div>

        <!-- SELECTOR DE REPORTE -->
        <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 1.5rem;">
            <h4 style="margin-bottom: 1rem;">Selecciona Tipo de Reporte</h4>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <select id="report-type" style="padding: 0.8rem; border: 1px solid var(--border); border-radius: 6px; flex: 1; max-width: 300px;">
                    <option value="">-- Selecciona reporte --</option>
                    <option value="paquetes-racks">📦 Paquetes en Racks (para entrega)</option>
                    <option value="paquetes-rack">📊 Paquetes por Rack específico</option>
                    <option value="entregas">✅ Reporte de Entregas</option>
                </select>
                
                <button id="generar-reporte" style="padding: 0.8rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Generar Reporte
                </button>
                
                <button id="imprimir-reporte" style="padding: 0.8rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; display: none;">
                    🖨️ Imprimir
                </button>
            </div>
            
            <!-- FILTRO PARA RACK ESPECÍFICO -->
            <div id="rack-select-container" style="margin-top: 1rem; display: none;">
                <label style="display: block; margin-bottom: 0.5rem;">Selecciona Rack:</label>
                <select id="rack-select" style="padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px; width: 300px;">
                    <option value="">Cargando racks...</option>
                </select>
            </div>
            
            <!-- FILTRO DE FECHAS -->
            <div id="date-filter-container" style="margin-top: 1rem; display: none;">
                <label style="display: block; margin-bottom: 0.5rem;">Filtrar por fecha de entrada:</label>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <input type="date" id="fecha-desde" style="padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                    <span>a</span>
                    <input type="date" id="fecha-hasta" style="padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                    <button id="limpiar-fechas" style="padding: 0.5rem 1rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        Limpiar
                    </button>
                </div>
            </div>
        </div>

        <!-- RESULTADOS DEL REPORTE -->
        <div id="report-results" style="background: var(--card-bg); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border); min-height: 400px;">
            <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                <h4>Selecciona un tipo de reporte</h4>
                <p>Los resultados aparecerán aquí</p>
            </div>
        </div>
        
        <!-- INFORMACIÓN DEL REPORTE -->
        <div id="report-info" style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary); text-align: center;"></div>
        
        <style>
            .report-header {
                text-align: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 2px solid var(--border);
            }
            
            .report-title {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--primary);
                margin-bottom: 0.5rem;
            }
            
            .report-subtitle {
                color: var(--text-secondary);
                font-size: 0.9rem;
            }
            
            .report-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9rem;
            }
            
            .report-table th {
                background: #f8f9fa;
                padding: 0.8rem;
                text-align: left;
                font-weight: 600;
                border-bottom: 2px solid var(--border);
            }
            
            .report-table td {
                padding: 0.8rem;
                border-bottom: 1px solid var(--border);
                vertical-align: top;
            }
            
            .report-table tr:hover {
                background: #f8f9fa;
            }
            
            .status-badge {
                display: inline-block;
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 500;
            }
            
            .rack-badge {
                display: inline-block;
                padding: 0.2rem 0.5rem;
                background: #e3f2fd;
                border-radius: 4px;
                font-size: 0.85rem;
                color: #1565c0;
            }
            
            .no-data {
                text-align: center;
                padding: 3rem;
                color: var(--text-secondary);
                font-style: italic;
            }
            
            .print-only {
                display: none;
            }
            
            @media print {
                body * {
                    visibility: hidden;
                }
                #report-print-area, #report-print-area * {
                    visibility: visible;
                }
                #report-print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                }
                .no-print {
                    display: none !important;
                }
            }
        </style>
    `;

    // Cargar racks en el select
    await cargarRacksEnSelect();
    
    // Configurar fechas por defecto (últimos 30 días)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    document.getElementById('fecha-desde').value = hace30Dias.toISOString().split('T')[0];
    document.getElementById('fecha-hasta').value = hoy.toISOString().split('T')[0];
    
    // Event Listeners
    document.getElementById('report-type').addEventListener('change', manejarCambioTipoReporte);
    document.getElementById('generar-reporte').addEventListener('click', generarReporte);
    document.getElementById('imprimir-reporte').addEventListener('click', imprimirReporte);
    document.getElementById('limpiar-fechas').addEventListener('click', limpiarFechas);
}

async function cargarRacksEnSelect() {
    try {
        const racks = await Storage.getRacks();
        const select = document.getElementById('rack-select');
        
        select.innerHTML = '<option value="">Todos los racks</option>';
        racks.forEach(rack => {
            const option = document.createElement('option');
            option.value = rack.id;
            option.textContent = `${rack.name} (${rack.occupied || 0}/${rack.capacity})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar racks:", error);
    }
}

function manejarCambioTipoReporte() {
    const tipo = document.getElementById('report-type').value;
    const rackContainer = document.getElementById('rack-select-container');
    const dateContainer = document.getElementById('date-filter-container');
    
    // Mostrar/ocultar filtros según tipo
    if (tipo === 'paquetes-rack') {
        rackContainer.style.display = 'block';
        dateContainer.style.display = 'none';
    } else if (tipo === 'entregas') {
        rackContainer.style.display = 'none';
        dateContainer.style.display = 'block';
    } else {
        rackContainer.style.display = 'none';
        dateContainer.style.display = 'none';
    }
    
    // Mostrar/ocultar botón de imprimir
    const imprimirBtn = document.getElementById('imprimir-reporte');
    imprimirBtn.style.display = 'none';
}

function limpiarFechas() {
    document.getElementById('fecha-desde').value = '';
    document.getElementById('fecha-hasta').value = '';
}

async function generarReporte() {
    const tipo = document.getElementById('report-type').value;
    
    if (!tipo) {
        alert("Por favor selecciona un tipo de reporte");
        return;
    }
    
    // Mostrar loading
    const resultsDiv = document.getElementById('report-results');
    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
            <p>Generando reporte...</p>
        </div>
    `;
    
    // Generar reporte según tipo
    switch(tipo) {
        case 'paquetes-racks':
            await generarReportePaquetesEnRacks();
            break;
        case 'paquetes-rack':
            await generarReportePaquetesPorRack();
            break;
        case 'entregas':
            await generarReporteEntregas();
            break;
    }
    
    // Mostrar botón de imprimir
    document.getElementById('imprimir-reporte').style.display = 'inline-block';
}

async function generarReportePaquetesEnRacks() {
    try {
        const [packages, racks, clients] = await Promise.all([
            Storage.getPackages(),
            Storage.getRacks(),
            Storage.getClients()
        ]);
        
        // Filtrar solo paquetes pendientes
        const paquetesPendientes = packages.filter(p => p.status === 'pendiente');
        
        // Crear mapas para nombres
        const rackMap = racks.reduce((map, r) => (map[r.id] = r.name, map), {});
        const clientMap = clients.reduce((map, c) => (map[c.id] = c.name, map), {});
        
        // Ordenar por rack y luego por nombre
        paquetesPendientes.sort((a, b) => {
            const rackA = rackMap[a.rackId] || '';
            const rackB = rackMap[b.rackId] || '';
            if (rackA !== rackB) return rackA.localeCompare(rackB);
            return (a.nombre || '').localeCompare(b.nombre || '');
        });
        
        // Crear HTML del reporte
        const fecha = new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let html = `
            <div id="report-print-area">
                <div class="report-header">
                    <div class="report-title">📦 REPORTE DE PAQUETES EN RACKS</div>
                    <div class="report-subtitle">Para entrega - ${fecha}</div>
                    <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                        Total: <strong>${paquetesPendientes.length}</strong> paquetes pendientes
                    </div>
                </div>
        `;
        
        if (paquetesPendientes.length === 0) {
            html += `
                <div class="no-data">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <h4>No hay paquetes pendientes</h4>
                    <p>Todos los paquetes han sido entregados o retirados</p>
                </div>
            `;
        } else {
            // Agrupar por rack
            const paquetesPorRack = {};
            paquetesPendientes.forEach(pkg => {
                const rackId = pkg.rackId || 'sin-rack';
                if (!paquetesPorRack[rackId]) {
                    paquetesPorRack[rackId] = {
                        rackName: rackMap[pkg.rackId] || 'Sin Rack Asignado',
                        paquetes: []
                    };
                }
                paquetesPorRack[rackId].paquetes.push(pkg);
            });
            
            // Generar tabla por rack
            html += `<div style="margin-bottom: 2rem;">`;
            
            Object.values(paquetesPorRack).forEach((grupo, index) => {
                html += `
                    <div style="margin-bottom: ${index > 0 ? '2rem' : '0'};">
                        <h4 style="background: #f8f9fa; padding: 0.8rem; border-radius: 6px; margin-bottom: 1rem;">
                            📍 ${grupo.rackName} <span style="font-size: 0.9rem; color: var(--text-secondary);">(${grupo.paquetes.length} paquetes)</span>
                        </h4>
                        
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th width="50">#</th>
                                    <th>Paquete</th>
                                    <th>Código</th>
                                    <th>Cliente</th>
                                    <th>Peso/Dimensiones</th>
                                    <th>Courier</th>
                                    <th>Fecha Entrada</th>
                                    <th>Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                grupo.paquetes.forEach((pkg, i) => {
                    html += `
                        <tr>
                            <td>${i + 1}</td>
                            <td><strong>${pkg.nombre || 'Sin nombre'}</strong></td>
                            <td><code>${pkg.codigoBarras || '—'}</code></td>
                            <td>${clientMap[pkg.clienteId] || pkg.destinatarioNuevo || '—'}</td>
                            <td>
                                ${pkg.peso ? `${pkg.peso} kg<br>` : ''}
                                ${pkg.dimensiones || ''}
                            </td>
                            <td>${pkg.courierName || pkg.courier || '—'}</td>
                            <td>${pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('es-MX') : '—'}</td>
                            <td style="max-width: 200px;">${pkg.notas || '—'}</td>
                        </tr>
                    `;
                });
                
                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        html += `
                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #ddd; font-size: 0.8rem; color: #666; text-align: center;">
                    PO Box El Paso • Reporte generado: ${new Date().toLocaleString('es-MX')}
                </div>
            </div>
        `;
        
        document.getElementById('report-results').innerHTML = html;
        document.getElementById('report-info').innerHTML = `
            <span style="color: #27ae60;">✓</span> Reporte generado: ${paquetesPendientes.length} paquetes pendientes para entrega
        `;
        
    } catch (error) {
        console.error("Error generando reporte:", error);
        mostrarErrorReporte("Error al generar reporte de paquetes");
    }
}

async function generarReportePaquetesPorRack() {
    const rackId = document.getElementById('rack-select').value;
    
    if (!rackId) {
        alert("Por favor selecciona un rack");
        return;
    }
    
    try {
        const [packages, racks, clients] = await Promise.all([
            Storage.getPackages(),
            Storage.getRacks(),
            Storage.getClients()
        ]);
        
        const rack = racks.find(r => r.id === rackId);
        if (!rack) {
            mostrarErrorReporte("Rack no encontrado");
            return;
        }
        
        // Filtrar paquetes en este rack (todos los estados)
        const paquetesEnRack = packages.filter(p => p.rackId === rackId);
        
        // Crear mapas para nombres
        const clientMap = clients.reduce((map, c) => (map[c.id] = c.name, map), {});
        
        // Ordenar por estado y fecha
        paquetesEnRack.sort((a, b) => {
            if (a.status !== b.status) return a.status.localeCompare(b.status);
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
        
        const fecha = new Date().toLocaleDateString('es-MX');
        
        let html = `
            <div id="report-print-area">
                <div class="report-header">
                    <div class="report-title">📊 PAQUETES EN RACK: ${rack.name}</div>
                    <div class="report-subtitle">Ubicación: ${rack.location || 'No especificada'} • ${fecha}</div>
                    <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                        Capacidad: <strong>${rack.occupied || 0}/${rack.capacity}</strong> • Estado: ${rack.status}
                    </div>
                </div>
        `;
        
        if (paquetesEnRack.length === 0) {
            html += `
                <div class="no-data">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <h4>Rack vacío</h4>
                    <p>No hay paquetes en este rack</p>
                </div>
            `;
        } else {
            // Contar por estado
            const porEstado = {};
            paquetesEnRack.forEach(pkg => {
                const estado = pkg.status || 'pendiente';
                porEstado[estado] = (porEstado[estado] || 0) + 1;
            });
            
            html += `
                <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
            `;
            
            Object.entries(porEstado).forEach(([estado, count]) => {
                const color = estado === 'entregado' ? '#28a745' : 
                              estado === 'pendiente' ? '#ffc107' : 
                              estado === 'retirado' ? '#17a2b8' : '#dc3545';
                
                html += `
                    <div style="background: ${color}15; padding: 0.8rem; border-radius: 6px; border-left: 4px solid ${color};">
                        <div style="font-size: 1.2rem; font-weight: bold; color: ${color};">${count}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            ${estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            
            // Tabla de paquetes
            html += `
                <table class="report-table">
                    <thead>
                        <tr>
                            <th width="50">#</th>
                            <th>Paquete</th>
                            <th>Cliente</th>
                            <th>Estado</th>
                            <th>Fecha Entrada</th>
                            <th>Código</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            paquetesEnRack.forEach((pkg, i) => {
                const estadoColor = pkg.status === 'entregado' ? '#28a745' : 
                                   pkg.status === 'pendiente' ? '#ffc107' : 
                                   pkg.status === 'retirado' ? '#17a2b8' : '#dc3545';
                
                html += `
                    <tr>
                        <td>${i + 1}</td>
                        <td><strong>${pkg.nombre || 'Sin nombre'}</strong></td>
                        <td>${clientMap[pkg.clienteId] || pkg.destinatarioNuevo || '—'}</td>
                        <td>
                            <span class="status-badge" style="background: ${estadoColor}20; color: ${estadoColor};">
                                ${pkg.status || 'pendiente'}
                            </span>
                        </td>
                        <td>${pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('es-MX') : '—'}</td>
                        <td><code>${pkg.codigoBarras || '—'}</code></td>
                        <td style="max-width: 200px;">${pkg.notas || '—'}</td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
        }
        
        html += `
                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #ddd; font-size: 0.8rem; color: #666; text-align: center;">
                    PO Box El Paso • ${rack.name} • Reporte generado: ${new Date().toLocaleString('es-MX')}
                </div>
            </div>
        `;
        
        document.getElementById('report-results').innerHTML = html;
        document.getElementById('report-info').innerHTML = `
            <span style="color: #27ae60;">✓</span> Reporte generado: ${paquetesEnRack.length} paquetes en rack ${rack.name}
        `;
        
    } catch (error) {
        console.error("Error generando reporte:", error);
        mostrarErrorReporte("Error al generar reporte por rack");
    }
}

async function generarReporteEntregas() {
    const fechaDesde = document.getElementById('fecha-desde').value;
    const fechaHasta = document.getElementById('fecha-hasta').value;
    
    try {
        const packages = await Storage.getPackages();
        
        // Filtrar solo paquetes entregados
        let entregas = packages.filter(p => p.status === 'entregado');
        
        // Filtrar por fecha si se especificó
        if (fechaDesde) {
            const desde = new Date(fechaDesde);
            entregas = entregas.filter(p => {
                const fechaPkg = p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt);
                return fechaPkg >= desde;
            });
        }
        
        if (fechaHasta) {
            const hasta = new Date(fechaHasta + 'T23:59:59');
            entregas = entregas.filter(p => {
                const fechaPkg = p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt);
                return fechaPkg <= hasta;
            });
        }
        
        // Ordenar por fecha de entrega (más recientes primero)
        entregas.sort((a, b) => {
            const fechaA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
            const fechaB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
            return fechaB - fechaA;
        });
        
        // Crear HTML del reporte
        const rangoFechas = fechaDesde || fechaHasta 
            ? `Del ${fechaDesde || 'inicio'} al ${fechaHasta || 'hoy'}`
            : 'Todas las entregas';
        
        const fecha = new Date().toLocaleDateString('es-MX');
        
        let html = `
            <div id="report-print-area">
                <div class="report-header">
                    <div class="report-title">✅ REPORTE DE ENTREGAS</div>
                    <div class="report-subtitle">${rangoFechas} • ${fecha}</div>
                    <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                        Total: <strong>${entregas.length}</strong> paquetes entregados
                    </div>
                </div>
        `;
        
        if (entregas.length === 0) {
            html += `
                <div class="no-data">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                    <h4>No hay entregas registradas</h4>
                    <p>${rangoFechas === 'Todas las entregas' ? 'No se han registrado entregas en el sistema' : 'No hay entregas en el rango de fechas seleccionado'}</p>
                </div>
            `;
        } else {
            // Resumen por fecha
            const entregasPorDia = {};
            entregas.forEach(pkg => {
                const fecha = pkg.updatedAt ? new Date(pkg.updatedAt).toLocaleDateString('es-MX') : 
                              pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('es-MX') : 'Sin fecha';
                entregasPorDia[fecha] = (entregasPorDia[fecha] || 0) + 1;
            });
            
            html += `
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-bottom: 2rem;">
                    <h5 style="margin-bottom: 0.5rem;">📅 Resumen por día:</h5>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            `;
            
            Object.entries(entregasPorDia).forEach(([fecha, count]) => {
                html += `
                    <div style="background: white; padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid #ddd;">
                        <strong>${count}</strong> el ${fecha}
                    </div>
                `;
            });
            
            html += `</div></div>`;
            
            // Tabla de entregas
            html += `
                <table class="report-table">
                    <thead>
                        <tr>
                            <th width="50">#</th>
                            <th>Paquete</th>
                            <th>Código</th>
                            <th>Fecha Entrega</th>
                            <th>Courier</th>
                            <th>Rack</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            entregas.forEach((pkg, i) => {
                const fechaEntrega = pkg.updatedAt ? new Date(pkg.updatedAt) : new Date(pkg.createdAt);
                
                html += `
                    <tr>
                        <td>${i + 1}</td>
                        <td><strong>${pkg.nombre || 'Sin nombre'}</strong></td>
                        <td><code>${pkg.codigoBarras || '—'}</code></td>
                        <td>
                            ${fechaEntrega.toLocaleDateString('es-MX')}<br>
                            <small style="color: #666;">${fechaEntrega.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</small>
                        </td>
                        <td>${pkg.courierName || pkg.courier || '—'}</td>
                        <td>
                            <span class="rack-badge">
                                ${pkg.rackId ? `Rack ${pkg.rackId.substring(0, 8)}...` : '—'}
                            </span>
                        </td>
                        <td style="max-width: 200px;">${pkg.notas || '—'}</td>
                    </tr>
                `;
            });
            
            html += `
                    </tbody>
                </table>
            `;
        }
        
        html += `
                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #ddd; font-size: 0.8rem; color: #666; text-align: center;">
                    PO Box El Paso • Reporte de entregas generado: ${new Date().toLocaleString('es-MX')}
                </div>
            </div>
        `;
        
        document.getElementById('report-results').innerHTML = html;
        document.getElementById('report-info').innerHTML = `
            <span style="color: #27ae60;">✓</span> Reporte generado: ${entregas.length} entregas ${rangoFechas}
        `;
        
    } catch (error) {
        console.error("Error generando reporte:", error);
        mostrarErrorReporte("Error al generar reporte de entregas");
    }
}

function imprimirReporte() {
    const printContents = document.getElementById('report-print-area').innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte - PO Box El Paso</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .header { text-align: center; margin-bottom: 20px; }
                .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #666; }
                @page { size: landscape; }
            </style>
        </head>
        <body>
            ${printContents}
        </body>
        </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Recargar para restaurar la interfaz
}

function mostrarErrorReporte(mensaje) {
    document.getElementById('report-results').innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
            <h4 style="color: #e74c3c;">Error al generar reporte</h4>
            <p>${mensaje}</p>
            <button onclick="generarReporte()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Reintentar
            </button>
        </div>
    `;
    
    document.getElementById('report-info').innerHTML = `
        <span style="color: #e74c3c;">✗</span> Error: ${mensaje}
    `;
}