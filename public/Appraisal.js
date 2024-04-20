// submit form to table
const d = new Date();
let submitBtn = document.getElementById("submit");
const title = document.getElementById("title").value;
const employeeId = document.getElementById("employeeId").value;

const Appraiasls = {
  title: title,
  Employe: employeeId,
  apraisalDate: `${String(d.getDate() + 1).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`,
  kpi: [],
  MdComment: "",
  HrCommnet: "",
  ManagerComment: "",
  employeComment: "",
  generalRating: "",
};

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();

  function Apraisal() {
    this.score = 0;
    this.innovation = 0;
    this.Measures = e.target.elements.Measures.value;
    this.Perspective = e.target.elements.Perspective.value;
    this.Objectives = e.target.elements.Objectives.value;
  }
  Appraiasls.kpi.push(new Apraisal());
  render(Appraiasls.kpi);

  document.querySelector("form").reset();
});

submitBtn.addEventListener("click", async () => {
  try {
    if (Appraiasls.kpi.length < 1) {
      submitBtn.setAttribute("disabled", true);
      throw new Error("Please select a KPI for this employee, Reload page to disable submit button");
    } else {
       
      const request = await fetch("/api/v1/Appraiasl/Employee/Apraisal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Appraiasls),
      });
      const response = await request.json();
      alert(response.message || response.error);
      response.message ? location.reload() : "";
      
    }
  } catch (error) {
    alert(error.message);
    submitBtn.setAttribute("disabled", true);
  }
});

var conNumber = 0;
const render = function (Apraisals) {
  var tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  Appraiasls.kpi.forEach((kpi) => {
    let trow = document.createElement("tr");
    // let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let td3 = document.createElement("td");
    let td4 = document.createElement("td");
    let td5 = document.createElement("td");
    let td6 = document.createElement("td");
    let td7 = document.createElement("td");

    // td1.innerText = conNumber + 1;
    td6.innerText = kpi.Perspective;
    td3.innerText = kpi.Objectives;
    td2.innerText = kpi.Measures;
    td5.innerText = `${kpi.score}`;
    td4.innerText = kpi.innovation;
    td7.innerText = "NEW";

    // delete kpi
    const deleteItem = () => {
      let index = Appraiasls.kpi.findIndex((item) => {
        return item === kpi;
      });
      if (index > -1) {
        try {
          Appraiasls.kpi.splice(index, 1);
          render(Appraiasls.kpi);

          calculateMax(Appraiasls.kpi);

          alert("kpi removed successfully");
        } catch (error) {
          alert(error.message);
        }
      }
    };

    //delete kpi innovation from list   of
    trow.ondblclick = deleteItem;
    trow.setAttribute("title", "Double click to delete");
    td7.classList.add("bg-success");
    td7.classList.add("text-light");
    td3.style -
      {
        width: " 11em",
        backgroundColor: "lightblue",
        border: ` 2px solid black`,
        padding: "10px",
        wordWrap: "break-word",
        fontSize: "20px",
      };

    // trow.appendChild(td1);
    trow.appendChild(td6);
    trow.appendChild(td3);
    trow.appendChild(td2);
    trow.appendChild(td5);
    trow.appendChild(td4);
    trow.appendChild(td7);
    tbody.appendChild(trow);
  });
  calculateMax(Appraiasls.kpi);
};

// calculate Max score
const calculateMax = function (Apraisals) {
  var max = Appraiasls.kpi
    .map((kpi) => {
      return kpi.Measures;
    })
    .reduce((total, currentValue) => {
      return parseInt(total) + parseInt(currentValue);
    }, 0);
  document.getElementById("Max").innerText = `Max Score: ${max}/100`;
  if (max > 100) {
    alert("max score exceeded");
  }
  return max;
};

