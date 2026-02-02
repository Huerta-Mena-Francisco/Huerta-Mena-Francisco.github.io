// js/ui-theme.js
console.log("Theme module cargado");

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const html = document.documentElement;
  let current = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', current);
  updateButtonText(current);

  toggleBtn.addEventListener("click", () => {
    current = current === "dark" ? "light" : "dark";
    html.setAttribute('data-theme', current);
    localStorage.setItem("theme", current);
    updateButtonText(current);
  });

  function updateButtonText(theme) {
    toggleBtn.textContent = theme === "dark" ? "☀️ Modo Día" : "🌙 Modo Noche";
  }
});