// js/clients.js - VERSIÓN MEJORADA CON boxNumber Y VISUALIZACIÓN DE PAQUETES

console.log("👤 Módulo Clientes cargado - CON GESTIÓN DE PAQUETES");

async function loadClients(container) {
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div>
                    <h3>👤 Gestión de Clientes</h3>
                    <p style="color: var(--text-secondary); margin-top: 0.3rem; font-size: 0.95rem;">
                        Administra clientes y visualiza sus paquetes
                    </p>
                </div>
                <button id="btn-nuevo-client" style="padding: 0.6rem 1.2rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                    + Nuevo Cliente
                </button>
            </div>
        </div>

        <div id="client-form" style="display: none; margin: 1.5rem 0; padding: 1.5rem; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);"></div>

        <!-- LISTA MEJORADA CON MÁS INFORMACIÓN -->
        <div id="clients-list" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <thead>
                    <tr style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white;">
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Cliente</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Casilla</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Paquetes</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Plan</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Vencimiento</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Contacto</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="clients-table-body">
                    <!-- Las filas se llenarán aquí -->
                </tbody>
            </table>
        </div>

        <!-- MODAL PARA VER PAQUETES DEL CLIENTE -->
        <div id="client-packages-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 10px; padding: 2rem; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h4 id="modal-client-name" style="color: #2c3e50;"></h4>
                    <button id="btn-close-packages-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7f8c8d;">×</button>
                </div>
                <div id="client-packages-content">
                    <!-- Paquetes del cliente se cargarán aquí -->
                </div>
            </div>
        </div>
    `;

    const formDiv = container.querySelector("#client-form");
    const tableBody = container.querySelector("#clients-table-body");
    const btnNuevo = container.querySelector("#btn-nuevo-client");
    const modal = container.querySelector("#client-packages-modal");
    const btnCloseModal = container.querySelector("#btn-close-packages-modal");

    btnNuevo.addEventListener("click", () => mostrarFormularioClient(formDiv, null, tableBody));
    btnCloseModal.addEventListener("click", () => {
        modal.style.display = 'none';
    });

    await renderizarListaClients(tableBody, formDiv, modal);
}

async function renderizarListaClients(tableBody, formDiv, modal) {
    try {
        const clients = await Storage.getClients();
        const plans = await Storage.getPlans();
        const packages = await Storage.getPackages();
        
        const planMap = plans.reduce((map, p) => {
            map[p.id] = p;
            return map;
        }, {});

        if (clients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
                        <h4>No hay clientes registrados</h4>
                        <p>Crea tu primer cliente para empezar a gestionar paquetes.</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Contar paquetes por cliente
        const clientPackagesCount = {};
        const clientPendingPackages = {};
        
        packages.forEach(pkg => {
            if (pkg.clienteId) {
                if (!clientPackagesCount[pkg.clienteId]) {
                    clientPackagesCount[pkg.clienteId] = 0;
                    clientPendingPackages[pkg.clienteId] = 0;
                }
                clientPackagesCount[pkg.clienteId]++;
                if (pkg.status === 'pendiente') {
                    clientPendingPackages[pkg.clienteId]++;
                }
            }
        });

        tableBody.innerHTML = clients.map(client => {
            const plan = planMap[client.planId] || { name: 'Sin plan', periodo: '', paquetesIncluidos: 0 };
            const vencimiento = client.vencimiento ? new Date(client.vencimiento) : null;
            const registro = client.fechaRegistro ? new Date(client.fechaRegistro).toLocaleDateString('es-MX') : '—';
            
            // Calcular estado de vencimiento
            let estado = '';
            let estadoColor = '';
            let diasRestantes = '';
            
            if (vencimiento) {
                const hoy = new Date();
                const diffTime = vencimiento - hoy;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) {
                    estado = 'Vencido';
                    estadoColor = '#dc3545';
                    diasRestantes = `Hace ${Math.abs(diffDays)} días`;
                } else if (diffDays <= 7) {
                    estado = 'Por vencer';
                    estadoColor = '#ffc107';
                    diasRestantes = `${diffDays} días`;
                } else {
                    estado = 'Activo';
                    estadoColor = '#28a745';
                    diasRestantes = `${diffDays} días`;
                }
            }

            // Paquetes del cliente
            const totalPackages = clientPackagesCount[client.id] || 0;
            const pendingPackages = clientPendingPackages[client.id] || 0;
            const packagesThisMonth = client.paquetesMesActual || 0;
            const limit = plan.paquetesIncluidos || 0;
            const percentage = limit > 0 ? Math.min((packagesThisMonth / limit) * 100, 100) : 0;

            return `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="font-weight: 600; font-size: 1.05rem; color: #2c3e50;">${client.name}</div>
                        ${client.notas ? `<div style="font-size: 0.85rem; color: #7f8c8d; margin-top: 0.3rem;">${client.notas}</div>` : ''}
                        <div style="font-size: 0.8rem; color: #95a5a6; margin-top: 0.3rem;">
                            Registro: ${registro}
                        </div>
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        ${client.boxNumber ? `
                            <div style="display: inline-block; padding: 0.4rem 0.8rem; background: #3498db; color: white; border-radius: 6px; font-weight: 600; font-size: 1.1rem;">
                                ${client.boxNumber}
                            </div>
                        ` : `
                            <div style="color: #95a5a6; font-style: italic; padding: 0.4rem 0;">
                                Sin casilla
                            </div>
                        `}
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="margin-bottom: 0.5rem;">
                            <button class="btn-view-packages" data-id="${client.id}" 
                                    style="padding: 0.4rem 0.8rem; background: #9b59b6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; width: 100%;">
                                📦 Ver Paquetes (${totalPackages})
                            </button>
                        </div>
                        
                        <!-- CONTADOR DE PAQUETES MEJORADO -->
                        <div style="background: #f8f9fa; padding: 0.6rem; border-radius: 6px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
                                <div style="font-size: 0.85rem; color: #2c3e50;">Este mes:</div>
                                <div style="font-weight: 600; color: ${packagesThisMonth > limit ? '#e74c3c' : '#27ae60'}">
                                    ${packagesThisMonth}${limit > 0 ? `/${limit}` : ''}
                                </div>
                            </div>
                            <div style="height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${percentage}%; 
                                    background: ${packagesThisMonth > limit ? '#e74c3c' : 
                                                packagesThisMonth >= limit * 0.8 ? '#f39c12' : '#2ecc71'};">
                                </div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 0.3rem;">
                                <div style="font-size: 0.75rem; color: #7f8c8d;">Total: ${totalPackages}</div>
                                ${pendingPackages > 0 ? `<div style="font-size: 0.75rem; color: #e67e22;">Pendientes: ${pendingPackages}</div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="display: inline-block; padding: 0.3rem 0.8rem; background: #e3f2fd; border-radius: 4px; font-size: 0.85rem; color: #1565c0; margin-bottom: 0.3rem;">
                            ${plan.name}
                        </div>
                        ${plan.periodo ? `<div style="font-size: 0.8rem; color: #7f8c8d;">${plan.periodo}</div>` : ''}
                        ${plan.precioMensual ? `<div style="font-size: 0.8rem; color: #27ae60; font-weight: 500;">$${plan.precioMensual}/mes</div>` : ''}
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="font-weight: 500;">${vencimiento ? vencimiento.toLocaleDateString('es-MX') : '—'}</div>
                        ${diasRestantes ? `
                            <div style="font-size: 0.85rem; padding: 0.2rem 0.5rem; background: ${estado === 'Vencido' ? '#f8d7da' : estado === 'Por vencer' ? '#fff3cd' : '#d4edda'}; 
                                color: ${estado === 'Vencido' ? '#721c24' : estado === 'Por vencer' ? '#856404' : '#155724'}; 
                                border-radius: 4px; margin-top: 0.3rem; display: inline-block;">
                                ${estado} • ${diasRestantes}
                            </div>
                        ` : ''}
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="font-size: 0.9rem; line-height: 1.4;">
                            ${client.telefono ? `
                                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem;">
                                    <span style="color: #3498db;">📱</span>
                                    <span>${client.telefono}</span>
                                </div>
                            ` : ''}
                            ${client.email ? `
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="color: #9b59b6;">📧</span>
                                    <span style="word-break: break-all;">${client.email}</span>
                                </div>
                            ` : ''}
                            ${!client.telefono && !client.email ? '<span style="color: #95a5a6; font-style: italic;">Sin contacto</span>' : ''}
                        </div>
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <button class="btn-edit" data-id="${client.id}" 
                                    style="background: #f39c12; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; text-align: center;">
                                ✏️ Editar
                            </button>
                            <button class="btn-view-packages" data-id="${client.id}" 
                                    style="background: #3498db; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; text-align: center;">
                                📦 Paquetes
                            </button>
                            <button class="btn-delete" data-id="${client.id}" 
                                    style="background: #e74c3c; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; text-align: center;">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // ASIGNAR EVENTOS
        tableBody.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editarCliente(btn.dataset.id, formDiv, tableBody));
        });
        
        tableBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => eliminarCliente(btn.dataset.id, tableBody, formDiv));
        });
        
        tableBody.querySelectorAll('.btn-view-packages').forEach(btn => {
            btn.addEventListener('click', () => mostrarPaquetesCliente(btn.dataset.id, modal));
        });

    } catch (err) {
        console.error("Error al renderizar clientes:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 3rem; text-align: center; color: #e74c3c;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                    <h4>Error al cargar clientes</h4>
                    <p>Revisa la consola para más detalles.</p>
                </td>
            </tr>
        `;
    }
}

// FUNCIONES DE FORMULARIO - MODIFICADA PARA INCLUIR boxNumber
function mostrarFormularioClient(formDiv, client = null, tableBody) {
    formDiv.innerHTML = `
        <form id="form-client">
            <h4 style="margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid var(--border);">
                ${client ? '✏️ Editar Cliente' : '👤 Nuevo Cliente'}
            </h4>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <!-- COLUMNA IZQUIERDA -->
                <div style="grid-column: 1;">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre completo *</label>
                        <input type="text" id="nombre" value="${client ? client.name : ''}" required 
                               style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Número de Casilla (PO Box)</label>
                        <input type="text" id="boxNumber" value="${client ? client.boxNumber || '' : ''}" 
                               placeholder="Ej: 567, A12, 100B"
                               style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                        <div style="font-size: 0.8rem; color: #7f8c8d; margin-top: 0.3rem;">
                            Importante para asignación automática de paquetes
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Teléfono</label>
                        <input type="tel" id="telefono" value="${client ? client.telefono || '' : ''}" 
                               style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;" 
                               placeholder="(915) 555-1234">
                    </div>
                </div>
                
                <!-- COLUMNA DERECHA -->
                <div style="grid-column: 2;">
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Fecha de registro *</label>
                        <input type="date" id="fechaRegistro" 
                               value="${client ? client.fechaRegistro.slice(0,10) : new Date().toISOString().slice(0,10)}" 
                               required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Plan asignado *</label>
                        <select id="planId" required 
                                style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                            <option value="">Selecciona un plan</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email</label>
                        <input type="email" id="email" value="${client ? client.email || '' : ''}" 
                               style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;" 
                               placeholder="cliente@email.com">
                    </div>
                </div>
                
                <!-- NOTAS (ANCHO COMPLETO) -->
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Notas</label>
                    <textarea id="notas" rows="3" 
                              style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;" 
                              placeholder="Notas opcionales (dirección, preferencias, etc.)">${client ? client.notas || '' : ''}</textarea>
                </div>
            </div>

            <!-- INFORMACIÓN DEL PLAN (se llenará dinámicamente) -->
            <div id="plan-info" style="background: #e8f4fc; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; display: none;">
                <div style="font-weight: 500; margin-bottom: 0.5rem; color: #2c3e50;">Información del Plan Seleccionado:</div>
                <div id="plan-details"></div>
            </div>

            <div style="display: flex; gap: 0.8rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                <button type="submit" 
                        style="flex: 1; padding: 0.8rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                    💾 Guardar Cliente
                </button>
                <button type="button" id="cancelar" 
                        style="flex: 1; padding: 0.8rem 1.5rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    ❌ Cancelar
                </button>
            </div>
        </form>
    `;

    formDiv.style.display = 'block';

    // Cargar planes en el select
    Storage.getPlans().then(plans => {
        const select = formDiv.querySelector("#planId");
        select.innerHTML = '<option value="">Selecciona un plan</option>';
        plans.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.periodo} - $${p.precioMensual})`;
            if (client && client.planId === p.id) opt.selected = true;
            select.appendChild(opt);
        });

        if (client && client.planId) select.value = client.planId;
        
        // Mostrar info del plan seleccionado
        select.addEventListener("change", function() {
            const planId = this.value;
            const planInfo = formDiv.querySelector("#plan-info");
            const planDetails = formDiv.querySelector("#plan-details");
            
            if (planId) {
                const selectedPlan = plans.find(p => p.id === planId);
                if (selectedPlan) {
                    planInfo.style.display = 'block';
                    planDetails.innerHTML = `
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.9rem;">
                            <div><strong>Nombre:</strong> ${selectedPlan.name}</div>
                            <div><strong>Período:</strong> ${selectedPlan.periodo}</div>
                            <div><strong>Precio:</strong> $${selectedPlan.precioMensual}/mes</div>
                            <div><strong>Paquetes incluidos:</strong> ${selectedPlan.paquetesIncluidos || 'Ilimitados'}</div>
                            ${selectedPlan.descripcion ? `<div style="grid-column: span 2;"><strong>Descripción:</strong> ${selectedPlan.descripcion}</div>` : ''}
                        </div>
                    `;
                }
            } else {
                planInfo.style.display = 'none';
            }
        });
        
        // Disparar cambio inicial si hay plan seleccionado
        if (client && client.planId) {
            select.dispatchEvent(new Event('change'));
        }
    });

    const form = formDiv.querySelector("#form-client");
    form.addEventListener("submit", async e => {
        e.preventDefault();

        const datos = {
            name: form.querySelector("#nombre").value.trim(),
            fechaRegistro: form.querySelector("#fechaRegistro").value,
            telefono: form.querySelector("#telefono").value.trim(),
            email: form.querySelector("#email").value.trim(),
            boxNumber: form.querySelector("#boxNumber").value.trim() || null,
            planId: form.querySelector("#planId").value,
            notas: form.querySelector("#notas").value.trim()
        };

        if (!datos.fechaRegistro || !datos.planId) {
            alert("Fecha de registro y plan son obligatorios");
            return;
        }

        // Calcular vencimiento basado en periodo del plan
        const plan = await Storage.getPlanById(datos.planId);
        const registro = new Date(datos.fechaRegistro);
        let vencimiento = new Date(registro);
        if (plan.periodo === 'semanal') {
            vencimiento.setDate(vencimiento.getDate() + 7);
        } else if (plan.periodo === 'mensual') {
            vencimiento.setMonth(vencimiento.getMonth() + 1);
        } else if (plan.periodo === 'anual') {
            vencimiento.setFullYear(vencimiento.getFullYear() + 1);
        }
        datos.vencimiento = vencimiento.toISOString();

        // Inicializar contadores de paquetes si es nuevo cliente
        if (!client) {
            datos.paquetesEntregados = 0;
            datos.paquetesMesActual = 0;
            datos.mesContador = new Date().getMonth();
            datos.ultimoReinicio = new Date().toISOString().split('T')[0];
        }

        try {
            if (client) {
                const clientActual = await Storage.getClientById(client.id);
                await Storage.updateClient({ ...clientActual, ...datos });
            } else {
                await Storage.addClient(datos);
            }
            formDiv.style.display = 'none';
            await renderizarListaClients(tableBody, formDiv);
        } catch (err) {
            alert("Error al guardar: " + err.message);
        }
    });

    form.querySelector("#cancelar").addEventListener("click", () => {
        formDiv.style.display = 'none';
    });
}

// FUNCIÓN PARA MOSTRAR PAQUETES DEL CLIENTE
async function mostrarPaquetesCliente(clientId, modal) {
    try {
        const client = await Storage.getClientById(clientId);
        const packages = await Storage.getPackages();
        const plans = await Storage.getPlans();
        
        // Filtrar paquetes del cliente
        const clientPackages = packages.filter(pkg => pkg.clienteId === clientId);
        const plan = plans.find(p => p.id === client.planId) || {};
        
        // Configurar modal
        modal.querySelector("#modal-client-name").textContent = `📦 Paquetes de ${client.name}`;
        const modalContent = modal.querySelector("#client-packages-content");
        
        // Agrupar paquetes por estado
        const pendingPackages = clientPackages.filter(p => p.status === 'pendiente');
        const deliveredPackages = clientPackages.filter(p => p.status === 'entregado');
        const otherPackages = clientPackages.filter(p => !['pendiente', 'entregado'].includes(p.status));
        
        modalContent.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="background: #e8f4fc; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📦</div>
                        <div style="font-size: 1.8rem; font-weight: 600; color: #2c3e50;">${clientPackages.length}</div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">Total paquetes</div>
                    </div>
                    <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⏳</div>
                        <div style="font-size: 1.8rem; font-weight: 600; color: #e67e22;">${pendingPackages.length}</div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">Pendientes</div>
                    </div>
                    <div style="background: #e8f4fc; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📊</div>
                        <div style="font-size: 1.8rem; font-weight: 600; color: ${client.paquetesMesActual > (plan.paquetesIncluidos || 0) ? '#e74c3c' : '#27ae60'}">
                            ${client.paquetesMesActual || 0}
                        </div>
                        <div style="font-size: 0.9rem; color: #7f8c8d;">
                            Este mes ${plan.paquetesIncluidos ? `(${plan.paquetesIncluidos} límite)` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- BARRA DE PROGRESO -->
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <div style="font-weight: 500;">Uso mensual de paquetes</div>
                        <div style="font-weight: 600; color: ${client.paquetesMesActual > (plan.paquetesIncluidos || 0) ? '#e74c3c' : '#27ae60'}">
                            ${client.paquetesMesActual || 0}${plan.paquetesIncluidos ? `/${plan.paquetesIncluidos}` : ''}
                        </div>
                    </div>
                    <div style="height: 12px; background: #e9ecef; border-radius: 6px; overflow: hidden;">
                        <div style="height: 100%; width: ${plan.paquetesIncluidos ? Math.min((client.paquetesMesActual || 0) / plan.paquetesIncluidos * 100, 100) : 0}%; 
                            background: ${client.paquetesMesActual > (plan.paquetesIncluidos || 0) ? '#e74c3c' : 
                                        (client.paquetesMesActual || 0) >= (plan.paquetesIncluidos || 0) * 0.8 ? '#f39c12' : '#2ecc71'};">
                        </div>
                    </div>
                </div>
                
                <!-- LISTA DE PAQUETES -->
                <div style="margin-bottom: 1.5rem;">
                    <h5 style="margin-bottom: 0.8rem; color: #2c3e50;">📋 Lista de Paquetes</h5>
                    ${clientPackages.length === 0 ? `
                        <div style="text-align: center; padding: 2rem; color: #7f8c8d;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                            <p>Este cliente no tiene paquetes registrados.</p>
                        </div>
                    ` : `
                        <div style="max-height: 300px; overflow-y: auto;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
                                        <th style="padding: 0.8rem; text-align: left;">Tracking</th>
                                        <th style="padding: 0.8rem; text-align: left;">Courier</th>
                                        <th style="padding: 0.8rem; text-align: left;">Estado</th>
                                        <th style="padding: 0.8rem; text-align: left;">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${clientPackages.map(pkg => `
                                        <tr style="border-bottom: 1px solid #eee;">
                                            <td style="padding: 0.8rem;">
                                                <div style="font-family: monospace; font-size: 0.9rem;">${pkg.trackingNumber || pkg.codigoBarras}</div>
                                                ${pkg.nombre ? `<div style="font-size: 0.8rem; color: #7f8c8d;">${pkg.nombre}</div>` : ''}
                                            </td>
                                            <td style="padding: 0.8rem;">
                                                <div style="font-size: 0.9rem;">${pkg.courierName || pkg.courier || '—'}</div>
                                            </td>
                                            <td style="padding: 0.8rem;">
                                                <span style="display: inline-block; padding: 0.2rem 0.5rem; 
                                                    background: ${pkg.status === 'entregado' ? '#d4edda' : 
                                                                pkg.status === 'pendiente' ? '#fff3cd' : '#e8f4fc'}; 
                                                    color: ${pkg.status === 'entregado' ? '#155724' : 
                                                            pkg.status === 'pendiente' ? '#856404' : '#2c3e50'}; 
                                                    border-radius: 4px; font-size: 0.8rem;">
                                                    ${pkg.status || 'registrado'}
                                                </span>
                                            </td>
                                            <td style="padding: 0.8rem;">
                                                <div style="font-size: 0.9rem;">${new Date(pkg.fechaEscaneo || pkg.createdAt).toLocaleDateString('es-MX')}</div>
                                                <div style="font-size: 0.8rem; color: #7f8c8d;">${new Date(pkg.fechaEscaneo || pkg.createdAt).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}</div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `}
                </div>
                
                <!-- INFORMACIÓN DEL CLIENTE -->
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                    <h6 style="margin-bottom: 0.8rem; color: #2c3e50;">👤 Información del Cliente</h6>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.8rem; font-size: 0.9rem;">
                        <div><strong>Casilla:</strong> ${client.boxNumber || 'No asignada'}</div>
                        <div><strong>Plan:</strong> ${plan.name || 'Sin plan'}</div>
                        <div><strong>Email:</strong> ${client.email || '—'}</div>
                        <div><strong>Teléfono:</strong> ${client.telefono || '—'}</div>
                        <div><strong>Registro:</strong> ${new Date(client.fechaRegistro).toLocaleDateString('es-MX')}</div>
                        <div><strong>Vencimiento:</strong> ${client.vencimiento ? new Date(client.vencimiento).toLocaleDateString('es-MX') : '—'}</div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error("Error mostrando paquetes del cliente:", error);
        modal.querySelector("#client-packages-content").innerHTML = `
            <div style="color: #e74c3c; text-align: center; padding: 2rem;">
                Error al cargar los paquetes: ${error.message}
            </div>
        `;
    }
}

// FUNCIONES AUXILIARES - SIN CAMBIOS
async function editarCliente(id, formDiv, tableBody) {
    const client = await Storage.getClientById(id);
    if (client) mostrarFormularioClient(formDiv, client, tableBody);
}

async function eliminarCliente(id, tableBody, formDiv) {
    if (!confirm("¿Eliminar este cliente? Sus paquetes se mantendrán pero sin cliente asignado.")) return;
    try {
        await Storage.deleteClient(id);
        await renderizarListaClients(tableBody, formDiv);
    } catch (err) {
        alert("No se pudo eliminar: " + err.message);
    }
}

// Registrar función global
window.loadClients = loadClients;