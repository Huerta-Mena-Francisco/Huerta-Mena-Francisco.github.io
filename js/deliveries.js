// js/deliveries.js - Módulo Entregas completo (CORREGIDO)

console.log("Módulo Entregas cargado");

async function loadDeliveries(container) {
    container.innerHTML = `
        <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center;">
            <h3>Gestión de Entregas</h3>
            <input type="text" id="search-entrega" placeholder="Buscar por nombre o tracking" style="padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px; width: 300px;">
        </div>

        <div id="deliveries-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.2rem;"></div>
    `;

    const searchInput = container.querySelector("#search-entrega");
    const listDiv = container.querySelector("#deliveries-list");

    searchInput.addEventListener("input", () => buscarPaquetes(searchInput.value, listDiv));

    await buscarPaquetes('', listDiv);  // Cargar todos al inicio
}

async function buscarPaquetes(query, listDiv) {
    try {
        const packages = await Storage.getPackages();
        const filtered = packages.filter(p => {
            return p.status === 'pendiente' && (p.nombre.toLowerCase().includes(query.toLowerCase()) || p.codigoBarras.toLowerCase().includes(query.toLowerCase()));
        });

        if (filtered.length === 0) {
            listDiv.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">No hay paquetes pendientes que coincidan.</p>';
            return;
        }

        // Usar Promise.all para manejar las promesas de forma asíncrona
        const packagesWithDetails = await Promise.all(filtered.map(async pkg => {
            const cliente = pkg.clienteId ? await Storage.getClientById(pkg.clienteId) : null;
            const rack = pkg.rackId ? await Storage.getRackById(pkg.rackId) : null;
            
            return {
                ...pkg,
                clienteNombre: cliente ? cliente.name : pkg.destinatarioNuevo,
                rackNombre: rack ? rack.name : '—'
            };
        }));

        listDiv.innerHTML = packagesWithDetails.map(pkg => `
            <div class="card" style="padding: 1.2rem; border-radius: 8px; background: var(--card-bg); border: 1px solid var(--border); box-shadow: var(--shadow);">
                <h4 style="margin-bottom: 0.8rem;">${pkg.nombre}</h4>
                <div style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">
                    <div><strong>Código:</strong> ${pkg.codigoBarras}</div>
                    <div><strong>Cliente:</strong> ${pkg.clienteNombre}</div>
                    <div><strong>Rack:</strong> ${pkg.rackNombre}</div>
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 0.8rem;">
                    <button class="btn-entregar" data-id="${pkg.id}" style="flex:1; padding: 0.5rem; background: #2ecc71; color: white; border: none; border-radius: 6px; cursor: pointer;">Entregar</button>
                </div>
            </div>
        `).join('');

        listDiv.querySelectorAll('.btn-entregar').forEach(btn => btn.addEventListener('click', () => iniciarEntrega(btn.dataset.id, listDiv)));

    } catch (err) {
        console.error("Error al buscar paquetes:", err);
        listDiv.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 2rem;">Error al buscar paquetes.</p>';
    }
}

// ... (código anterior permanece igual hasta la parte de iniciarEntrega)

async function iniciarEntrega(packageId, listDiv) {
    const pkg = await Storage.getPackageById(packageId);
    if (!pkg) return alert("Paquete no encontrado");

    const ticketContainer = document.createElement("div");
    ticketContainer.id = "ticket-container";
    ticketContainer.style = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 9999;";

    ticketContainer.innerHTML = `
        <div style="background: var(--card-bg); padding: 2rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); max-width: 500px; width: 90%;">
            <h3>Entrega de Paquete</h3>
            <p>Paquete: ${pkg.nombre} (${pkg.codigoBarras})</p>
            <label style="display: block; margin: 1rem 0 0.5rem;">Nombre completo del receptor</label>
            <input type="text" id="receptor-nombre" required style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">

            <label style="display: block; margin: 1rem 0 0.5rem;">Cantidad (si aplica, default 1)</label>
            <input type="number" id="cantidad" value="1" min="1" style="width: 100%; padding: 0.7rem; border: 1px solid var(--border); border-radius: 6px;">

            <label style="display: block; margin: 1rem 0 0.5rem;">Firma de recibido</label>
            <div style="position: relative; border: 1px solid var(--border); border-radius: 6px; background: white; width: 100%; height: 200px;">
                <canvas id="signature-pad" style="width: 100%; height: 100%; touch-action: none;"></canvas>
                <div id="firma-placeholder" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #999; font-style: italic; pointer-events: none;">Firme aquí</div>
            </div>
            <button id="clear-signature" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 6px;">Limpiar Firma</button>

            <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <button id="generar-ticket" style="flex: 1; padding: 0.8rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">Generar Ticket</button>
                <button id="cancelar-entrega" style="flex: 1; padding: 0.8rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(ticketContainer);

    // Configurar SignaturePad
    const canvas = ticketContainer.querySelector("#signature-pad");
    const placeholder = ticketContainer.querySelector("#firma-placeholder");
    
    // Asegurar tamaño adecuado del canvas
    const canvasDiv = canvas.parentElement;
    canvas.width = canvasDiv.offsetWidth;
    canvas.height = canvasDiv.offsetHeight;
    
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'white',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 3,
        throttle: 16,
        velocityFilterWeight: 0.7,
        minDistance: 2
    });
    
    // Mostrar/ocultar placeholder
    signaturePad.addEventListener("beginStroke", () => {
        placeholder.style.display = 'none';
    });
    
    signaturePad.addEventListener("endStroke", () => {
        if (signaturePad.isEmpty()) {
            placeholder.style.display = 'block';
        }
    });
    
    ticketContainer.querySelector("#clear-signature").addEventListener("click", () => {
        signaturePad.clear();
        placeholder.style.display = 'block';
    });

    // MANTENGO EL CÓDIGO ORIGINAL PARA GENERAR EL TICKET (sin cambios)
    ticketContainer.querySelector("#generar-ticket").addEventListener("click", async () => {
        const nombreReceptor = ticketContainer.querySelector("#receptor-nombre").value.trim();
        const cantidad = parseInt(ticketContainer.querySelector("#cantidad").value) || 1;

        if (!nombreReceptor || signaturePad.isEmpty()) {
            alert("Nombre y firma son obligatorios");
            return;
        }

        // Crear ticket (MANTENIENDO EL FORMATO ORIGINAL)
        const ticket = document.createElement("div");
        ticket.style = "background: white; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; max-width: 400px; margin: 0 auto;";
        ticket.innerHTML = `
            <img src="assets/PObox.jpg" alt="PO Box El Paso" style="width: 150px; display: block; margin: 0 auto 1rem;">
            <h3 style="text-align: center; margin-bottom: 1rem;">Recibo de Entrega</h3>
            <p style="text-align: center; margin-bottom: 1rem;">Recibí de PO Box El Paso el paquete en buenas condiciones.</p>
            <div style="margin-bottom: 1rem;">
                <strong>Nombre completo:</strong> ${nombreReceptor}<br>
                <strong>Tracking:</strong> ${pkg.codigoBarras}<br>
                <strong>Fecha de entrega:</strong> ${new Date().toLocaleString('es-MX')}<br>
                <strong>Cantidad:</strong> ${cantidad}
            </div>
            <p style="text-align: center; font-style: italic; margin-top: 2rem;">PO Box El Paso le agradece su preferencia.</p>
            <p style="text-align: center; font-size: 0.8rem; margin-top: 1rem;">Firma de recibido: <img src="${signaturePad.toDataURL()}" style="width: 150px; height: 50px; border: 1px solid #ddd;"></p>
        `;

        // Opciones del ticket (MANTENIENDO EL FORMATO ORIGINAL)
        const opcionesDiv = document.createElement("div");
        opcionesDiv.style = "margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;";
        opcionesDiv.innerHTML = `
            <button id="imprimir-ticket" style="padding: 0.8rem 1.5rem; background: #2ecc71; color: white; border: none; border-radius: 6px; cursor: pointer;">Imprimir</button>
            <button id="whatsapp-ticket" style="padding: 0.8rem 1.5rem; background: #25D366; color: white; border: none; border-radius: 6px; cursor: pointer;">Enviar por WhatsApp</button>
            <button id="cerrar-ticket" style="padding: 0.8rem 1.5rem; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer;">Cerrar</button>
        `;

        ticket.appendChild(opcionesDiv);

        // Reemplazar el formulario con el ticket generado
        ticketContainer.querySelector("#ticket-container div").innerHTML = ticket.innerHTML;

        // Imprimir (MANTENIENDO EL CÓDIGO ORIGINAL)
        ticketContainer.querySelector("#imprimir-ticket").addEventListener("click", () => {
            const printWindow = window.open('', '', 'height=500, width=800');
            printWindow.document.write('<html><head><title>Ticket</title></head><body>');
            printWindow.document.write(ticket.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        });

        // WhatsApp (MANTENIENDO EL CÓDIGO ORIGINAL)
        ticketContainer.querySelector("#whatsapp-ticket").addEventListener("click", () => {
            const textoTicket = `Recibo de Entrega\nPO Box El Paso\nRecibí el paquete en buenas condiciones.\nNombre: ${nombreReceptor}\nTracking: ${pkg.codigoBarras}\nFecha: ${new Date().toLocaleString('es-MX')}\nCantidad: ${cantidad}\nFirma: [adjunta]\nGracias por su preferencia.`;
            const url = `https://wa.me/?text=${encodeURIComponent(textoTicket)}`;
            window.open(url, '_blank');
        });

        // Cerrar (MANTENIENDO EL CÓDIGO ORIGINAL)
        ticketContainer.querySelector("#cerrar-ticket").addEventListener("click", () => {
            ticketContainer.remove();
        });

        // Actualizar paquete como entregado (MANTENIENDO EL CÓDIGO ORIGINAL)
        // 1. ACTUALIZAR PAQUETE COMO ENTREGADO
pkg.status = 'entregado';
await Storage.updatePackage(pkg);

// 2. CONTAR PAQUETE PARA EL CLIENTE (¡NUEVO!)
if (pkg.clienteId) {
    try {
        const cliente = await Storage.getClientById(pkg.clienteId);
        if (cliente) {
            // A. VERIFICAR SI ES NUEVO MES (REINICIAR CONTADOR)
            const mesActual = new Date().getMonth(); // 0=enero, 11=diciembre
            const fechaActual = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            
            if (cliente.mesContador !== mesActual || cliente.ultimoReinicio !== fechaActual) {
                console.log(`🔄 Reiniciando contador para ${cliente.name} (nuevo mes)`);
                cliente.paquetesMesActual = 0;
                cliente.mesContador = mesActual;
                cliente.ultimoReinicio = fechaActual;
            }
            
            // B. INCREMENTAR CONTADORES
            cliente.paquetesEntregados = (cliente.paquetesEntregados || 0) + 1;
            cliente.paquetesMesActual = (cliente.paquetesMesActual || 0) + 1;
            
            // C. ACTUALIZAR CLIENTE
            await Storage.updateClient(cliente);
            
            // D. VERIFICAR SI EXCEDE LÍMITE
            if (cliente.planId) {
                const plan = await Storage.getPlanById(cliente.planId);
                if (plan && plan.paquetesIncluidos) {
                    console.log(`📦 ${cliente.name}: ${cliente.paquetesMesActual}/${plan.paquetesIncluidos} paquetes este mes`);
                    
                    // ALERTA SI EXCEDE LÍMITE
                    if (cliente.paquetesMesActual > plan.paquetesIncluidos) {
                        alert(`⚠️ ATENCIÓN: ${cliente.name} HA EXCEDIDO SU LÍMITE MENSUAL\n\n` +
                              `📋 Plan: ${plan.name} (${plan.paquetesIncluidos} paquetes/mes)\n` +
                              `📦 Recibidos este mes: ${cliente.paquetesMesActual} paquetes\n` +
                              `💵 Se aplicará cargo extra por excedente.\n\n` +
                              `✅ Entrega registrada igualmente.`);
                    }
                    // ALERTA SI ESTÁ CERCA DEL LÍMITE (80%)
                    else if (cliente.paquetesMesActual >= plan.paquetesIncluidos * 0.8) {
                        alert(`📢 NOTA: ${cliente.name} ESTÁ CERCA DE SU LÍMITE\n\n` +
                              `📋 Plan: ${plan.name} (${plan.paquetesIncluidos} paquetes/mes)\n` +
                              `📦 Recibidos este mes: ${cliente.paquetesMesActual} paquetes\n` +
                              `📈 Ha usado el ${Math.round((cliente.paquetesMesActual / plan.paquetesIncluidos) * 100)}% de su plan`);
                    }
                }
            }
            
            // E. VERIFICAR SI MEMBRESÍA ESTÁ VENCIDA
            if (cliente.vencimiento) {
                const hoy = new Date();
                const vencimiento = new Date(cliente.vencimiento);
                const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
                
                if (diasRestantes < 0) {
                    alert(`⚠️ ${cliente.name} TIENE LA MEMBRESÍA VENCIDA\n\n` +
                          `📅 Vencimiento: ${vencimiento.toLocaleDateString('es-MX')}\n` +
                          `⏰ Hace ${Math.abs(diasRestantes)} días\n\n` +
                          `💡 Contactar para renovación.`);
                } else if (diasRestantes <= 7) {
                    alert(`📢 ${cliente.name}: MEMBRESÍA POR VENCER\n\n` +
                          `📅 Vencimiento: ${vencimiento.toLocaleDateString('es-MX')}\n` +
                          `⏰ Faltan ${diasRestantes} días\n\n` +
                          `💡 Recordar renovación.`);
                }
            }
        }
    } catch (error) {
        console.error("❌ Error al contar paquete para cliente:", error);
        // No detenemos la entrega por este error
    }
} else {
    console.log("📦 Paquete sin cliente asignado, no se cuenta");
}

// 3. RESTAR DEL RACK (código original)
if (pkg.rackId) {
    const rack = await Storage.getRackById(pkg.rackId);
    if (rack) {
        rack.occupied = (rack.occupied || 0) - 1;
        rack.status = rack.occupied > 0 ? 'occupied' : 'available';
        await Storage.updateRack(rack);
    }
}

        // 4. REFRESCAR LISTA (código original)
        await buscarPaquetes('', listDiv);
    });

    // Cancelar entrega (MANTENIENDO EL CÓDIGO ORIGINAL)
    ticketContainer.querySelector("#cancelar-entrega").addEventListener("click", () => {
        ticketContainer.remove();
    });
}