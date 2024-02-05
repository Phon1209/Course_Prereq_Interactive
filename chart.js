const colornone = "#ccc";
const colorout = "#f00";
const colorin = "#00f";
const departmentDir = [
  "all",
  "arch",
  "arts",
  "astr",
  "bcbp",
  "biol",
  "bmed",
  "chem",
  "chme",
  "civl",
  "cogs",
  "comm",
  "csci",
  "dses",
  "econ",
  "ecse",
  "engr",
  "enve",
  "epow",
  "erth",
  "gsas",
  "ihss",
  "inqr",
  "isci",
  "isye",
  "itec",
  "itws",
  "lang",
  "lght",
  "mane",
  "math",
  "matp",
  "mgmt",
  "mtle",
  "phil",
  "phys",
  "psyc",
  "stsh",
  "stso",
  "stss",
  "writ",
];

function bilink(root) {
  // return root;
  const map = new Map(root.leaves().map((d) => [d.data.name, d]));
  // console.log(root.leaves());
  for (const d of root.leaves()) {
    // console.log(d.incoming, d.outgoing);
    (d.incoming = []),
      (d.outgoing = d.data.prereqs
        .filter((i) => {
          const out = map.get(i);
          // if (!out) console.log(d.data.name, i);
          return out;
        })
        .map((i) => {
          return [d, map.get(i)];
        }));
  }
  for (const d of root.leaves()) {
    for (const o of d.outgoing) o[1].incoming.push(o);
  }
  return root;
}

function hierarchy(data) {
  let root = {
    name: "RPI",
    children: [],
  };
  const depList = [];
  const map = new Map();
  data.forEach((datum) => {
    const { name, department } = datum;
    if (map.has(name)) return map.get(name);
    map.set(name, datum);

    if (!map.has(department)) {
      const dep = {
        name: department,
        children: [],
      };
      depList.push(department);
      root.children.push(dep);
      map.set(department, dep);
    }

    const parent = map.get(department);
    parent.children.push(datum);
    map.set(department, parent);

    return datum;
  });

  return root;
}

async function fetchJSONData(department) {
  let filePath;
  console.log(department);
  if (!department || department == "" || department === "all")
    filePath = "./hw5_data/HED_formatted.json";
  else filePath = `./hw5_data/${department}_list.json`;

  return await fetch(filePath)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => data)
    .catch((error) => console.error("Unable to fetch data:", error));
}

async function read(department) {
  return await fetchJSONData(department);
}

const render = async (department = "all") => {
  const res = await read(department);

  data = hierarchy(res);
  const width = 1000;
  const radius = width / 2;

  const tree = d3.cluster().size([2 * Math.PI, radius - 100]);
  const root = tree(
    bilink(
      d3
        .hierarchy(data)
        .sort(
          (a, b) =>
            d3.ascending(a.height, b.height) ||
            d3.ascending(a.data.name, b.data.name)
        )
    )
  );

  // console.log(root);

  d3.select("#chart svg").remove();
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", width)
    .attr("viewBox", [-width / 2, -width / 2, width, width])
    .attr("style", "max-width: 100%; height: auto; font: 6px sans-serif;");

  // console.log(root);
  // console.log(root.leaves());
  const node = svg
    .append("g")
    .selectAll()
    .data(root.leaves())
    .join("g")
    .attr(
      "transform",
      (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
    )
    .append("text")
    .attr("dy", "0.31em")
    .attr("x", (d) => (d.x < Math.PI ? 6 : -6))
    .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end"))
    .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null))
    .text((d) => d.data.displayName)
    .each(function (d) {
      d.text = this;
    })
    .on("mouseover", overed)
    .on("mouseout", outed)
    .call((text) =>
      text.append("title").text(
        (d) => `${d.data.department}: ${d.data.displayName}
${d.outgoing.length} outgoing
${d.incoming.length} incoming`
      )
    );

  const line = d3
    .lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius((d) => d.y)
    .angle((d) => d.x);

  const link = svg
    .append("g")
    .attr("stroke", colornone)
    .attr("fill", "none")
    .selectAll()
    .data(root.leaves().flatMap((leaf) => leaf.outgoing))
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", ([i, o]) => line(i.path(o)))
    .each(function (d) {
      d.path = this;
    });

  function overed(event, d) {
    link.style("mix-blend-mode", null);
    d3.select(this).attr("font-weight", "bold");
    // d3.select(this).attr("font-size", "15px");
    d3.selectAll(d.incoming.map((d) => d.path))
      .attr("stroke", colorin)
      .raise();
    d3.selectAll(d.incoming.map(([d]) => d.text))
      .attr("fill", colorin)
      .attr("font-weight", "bold");
    d3.selectAll(d.outgoing.map((d) => d.path))
      .attr("stroke", colorout)
      .raise();
    d3.selectAll(d.outgoing.map(([, d]) => d.text))
      .attr("fill", colorout)
      .attr("font-weight", "bold");
  }

  function outed(event, d) {
    link.style("mix-blend-mode", "multiply");
    d3.select(this).attr("font-weight", null);
    // d3.select(this).attr("font-size", null);
    d3.selectAll(d.incoming.map((d) => d.path)).attr("stroke", null);
    d3.selectAll(d.incoming.map(([d]) => d.text))
      .attr("fill", null)
      .attr("font-weight", null);
    d3.selectAll(d.outgoing.map((d) => d.path)).attr("stroke", null);
    d3.selectAll(d.outgoing.map(([, d]) => d.text))
      .attr("fill", null)
      .attr("font-weight", null);
  }

  return svg.node();
};
