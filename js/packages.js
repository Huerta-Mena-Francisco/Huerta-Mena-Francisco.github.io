// js/packages.js - VERSIÓN COMPLETA CON ESCANEO AUTOMÁTICO Y TABLAS

console.log("📦 Módulo Paquetes cargado - CON ESCANEO AUTOMÁTICO");

async function loadPackages(container) {
    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h3>📦 Gestión de Paquetes</h3>
                    <p style="color: var(--text-secondary); margin-top: 0.3rem; font-size: 0.95rem;">
                        Escanea tracking numbers para asignación automática
                    </p>
                </div>
                <div style="display: flex; gap: 0.8rem;">
                    <button id="btn-view-pending" style="padding: 0.6rem 1.2rem; background: #e67e22; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                        📭 Pendientes (<span id="pending-count-badge">0</span>)
                    </button>
                    <button id="btn-manual-add" style="padding: 0.6rem 1.2rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        + Manual
                    </button>
                </div>
            </div>

            <!-- PANEL PRINCIPAL DE ESCANEO -->
            <div id="scan-main-panel" style="background: white; border-radius: 10px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 2px solid #e3f2fd;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
                    <h2 style="margin-bottom: 0.5rem; color: #2c3e50;">Escaneo Rápido de Paquetes</h2>
                    <p style="color: #7f8c8d; max-width: 600px; margin: 0 auto 1.5rem;">
                        Escanea el código de barras del paquete. El sistema detectará automáticamente la paquetería y buscará al cliente.
                    </p>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.8rem; font-weight: 600; color: #2c3e50;">
                            🔢 Número de Tracking / Código de Barras *
                        </label>
                        <input type="text" id="scan-tracking" 
                               placeholder="Ej: 1Z9999999999999999, 9205590164917326733325, 123456789012"
                               style="width: 100%; padding: 1rem; border: 2px solid #3498db; border-radius: 8px; font-family: monospace; font-size: 1.1rem;"
                               autocomplete="off">
                        <div style="font-size: 0.85rem; color: #7f8c8d; margin-top: 0.5rem;">
                            <div>📦 Formatos reconocidos:</div>
                            <div style="display: flex; gap: 1rem; margin-top: 0.3rem; flex-wrap: wrap;">
                                <span style="background: #e8f4fc; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">UPS: 1Zxxxxxxxxxxxxxxxx</span>
                                <span style="background: #e8f4fc; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">USPS: 20-22 dígitos</span>
                                <span style="background: #e8f4fc; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">FedEx: 12/15 dígitos</span>
                                <span style="background: #e8f4fc; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">DHL: 10 dígitos</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.8rem; font-weight: 600; color: #2c3e50;">
                            👤 Nombre Destinatario
                        </label>
                        <input type="text" id="scan-recipient" 
                               placeholder="Nombre del destinatario"
                               style="width: 100%; padding: 1rem; border: 2px solid #ddd; border-radius: 8px;">
                        <div style="font-size: 0.85rem; color: #7f8c8d; margin-top: 0.5rem;">
                            Para búsqueda más precisa
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.8rem; font-weight: 600; color: #2c3e50;">
                            📬 Número de Casilla
                        </label>
                        <input type="text" id="scan-boxnumber" 
                               placeholder="Ej: 567, A12"
                               style="width: 100%; padding: 1rem; border: 2px solid #ddd; border-radius: 8px;">
                        <div style="font-size: 0.85rem; color: #7f8c8d; margin-top: 0.5rem;">
                            Número asignado al cliente
                        </div>
                    </div>
                </div>

                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <button id="btn-process-scan" 
                            style="padding: 1rem 3rem; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600; box-shadow: 0 4px 6px rgba(52, 152, 219, 0.3);">
                        🔍 ESCANEAR Y PROCESAR
                    </button>
                    <div style="margin-top: 1rem;">
                        <button id="btn-scan-multiple" style="background: transparent; border: none; color: #3498db; cursor: pointer; font-size: 0.9rem;">
                            ⚡ Modo escaneo múltiple (mantener abierto)
                        </button>
                    </div>
                </div>

                <!-- RESULTADO DEL ESCANEO -->
                <div id="scan-result" style="min-height: 80px; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border: 1px dashed #ddd; margin-top: 1rem; display: none;">
                    <!-- Resultado dinámico -->
                </div>

                <!-- DETECCIÓN DE PAQUETERÍA -->
                <div id="courier-detection" style="margin-top: 1.5rem; padding: 1rem; background: #e8f4fc; border-radius: 6px; display: none;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div id="courier-icon" style="font-size: 1.5rem;"></div>
                        <div>
                            <div id="courier-name" style="font-weight: 600; color: #2c3e50;"></div>
                            <div id="courier-details" style="font-size: 0.9rem; color: #7f8c8d;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- TABLA DE PAQUETES ASIGNADOS RECIENTES -->
        <div style="margin-top: 2.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="color: #2c3e50;">
                    📋 Paquetes Recientes
                    <span id="recent-count" style="background: #3498db; color: white; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 0.8rem; margin-left: 0.5rem;">0</span>
                </h4>
                <div style="display: flex; gap: 0.5rem;">
                    <button id="btn-refresh-packages" style="padding: 0.4rem 0.8rem; background: #ecf0f1; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">
                        🔄 Actualizar
                    </button>
                    <select id="filter-status" style="padding: 0.4rem 0.8rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                        <option value="all">Todos los estados</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="asignado">Asignados</option>
                        <option value="entregado">Entregados</option>
                    </select>
                </div>
            </div>
            
            <div id="packages-table-container" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #3498db, #2980b9); color: white;">
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Tracking</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Cliente</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Courier</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Estado</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Fecha Escaneo</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="packages-table-body">
                        <!-- Paquetes se cargarán aquí -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SECCIÓN DE PAQUETES PENDIENTES (inicialmente colapsada) -->
        <div id="pending-section" style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e67e22; display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h4 style="color: #e67e22; margin-bottom: 0.3rem;">
                        📭 Paquetes Pendientes de Asignación
                    </h4>
                    <p style="color: #7f8c8d; font-size: 0.9rem;">
                        Paquetes escaneados que no pudieron asignarse automáticamente
                    </p>
                </div>
                <div>
                    <button id="btn-close-pending" style="padding: 0.5rem 1rem; background: #ecf0f1; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
                        Cerrar
                    </button>
                </div>
            </div>
            
            <div id="pending-packages-container">
                <!-- Tabla de pendientes se cargará aquí -->
            </div>
        </div>

        <!-- MODAL PARA ASIGNACIÓN MANUAL -->
        <div id="assign-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 10px; padding: 2rem; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h4 style="color: #2c3e50;">👤 Asignar Paquete a Cliente</h4>
                    <button id="btn-close-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7f8c8d;">×</button>
                </div>
                <div id="modal-content">
                    <!-- Contenido dinámico -->
                </div>
            </div>
        </div>
    `;

    // Inicializar variables
    const scanTracking = container.querySelector("#scan-tracking");
    const scanRecipient = container.querySelector("#scan-recipient");
    const scanBoxNumber = container.querySelector("#scan-boxnumber");
    const btnProcessScan = container.querySelector("#btn-process-scan");
    const scanResult = container.querySelector("#scan-result");
    const courierDetection = container.querySelector("#courier-detection");
    const packagesTableBody = container.querySelector("#packages-table-body");
    const pendingSection = container.querySelector("#pending-section");
    const assignModal = container.querySelector("#assign-modal");

    // 1. DETECCIÓN AUTOMÁTICA AL ESCRIBIR
    scanTracking.addEventListener("input", async function() {
        const tracking = this.value.trim();
        if (tracking.length > 5) {
            await updateCourierDetection(tracking, courierDetection);
        } else {
            courierDetection.style.display = 'none';
        }
    });

    // 2. PROCESAR ESCANEO
    btnProcessScan.addEventListener("click", async () => {
        await processScan(container);
    });

    // Permitir Enter para escanear
    scanTracking.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            processScan(container);
        }
    });

    // 3. MOSTRAR/OCULTAR PENDIENTES
    container.querySelector("#btn-view-pending").addEventListener("click", () => {
        pendingSection.style.display = pendingSection.style.display === 'none' ? 'block' : 'none';
        if (pendingSection.style.display === 'block') {
            loadPendingPackages(container);
        }
    });

    container.querySelector("#btn-close-pending").addEventListener("click", () => {
        pendingSection.style.display = 'none';
    });

    // 4. BOTÓN MANUAL (formulario tradicional)
    container.querySelector("#btn-manual-add").addEventListener("click", () => {
        mostrarFormularioManual(container);
    });

    // 5. FILTRAR TABLA
    container.querySelector("#filter-status").addEventListener("change", async () => {
        await loadRecentPackages(container);
    });

    // 6. ACTUALIZAR TABLA
    container.querySelector("#btn-refresh-packages").addEventListener("click", async () => {
        await loadRecentPackages(container);
        await updatePendingCount(container);
    });

    // 7. MODO ESCANEO MÚLTIPLE
    container.querySelector("#btn-scan-multiple").addEventListener("click", function() {
        const isActive = this.style.fontWeight === 'bold';
        if (!isActive) {
            this.style.fontWeight = 'bold';
            this.style.color = '#e74c3c';
            this.innerHTML = '⚡ Modo activo (limpiar después de escanear)';
        } else {
            this.style.fontWeight = 'normal';
            this.style.color = '#3498db';
            this.innerHTML = '⚡ Modo escaneo múltiple (mantener abierto)';
        }
    });

    // 8. CERRAR MODAL
    container.querySelector("#btn-close-modal").addEventListener("click", () => {
        assignModal.style.display = 'none';
    });

    // Cargar datos iniciales
    await loadRecentPackages(container);
    await updatePendingCount(container);

    // Enfocar campo de escaneo
    setTimeout(() => scanTracking.focus(), 100);
}

// ========== FUNCIONES AUXILIARES ==========

async function updateCourierDetection(tracking, container) {
    if (!Storage.detectCourier) return;
    
    const result = Storage.detectCourier(tracking);
    if (result.courier !== 'unknown') {
        container.style.display = 'block';
        container.querySelector("#courier-name").textContent = result.courierName;
        container.querySelector("#courier-details").textContent = `Tracking: ${tracking}`;
        
        // Icono según courier
        const iconMap = {
            'fedex': '🚚',
            'ups': '📦',
            'usps': '✉️',
            'dhl': '✈️',
            'estafeta': '🇲🇽',
            'other': '📨'
        };
        container.querySelector("#courier-icon").textContent = iconMap[result.courier] || '📦';
    } else {
        container.style.display = 'none';
    }
}

async function processScan(container) {
    const tracking = container.querySelector("#scan-tracking").value.trim();
    const recipient = container.querySelector("#scan-recipient").value.trim();
    const boxNumber = container.querySelector("#scan-boxnumber").value.trim();
    const scanResultDiv = container.querySelector("#scan-result");
    
    if (!tracking) {
        showScanResult(scanResultDiv, 'warning', '⚠️ Ingresa un número de tracking');
        container.querySelector("#scan-tracking").focus();
        return;
    }
    
    // Mostrar procesando
    showScanResult(scanResultDiv, 'processing', '🔍 Procesando escaneo...');
    
    try {
        // Usar la función de storage.js
        const result = await Storage.processTrackingScan(tracking, recipient || null, boxNumber || null);
        
        // Mostrar resultado
        if (result.success) {
            if (result.action === "auto_assigned") {
                showScanResult(scanResultDiv, 'success', 
                    `✅ <strong>${result.message}</strong><br>
                     👤 Cliente: ${result.client.name}<br>
                     📦 Courier: ${result.courier.courierName}<br>
                     📅 Fecha: ${new Date().toLocaleTimeString()}`);
                
                // Actualizar contador de cliente en UI si existe
                updateClientCounterUI(result.client.id);
                
            } else if (result.action === "pending") {
                showScanResult(scanResultDiv, 'warning',
                    `📭 <strong>${result.message}</strong><br>
                     ⏳ Guardado como pendiente de asignación`);
                
            } else if (result.action === "limit_exceeded") {
                showScanResult(scanResultDiv, 'error',
                    `⛔ <strong>${result.message}</strong><br>
                     ℹ️ El cliente ha alcanzado su límite mensual`);
                
            } else if (result.action === "duplicate") {
                showScanResult(scanResultDiv, 'info',
                    `⚠️ <strong>${result.message}</strong><br>
                     📊 Este paquete ya estaba registrado`);
            }
        } else {
            showScanResult(scanResultDiv, 'error', `❌ ${result.message}`);
        }
        
        // Si NO es modo múltiple, limpiar campos
        const multipleMode = container.querySelector("#btn-scan-multiple").style.fontWeight === 'bold';
        if (!multipleMode) {
            container.querySelector("#scan-tracking").value = '';
            container.querySelector("#scan-recipient").value = '';
            container.querySelector("#scan-boxnumber").value = '';
        } else {
            // En modo múltiple, solo limpiar tracking
            container.querySelector("#scan-tracking").value = '';
            container.querySelector("#scan-tracking").focus();
        }
        
        // Actualizar listas después de 1 segundo
        setTimeout(async () => {
            await loadRecentPackages(container);
            await updatePendingCount(container);
            
            // Si hay pendientes, actualizar esa sección si está visible
            if (result.action === "pending" && container.querySelector("#pending-section").style.display === 'block') {
                await loadPendingPackages(container);
            }
        }, 1000);
        
    } catch (error) {
        console.error("Error en escaneo:", error);
        showScanResult(scanResultDiv, 'error', `❌ Error: ${error.message}`);
    }
}

function showScanResult(container, type, html) {
    container.style.display = 'block';
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db',
        processing: '#3498db'
    };
    
    const bgColors = {
        success: '#d5f4e6',
        error: '#fadbd8',
        warning: '#fef5e7',
        info: '#e8f4fc',
        processing: '#e8f4fc'
    };
    
    container.style.borderColor = colors[type];
    container.style.background = bgColors[type];
    container.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 1rem;">
            <div style="font-size: 1.5rem;">${type === 'processing' ? '⏳' : ''}</div>
            <div style="flex: 1;">
                ${html}
                <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 0.5rem;">
                    ${new Date().toLocaleString('es-MX')}
                </div>
            </div>
        </div>
    `;
}

async function loadRecentPackages(container) {
    const tableBody = container.querySelector("#packages-table-body");
    const filterStatus = container.querySelector("#filter-status").value;
    
    try {
        let packages = await Storage.getPackages();
        
        // Ordenar por fecha más reciente
        packages.sort((a, b) => new Date(b.fechaEscaneo || b.createdAt) - new Date(a.fechaEscaneo || a.createdAt));
        
        // Filtrar por estado si no es "all"
        if (filterStatus !== 'all') {
            packages = packages.filter(pkg => pkg.status === filterStatus);
        }
        
        // Mostrar solo los 20 más recientes
        packages = packages.slice(0, 20);
        
        // Actualizar contador
        container.querySelector("#recent-count").textContent = packages.length;
        
        if (packages.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        No hay paquetes registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        // Cargar clientes para mostrar nombres
        const clients = await Storage.getClients();
        const clientMap = clients.reduce((map, c) => {
            map[c.id] = c;
            return map;
        }, {});
        
        tableBody.innerHTML = packages.map(pkg => {
            const client = pkg.clienteId ? clientMap[pkg.clienteId] : null;
            const statusColor = pkg.estaAsignado ? '#27ae60' : '#e67e22';
            const statusText = pkg.estaAsignado ? 'Asignado' : 'Pendiente';
            
            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 0.8rem;">
                        <div style="font-family: monospace; font-weight: 500;">${pkg.trackingNumber || pkg.codigoBarras || '—'}</div>
                        <div style="font-size: 0.8rem; color: #7f8c8d;">${pkg.nombre || 'Paquete'}</div>
                    </td>
                    <td style="padding: 0.8rem;">
                        ${client ? `
                            <div style="font-weight: 500;">${client.name}</div>
                            ${client.boxNumber ? `<div style="font-size: 0.8rem; color: #3498db;">Casilla ${client.boxNumber}</div>` : ''}
                        ` : pkg.clienteTemp ? `
                            <div style="color: #e67e22; font-style: italic;">${pkg.clienteTemp}</div>
                            <div style="font-size: 0.8rem; color: #95a5a6;">(Pendiente de asignar)</div>
                        ` : '<div style="color: #95a5a6;">—</div>'}
                    </td>
                    <td style="padding: 0.8rem;">
                        <div style="display: inline-block; padding: 0.2rem 0.6rem; background: #e8f4fc; border-radius: 4px; font-size: 0.85rem;">
                            ${pkg.courierName || pkg.courier || '—'}
                        </div>
                    </td>
                    <td style="padding: 0.8rem;">
                        <span style="display: inline-block; padding: 0.2rem 0.6rem; background: ${statusColor}20; color: ${statusColor}; border-radius: 4px; font-size: 0.85rem; font-weight: 500;">
                            ${statusText}
                        </span>
                    </td>
                    <td style="padding: 0.8rem;">
                        <div style="font-size: 0.9rem;">${new Date(pkg.fechaEscaneo || pkg.createdAt).toLocaleDateString('es-MX')}</div>
                        <div style="font-size: 0.8rem; color: #7f8c8d;">${new Date(pkg.fechaEscaneo || pkg.createdAt).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td style="padding: 0.8rem;">
                        ${!pkg.estaAsignado ? `
                            <button class="btn-assign-manual" data-id="${pkg.id}" style="padding: 0.3rem 0.6rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                                Asignar
                            </button>
                        ` : ''}
                        <button class="btn-view-details" data-id="${pkg.id}" style="padding: 0.3rem 0.6rem; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; margin-left: 0.3rem;">
                            Ver
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Asignar eventos a los botones
        tableBody.querySelectorAll('.btn-assign-manual').forEach(btn => {
            btn.addEventListener('click', () => showAssignModal(btn.dataset.id, container));
        });
        
        tableBody.querySelectorAll('.btn-view-details').forEach(btn => {
            btn.addEventListener('click', () => showPackageDetails(btn.dataset.id, container));
        });
        
    } catch (error) {
        console.error("Error cargando paquetes:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 3rem; text-align: center; color: #e74c3c;">
                    Error al cargar paquetes
                </td>
            </tr>
        `;
    }
}

async function loadPendingPackages(container) {
    const pendingContainer = container.querySelector("#pending-packages-container");
    
    try {
        // Obtener paquetes no asignados
        const packages = await Storage.getPackages();
        const pendingPackages = packages.filter(pkg => !pkg.estaAsignado);
        
        // Actualizar badge
        container.querySelector("#pending-count-badge").textContent = pendingPackages.length;
        
        if (pendingPackages.length === 0) {
            pendingContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary); background: white; border-radius: 8px;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <h4>No hay paquetes pendientes</h4>
                    <p>Todos los paquetes han sido asignados correctamente.</p>
                </div>
            `;
            return;
        }
        
        pendingContainer.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: #f39c12; color: white;">
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Tracking</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Destinatario</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Courier</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Fecha</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="pending-table-body">
                    <!-- Pendientes se cargarán aquí -->
                </tbody>
            </table>
        `;
        
        const pendingTableBody = container.querySelector("#pending-table-body");
        pendingTableBody.innerHTML = pendingPackages.map(pkg => {
            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 0.8rem;">
                        <div style="font-family: monospace; font-weight: 500;">${pkg.trackingNumber || pkg.codigoBarras}</div>
                    </td>
                    <td style="padding: 0.8rem;">
                        <div style="font-weight: 500; color: #e67e22;">${pkg.clienteTemp || 'Desconocido'}</div>
                        ${pkg.destinatarioNuevo ? `<div style="font-size: 0.8rem; color: #7f8c8d;">${pkg.destinatarioNuevo}</div>` : ''}
                    </td>
                    <td style="padding: 0.8rem;">
                        <div style="display: inline-block; padding: 0.2rem 0.6rem; background: #fef5e7; border-radius: 4px; font-size: 0.85rem;">
                            ${pkg.courierName || pkg.courier || '—'}
                        </div>
                    </td>
                    <td style="padding: 0.8rem;">
                        ${new Date(pkg.fechaEscaneo || pkg.createdAt).toLocaleDateString('es-MX')}
                    </td>
                    <td style="padding: 0.8rem;">
                        <button class="btn-assign-pending" data-id="${pkg.id}" style="padding: 0.3rem 0.6rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                            Asignar
                        </button>
                        <button class="btn-delete-pending" data-id="${pkg.id}" style="padding: 0.3rem 0.6rem; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; margin-left: 0.3rem;">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Asignar eventos
        pendingTableBody.querySelectorAll('.btn-assign-pending').forEach(btn => {
            btn.addEventListener('click', () => showAssignModal(btn.dataset.id, container));
        });
        
        pendingTableBody.querySelectorAll('.btn-delete-pending').forEach(btn => {
            btn.addEventListener('click', () => deletePendingPackage(btn.dataset.id, container));
        });
        
    } catch (error) {
        console.error("Error cargando pendientes:", error);
        pendingContainer.innerHTML = `
            <div style="color: #e74c3c; padding: 2rem; text-align: center;">
                Error al cargar paquetes pendientes
            </div>
        `;
    }
}

async function updatePendingCount(container) {
    try {
        const packages = await Storage.getPackages();
        const pendingCount = packages.filter(pkg => !pkg.estaAsignado).length;
        container.querySelector("#pending-count-badge").textContent = pendingCount;
    } catch (error) {
        console.error("Error actualizando contador:", error);
    }
}

async function showAssignModal(packageId, container) {
    const modal = container.querySelector("#assign-modal");
    const modalContent = container.querySelector("#modal-content");
    
    try {
        const pkg = await Storage.getPackageById(packageId);
        const clients = await Storage.getClients();
        
        modalContent.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <div style="font-weight: 500;">📦 Paquete a asignar:</div>
                    <div style="font-family: monospace; margin-top: 0.3rem;">${pkg.trackingNumber || pkg.codigoBarras}</div>
                    <div style="color: #7f8c8d; font-size: 0.9rem; margin-top: 0.2rem;">
                        Destinatario: ${pkg.clienteTemp || pkg.destinatarioNuevo || 'No especificado'}
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Buscar cliente:</label>
                    <input type="text" id="search-client-input" placeholder="Nombre, email o casilla" style="width: 100%; padding: 0.7rem; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                
                <div id="search-results" style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 6px; padding: 0.5rem;">
                    ${clients.map(client => `
                        <div class="client-option" data-id="${client.id}" style="padding: 0.8rem; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: background 0.2s;" 
                             onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
                            <div style="display: flex; justify-content: space-between;">
                                <div>
                                    <div style="font-weight: 500;">${client.name}</div>
                                    ${client.email ? `<div style="font-size: 0.85rem; color: #7f8c8d;">${client.email}</div>` : ''}
                                </div>
                                <div style="text-align: right;">
                                    ${client.boxNumber ? `<div style="background: #e3f2fd; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">Casilla ${client.boxNumber}</div>` : ''}
                                    <div style="font-size: 0.85rem; color: #27ae60; margin-top: 0.2rem;">
                                        ${client.paquetesMesActual || 0} paquetes este mes
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="display: flex; gap: 0.8rem; padding-top: 1rem; border-top: 1px solid #eee;">
                <button id="btn-confirm-assign" style="flex: 1; padding: 0.8rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;" disabled>
                    Asignar a Cliente Seleccionado
                </button>
                <button id="btn-create-client" style="padding: 0.8rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Crear Nuevo Cliente
                </button>
            </div>
            
            <div id="selected-client-info" style="margin-top: 1rem; padding: 1rem; background: #e8f4fc; border-radius: 6px; display: none;">
                <div style="font-weight: 500; color: #2c3e50;">Cliente seleccionado:</div>
                <div id="selected-client-details"></div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Variables del modal
        let selectedClientId = null;
        const searchInput = modalContent.querySelector("#search-client-input");
        const searchResults = modalContent.querySelector("#search-results");
        const btnConfirm = modalContent.querySelector("#btn-confirm-assign");
        const selectedInfo = modalContent.querySelector("#selected-client-info");
        const selectedDetails = modalContent.querySelector("#selected-client-details");
        
        // Búsqueda en tiempo real
        searchInput.addEventListener("input", function() {
            const searchTerm = this.value.toLowerCase();
            const options = searchResults.querySelectorAll(".client-option");
            
            options.forEach(option => {
                const clientText = option.textContent.toLowerCase();
                option.style.display = clientText.includes(searchTerm) ? "block" : "none";
            });
        });
        
        // Seleccionar cliente
        searchResults.querySelectorAll(".client-option").forEach(option => {
            option.addEventListener("click", function() {
                selectedClientId = this.dataset.id;
                const client = clients.find(c => c.id === selectedClientId);
                
                // Resaltar selección
                searchResults.querySelectorAll(".client-option").forEach(opt => {
                    opt.style.background = opt === this ? "#e3f2fd" : "white";
                });
                
                // Mostrar info del cliente seleccionado
                selectedInfo.style.display = 'block';
                selectedDetails.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                        <div>
                            <strong>${client.name}</strong>
                            ${client.email ? `<div>📧 ${client.email}</div>` : ''}
                            ${client.telefono ? `<div>📱 ${client.telefono}</div>` : ''}
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: #27ae60;">
                                📦 ${client.paquetesMesActual || 0} paquetes este mes
                            </div>
                            ${client.boxNumber ? `<div style="font-size: 0.9rem; color: #3498db;">📬 Casilla ${client.boxNumber}</div>` : ''}
                        </div>
                    </div>
                `;
                
                // Habilitar botón de confirmar
                btnConfirm.disabled = false;
                btnConfirm.textContent = `Asignar a ${client.name.split(' ')[0]}`;
            });
        });
        
        // Confirmar asignación
        btnConfirm.addEventListener("click", async () => {
            if (!selectedClientId) return;
            
            try {
                // Verificar límite del cliente
                const limitCheck = await Storage.checkClientPackageLimit(selectedClientId);
                if (!limitCheck.canAdd) {
                    alert(`⛔ ${limitCheck.reason}`);
                    return;
                }
                
                // Asignar paquete
                const result = await Storage.assignPackageToClient(packageId, selectedClientId);
                
                if (result.success) {
                    // Cerrar modal
                    modal.style.display = 'none';
                    
                    // Mostrar mensaje de éxito
                    showScanResult(container.querySelector("#scan-result"), 'success', 
                        `✅ Paquete asignado a ${result.client.name}`);
                    
                    // Actualizar listas
                    setTimeout(async () => {
                        await loadRecentPackages(container);
                        await loadPendingPackages(container);
                        await updatePendingCount(container);
                        updateClientCounterUI(selectedClientId);
                    }, 500);
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
        
        // Crear nuevo cliente
        modalContent.querySelector("#btn-create-client").addEventListener("click", () => {
            // Cerrar este modal y abrir formulario de cliente
            modal.style.display = 'none';
            // Aquí podrías integrar con clients.js para crear cliente rápido
            alert("Para crear un nuevo cliente, ve a la sección de Clientes");
        });
        
    } catch (error) {
        console.error("Error mostrando modal:", error);
        modalContent.innerHTML = `<div style="color: #e74c3c;">Error: ${error.message}</div>`;
    }
}

async function deletePendingPackage(packageId, container) {
    if (!confirm("¿Eliminar este paquete pendiente?")) return;
    
    try {
        await Storage.deletePackage(packageId);
        await loadPendingPackages(container);
        await updatePendingCount(container);
        await loadRecentPackages(container);
    } catch (error) {
        alert("Error eliminando paquete: " + error.message);
    }
}

function updateClientCounterUI(clientId) {
    // Esta función podría actualizar un contador visual si tienes uno
    console.log(`Contador actualizado para cliente ${clientId}`);
}

function showPackageDetails(packageId, container) {
    // Implementar vista de detalles del paquete
    alert(`Ver detalles del paquete ${packageId} - Esta función se implementará después`);
}

function mostrarFormularioManual(container) {
    // Aquí mantendrías el formulario tradicional si lo necesitas
    alert("Formulario manual - Puedes mantener el formulario original si lo necesitas");
}

// Registrar función global
window.loadPackages = loadPackages;