// js/storage.js - Versión COMPLETA con control de paquetes

console.log('💾 Storage: Inicializando...');

const DB_NAME = "POBoxElPaso";
const DB_VERSION = 6;  // Incrementé la versión por los cambios

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
            console.log("✅ DB abierta");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            console.log(`🔧 Creando/Actualizando DB a v${DB_VERSION}`);

            // Racks
            if (!db.objectStoreNames.contains("racks")) {
                const store = db.createObjectStore("racks", { keyPath: "id" });
                store.createIndex("name", "name", { unique: true });
            }

            // Plans
            if (!db.objectStoreNames.contains("plans")) {
                const store = db.createObjectStore("plans", { keyPath: "id" });
                store.createIndex("name", "name", { unique: true });
            }

            // Clients (CON CAMPOS NUEVOS)
            if (!db.objectStoreNames.contains("clients")) {
                const store = db.createObjectStore("clients", { keyPath: "id" });
                store.createIndex("name", "name");
                console.log("✅ Store 'clients' creado con campos nuevos");
            }

            // Packages
            if (!db.objectStoreNames.contains("packages")) {
                const store = db.createObjectStore("packages", { keyPath: "id" });
                store.createIndex("codigoBarras", "codigoBarras", { unique: true });
                store.createIndex("clienteId", "clienteId");
                store.createIndex("rackId", "rackId");
            }
        };
    });
}

// Funciones genéricas
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

        // AGREGAR CAMPOS POR DEFECTO SEGÚN STORE
        let finalItem = { ...item };
        
        if (storeName === "clients") {
            finalItem = {
                ...item,
                // CAMPOS NUEVOS PARA CONTROL DE PAQUETES
                paquetesEntregados: item.paquetesEntregados || 0,
                paquetesMesActual: item.paquetesMesActual || 0,
                mesContador: item.mesContador || new Date().getMonth(), // Mes actual (0-11)
                ultimoReinicio: item.ultimoReinicio || new Date().toISOString().split('T')[0]
            };
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
        
        // Para clientes, asegurar que tenga los campos nuevos
        if (storeName === "clients") {
            const clienteCompleto = {
                paquetesEntregados: 0,
                paquetesMesActual: 0,
                mesContador: new Date().getMonth(),
                ultimoReinicio: new Date().toISOString().split('T')[0],
                ...item // Los valores del item sobreescriben los defaults
            };
            const req = tx.objectStore(storeName).put(clienteCompleto);
            req.onsuccess = () => resolve(clienteCompleto);
            req.onerror = () => reject(req.error);
        } else {
            const req = tx.objectStore(storeName).put(item);
            req.onsuccess = () => resolve(item);
            req.onerror = () => reject(req.error);
        }
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

// Exportar métodos
window.Storage = {
    openDB,
    
    // Racks
    getRacks: () => getAll("racks"),
    getRackById: (id) => getById("racks", id),
    addRack: (rack) => addItem("racks", rack),
    updateRack: (rack) => updateItem("racks", rack),
    deleteRack: (id) => deleteItem("racks", id),

    // Plans
    getPlans: () => getAll("plans"),
    getPlanById: (id) => getById("plans", id),
    addPlan: (plan) => addItem("plans", plan),
    updatePlan: (plan) => updateItem("plans", plan),
    deletePlan: (id) => deleteItem("plans", id),

    // Clients (CON CAMPOS NUEVOS)
    getClients: () => getAll("clients"),
    getClientById: (id) => getById("clients", id),
    addClient: (client) => addItem("clients", client),
    updateClient: (client) => updateItem("clients", client),
    deleteClient: (id) => deleteItem("clients", id),

    // Packages
    getPackages: () => getAll("packages"),
    getPackageById: (id) => getById("packages", id),
    addPackage: (pkg) => addItem("packages", pkg),
    updatePackage: (pkg) => updateItem("packages", pkg),
    deletePackage: (id) => deleteItem("packages", id)
};

console.log('💾 Storage: Listo con control de paquetes');