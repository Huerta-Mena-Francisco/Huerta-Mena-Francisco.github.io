// js/main.js
console.log("PO Box El Paso – App cargada correctamente");

document.addEventListener("DOMContentLoaded", async () => {
  // Cargar módulos en orden
  try {
    // Tema primero (para que no haya flash)
    await import('./ui-theme.js');

    // Storage (ya está cargado globalmente como window.Storage)
    // No necesita import si lo cargas con <script> en HTML

    // UI de racks
    await import('./ui-racks.js');

    console.log("Todos los módulos cargados");
  } catch (err) {
    console.error("Error al cargar módulos:", err);
    alert("Hubo un problema al iniciar la aplicación. Revisa la consola.");
  }
});