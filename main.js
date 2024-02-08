window.$ = document.querySelector.bind(document);
window.$s = document.querySelectorAll.bind(document);

const updateStatistic = (nCourse, courseListing) => {
  $("#courses").textContent = `${nCourse} course(s) found`;
  const res = $("#course-label");

  const newChildren = [];
  courseListing.forEach((course) => {
    const div = document.createElement("div");
    div.classList.add("result-label");
    const { color, name } = course;
    const colDiv = document.createElement("div");
    const nameDiv = document.createElement("p");
    colDiv.style.backgroundColor = color;
    nameDiv.textContent = name;
    div.appendChild(colDiv);
    div.appendChild(nameDiv);
    newChildren.push(div);
  });
  res.replaceChildren(...newChildren);
};

const handleCheckboxChange = (event) => {
  event.preventDefault();

  var checkboxes = Array.from(
    document.querySelectorAll('input[type="checkbox"]')
  );
  const checkedDepartment = checkboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  if (event.target.checked && event.target.value == "all") {
    checkboxes.forEach((checkbox) => (checkbox.checked = false));
    $("input#checkbox-0").checked = true;
    checkedDepartment.splice(0, checkedDepartment.length);
    checkedDepartment.push("all");
  }
  if (checkedDepartment.includes("all") && checkedDepartment.length > 1) {
    checkedDepartment.shift();
    $("input#checkbox-0").checked = false;
  }
  if (checkedDepartment.length > 5) {
    event.target.checked = false;
  } else {
    if (checkedDepartment.length === 0) {
      $("input#checkbox-0").checked = true;
      checkedDepartment.push("all");
    }
    render(checkedDepartment, "include_department", updateStatistic);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const container = $("#department");

  departmentDir.forEach((dep, i) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "checkbox-" + i;
    checkbox.value = dep;
    if (i === 0) checkbox.checked = true;
    checkbox.addEventListener("change", handleCheckboxChange);
    container.appendChild(checkbox);
    const label = document.createElement("label");
    label.htmlFor = "checkbox-" + i;
    label.textContent = dep.toUpperCase();

    const div = document.createElement("div");
    div.appendChild(checkbox);
    div.appendChild(label);

    container.appendChild(div);
  });

  initialRender(updateStatistic);
});
