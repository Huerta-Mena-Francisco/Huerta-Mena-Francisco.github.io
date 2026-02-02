// js/dashboard.js - Dashboard con métricas y gráficos

console.log("Módulo Dashboard cargado");

async function loadDashboard(container) {
    container.innerHTML = `
        <h3 style="margin-bottom: 1.5rem;">Dashboard Principal</h3>
        
        <!-- FILA DE MÉTRICAS RÁPIDAS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="metric-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 10px; color: white; box-shadow: var(--shadow);">
                <div style="font-size: 0.9rem; opacity: 0.9;">Total Paquetes</div>
                <div style="font-size: 2rem; font-weight: bold;" id="metric-total-paquetes">0</div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem;" id="metric-paquetes-detalle">Cargando...</div>
            </div>
            
            <div class="metric-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: 10px; color: white; box-shadow: var(--shadow);">
                <div style="font-size: 0.9rem; opacity: 0.9;">Paquetes Pendientes</div>
                <div style="font-size: 2rem; font-weight: bold;" id="metric-pendientes">0</div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem;">Para entregar</div>
            </div>
            
            <div class="metric-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: 10px; color: white; box-shadow: var(--shadow);">
                <div style="font-size: 0.9rem; opacity: 0.9;">Racks Disponibles</div>
                <div style="font-size: 2rem; font-weight: bold;" id="metric-racks-disponibles">0</div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem;" id="metric-racks-total">de 0 total</div>
            </div>
            
            <div class="metric-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 1.5rem; border-radius: 10px; color: white; box-shadow: var(--shadow);">
                <div style="font-size: 0.9rem; opacity: 0.9;">Clientes Activos</div>
                <div style="font-size: 2rem; font-weight: bold;" id="metric-clientes">0</div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem;" id="metric-clientes-vencimiento">0 por vencer</div>
            </div>
        </div>
        
        <!-- FILA DE GRÁFICOS -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
            <!-- GRÁFICO 1: Paquetes por Estado -->
            <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 10px; border: 1px solid var(--border);">
                <h4 style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <span>Paquetes por Estado</span>
                    <span style="font-size: 0.9rem; color: var(--text-secondary);" id="total-paquetes-chart">Total: 0</span>
                </h4>
                <div style="height: 250px; display: flex; align-items: center; justify-content: center;" id="chart-estados">
                    <div style="text-align: center; color: var(--text-secondary);">
                        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                        Cargando gráfico...
                    </div>
                </div>
                <div style="margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;" id="chart-legend"></div>
            </div>
            
            <!-- GRÁFICO 2: Ocupación de Racks -->
            <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 10px; border: 1px solid var(--border);">
                <h4 style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <span>Ocupación de Racks</span>
                    <span style="font-size: 0.9rem; color: var(--text-secondary);" id="ocupacion-total">0% ocupado</span>
                </h4>
                <div style="height: 250px; display: flex; align-items: center; justify-content: center;" id="chart-racks">
                    <div style="text-align: center; color: var(--text-secondary);">
                        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                        Cargando gráfico...
                    </div>
                </div>
                <div style="margin-top: 1rem; font-size: 0.9rem; text-align: center; color: var(--text-secondary);">
                    <div id="racks-info">0 racks disponibles de 0</div>
                </div>
            </div>
        </div>
        
        <!-- ÚLTIMOS PAQUETES RECIENTES -->
        <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 10px; border: 1px solid var(--border);">
            <h4 style="margin-bottom: 1rem;">Paquetes Recientes</h4>
            <div id="ultimos-paquetes" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border);">
                            <th style="padding: 0.8rem; text-align: left; font-weight: 600;">Paquete</th>
                            <th style="padding: 0.8rem; text-align: left; font-weight: 600;">Cliente</th>
                            <th style="padding: 0.8rem; text-align: left; font-weight: 600;">Rack</th>
                            <th style="padding: 0.8rem; text-align: left; font-weight: 600;">Estado</th>
                            <th style="padding: 0.8rem; text-align: left; font-weight: 600;">Fecha</th>
                        </tr>
                    </thead>
                    <tbody id="recent-packages-body">
                        <tr>
                            <td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                                Cargando paquetes recientes...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .legend-item {
                display: flex; 
                align-items: center; 
                gap: 0.5rem; 
                margin: 0.3rem 0;
            }
            
            .legend-color {
                width: 12px; 
                height: 12px; 
                border-radius: 3px;
            }
            
            .chart-container {
                position: relative;
                height: 250px;
            }
        </style>
    `;
    
    await actualizarDashboard();
}

async function actualizarDashboard() {
    try {
        // Cargar todos los datos necesarios
        const [packages, clients, racks, plans] = await Promise.all([
            Storage.getPackages(),
            Storage.getClients(),
            Storage.getRacks(),
            Storage.getPlans ? Storage.getPlans() : Promise.resolve([])
        ]);
        
        // 1. ACTUALIZAR MÉTRICAS RÁPIDAS
        actualizarMetricas(packages, clients, racks, plans);
        
        // 2. CREAR GRÁFICO DE PAQUETES POR ESTADO
        crearGraficoEstados(packages);
        
        // 3. CREAR GRÁFICO DE OCUPACIÓN DE RACKS
        crearGraficoRacks(racks);
        
        // 4. MOSTRAR ÚLTIMOS PAQUETES
        mostrarUltimosPaquetes(packages);
        
    } catch (error) {
        console.error("Error al actualizar dashboard:", error);
        mostrarError("Error al cargar datos del dashboard");
    }
}

function actualizarMetricas(packages, clients, racks, plans) {
    // Total paquetes
    const totalPaquetes = packages.length;
    const paquetesPendientes = packages.filter(p => p.status === 'pendiente').length;
    const paquetesEntregados = packages.filter(p => p.status === 'entregado').length;
    
    document.getElementById('metric-total-paquetes').textContent = totalPaquetes;
    document.getElementById('metric-paquetes-detalle').innerHTML = 
        `${paquetesEntregados} entregados, ${paquetesPendientes} pendientes`;
    
    // Paquetes pendientes
    document.getElementById('metric-pendientes').textContent = paquetesPendientes;
    
    // Racks disponibles
    const racksDisponibles = racks.filter(r => r.status === 'available' || (r.occupied || 0) < r.capacity).length;
    const capacidadTotal = racks.reduce((sum, r) => sum + r.capacity, 0);
    const ocupadosTotal = racks.reduce((sum, r) => sum + (r.occupied || 0), 0);
    const porcentajeOcupacion = capacidadTotal > 0 ? Math.round((ocupadosTotal / capacidadTotal) * 100) : 0;
    
    document.getElementById('metric-racks-disponibles').textContent = racksDisponibles;
    document.getElementById('metric-racks-total').textContent = `de ${racks.length} total`;
    
    // Clientes activos
    const clientesActivos = clients.length;
    const clientesPorVencer = clients.filter(c => {
        if (!c.vencimiento) return false;
        const vencimiento = new Date(c.vencimiento);
        const hoy = new Date();
        const diffDias = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        return diffDias <= 7 && diffDias >= 0;
    }).length;
    
    document.getElementById('metric-clientes').textContent = clientesActivos;
    document.getElementById('metric-clientes-vencimiento').textContent = 
        `${clientesPorVencer} por vencer esta semana`;
}

function crearGraficoEstados(packages) {
    const estados = {
        'pendiente': 0,
        'entregado': 0,
        'retirado': 0,
        'perdido': 0,
        'otro': 0
    };
    
    // Contar por estado
    packages.forEach(pkg => {
        const estado = pkg.status || 'pendiente';
        if (estados[estado] !== undefined) {
            estados[estado]++;
        } else {
            estados['otro']++;
        }
    });
    
    // Filtrar estados con 0 paquetes
    const estadosConDatos = Object.entries(estados).filter(([_, count]) => count > 0);
    
    if (estadosConDatos.length === 0) {
        document.getElementById('chart-estados').innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                No hay datos de paquetes
            </div>
        `;
        return;
    }
    
    // Actualizar total en título
    const total = packages.length;
    document.getElementById('total-paquetes-chart').textContent = `Total: ${total}`;
    
    // Crear gráfico donut simple con HTML/CSS
    const colors = {
        'pendiente': '#ffc107',
        'entregado': '#28a745',
        'retirado': '#17a2b8',
        'perdido': '#dc3545',
        'otro': '#6c757d'
    };
    
    // Crear SVG para gráfico donut
    const size = 200;
    const radius = 70;
    const strokeWidth = 30;
    const center = size / 2;
    
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    
    let accumulatedAngle = 0;
    const totalValue = estadosConDatos.reduce((sum, [_, count]) => sum + count, 0);
    
    estadosConDatos.forEach(([estado, count], index) => {
        const percentage = count / totalValue;
        const angle = percentage * 360;
        
        // Calcular coordenadas para arco
        const x1 = center + radius * Math.cos((accumulatedAngle - 90) * (Math.PI / 180));
        const y1 = center + radius * Math.sin((accumulatedAngle - 90) * (Math.PI / 180));
        const x2 = center + radius * Math.cos((accumulatedAngle + angle - 90) * (Math.PI / 180));
        const y2 = center + radius * Math.sin((accumulatedAngle + angle - 90) * (Math.PI / 180));
        
        // Determinar si el arco es grande (>180 grados)
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        svg += `
            <path d="M ${x1} ${y1} 
                     A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}" 
                  stroke="${colors[estado]}" 
                  stroke-width="${strokeWidth}" 
                  fill="none"
                  stroke-linecap="round" />
        `;
        
        accumulatedAngle += angle;
    });
    
    // Agregar texto en el centro
    svg += `
        <circle cx="${center}" cy="${center}" r="${radius - strokeWidth/2}" fill="var(--card-bg)" />
        <text x="${center}" y="${center - 10}" text-anchor="middle" font-size="14" font-weight="bold" fill="var(--text-primary)">
            ${total}
        </text>
        <text x="${center}" y="${center + 15}" text-anchor="middle" font-size="10" fill="var(--text-secondary)">
            paquetes
        </text>
    </svg>`;
    
    document.getElementById('chart-estados').innerHTML = svg;
    
    // Crear leyenda
    const legend = estadosConDatos.map(([estado, count]) => `
        <div class="legend-item">
            <div class="legend-color" style="background: ${colors[estado]};"></div>
            <div style="font-size: 0.9rem;">
                <span style="font-weight: 500;">${estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
                <span style="color: var(--text-secondary); margin-left: 0.5rem;">${count}</span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('chart-legend').innerHTML = legend;
}

function crearGraficoRacks(racks) {
    if (racks.length === 0) {
        document.getElementById('chart-racks').innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                No hay racks registrados
            </div>
        `;
        return;
    }
    
    // Calcular ocupación
    const capacidadTotal = racks.reduce((sum, r) => sum + r.capacity, 0);
    const ocupadosTotal = racks.reduce((sum, r) => sum + (r.occupied || 0), 0);
    const disponiblesTotal = capacidadTotal - ocupadosTotal;
    const porcentajeOcupacion = capacidadTotal > 0 ? Math.round((ocupadosTotal / capacidadTotal) * 100) : 0;
    
    document.getElementById('ocupacion-total').textContent = `${porcentajeOcupacion}% ocupado`;
    document.getElementById('racks-info').textContent = 
        `${disponiblesTotal} espacios disponibles de ${capacidadTotal} total`;
    
    // Crear gráfico donut para ocupación
    const size = 200;
    const radius = 70;
    const strokeWidth = 30;
    const center = size / 2;
    
    const colorOcupado = ocupadosTotal > capacidadTotal * 0.9 ? '#dc3545' : 
                         ocupadosTotal > capacidadTotal * 0.7 ? '#ffc107' : '#28a745';
    const colorDisponible = '#e9ecef';
    
    // Crear SVG
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    
    // Arco para ocupados
    const percentage = capacidadTotal > 0 ? ocupadosTotal / capacidadTotal : 0;
    const angle = percentage * 360;
    
    if (angle > 0) {
        const x1 = center + radius * Math.cos(-90 * (Math.PI / 180));
        const y1 = center + radius * Math.sin(-90 * (Math.PI / 180));
        const x2 = center + radius * Math.cos((angle - 90) * (Math.PI / 180));
        const y2 = center + radius * Math.sin((angle - 90) * (Math.PI / 180));
        
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        svg += `
            <path d="M ${x1} ${y1} 
                     A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}" 
                  stroke="${colorOcupado}" 
                  stroke-width="${strokeWidth}" 
                  fill="none"
                  stroke-linecap="round" />
        `;
    }
    
    // Arco para disponibles (el resto)
    if (angle < 360) {
        const x1 = center + radius * Math.cos((angle - 90) * (Math.PI / 180));
        const y1 = center + radius * Math.sin((angle - 90) * (Math.PI / 180));
        const x2 = center + radius * Math.cos((360 - 90) * (Math.PI / 180));
        const y2 = center + radius * Math.sin((360 - 90) * (Math.PI / 180));
        
        const remainingAngle = 360 - angle;
        const largeArcFlag = remainingAngle > 180 ? 1 : 0;
        
        svg += `
            <path d="M ${x1} ${y1} 
                     A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}" 
                  stroke="${colorDisponible}" 
                  stroke-width="${strokeWidth}" 
                  fill="none"
                  stroke-linecap="round" />
        `;
    }
    
    // Texto en el centro
    svg += `
        <circle cx="${center}" cy="${center}" r="${radius - strokeWidth/2}" fill="var(--card-bg)" />
        <text x="${center}" y="${center - 10}" text-anchor="middle" font-size="20" font-weight="bold" fill="${colorOcupado}">
            ${porcentajeOcupacion}%
        </text>
        <text x="${center}" y="${center + 15}" text-anchor="middle" font-size="10" fill="var(--text-secondary)">
            ocupado
        </text>
    </svg>`;
    
    document.getElementById('chart-racks').innerHTML = svg;
}

async function mostrarUltimosPaquetes(packages) {
    // Ordenar por fecha de creación (más recientes primero)
    const recentPackages = [...packages]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 8); // Mostrar solo los 8 más recientes
    
    if (recentPackages.length === 0) {
        document.getElementById('recent-packages-body').innerHTML = `
            <tr>
                <td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                    No hay paquetes registrados
                </td>
            </tr>
        `;
        return;
    }
    
    // Obtener datos de clientes y racks para mostrar nombres
    const clients = await Storage.getClients();
    const racks = await Storage.getRacks();
    const clientMap = clients.reduce((map, c) => (map[c.id] = c.name, map), {});
    const rackMap = racks.reduce((map, r) => (map[r.id] = r.name, map), {});
    
    const tbody = document.getElementById('recent-packages-body');
    tbody.innerHTML = recentPackages.map(pkg => {
        const statusColor = pkg.status === 'entregado' ? '#28a745' : 
                            pkg.status === 'retirado' ? '#17a2b8' : 
                            pkg.status === 'perdido' ? '#dc3545' : '#ffc107';
        
        return `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 0.8rem; vertical-align: top;">
                    <div style="font-weight: 500;">${pkg.nombre || 'Sin nombre'}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${pkg.codigoBarras || ''}</div>
                </td>
                <td style="padding: 0.8rem; vertical-align: top;">
                    ${clientMap[pkg.clienteId] || pkg.destinatarioNuevo || '<span style="color: #95a5a6; font-style: italic;">Sin cliente</span>'}
                </td>
                <td style="padding: 0.8rem; vertical-align: top;">
                    ${rackMap[pkg.rackId] ? `
                        <span style="display: inline-block; padding: 0.2rem 0.5rem; background: #e3f2fd; border-radius: 4px; font-size: 0.85rem;">
                            ${rackMap[pkg.rackId]}
                        </span>
                    ` : '<span style="color: #95a5a6; font-style: italic;">—</span>'}
                </td>
                <td style="padding: 0.8rem; vertical-align: top;">
                    <span style="display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.85rem; background: ${pkg.status === 'entregado' ? '#d4edda' : pkg.status === 'pendiente' ? '#fff3cd' : '#f8d7da'}; color: ${pkg.status === 'entregado' ? '#155724' : pkg.status === 'pendiente' ? '#856404' : '#721c24'}">
                        ${pkg.status || 'pendiente'}
                    </span>
                </td>
                <td style="padding: 0.8rem; vertical-align: top;">
                    <div style="font-size: 0.85rem;">
                        ${pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('es-MX') : '—'}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function mostrarError(mensaje) {
    const container = document.getElementById('module-content');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <h3 style="color: #e74c3c;">Error en Dashboard</h3>
                <p>${mensaje}</p>
                <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }
}