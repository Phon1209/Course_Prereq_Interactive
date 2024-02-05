window.$ = document.querySelector.bind(document);
window.$s = document.querySelectorAll.bind(document);

document.addEventListener("DOMContentLoaded", () => {
  const departmentDropdown = $("#department");

  departmentDir.forEach((dep) => {
    const opt = document.createElement("option");
    opt.value = dep;
    opt.textContent = dep.toUpperCase();

    departmentDropdown.add(opt);
  });

  departmentDropdown.addEventListener("change", () => {
    const selection = departmentDropdown.value;
    render(selection);
  });
  render();
});
