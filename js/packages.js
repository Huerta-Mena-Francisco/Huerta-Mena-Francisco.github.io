// js/packages.js - VERSIÓN COMPLETA CORREGIDA

console.log("📦 Módulo Paquetes cargado - CON ESCANEO AUTOMÁTICO Y RACK");

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
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.8rem; font-weight: 600; color: #2c3e50;">
                            👤 Nombre Destinatario
                        </label>
                        <input type="text" id="scan-recipient" 
                               placeholder="Nombre del destinatario"
                               style="width: 100%; padding: 1rem; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.8rem; font-weight: 600; color: #2c3e50;">
                            📬 Número de Casilla
                        </label>
                        <input type="text" id="scan-boxnumber" 
                               placeholder="Ej: 567, A12"
                               style="width: 100%; padding: 1rem; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                </div>

                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <button id="btn-process-scan" 
                            style="padding: 1rem 3rem; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: 600;">
                        🔍 ESCANEAR Y PROCESAR
                    </button>
                </div>

                <!-- RESULTADO DEL ESCANEO -->
                <div id="scan-result" style="min-height: 80px; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border: 1px dashed #ddd; margin-top: 1rem; display: none;">
                    <!-- Resultado dinámico -->
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
                </div>
            </div>
            
            <div id="packages-table-container" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #3498db, #2980b9); color: white;">
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Tracking</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Cliente</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Rack</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Courier</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Estado</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Fecha</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="packages-table-body">
                        <!-- Paquetes se cargarán aquí -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SECCIÓN DE PAQUETES PENDIENTES -->
        <div id="pending-section" style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #e67e22; display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div>
                    <h4 style="color: #e67e22; margin-bottom: 0.3rem;">
                        📭 Paquetes Pendientes
                    </h4>
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
    const btnProcessScan = container.querySelector("#btn-process-scan");
    const scanResult = container.querySelector("#scan-result");
    const packagesTableBody = container.querySelector("#packages-table-body");
    const pendingSection = container.querySelector("#pending-section");

    // PROCESAR ESCANEO
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

    // MOSTRAR/OCULTAR PENDIENTES
    container.querySelector("#btn-view-pending").addEventListener("click", () => {
        pendingSection.style.display = pendingSection.style.display === 'none' ? 'block' : 'none';
        if (pendingSection.style.display === 'block') {
            loadPendingPackages(container);
        }
    });

    container.querySelector("#btn-close-pending").addEventListener("click", () => {
        pendingSection.style.display = 'none';
    });

    // ACTUALIZAR TABLA
    container.querySelector("#btn-refresh-packages").addEventListener("click", async () => {
        await loadRecentPackages(container);
        await updatePendingCount(container);
    });

    // CERRAR MODAL
    container.querySelector("#btn-close-modal").addEventListener("click", () => {
        container.querySelector("#assign-modal").style.display = 'none';
    });

    // Cargar datos iniciales
    await loadRecentPackages(container);
    await updatePendingCount(container);

    // Enfocar campo de escaneo
    setTimeout(() => scanTracking.focus(), 100);
}

// ========== FUNCIONES AUXILIARES ==========

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
        
        if (result.success) {
            if (result.action === "auto_assigned") {
                // PEDIR RACK DESPUÉS DE ASIGNAR
                const rack = await selectRackForPackage(container, result.package);
                if (rack) {
                    // Actualizar paquete con rack seleccionado
                    result.package.rackId = rack.id;
                    await Storage.updatePackage(result.package);
                    
                    // Actualizar contador del rack
                    const rackData = await Storage.getRackById(rack.id);
                    rackData.occupied = (rackData.occupied || 0) + 1;
                    if (rackData.occupied >= rackData.capacity) {
                        rackData.status = 'full';
                    }
                    await Storage.updateRack(rackData);
                    
                    showScanResult(scanResultDiv, 'success', 
                        `✅ <strong>${result.message}</strong><br>
                         👤 Cliente: ${result.client.name}<br>
                         📍 Rack: ${rack.name}`);
                } else {
                    showScanResult(scanResultDiv, 'warning',
                        `📦 <strong>Paquete asignado pero sin rack</strong>`);
                }
                
            } else if (result.action === "pending") {
                // Para paquetes pendientes, también pedir rack
                const rack = await selectRackForPackage(container, result.package);
                if (rack) {
                    // Actualizar paquete pendiente con rack
                    result.package.rackId = rack.id;
                    await Storage.updatePackage(result.package);
                    
                    // Actualizar contador del rack
                    const rackData = await Storage.getRackById(rack.id);
                    rackData.occupied = (rackData.occupied || 0) + 1;
                    if (rackData.occupied >= rackData.capacity) {
                        rackData.status = 'full';
                    }
                    await Storage.updateRack(rackData);
                    
                    showScanResult(scanResultDiv, 'warning',
                        `📭 <strong>${result.message}</strong>`);
                } else {
                    showScanResult(scanResultDiv, 'warning',
                        `📭 <strong>${result.message}</strong>`);
                }
            }
        } else {
            showScanResult(scanResultDiv, 'error', `❌ ${result.message}`);
        }
        
        // Limpiar campos
        container.querySelector("#scan-tracking").value = '';
        container.querySelector("#scan-recipient").value = '';
        container.querySelector("#scan-boxnumber").value = '';
        
        // Actualizar listas
        setTimeout(async () => {
            await loadRecentPackages(container);
            await updatePendingCount(container);
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
            <div style="flex: 1;">${html}</div>
        </div>
    `;
}

async function loadRecentPackages(container) {
    const tableBody = container.querySelector("#packages-table-body");
    
    try {
        let packages = await Storage.getPackages();
        const clients = await Storage.getClients();
        const racks = await Storage.getRacks();
        
        const clientMap = clients.reduce((map, c) => {
            map[c.id] = c;
            return map;
        }, {});
        
        const rackMap = racks.reduce((map, r) => {
            map[r.id] = r;
            return map;
        }, {});
        
        // Ordenar por fecha más reciente
        packages.sort((a, b) => new Date(b.fechaEscaneo || b.createdAt) - new Date(a.fechaEscaneo || a.createdAt));
        
        // Mostrar solo los 20 más recientes
        packages = packages.slice(0, 20);
        
        // Actualizar contador
        container.querySelector("#recent-count").textContent = packages.length;
        
        if (packages.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        No hay paquetes registrados
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = packages.map(pkg => {
            const client = pkg.clienteId ? clientMap[pkg.clienteId] : null;
            const rack = pkg.rackId ? rackMap[pkg.rackId] : null;
            const statusColor = pkg.estaAsignado ? '#27ae60' : '#e67e22';
            const statusText = pkg.estaAsignado ? 'Asignado' : 'Pendiente';
            
            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 0.8rem;">
                        <div style="font-family: monospace; font-weight: 500;">${pkg.trackingNumber || pkg.codigoBarras || '—'}</div>
                    </td>
                    <td style="padding: 0.8rem;">
                        ${client ? `
                            <div style="font-weight: 500;">${client.name}</div>
                            ${client.boxNumber ? `<div style="font-size: 0.8rem; color: #3498db;">Casilla ${client.boxNumber}</div>` : ''}
                        ` : pkg.clienteTemp ? `
                            <div style="color: #e67e22; font-style: italic;">${pkg.clienteTemp}</div>
                            <div style="font-size: 0.8rem; color: #95a5a6;">(Pendiente)</div>
                        ` : '<div style="color: #95a5a6;">—</div>'}
                    </td>
                    <td style="padding: 0.8rem;">
                        ${rack ? `
                            <div style="display: inline-block; padding: 0.3rem 0.6rem; background: #e3f2fd; border-radius: 4px; font-size: 0.85rem; color: #1565c0;">
                                ${rack.name}
                            </div>
                        ` : `
                            <button class="btn-assign-rack" data-id="${pkg.id}" 
                                    style="padding: 0.2rem 0.4rem; background: #3498db; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 0.75rem;">
                                Asignar rack
                            </button>
                        `}
                    </td>
                    <td style="padding: 0.8rem;">
                        <div style="font-size: 0.85rem;">${pkg.courierName || pkg.courier || '—'}</div>
                    </td>
                    <td style="padding: 0.8rem;">
                        <span style="display: inline-block; padding: 0.2rem 0.6rem; background: ${statusColor}20; color: ${statusColor}; border-radius: 4px; font-size: 0.85rem; font-weight: 500;">
                            ${statusText}
                        </span>
                    </td>
                    <td style="padding: 0.8rem;">
                        <div style="font-size: 0.9rem;">${new Date(pkg.fechaEscaneo || pkg.createdAt).toLocaleDateString('es-MX')}</div>
                    </td>
                    <td style="padding: 0.8rem;">
                        ${!pkg.estaAsignado ? `
                            <button class="btn-assign-manual" data-id="${pkg.id}" style="padding: 0.3rem 0.6rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                                Asignar
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
        
        // Asignar eventos
        tableBody.querySelectorAll('.btn-assign-manual').forEach(btn => {
            btn.addEventListener('click', () => showAssignModal(btn.dataset.id, container));
        });
        
        tableBody.querySelectorAll('.btn-assign-rack').forEach(btn => {
            btn.addEventListener('click', async () => {
                const pkg = await Storage.getPackageById(btn.dataset.id);
                const rack = await selectRackForPackage(container, pkg);
                if (rack) {
                    pkg.rackId = rack.id;
                    await Storage.updatePackage(pkg);
                    
                    const rackData = await Storage.getRackById(rack.id);
                    rackData.occupied = (rackData.occupied || 0) + 1;
                    await Storage.updateRack(rackData);
                    
                    await loadRecentPackages(container);
                }
            });
        });
        
    } catch (error) {
        console.error("Error cargando paquetes:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 3rem; text-align: center; color: #e74c3c;">
                    Error al cargar paquetes
                </td>
            </tr>
        `;
    }
}

async function selectRackForPackage(container, packageData) {
    return new Promise(async (resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        try {
            const racks = await Storage.getRacks();
            const availableRacks = racks.filter(rack => 
                rack.status !== 'full' && 
                (rack.occupied || 0) < (rack.capacity || 999)
            );
            
            modal.innerHTML = `
                <div style="background: white; border-radius: 10px; padding: 2rem; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h4 style="color: #2c3e50;">📍 Seleccionar Rack</h4>
                        <button id="close-rack-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7f8c8d;">×</button>
                    </div>
                    
                    <div id="racks-list" style="max-height: 300px; overflow-y: auto;">
                        ${availableRacks.length > 0 ? 
                            availableRacks.map(rack => `
                                <div class="rack-option" data-id="${rack.id}" 
                                     style="padding: 1rem; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 0.8rem; cursor: pointer;"
                                     onmouseover="this.style.borderColor='#3498db'"
                                     onmouseout="this.style.borderColor='#e0e0e0'">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="font-weight: 600; color: #2c3e50;">${rack.name}</div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 0.85rem; color: #3498db;">
                                                ${rack.occupied || 0} / ${rack.capacity || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('') : 
                            `<div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                                <p>No hay racks disponibles.</p>
                            </div>`
                        }
                    </div>
                    
                    ${availableRacks.length > 0 ? `
                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee;">
                            <div style="display: flex; gap: 1rem;">
                                <button id="btn-skip-rack" style="flex: 1; padding: 0.8rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                    Omitir
                                </button>
                                <button id="btn-confirm-rack" style="flex: 1; padding: 0.8rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;" disabled>
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
            
            document.body.appendChild(modal);
            
            let selectedRack = null;
            
            modal.querySelector('#close-rack-modal').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(null);
            });
            
            modal.querySelectorAll('.rack-option').forEach(option => {
                option.addEventListener('click', function() {
                    modal.querySelectorAll('.rack-option').forEach(opt => {
                        opt.style.borderColor = '#e0e0e0';
                    });
                    
                    this.style.borderColor = '#27ae60';
                    selectedRack = availableRacks.find(r => r.id === this.dataset.id);
                    modal.querySelector('#btn-confirm-rack').disabled = false;
                });
            });
            
            if (modal.querySelector('#btn-confirm-rack')) {
                modal.querySelector('#btn-confirm-rack').addEventListener('click', () => {
                    if (selectedRack) {
                        document.body.removeChild(modal);
                        resolve(selectedRack);
                    }
                });
            }
            
            if (modal.querySelector('#btn-skip-rack')) {
                modal.querySelector('#btn-skip-rack').addEventListener('click', () => {
                    document.body.removeChild(modal);
                    resolve(null);
                });
            }
            
        } catch (error) {
            console.error("Error seleccionando rack:", error);
            document.body.removeChild(modal);
            resolve(null);
        }
    });
}

async function loadPendingPackages(container) {
    const pendingContainer = container.querySelector("#pending-packages-container");
    
    try {
        const packages = await Storage.getPackages();
        const pendingPackages = packages.filter(pkg => !pkg.estaAsignado);
        
        container.querySelector("#pending-count-badge").textContent = pendingPackages.length;
        
        if (pendingPackages.length === 0) {
            pendingContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary); background: white; border-radius: 8px;">
                    <p>No hay paquetes pendientes</p>
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
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="pending-table-body">
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
                    </td>
                    <td style="padding: 0.8rem;">
                        <button class="btn-assign-pending" data-id="${pkg.id}" style="padding: 0.3rem 0.6rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                            Asignar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        pendingTableBody.querySelectorAll('.btn-assign-pending').forEach(btn => {
            btn.addEventListener('click', () => showAssignModal(btn.dataset.id, container));
        });
        
    } catch (error) {
        console.error("Error cargando pendientes:", error);
        pendingContainer.innerHTML = `
            <div style="color: #e74c3c; padding: 2rem; text-align: center;">
                Error
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
        const allPackages = await Storage.getPackages();
        
        modalContent.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <div style="font-weight: 500;">📦 Paquete a asignar:</div>
                    <div style="font-family: monospace; margin-top: 0.3rem;">${pkg.trackingNumber || pkg.codigoBarras}</div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Buscar cliente:</label>
                    <input type="text" id="search-client-input" placeholder="Nombre, email o casilla" style="width: 100%; padding: 0.7rem; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                
                <div id="search-results" style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 6px; padding: 0.5rem;">
                    ${clients.map(client => {
                        const clientPackageCount = allPackages.filter(p => p.clienteId === client.id).length;
                        return `
                        <div class="client-option" data-id="${client.id}" style="padding: 0.8rem; border-bottom: 1px solid #f0f0f0; cursor: pointer;">
                            <div style="display: flex; justify-content: space-between;">
                                <div>
                                    <div style="font-weight: 500;">${client.name}</div>
                                    ${client.boxNumber ? `<div style="font-size: 0.85rem; color: #3498db;">Casilla ${client.boxNumber}</div>` : ''}
                                </div>
                                <div style="text-align: right; font-size: 0.8rem;">
                                    <div style="color: #27ae60;">${client.paquetesMesActual || 0} paq/mes</div>
                                    <div style="color: #7f8c8d;">Total: ${clientPackageCount}</div>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
            
            <div style="display: flex; gap: 0.8rem; padding-top: 1rem; border-top: 1px solid #eee;">
                <button id="btn-confirm-assign" style="flex: 1; padding: 0.8rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;" disabled>
                    Asignar
                </button>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        let selectedClientId = null;
        const searchInput = modalContent.querySelector("#search-client-input");
        const searchResults = modalContent.querySelector("#search-results");
        const btnConfirm = modalContent.querySelector("#btn-confirm-assign");
        
        searchInput.addEventListener("input", function() {
            const searchTerm = this.value.toLowerCase();
            const options = searchResults.querySelectorAll(".client-option");
            
            options.forEach(option => {
                const clientText = option.textContent.toLowerCase();
                option.style.display = clientText.includes(searchTerm) ? "block" : "none";
            });
        });
        
        searchResults.querySelectorAll(".client-option").forEach(option => {
            option.addEventListener("click", function() {
                selectedClientId = this.dataset.id;
                
                searchResults.querySelectorAll(".client-option").forEach(opt => {
                    opt.style.background = "white";
                });
                
                this.style.background = "#e3f2fd";
                btnConfirm.disabled = false;
            });
        });
        
        btnConfirm.addEventListener("click", async () => {
            if (!selectedClientId) return;
            
            try {
                // Asignar paquete
                const result = await Storage.assignPackageToClient(packageId, selectedClientId);
                
                if (result.success) {
                    // Preguntar por rack
                    const rack = await selectRackForPackage(container, result.package);
                    if (rack) {
                        result.package.rackId = rack.id;
                        await Storage.updatePackage(result.package);
                        
                        const rackData = await Storage.getRackById(rack.id);
                        rackData.occupied = (rackData.occupied || 0) + 1;
                        await Storage.updateRack(rackData);
                    }
                    
                    modal.style.display = 'none';
                    
                    // Actualizar listas
                    setTimeout(async () => {
                        await loadRecentPackages(container);
                        await loadPendingPackages(container);
                        await updatePendingCount(container);
                    }, 500);
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
        
    } catch (error) {
        console.error("Error mostrando modal:", error);
        modalContent.innerHTML = `<div style="color: #e74c3c;">Error: ${error.message}</div>`;
    }
}

// Registrar función global
window.loadPackages = loadPackages;