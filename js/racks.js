// js/racks.js - Racks completo y funcional (VERSIÓN CON LISTAS)

console.log("Racks módulo cargado");

async function loadRacks(container) {
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <h3>Gestión de Racks</h3>
            <button id="racks-nuevo" style="padding: 0.8rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">
                + Nuevo Rack
            </button>
        </div>
        <div id="racks-form" style="display:none; margin-bottom:2rem; padding:1.5rem; background:var(--card-bg); border-radius:8px; border:1px solid var(--border);"></div>
        
        <!-- LISTA EN FORMATO TABULAR -->
        <div id="racks-lista" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Nombre</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Capacidad</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Ocupado</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Ubicación</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Estado</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="racks-table-body">
                    <!-- Las filas se llenarán aquí -->
                </tbody>
            </table>
        </div>
    `;

    const form = container.querySelector("#racks-form");
    const tableBody = container.querySelector("#racks-table-body");
    const btnNuevo = container.querySelector("#racks-nuevo");

    btnNuevo.onclick = () => mostrarFormRack(form, null, tableBody);
    await pintarRacks(tableBody, form);
}

async function pintarRacks(tableBody, form) {
    try {
        const racks = await Storage.getRacks();
        console.log("Racks encontrados:", racks.length);

        if (racks.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        No hay racks registrados
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = racks.map(r => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem;">
                    <strong>${r.name}</strong>
                    ${r.notes ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.3rem;">${r.notes}</div>` : ''}
                </td>
                <td style="padding: 1rem;">${r.capacity}</td>
                <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span>${r.occupied || 0}</span>
                        <div style="flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${((r.occupied || 0) / r.capacity * 100)}%; height: 100%; background: ${((r.occupied || 0) / r.capacity * 100) > 80 ? '#e74c3c' : '#2ecc71'};"></div>
                        </div>
                    </div>
                </td>
                <td style="padding: 1rem;">${r.location || '—'}</td>
                <td style="padding: 1rem;">
                    <span style="display: inline-block; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 500; background: ${r.status === 'available' ? '#d4edda' : (r.status === 'occupied' ? '#fff3cd' : '#f8d7da')}; color: ${r.status === 'available' ? '#155724' : (r.status === 'occupied' ? '#856404' : '#721c24')};">
                        ${r.status || 'available'}
                    </span>
                </td>
                <td style="padding: 1rem;">
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="edit-rack" data-id="${r.id}" style="background: #f39c12; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Editar</button>
                        <button class="delete-rack" data-id="${r.id}" style="background: #e74c3c; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Asignar eventos - MANTENIENDO LAS MISMAS FUNCIONES
        tableBody.querySelectorAll('.edit-rack').forEach(b => b.onclick = () => editarRack(b.dataset.id, form, tableBody));
        tableBody.querySelectorAll('.delete-rack').forEach(b => b.onclick = () => borrarRack(b.dataset.id, tableBody, form));

    } catch(e) {
        console.error("Error al pintar racks:", e);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 3rem; text-align: center; color: #e74c3c;">
                    Error al cargar racks. Revisa la consola para más detalles.
                </td>
            </tr>
        `;
    }
}

// FUNCIONES DE FORMULARIO - NO MODIFICADAS
function mostrarFormRack(form, rack = null, tableBody) {
    form.innerHTML = `
        <h4 style="margin-bottom: 1rem;">${rack ? 'Editar Rack' : 'Nuevo Rack'}</h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre (único)*</label>
                <input type="text" id="rack-nombre" value="${rack ? rack.name : ''}" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Capacidad*</label>
                <input type="number" id="rack-capacidad" value="${rack ? rack.capacity : '10'}" min="1" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Ubicación</label>
                <input type="text" id="rack-ubicacion" value="${rack ? rack.location || '' : ''}" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Estado inicial</label>
                <select id="rack-status" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                    <option value="available" ${rack?.status === 'available' ? 'selected' : ''}>Disponible</option>
                    <option value="occupied" ${rack?.status === 'occupied' ? 'selected' : ''}>Ocupado</option>
                    <option value="maintenance" ${rack?.status === 'maintenance' ? 'selected' : ''}>Mantenimiento</option>
                </select>
            </div>
        </div>
        <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Notas</label>
            <textarea id="rack-notas" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px; min-height: 80px;">${rack ? rack.notes || '' : ''}</textarea>
        </div>
        <input type="hidden" id="rack-id" value="${rack ? rack.id : ''}">
        <div style="display: flex; gap: 0.8rem;">
            <button id="rack-guardar" style="padding: 0.8rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">Guardar</button>
            <button id="rack-cancelar" style="padding: 0.8rem 1.5rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
        </div>
    `;
    form.style.display = 'block';

    document.getElementById("rack-guardar").onclick = async () => {
        const datos = {
            id: document.getElementById("rack-id").value || undefined,
            name: document.getElementById("rack-nombre").value.trim(),
            capacity: parseInt(document.getElementById("rack-capacidad").value) || 10,
            location: document.getElementById("rack-ubicacion").value.trim(),
            status: document.getElementById("rack-status").value,
            notes: document.getElementById("rack-notas").value.trim(),
            occupied: rack ? (rack.occupied || 0) : 0
        };

        if (!datos.name) return alert("El nombre es obligatorio");

        try {
            if (datos.id) {
                const actual = await Storage.getRackById(datos.id);
                await Storage.updateRack({ ...actual, ...datos });
            } else {
                await Storage.addRack(datos);
            }
            form.style.display = 'none';
            await pintarRacks(tableBody, form);
        } catch(e) {
            alert("Error al guardar rack: " + e.message);
        }
    };

    document.getElementById("rack-cancelar").onclick = () => {
        form.style.display = 'none';
    };
}

// FUNCIONES AUXILIARES - NO MODIFICADAS
async function editarRack(id, form, tableBody) {
    const rack = await Storage.getRackById(id);
    if (rack) mostrarFormRack(form, rack, tableBody);
}

async function borrarRack(id, tableBody, form) {
    if (!confirm("¿Eliminar rack? Esto también liberará cualquier paquete asignado.")) return;
    try {
        await Storage.deleteRack(id);
        await pintarRacks(tableBody, form);
    } catch(e) {
        alert("No se pudo eliminar: " + e.message);
    }
}