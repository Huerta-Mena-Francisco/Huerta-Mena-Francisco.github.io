// js/packages.js - Módulo Paquetes completo y funcional (VERSIÓN CON LISTAS)

console.log("Módulo Paquetes cargado");

async function loadPackages(container) {
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <h3>Gestión de Paquetes</h3>
            <button id="btn-nuevo-package" style="padding: 0.6rem 1.2rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">
                + Nuevo Paquete
            </button>
        </div>

        <div id="package-form" style="display: none; margin: 1.5rem 0; padding: 1.5rem; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);"></div>

        <!-- LISTA EN FORMATO TABULAR -->
        <div id="packages-list" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Paquete</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Código</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Cliente</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Rack</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Courier</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Detalles</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Estado</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="packages-table-body">
                    <!-- Las filas se llenarán aquí -->
                </tbody>
            </table>
        </div>
    `;

    const formDiv = container.querySelector("#package-form");
    const tableBody = container.querySelector("#packages-table-body");
    const btnNuevo = container.querySelector("#btn-nuevo-package");

    btnNuevo.addEventListener("click", () => mostrarFormularioPackage(formDiv, null, tableBody));
    await renderizarListaPackages(tableBody, formDiv);
}

async function renderizarListaPackages(tableBody, formDiv) {
    try {
        const packages = await Storage.getPackages();
        const clients = await Storage.getClients();
        const racks = await Storage.getRacks();
        const clientMap = clients.reduce((map, c) => (map[c.id] = c.name, map), {});
        const rackMap = racks.reduce((map, r) => (map[r.id] = r.name, map), {});

        if (packages.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        No hay paquetes registrados
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = packages.map(pkg => {
            const statusColor = pkg.status === 'entregado' ? '#28a745' : 
                                pkg.status === 'retirado' ? '#17a2b8' : 
                                pkg.status === 'perdido' ? '#dc3545' : '#ffc107';
            
            const statusBg = pkg.status === 'entregado' ? '#d4edda' : 
                             pkg.status === 'retirado' ? '#d1ecf1' : 
                             pkg.status === 'perdido' ? '#f8d7da' : '#fff3cd';
            
            const statusText = pkg.status === 'entregado' ? '#155724' : 
                               pkg.status === 'retirado' ? '#0c5460' : 
                               pkg.status === 'perdido' ? '#721c24' : '#856404';

            return `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 1rem; vertical-align: top;">
                        <strong>${pkg.nombre}</strong>
                        ${pkg.notas ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem; max-width: 200px;">${pkg.notas}</div>` : ''}
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <code style="background: #f8f9fa; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace; font-size: 0.9rem;">
                            ${pkg.codigoBarras || '—'}
                        </code>
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="font-size: 0.9rem;">
                            ${clientMap[pkg.clienteId] || pkg.destinatarioNuevo || '<span style="color: #95a5a6; font-style: italic;">Sin cliente</span>'}
                        </div>
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        ${rackMap[pkg.rackId] ? `
                            <span style="display: inline-block; padding: 0.3rem 0.8rem; background: #e3f2fd; border-radius: 4px; font-size: 0.85rem; color: #1565c0;">
                                ${rackMap[pkg.rackId]}
                            </span>
                        ` : '<span style="color: #95a5a6; font-style: italic;">Sin rack</span>'}
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="font-size: 0.9rem;">
                            ${pkg.courierName || pkg.courier || '<span style="color: #95a5a6; font-style: italic;">No especificado</span>'}
                        </div>
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="font-size: 0.85rem; line-height: 1.4;">
                            ${pkg.peso ? `<div><strong>Peso:</strong> ${pkg.peso} kg</div>` : ''}
                            ${pkg.dimensiones ? `<div><strong>Dim:</strong> ${pkg.dimensiones}</div>` : ''}
                            ${!pkg.peso && !pkg.dimensiones ? '<span style="color: #95a5a6; font-style: italic;">Sin detalles</span>' : ''}
                        </div>
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <span style="display: inline-block; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 500; background: ${statusBg}; color: ${statusText};">
                            ${pkg.status || 'pendiente'}
                        </span>
                        ${pkg.createdAt ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem;">${new Date(pkg.createdAt).toLocaleDateString('es-MX')}</div>` : ''}
                    </td>
                    <td style="padding: 1rem; vertical-align: top;">
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn-edit" data-id="${pkg.id}" style="background: #f39c12; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Editar</button>
                            <button class="btn-delete" data-id="${pkg.id}" style="background: #e74c3c; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // ASIGNAR EVENTOS - MANTENIENDO LAS MISMAS FUNCIONES
        tableBody.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => mostrarFormularioPackage(formDiv, { id: btn.dataset.id }, tableBody)));
        tableBody.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => eliminarPackage(btn.dataset.id, tableBody, formDiv)));

    } catch (err) {
        console.error("Error al cargar paquetes:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 3rem; text-align: center; color: #e74c3c;">
                    Error al cargar paquetes. Revisa la consola para más detalles.
                </td>
            </tr>
        `;
    }
}

// FUNCIONES DE FORMULARIO - NO MODIFICADAS (solo mejoras visuales)
async function mostrarFormularioPackage(formDiv, pkg = null, tableBody) {
    let currentPkg = pkg ? await Storage.getPackageById(pkg.id) : null;

    formDiv.innerHTML = `
        <form id="form-package">
            <h4 style="margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid var(--border);">${currentPkg ? 'Editar Paquete' : 'Nuevo Paquete'}</h4>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre del paquete*</label>
                    <input type="text" id="nombre" value="${currentPkg ? currentPkg.nombre : ''}" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Código de barras*</label>
                    <input type="text" id="codigoBarras" value="${currentPkg ? currentPkg.codigoBarras : ''}" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Cliente existente</label>
                    <select id="clienteId" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                        <option value="">Selecciona cliente</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">O nombre nuevo</label>
                    <input type="text" id="destinatarioNuevo" placeholder="Escribe nombre nuevo" value="${currentPkg ? currentPkg.destinatarioNuevo : ''}" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Rack*</label>
                    <select id="rackId" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                        <option value="">Selecciona rack</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Courier</label>
                    <select id="courierId" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                        <option value="">Selecciona courier</option>
                        <option value="dhl" ${currentPkg && currentPkg.courier === 'dhl' ? 'selected' : ''}>DHL</option>
                        <option value="fedex" ${currentPkg && currentPkg.courier === 'fedex' ? 'selected' : ''}>FedEx</option>
                        <option value="ups" ${currentPkg && currentPkg.courier === 'ups' ? 'selected' : ''}>UPS</option>
                        <option value="usps" ${currentPkg && currentPkg.courier === 'usps' ? 'selected' : ''}>USPS</option>
                        <option value="estafeta" ${currentPkg && currentPkg.courier === 'estafeta' ? 'selected' : ''}>Estafeta</option>
                        <option value="redpack" ${currentPkg && currentPkg.courier === 'redpack' ? 'selected' : ''}>RedPack</option>
                        <option value="other" ${currentPkg && currentPkg.courier === 'other' ? 'selected' : ''}>Otra</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Peso (kg)</label>
                    <input type="number" id="peso" value="${currentPkg ? currentPkg.peso : ''}" min="0" step="0.01" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Dimensiones (cm)</label>
                    <input type="text" id="dimensiones" value="${currentPkg ? currentPkg.dimensiones : ''}" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;" placeholder="Ej: 30x20x15">
                </div>
            </div>

            <div style="margin-bottom: 1rem; display: ${currentPkg && currentPkg.courier === 'other' ? 'block' : 'none'};" id="courier-otro-container">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Especifica courier</label>
                <input type="text" id="courierOtro" placeholder="Nombre del courier" value="${currentPkg && currentPkg.courierName ? currentPkg.courierName : ''}" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Notas</label>
                <textarea id="notas" rows="3" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;" placeholder="Notas opcionales...">${currentPkg ? currentPkg.notas || '' : ''}</textarea>
            </div>

            <div style="display: flex; gap: 0.8rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                <button type="submit" style="flex: 1; padding: 0.8rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Guardar</button>
                <button type="button" id="cancelar" style="flex: 1; padding: 0.8rem 1.5rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
            </div>
        </form>
    `;

    formDiv.style.display = 'block';

    // Cargar clientes - MANTENIENDO LA MISMA LÓGICA
    Storage.getClients().then(clients => {
        const select = formDiv.querySelector("#clienteId");
        select.innerHTML = '<option value="">Selecciona cliente</option>';
        clients.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.name;
            if (currentPkg && currentPkg.clienteId === c.id) opt.selected = true;
            select.appendChild(opt);
        });
    });

    // Cargar racks - MANTENIENDO LA MISMA LÓGICA
    Storage.getRacks().then(racks => {
        const select = formDiv.querySelector("#rackId");
        select.innerHTML = '<option value="">Selecciona rack</option>';
        racks.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.id;
            opt.textContent = r.name;
            if (currentPkg && currentPkg.rackId === r.id) opt.selected = true;
            select.appendChild(opt);
        });
    });

    // Manejar "Otra" en courier - MANTENIENDO LA MISMA LÓGICA
    const selectCourier = formDiv.querySelector("#courierId");
    const otroContainer = formDiv.querySelector("#courier-otro-container");
    const inputOtro = formDiv.querySelector("#courierOtro");
    
    selectCourier.addEventListener("change", () => {
        otroContainer.style.display = selectCourier.value === "other" ? 'block' : 'none';
        if (selectCourier.value !== "other") inputOtro.value = '';
    });
    
    if (currentPkg && currentPkg.courier === 'other') {
        otroContainer.style.display = 'block';
    }

    const form = formDiv.querySelector("#form-package");
    form.addEventListener("submit", async e => {
        e.preventDefault();

        const datos = {
            nombre: form.querySelector("#nombre").value.trim(),
            codigoBarras: form.querySelector("#codigoBarras").value.trim(),
            clienteId: form.querySelector("#clienteId").value || null,
            destinatarioNuevo: form.querySelector("#destinatarioNuevo").value.trim() || null,
            rackId: form.querySelector("#rackId").value,
            peso: parseFloat(form.querySelector("#peso").value) || 0,
            dimensiones: form.querySelector("#dimensiones").value.trim() || null,
            courier: form.querySelector("#courierId").value || null,
            courierName: form.querySelector("#courierId").value === "other" ? form.querySelector("#courierOtro").value.trim() : null,
            notas: form.querySelector("#notas").value.trim() || null,
            status: currentPkg ? currentPkg.status : 'pendiente',
            createdAt: currentPkg ? currentPkg.createdAt : new Date().toISOString()
        };

        if (!datos.rackId) {
            alert("El rack es obligatorio");
            return;
        }

        try {
            let nuevoPackage;
            if (currentPkg) {
                const pkgActual = await Storage.getPackageById(currentPkg.id);
                nuevoPackage = await Storage.updatePackage({ ...pkgActual, ...datos });
            } else {
                nuevoPackage = await Storage.addPackage(datos);
            }
        
            // Si es nuevo paquete y tiene rackId, incrementar occupied del rack - MANTENIENDO LA MISMA LÓGICA
            if (!currentPkg && datos.rackId) {
                const rack = await Storage.getRackById(datos.rackId);
                if (rack) {
                    const updatedRack = {
                        ...rack,
                        occupied: (rack.occupied || 0) + 1,
                        status: (rack.occupied + 1 >= rack.capacity) ? 'full' : rack.status
                    };
                    await Storage.updateRack(updatedRack);
                    console.log("Rack actualizado - occupied ahora:", updatedRack.occupied);
                }
            }
        
            formDiv.style.display = 'none';
            await renderizarListaPackages(tableBody, formDiv);
        } catch (err) {
            console.error(err);
            alert("Error al guardar paquete: " + err.message);
        }
    });

    form.querySelector("#cancelar").addEventListener("click", () => {
        formDiv.style.display = 'none';
    });
}

// FUNCIONES AUXILIARES - NO MODIFICADAS
async function eliminarPackage(id, tableBody, formDiv) {
    if (!confirm("¿Eliminar este paquete?")) return;
    try {
        await Storage.deletePackage(id);
        await renderizarListaPackages(tableBody, formDiv);
    } catch (err) {
        alert("No se pudo eliminar: " + err.message);
    }
}