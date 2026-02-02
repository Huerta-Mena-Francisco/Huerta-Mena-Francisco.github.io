// js/app.js
// js/app.js - Navegación principal y carga de módulos

document.addEventListener("DOMContentLoaded", () => {
  console.log("App inicializada - DOMContentLoaded ejecutado");

  const navItems = document.querySelectorAll(".nav-item");
  const moduleContent = document.getElementById("module-content");
  const pageTitle = document.getElementById("page-title");

  if (!moduleContent || !pageTitle) {
      console.error("No se encontraron elementos #module-content o #page-title");
      return;
  }

  // Manejar clics en el menú lateral
  navItems.forEach(item => {
      item.addEventListener("click", () => {
          // Quitar active de todos los botones
          navItems.forEach(i => i.classList.remove("active"));
          item.classList.add("active");

          // Obtener módulo y título
          const modulo = item.dataset.module;
          const texto = item.textContent.trim().replace(/^[^\w\s]+/, '').trim(); // quita icono si existe
          pageTitle.textContent = texto || "Dashboard";

          // Limpiar contenido anterior
          moduleContent.innerHTML = '<div style="padding: 3rem; text-align: center; color: var(--text-secondary);">Cargando...</div>';

          // Cargar según el módulo seleccionado
          // En tu app.js, modifica solo el case "dashboard":

switch (modulo) {
    case "dashboard":
        if (typeof window.loadDashboard === "function") {
            window.loadDashboard(moduleContent);
        } else {
            moduleContent.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h3>Bienvenido al Sistema</h3>
                    <p>Gestión interna de paquetería - PO Box El Paso</p>
                    <div style="margin: 2rem 0; font-size: 1.2rem;">
                        <strong>Racks registrados:</strong> <span id="rack-count">0</span><br>
                        <strong>Planes creados:</strong> <span id="plan-count">0</span>
                    </div>
                    <p style="color: #e74c3c; margin-top: 1rem;">
                        Módulo dashboard.js no cargado correctamente
                    </p>
                </div>
            `;
            
            // Actualizar conteos reales (fallback)
            if (window.Storage) {
                Storage.getRacks().then(racks => {
                    const rackCount = document.getElementById("rack-count");
                    if (rackCount) rackCount.textContent = racks.length;
                }).catch(err => console.error("Error contando racks:", err));

                Storage.getPlans?.().then(plans => {
                    const planCount = document.getElementById("plan-count");
                    if (planCount) planCount.textContent = plans.length;
                }).catch(err => console.error("Error contando planes:", err));
            }
        }
        break;

              case "racks":
                  if (typeof window.loadRacks === "function") {
                      window.loadRacks(moduleContent);
                  } else {
                      moduleContent.innerHTML = '<p style="padding: 4rem; text-align: center; color: #e74c3c;">Error: Módulo Racks no disponible</p>';
                      console.error("Función loadRacks no encontrada");
                  }
                  break;

              case "plans":
                  if (typeof window.loadPlans === "function") {
                      window.loadPlans(moduleContent);
                  } else {
                      moduleContent.innerHTML = '<p style="padding: 4rem; text-align: center; color: #e74c3c;">Error: Módulo Planes no disponible</p>';
                      console.error("Función loadPlans no encontrada");
                  }
                  break;

              case "clients":
                    if (typeof window.loadClients === "function") {
                        window.loadClients(moduleContent);
                    } else {
                        moduleContent.innerHTML = '<p style="padding:3rem; text-align:center; color:#e74c3c;">Error al cargar Clientes</p>';
                    }
                    break;


                    case "packages":
                        if (typeof window.loadPackages === "function") {
                            window.loadPackages(moduleContent);
                        } else {
                            moduleContent.innerHTML = `
                                <div style="padding: 4rem; text-align: center; color: var(--text-secondary);">
                                    <h3>Error al cargar Paquetes</h3>
                                    <p>Revisa la consola para más detalles (F12 → Console).</p>
                                </div>
                            `;
                            console.error("Función loadPackages no encontrada. Verifica que js/packages.js esté cargado.");
                        }
                        break;
                        case "deliveries":
                            if (typeof window.loadDeliveries === "function") {
                                window.loadDeliveries(moduleContent);
                            } else {
                                moduleContent.innerHTML = '<p style="padding:3rem; text-align:center; color:#e74c3c;">Error al cargar Entregas</p>';
                            }
                            break;
                            case "reports":
                                if (typeof window.loadReports === "function") {
                                    window.loadReports(moduleContent);
                                } else {
                                    moduleContent.innerHTML = `
                                        <div style="padding: 4rem; text-align: center; color: var(--text-secondary);">
                                            <h3>Reportes</h3>
                                            <p>Módulo en desarrollo. Próximamente disponible.</p>
                                        </div>
                                    `;
                                }
                                break;

              default:
                  moduleContent.innerHTML = '<p style="padding: 4rem; text-align: center;">Selecciona un módulo válido</p>';
          }
      });
  });

  // Cargar dashboard por defecto al iniciar
  const dashboardBtn = document.querySelector('.nav-item[data-module="dashboard"]');
  if (dashboardBtn) {
      dashboardBtn.click();
  } else {
      console.warn("No se encontró botón de dashboard");
      // Cargar dashboard manualmente como fallback
      moduleContent.innerHTML = '<p style="padding: 4rem; text-align: center;">Cargando dashboard...</p>';
  }
});