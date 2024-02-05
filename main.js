window.$ = document.querySelector.bind(document);
window.$s = document.querySelectorAll.bind(document);

document.addEventListener("DOMContentLoaded", () => {
  const departmentDropdown = $("#department");
  console.log(departmentDropdown);

  departmentDir.forEach((dep) => {
    const opt = document.createElement("option");
    opt.value = dep;
    opt.textContent = dep.toUpperCase();

    departmentDropdown.add(opt);
  });

  departmentDropdown.addEventListener("change", () => {
    const selection = departmentDropdown.value;
    console.log(selection);
    render(selection);
  });
});
