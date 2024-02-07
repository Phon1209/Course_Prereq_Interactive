qualitativeColor = ['#8dd3c7','#f5d833','#bebada','#fb8072','#80b1d3'];
sequentialColor = ['#feedde','#fdbe85','#fd8d3c','#e6550d','#a63603'];

const colorScheme = {
  d3: d3.scaleOrdinal(d3.schemeCategory10),
};

const filterScheme = {
  include_department: (departmentList) => {
    return (data) => {
      data.type = "main";
      if (departmentList.length == 1 && departmentList[0] === "all")
        return true;
      if (departmentList.includes(data.department)) return true;
      data.type = "other";
      return data.prereqs.reduce((acc, val) => {
        const inc = departmentList.includes(val.split()[0]);
        return acc || inc;
      }, false);
    };
  },
};
