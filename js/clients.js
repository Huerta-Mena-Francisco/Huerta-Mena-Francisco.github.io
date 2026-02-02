// js/clients.js - Clientes con fecha registro y vencimiento calculado (VERSIÓN CON LISTAS)

console.log("Módulo Clientes cargado");

async function loadClients(container) {
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <h3>Gestión de Clientes</h3>
            <button id="btn-nuevo-client" style="padding: 0.6rem 1.2rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">
                + Nuevo Cliente
            </button>
        </div>

        <div id="client-form" style="display: none; margin: 1.5rem 0; padding: 1.5rem; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);"></div>

        <!-- LISTA EN FORMATO TABULAR -->
        <div id="clients-list" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Cliente</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Plan</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Registro</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Vencimiento</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Contacto</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Estado</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="clients-table-body">
                    <!-- Las filas se llenarán aquí -->
                </tbody>
            </table>
        </div>
    `;

    const formDiv = container.querySelector("#client-form");
    const tableBody = container.querySelector("#clients-table-body");
    const btnNuevo = container.querySelector("#btn-nuevo-client");

    btnNuevo.addEventListener("click", () => mostrarFormularioClient(formDiv, null, tableBody));
    await renderizarListaClients(tableBody, formDiv);
}

async function renderizarListaClients(tableBody, formDiv) {
    try {
        const clients = await Storage.getClients();
        const plans = await Storage.getPlans();
        const planMap = plans.reduce((map, p) => {
            map[p.id] = p;
            return map;
        }, {});

        if (clients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        No hay clientes registrados
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = clients.map(client => {
            const plan = planMap[client.planId] || { name: 'Sin plan', periodo: '' };
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

            return `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; vertical-align: top;">
                        <strong>${client.name}</strong>
                        ${client.notas ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem; max-width: 200px;">${client.notas}</div>` : ''}
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                    <span style="display: inline-block; padding: 0.3rem 0.8rem; background: #e3f2fd; border-radius: 4px; font-size: 0.85rem; color: #1565c0;">
                        ${plan.name}
                    </span>
                    ${plan.periodo ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">${plan.periodo}</div>` : ''}
                    
                    <!-- CONTADOR DE PAQUETES (¡NUEVO!) -->
                    <div style="margin-top: 0.5rem; font-size: 0.85rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="flex: 1; background: #e9ecef; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${plan.paquetesIncluidos ? Math.min((client.paquetesMesActual || 0) / plan.paquetesIncluidos * 100, 100) : 0}%; 
                                    background: ${(client.paquetesMesActual || 0) > (plan.paquetesIncluidos || 0) ? '#e74c3c' : 
                                                (client.paquetesMesActual || 0) >= (plan.paquetesIncluidos || 0) * 0.8 ? '#f39c12' : '#2ecc71'};">
                                </div>
                            </div>
                            <div style="font-weight: 600; color: ${(client.paquetesMesActual || 0) > (plan.paquetesIncluidos || 0) ? '#e74c3c' : 'inherit'}">
                                ${client.paquetesMesActual || 0}
                                ${plan.paquetesIncluidos ? `/ ${plan.paquetesIncluidos}` : ''}
                            </div>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">
                            ${(client.paquetesEntregados || 0)} totales
                        </div>
                    </div>
                </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="font-size: 0.9rem;">${registro}</div>
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="font-size: 0.9rem; font-weight: 500;">${vencimiento ? vencimiento.toLocaleDateString('es-MX') : '—'}</div>
                        ${diasRestantes ? `<div style="font-size: 0.8rem; color: ${estadoColor};">${diasRestantes}</div>` : ''}
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="font-size: 0.9rem; line-height: 1.4;">
                            ${client.telefono ? `<div><strong>Tel:</strong> ${client.telefono}</div>` : ''}
                            ${client.email ? `<div><strong>Email:</strong> ${client.email}</div>` : ''}
                            ${!client.telefono && !client.email ? '<span style="color: #95a5a6; font-style: italic;">Sin contacto</span>' : ''}
                        </div>
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        ${estado ? `
                            <span style="display: inline-block; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 500; background: ${estado === 'Vencido' ? '#f8d7da' : estado === 'Por vencer' ? '#fff3cd' : '#d4edda'}; color: ${estado === 'Vencido' ? '#721c24' : estado === 'Por vencer' ? '#856404' : '#155724'};">
                                ${estado}
                            </span>
                        ` : '—'}
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn-edit" data-id="${client.id}" style="background: #f39c12; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Editar</button>
                            <button class="btn-delete" data-id="${client.id}" style="background: #e74c3c; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // ASIGNAR EVENTOS - MANTENIENDO LAS MISMAS FUNCIONES
        tableBody.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => editarCliente(btn.dataset.id, formDiv, tableBody)));
        tableBody.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => eliminarCliente(btn.dataset.id, tableBody, formDiv)));

    } catch (err) {
        console.error("Error al renderizar clientes:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 3rem; text-align: center; color: #e74c3c;">
                    Error al cargar clientes. Revisa la consola para más detalles.
                </td>
            </tr>
        `;
    }
}

// FUNCIONES DE FORMULARIO - NO MODIFICADAS (solo mejoras visuales)
function mostrarFormularioClient(formDiv, client = null, tableBody) {
    formDiv.innerHTML = `
        <form id="form-client">
            <h4 style="margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid var(--border);">${client ? 'Editar Cliente' : 'Nuevo Cliente'}</h4>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre completo*</label>
                    <input type="text" id="nombre" value="${client ? client.name : ''}" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Fecha de registro*</label>
                    <input type="date" id="fechaRegistro" value="${client ? client.fechaRegistro.slice(0,10) : new Date().toISOString().slice(0,10)}" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Teléfono</label>
                    <input type="tel" id="telefono" value="${client ? client.telefono || '' : ''}" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;" placeholder="Opcional">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Email</label>
                    <input type="email" id="email" value="${client ? client.email || '' : ''}" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;" placeholder="Opcional">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Plan asignado*</label>
                    <select id="planId" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                        <option value="">Selecciona un plan</option>
                    </select>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Notas</label>
                <textarea id="notas" rows="3" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;" placeholder="Notas opcionales...">${client ? client.notas || '' : ''}</textarea>
            </div>

            <div style="display: flex; gap: 0.8rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                <button type="submit" style="flex: 1; padding: 0.8rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Guardar</button>
                <button type="button" id="cancelar" style="flex: 1; padding: 0.8rem 1.5rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
            </div>
        </form>
    `;

    formDiv.style.display = 'block';

    // Cargar planes en el select - MANTENIENDO LA MISMA LÓGICA
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
    });

    const form = formDiv.querySelector("#form-client");
    form.addEventListener("submit", async e => {
        e.preventDefault();

        const datos = {
            name: form.querySelector("#nombre").value.trim(),
            fechaRegistro: form.querySelector("#fechaRegistro").value,
            telefono: form.querySelector("#telefono").value.trim(),
            email: form.querySelector("#email").value.trim(),
            planId: form.querySelector("#planId").value,
            notas: form.querySelector("#notas").value.trim()
        };

        if (!datos.fechaRegistro || !datos.planId) {
            alert("Fecha de registro y plan son obligatorios");
            return;
        }

        // Calcular vencimiento basado en periodo del plan - MANTENIENDO LA MISMA LÓGICA
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

// FUNCIONES AUXILIARES - NO MODIFICADAS
async function editarCliente(id, formDiv, tableBody) {
    const client = await Storage.getClientById(id);
    if (client) mostrarFormularioClient(formDiv, client, tableBody);
}

async function eliminarCliente(id, tableBody, formDiv) {
    if (!confirm("¿Eliminar este cliente? Todos sus paquetes asociados se mantendrán.")) return;
    try {
        await Storage.deleteClient(id);
        await renderizarListaClients(tableBody, formDiv);
    } catch (err) {
        alert("No se pudo eliminar: " + err.message);
    }
}