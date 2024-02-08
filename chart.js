const colornone = "#ccc";
const colorout = "#f00";
const colorin = "#00f";
const colorScale = colorScheme["qualitative"];
const colorMapping = {};
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
  const map = new Map(root.leaves().map((d) => [d.data.name, d]));
  for (const d of root.leaves()) {
    (d.incoming = []),
      (d.outgoing = d.data.prereqs
        .filter((i) => {
          const out = map.get(i);
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

function hierarchy(data, filterMethod = () => true) {
  let root = {
    name: "RPI",
    children: [],
  };
  const depList = [];
  const map = new Map();
  data.filter(filterMethod).forEach((datum) => {
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

  depList.sort().forEach((dep, i) => {
    colorMapping[dep] = colorScale(i);
  });

  return root;
}

let allData;

const initialRender = async (callback) => {
  allData = prereqData;
  render(["all"], "include_department", callback);
};

const render = async (department, filterName, callback) => {
  data = hierarchy(allData, filterScheme[filterName](department));
  const all = department.length == 1 && department[0] === "all";
  const width = all ? 1500 : 1000;
  const radius = width / 2;
  const fontSize = all ? "4px" : "10px";
  const borderSize = all ? 200 : 150;

  const tree = d3.cluster().size([2 * Math.PI, radius - borderSize]);
  const root = tree(
    bilink(
      d3
        .hierarchy(data)
        .sort(
          (a, b) =>
            d3.ascending(a.type, b.type) ||
            d3.ascending(a.department, b.department) ||
            d3.ascending(a.data.name, b.data.name) ||
            d3.ascending(a.height, b.height)
        )
    )
  );

  d3.select("#chart svg").remove();
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", width)
    .attr("viewBox", [-width / 2, -width / 2, width, width])
    .attr(
      "style",
      `max-width: 100%; height: auto; font: ${fontSize} sans-serif;`
    );

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
    .attr("fill", (d) => {
      if (all || department.includes(d.data.department))
        return colorMapping[d.data.department];
      return "#ffffff00";
    })
    .attr("color", (d) => {
      if (all || department.includes(d.data.department))
        return colorMapping[d.data.department];
      return "#ffffff00";
    })
    .text((d) => d.data.displayName)
    .each(function (d) {
      d.text = this;
    })
    .on("mouseover", overed)
    .on("mouseout", outed)
    .call((text) =>
      text.append("title").text(
        (d) => `${d.data.name.toUpperCase()}: ${d.data.displayName}
${d.outgoing.length} prereq(s) needed
${d.incoming.length} course(s) has this as prereq`
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
    d3.selectAll(d.incoming.map((d) => d.path)).attr("stroke", null);
    d3.selectAll(d.incoming.map(([d]) => d.text))
      .attr("fill", function () {
        return d3.select(this).attr("color");
      })
      .attr("font-weight", null);
    d3.selectAll(d.outgoing.map((d) => d.path)).attr("stroke", null);
    d3.selectAll(d.outgoing.map(([, d]) => d.text))
      .attr("fill", function () {
        return d3.select(this).attr("color");
      })
      .attr("font-weight", null);
  }

  const nCourse = root.leaves().length;

  callback(nCourse);
  return svg.node();
};
