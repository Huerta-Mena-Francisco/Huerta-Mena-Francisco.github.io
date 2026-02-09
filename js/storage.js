// js/storage.js - VERSIÓN COMPLETA Y SEGURA para actualizar

console.log('💾 Storage: Inicializando sistema de tracking...');

const DB_NAME = "POBoxElPaso";
const DB_VERSION = 7;  // Incrementamos solo 1 versión

let db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("❌ Error abriendo DB:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("✅ DB abierta exitosamente - Versión:", DB_VERSION);
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            const oldVersion = event.oldVersion;
            
            console.log(`🔧 Migrando DB: v${oldVersion} → v${DB_VERSION}`);
            
            // MIGRACIÓN PASO A PASO - SEGURA
            const transaction = event.target.transaction;
            
            // 1. CLIENTES - Agregar campos nuevos si no existen
            if (!db.objectStoreNames.contains("clients")) {
                console.log("🆕 Creando store 'clients' desde cero");
                const store = db.createObjectStore("clients", { keyPath: "id" });
                store.createIndex("name", "name");
                store.createIndex("email", "email");
                store.createIndex("phone", "phone");
                store.createIndex("boxNumber", "boxNumber");
            } else {
                // Store ya existe, solo migrar datos
                console.log("📝 Store 'clients' ya existe - manteniendo datos");
            }
            
            // 2. PAQUETES - Agregar campos nuevos
            if (!db.objectStoreNames.contains("packages")) {
                console.log("🆕 Creando store 'packages' desde cero");
                const store = db.createObjectStore("packages", { keyPath: "id" });
                store.createIndex("trackingNumber", "trackingNumber");
                store.createIndex("clienteId", "clienteId");
                store.createIndex("clienteTemp", "clienteTemp");
                store.createIndex("status", "status");
                store.createIndex("estaAsignado", "estaAsignado");
            } else {
                console.log("📝 Store 'packages' ya existe - manteniendo datos");
            }
            
            // 3. RACKS (sin cambios)
            if (!db.objectStoreNames.contains("racks")) {
                db.createObjectStore("racks", { keyPath: "id" });
            }
            
            // 4. PLANS (sin cambios)
            if (!db.objectStoreNames.contains("plans")) {
                db.createObjectStore("plans", { keyPath: "id" });
            }
            
            // Si estamos migrando desde versión 6 o anterior, actualizar datos
            if (oldVersion > 0 && oldVersion < DB_VERSION) {
                console.log("🔄 Migrando datos de versión anterior...");
                
                // Migración para packages
                setTimeout(() => {
                    try {
                        const tx = db.transaction(["packages"], "readwrite");
                        const store = tx.objectStore("packages");
                        const request = store.openCursor();
                        
                        request.onsuccess = (e) => {
                            const cursor = e.target.result;
                            if (cursor) {
                                const pkg = cursor.value;
                                
                                // Asegurar que tenga los campos nuevos
                                if (!pkg.trackingNumber && pkg.codigoBarras) {
                                    pkg.trackingNumber = pkg.codigoBarras;
                                }
                                if (typeof pkg.estaAsignado === 'undefined') {
                                    pkg.estaAsignado = !!pkg.clienteId;
                                }
                                if (!pkg.clienteTemp && !pkg.clienteId) {
                                    pkg.clienteTemp = pkg.destinatarioNuevo || 'Desconocido';
                                }
                                if (!pkg.fechaEscaneo) {
                                    pkg.fechaEscaneo = pkg.createdAt || new Date().toISOString();
                                }
                                
                                cursor.update(pkg);
                                cursor.continue();
                            }
                        };
                    } catch (error) {
                        console.warn("⚠️ Error en migración de packages:", error);
                    }
                }, 100);
            }
        };
    });
}

// FUNCIONES GENÉRICAS (MANTENER LAS MISMAS)
async function getAll(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

async function getById(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
    });
}

async function addItem(storeName, item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);

        let finalItem = { ...item };
        
        // Campos por defecto según el store
        if (storeName === "clients") {
            finalItem = {
                paquetesEntregados: 0,
                paquetesMesActual: 0,
                mesContador: new Date().getMonth(),
                ultimoReinicio: new Date().toISOString().split('T')[0],
                boxNumber: null,
                ...item
            };
        }
        
        if (storeName === "packages") {
            finalItem = {
                trackingNumber: item.trackingNumber || item.codigoBarras || '',
                clienteTemp: item.clienteTemp || null,
                estaAsignado: item.estaAsignado || false,
                fechaEscaneo: item.fechaEscaneo || new Date().toISOString(),
                fechaAsignacion: item.fechaAsignacion || null,
                ...item
            };
            
            // Si no tiene clienteId pero tiene clienteTemp, no está asignado
            if (!finalItem.clienteId && finalItem.clienteTemp) {
                finalItem.estaAsignado = false;
            }
        }
        
        finalItem.id = item.id || `${storeName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        finalItem.createdAt = finalItem.createdAt || new Date().toISOString();

        const req = store.add(finalItem);
        req.onsuccess = () => resolve(finalItem);
        req.onerror = () => reject(req.error);
    });
}

async function updateItem(storeName, item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const req = tx.objectStore(storeName).put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = () => reject(req.error);
    });
}

async function deleteItem(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const req = tx.objectStore(storeName).delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => reject(req.error);
    });
}

// ========== FUNCIONES NUEVAS PARA TRACKING ==========

// Buscar cliente por diferentes criterios
async function searchClient(criteria) {
    const clients = await getAll("clients");
    const { name, boxNumber, email, phone } = criteria;
    
    return clients.filter(client => {
        // Buscar por nombre (insensible a mayúsculas y acentos)
        if (name && client.name) {
            const clientName = client.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const searchName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            if (clientName.includes(searchName) || searchName.includes(clientName)) {
                return true;
            }
        }
        
        // Buscar por número de casilla
        if (boxNumber && client.boxNumber) {
            if (client.boxNumber.toString() === boxNumber.toString()) {
                return true;
            }
        }
        
        // Buscar por email
        if (email && client.email) {
            if (client.email.toLowerCase() === email.toLowerCase()) {
                return true;
            }
        }
        
        // Buscar por teléfono (últimos 4 dígitos)
        if (phone && client.phone) {
            const last4Client = client.phone.slice(-4);
            const last4Search = phone.slice(-4);
            if (last4Client === last4Search) {
                return true;
            }
        }
        
        return false;
    });
}

// Obtener paquetes sin asignar
async function getUnassignedPackages() {
    const allPackages = await getAll("packages");
    return allPackages.filter(pkg => !pkg.estaAsignado);
}

// Obtener paquetes por cliente temporal
async function getPackagesByTempClient(tempClientName) {
    const allPackages = await getAll("packages");
    return allPackages.filter(pkg => pkg.clienteTemp === tempClientName);
}

// Asignar paquete a cliente
async function assignPackageToClient(packageId, clientId) {
    const pkg = await getById("packages", packageId);
    const client = await getById("clients", clientId);
    
    if (!pkg) throw new Error("Paquete no encontrado");
    if (!client) throw new Error("Cliente no encontrado");
    
    // Actualizar paquete
    pkg.clienteId = clientId;
    pkg.clienteTemp = null;
    pkg.estaAsignado = true;
    pkg.fechaAsignacion = new Date().toISOString();
    
    // Actualizar cliente
    client.paquetesPendientes = (client.paquetesPendientes || 0) + 1;
    client.ultimoPaquete = new Date().toISOString();
    
    // Guardar cambios
    await updateItem("packages", pkg);
    await updateItem("clients", client);
    
    console.log(`✅ Paquete ${pkg.trackingNumber} asignado a ${client.name}`);
    
    return { success: true, package: pkg, client: client };
}

// Buscar coincidencias automáticas
async function findAutoMatches(packageData) {
    const clients = await getAll("clients");
    const { recipientName, boxNumber } = packageData;
    
    const matches = [];
    
    clients.forEach(client => {
        let score = 0;
        let reasons = [];
        
        // 1. Coincidencia por número de casilla
        if (boxNumber && client.boxNumber && client.boxNumber.toString() === boxNumber.toString()) {
            score += 100;
            reasons.push(`Casilla ${boxNumber} coincide`);
        }
        
        // 2. Coincidencia por nombre
        if (recipientName && client.name) {
            const clientName = client.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const recipientNameNorm = recipientName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            if (clientName === recipientNameNorm) {
                score += 80;
                reasons.push("Nombre coincide exactamente");
            } else if (clientName.includes(recipientNameNorm) || recipientNameNorm.includes(clientName)) {
                score += 40;
                reasons.push("Nombre coincide parcialmente");
            }
        }
        
        if (score > 0) {
            matches.push({
                client,
                score,
                reasons,
                confidence: score >= 100 ? 'alta' : score >= 50 ? 'media' : 'baja'
            });
        }
    });
    
    return matches.sort((a, b) => b.score - a.score);
}

// ========== FUNCIONES PARA DETECCIÓN DE PAQUETERÍAS ==========

function detectCourier(trackingNumber) {
    const tn = trackingNumber.trim();
    
    // FedEx: 12 o 15 dígitos
    if (/^\d{12}$/.test(tn) || /^\d{15}$/.test(tn)) {
        return { courier: 'fedex', courierName: 'FedEx' };
    }
    
    // UPS: Empieza con "1Z" + 16 caracteres
    if (/^1Z[A-Z0-9]{16}$/i.test(tn)) {
        return { courier: 'ups', courierName: 'UPS' };
    }
    
    // USPS: 20-22 dígitos, empieza con 91-94
    if (/^9[1-4]\d{18,20}$/.test(tn)) {
        return { courier: 'usps', courierName: 'USPS' };
    }
    
    // DHL: 10 dígitos
    if (/^\d{10}$/.test(tn)) {
        return { courier: 'dhl', courierName: 'DHL' };
    }
    
    // Estafeta: Empieza con 800
    if (/^800\d+$/.test(tn)) {
        return { courier: 'estafeta', courierName: 'Estafeta' };
    }
    
    // RedPack u otros
    if (/^\d{9,14}$/.test(tn)) {
        return { courier: 'other', courierName: 'Otra paquetería' };
    }
    
    return { courier: 'unknown', courierName: 'Desconocido' };
}

// Función para buscar cliente en paquete (destinatario)
async function findClientInPackage(packageData) {
    const { recipientName, boxNumber } = packageData;
    const clients = await getAll("clients");
    
    // 1. Buscar por número de casilla exacto
    if (boxNumber) {
        const byBox = clients.find(c => c.boxNumber && c.boxNumber.toString() === boxNumber.toString());
        if (byBox) return { client: byBox, reason: `Casilla ${boxNumber}` };
    }
    
    // 2. Buscar por nombre (coincidencias parciales sin acentos)
    if (recipientName) {
        const normalizedSearch = recipientName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        for (const client of clients) {
            if (!client.name) continue;
            
            const normalizedClient = client.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            // Coincidencia exacta
            if (normalizedClient === normalizedSearch) {
                return { client, reason: `Nombre exacto: ${client.name}` };
            }
            
            // Coincidencia parcial (el nombre del cliente contiene el del paquete)
            if (normalizedClient.includes(normalizedSearch)) {
                return { client, reason: `El nombre del cliente contiene "${recipientName}"` };
            }
            
            // Coincidencia parcial inversa
            if (normalizedSearch.includes(normalizedClient)) {
                return { client, reason: `El destinatario contiene nombre del cliente` };
            }
        }
    }
    
    return null; // No encontrado
}

// Función para verificar límite de paquetes del cliente
async function checkClientPackageLimit(clientId) {
    try {
        const client = await getById("clients", clientId);
        if (!client) return { canAdd: true, reason: "Cliente no encontrado" };
        
        const plan = await getById("plans", client.planId);
        if (!plan) return { canAdd: true, reason: "Plan no encontrado, sin límite" };
        
        // Verificar si estamos en el mismo mes del contador
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Reiniciar contador si es nuevo mes
        if (client.mesContador !== currentMonth || !client.mesContador) {
            client.paquetesMesActual = 0;
            client.mesContador = currentMonth;
            client.ultimoReinicio = now.toISOString().split('T')[0];
            await updateItem("clients", client);
        }
        
        const paquetesActuales = client.paquetesMesActual || 0;
        const limite = plan.paquetesIncluidos || Infinity;
        
        if (paquetesActuales >= limite) {
            return {
                canAdd: false,
                reason: `Límite alcanzado (${paquetesActuales}/${limite})`,
                client,
                plan
            };
        }
        
        return {
            canAdd: true,
            reason: `Puede recibir (${paquetesActuales + 1}/${limite})`,
            client,
            plan,
            currentCount: paquetesActuales
        };
        
    } catch (error) {
        console.error("Error verificando límite:", error);
        return { canAdd: true, reason: "Error, permitiendo paquete" };
    }
}

// Función para procesar escaneo de tracking
async function processTrackingScan(trackingNumber, recipientName = null, boxNumber = null) {
    console.log("🔍 Procesando escaneo:", trackingNumber);
    
    // 1. Detectar paquetería
    const courierInfo = detectCourier(trackingNumber);
    console.log("📦 Detectado:", courierInfo.courierName);
    
    // 2. Verificar si ya existe este paquete
    const existingPackages = await getAll("packages");
    const existing = existingPackages.find(p => 
        p.trackingNumber === trackingNumber || p.codigoBarras === trackingNumber
    );
    
    if (existing) {
        return {
            success: false,
            message: "⚠️ Este paquete ya está registrado",
            package: existing,
            action: "duplicate"
        };
    }
    
    // 3. Buscar cliente automáticamente
    const clientMatch = await findClientInPackage({ recipientName, boxNumber });
    
    if (clientMatch) {
        console.log("✅ Cliente encontrado:", clientMatch.client.name);
        
        // 4. Verificar límite del cliente
        const limitCheck = await checkClientPackageLimit(clientMatch.client.id);
        
        if (!limitCheck.canAdd) {
            return {
                success: false,
                message: `❌ ${clientMatch.client.name} alcanzó su límite mensual (${limitCheck.client.paquetesMesActual || 0}/${limitCheck.plan.paquetesIncluidos})`,
                client: clientMatch.client,
                limitCheck,
                action: "limit_exceeded"
            };
        }
        
        // 5. Crear paquete asignado al cliente
        const newPackage = {
            trackingNumber,
            codigoBarras: trackingNumber,
            clienteId: clientMatch.client.id,
            clienteTemp: null,
            estaAsignado: true,
            fechaEscaneo: new Date().toISOString(),
            fechaAsignacion: new Date().toISOString(),
            courier: courierInfo.courier,
            courierName: courierInfo.courierName,
            status: 'pendiente',
            nombre: `Paquete ${trackingNumber.slice(-6)}`,
            destinatarioNuevo: recipientName || clientMatch.client.name,
            notas: `Asignado automáticamente. ${clientMatch.reason}`
        };
        
        const savedPackage = await addItem("packages", newPackage);
        
        // 6. Actualizar contador del cliente
        clientMatch.client.paquetesMesActual = (clientMatch.client.paquetesMesActual || 0) + 1;
        clientMatch.client.ultimoPaquete = new Date().toISOString();
        await updateItem("clients", clientMatch.client);
        
        return {
            success: true,
            message: `✅ Paquete asignado a ${clientMatch.client.name}`,
            package: savedPackage,
            client: clientMatch.client,
            courier: courierInfo,
            action: "auto_assigned"
        };
        
    } else {
        // 7. No se encontró cliente → guardar como pendiente
        const newPackage = {
            trackingNumber,
            codigoBarras: trackingNumber,
            clienteId: null,
            clienteTemp: recipientName || "Desconocido",
            estaAsignado: false,
            fechaEscaneo: new Date().toISOString(),
            fechaAsignacion: null,
            courier: courierInfo.courier,
            courierName: courierInfo.courierName,
            status: 'pendiente',
            nombre: `Paquete ${trackingNumber.slice(-6)}`,
            destinatarioNuevo: recipientName,
            notas: `Pendiente de asignación. Courier: ${courierInfo.courierName}`
        };
        
        const savedPackage = await addItem("packages", newPackage);
        
        return {
            success: true,
            message: `📭 Paquete guardado como pendiente para "${recipientName || 'Desconocido'}"`,
            package: savedPackage,
            client: null,
            courier: courierInfo,
            action: "pending"
        };
    }
}

// ========== EXPORTAR ==========

window.Storage = {
    // Métodos existentes
    getRacks: () => getAll("racks"),
    getRackById: (id) => getById("racks", id),
    addRack: (rack) => addItem("racks", rack),
    updateRack: (rack) => updateItem("racks", rack),
    deleteRack: (id) => deleteItem("racks", id),

    getPlans: () => getAll("plans"),
    getPlanById: (id) => getById("plans", id),
    addPlan: (plan) => addItem("plans", plan),
    updatePlan: (plan) => updateItem("plans", plan),
    deletePlan: (id) => deleteItem("plans", id),

    getClients: () => getAll("clients"),
    getClientById: (id) => getById("clients", id),
    addClient: (client) => addItem("clients", client),
    updateClient: (client) => updateItem("clients", client),
    deleteClient: (id) => deleteItem("clients", id),

    getPackages: () => getAll("packages"),
    getPackageById: (id) => getById("packages", id),
    addPackage: (pkg) => addItem("packages", pkg),
    updatePackage: (pkg) => updateItem("packages", pkg),
    deletePackage: (id) => deleteItem("packages", id),

    // Funciones genéricas (por si las necesitas)
    openDB,
    
    // ===== NUEVAS FUNCIONES PARA TRACKING =====
    searchClient,
    getUnassignedPackages,
    getPackagesByTempClient,
    assignPackageToClient,
    findAutoMatches,
    detectCourier,
    findClientInPackage,
    checkClientPackageLimit,
    processTrackingScan
};

console.log('💾 Storage: Sistema listo con funciones de tracking');