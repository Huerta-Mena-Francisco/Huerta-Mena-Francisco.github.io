// js/plans.js - Planes con periodo (VERSIÓN CON LISTAS)

console.log("Módulo Planes cargado");

async function loadPlans(container) {
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <h3>Gestión de Planes</h3>
            <button id="btn-nuevo-plan" style="padding: 0.6rem 1.2rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">
                + Nuevo Plan
            </button>
        </div>

        <div id="plan-form" style="display: none; margin: 1.5rem 0; padding: 1.5rem; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);"></div>

        <!-- LISTA EN FORMATO TABULAR -->
        <div id="plans-list" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: var(--card-bg); border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Nombre</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Precio</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Paquetes</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Periodo</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Descripción</th>
                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody id="plans-table-body">
                    <!-- Las filas se llenarán aquí -->
                </tbody>
            </table>
        </div>
    `;

    const formDiv = container.querySelector("#plan-form");
    const tableBody = container.querySelector("#plans-table-body");
    const btnNuevo = container.querySelector("#btn-nuevo-plan");

    btnNuevo.addEventListener("click", () => mostrarFormularioPlan(formDiv, null, tableBody));
    await renderizarListaPlanes(tableBody, formDiv);
}

async function renderizarListaPlanes(tableBody, formDiv) {
    try {
        const plans = await Storage.getPlans();

        if (plans.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 3rem; text-align: center; color: var(--text-secondary);">
                        No hay planes registrados
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = plans.map(plan => `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem; vertical-align: top;">
                    <strong>${plan.name}</strong>
                </td>
                <td style="padding: 1rem; vertical-align: top;">
                    <span style="font-weight: 600; color: #2ecc71;">$${plan.precioMensual}</span>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        por ${plan.periodo === 'anual' ? 'año' : plan.periodo === 'semanal' ? 'semana' : 'mes'}
                    </div>
                </td>
                <td style="padding: 1rem; vertical-align: top;">
                    <span style="display: inline-block; padding: 0.3rem 0.8rem; background: #e3f2fd; border-radius: 4px; font-weight: 600; color: #1565c0;">
                        ${plan.paquetesIncluidos} paq.
                    </span>
                </td>
                <td style="padding: 1rem; vertical-align: top;">
                    <span style="display: inline-block; padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.85rem; font-weight: 500; background: ${getPeriodoColor(plan.periodo).bg}; color: ${getPeriodoColor(plan.periodo).text};">
                        ${plan.periodo === 'semanal' ? 'Semanal' : plan.periodo === 'mensual' ? 'Mensual' : 'Anual'}
                    </span>
                </td>
                <td style="padding: 1rem; vertical-align: top;">
                    <div style="max-width: 300px; font-size: 0.9rem; color: var(--text-secondary);">
                        ${plan.descripcion ? plan.descripcion : '<span style="color: #95a5a6; font-style: italic;">Sin descripción</span>'}
                    </div>
                </td>
                <td style="padding: 1rem; vertical-align: top;">
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn-edit" data-id="${plan.id}" style="background: #f39c12; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Editar</button>
                        <button class="btn-delete" data-id="${plan.id}" style="background: #e74c3c; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');

        // ASIGNAR EVENTOS - MANTENIENDO LAS MISMAS FUNCIONES
        tableBody.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => editarPlan(btn.dataset.id, formDiv, tableBody)));
        tableBody.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', () => eliminarPlan(btn.dataset.id, tableBody, formDiv)));

    } catch (err) {
        console.error("Error al renderizar lista de planes:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="padding: 3rem; text-align: center; color: #e74c3c;">
                    Error al cargar planes. Revisa la consola para más detalles.
                </td>
            </tr>
        `;
    }
}

// Función auxiliar para colores según periodo
function getPeriodoColor(periodo) {
    switch(periodo) {
        case 'semanal': return { bg: '#fff3cd', text: '#856404' };
        case 'mensual': return { bg: '#d4edda', text: '#155724' };
        case 'anual': return { bg: '#d1ecf1', text: '#0c5460' };
        default: return { bg: '#f8d7da', text: '#721c24' };
    }
}

// FUNCIONES DE FORMULARIO - NO MODIFICADAS
function mostrarFormularioPlan(formDiv, plan = null, tableBody) {
    formDiv.innerHTML = `
        <form id="form-plan">
            <h4 style="margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 2px solid var(--border);">${plan ? 'Editar Plan' : 'Nuevo Plan'}</h4>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nombre del plan*</label>
                    <input type="text" id="nombre" value="${plan ? plan.name : ''}" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Precio*</label>
                    <div style="position: relative;">
                        <span style="position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%); color: #666;">$</span>
                        <input type="number" id="precio" value="${plan ? plan.precioMensual : ''}" min="0" step="0.01" required style="width: 100%; padding: 0.7rem 0.7rem 0.7rem 1.5rem; border: 1px solid var(--border); border-radius: 6px;">
                    </div>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Paquetes incluidos*</label>
                    <input type="number" id="paquetes" value="${plan ? plan.paquetesIncluidos : ''}" min="0" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Periodo*</label>
                    <select id="periodo" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">
                        <option value="">Selecciona periodo</option>
                        <option value="semanal" ${plan && plan.periodo === 'semanal' ? 'selected' : ''}>Semanal</option>
                        <option value="mensual" ${plan && plan.periodo === 'mensual' ? 'selected' : ''}>Mensual</option>
                        <option value="anual" ${plan && plan.periodo === 'anual' ? 'selected' : ''}>Anual</option>
                    </select>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Descripción</label>
                <textarea id="descripcion" rows="4" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;" placeholder="Descripción opcional del plan...">${plan ? plan.descripcion || '' : ''}</textarea>
            </div>

            <div style="display: flex; gap: 0.8rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                <button type="submit" style="flex: 1; padding: 0.8rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Guardar</button>
                <button type="button" id="cancelar" style="flex: 1; padding: 0.8rem 1.5rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
            </div>
        </form>
    `;

    formDiv.style.display = 'block';

    const form = formDiv.querySelector("#form-plan");
    form.addEventListener("submit", async e => {
        e.preventDefault();

        const datos = {
            name: form.querySelector("#nombre").value.trim(),
            precioMensual: parseFloat(form.querySelector("#precio").value) || 0,
            paquetesIncluidos: parseInt(form.querySelector("#paquetes").value) || 0,
            periodo: form.querySelector("#periodo").value,
            descripcion: form.querySelector("#descripcion").value.trim()
        };

        if (!datos.periodo) {
            alert("El periodo es obligatorio");
            return;
        }

        try {
            if (plan) {
                const planActual = await Storage.getPlanById(plan.id);
                await Storage.updatePlan({ ...planActual, ...datos });
            } else {
                await Storage.addPlan(datos);
            }
            formDiv.style.display = 'none';
            await renderizarListaPlanes(tableBody, formDiv);
        } catch (err) {
            alert("Error al guardar: " + err.message);
        }
    });

    form.querySelector("#cancelar").addEventListener("click", () => {
        formDiv.style.display = 'none';
    });
}

// FUNCIONES AUXILIARES - NO MODIFICADAS
async function editarPlan(id, formDiv, tableBody) {
    const plan = await Storage.getPlanById(id);
    if (plan) mostrarFormularioPlan(formDiv, plan, tableBody);
}

async function eliminarPlan(id, tableBody, formDiv) {
    if (!confirm("¿Eliminar este plan? Los clientes asociados a este plan quedarán sin plan.")) return;
    try {
        await Storage.deletePlan(id);
        await renderizarListaPlanes(tableBody, formDiv);
    } catch (err) {
        alert("No se pudo eliminar: " + err.message);
    }
}