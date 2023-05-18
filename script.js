function main() {
  document.querySelector("#value-table").innerHTML = "";
  document.querySelector("#interval-table").innerHTML = "";
  Chart.helpers.each(Chart.instances, function (instance) {
    instance.destroy();
  });

  // Количество разыгранных значений
  let n = parseInt(document.querySelector(".count-input").value);
  // Функция для генерации случайного значения распределения Коши
  function generateCauchy() {
    let u1 = Math.random();
    let u2 = Math.random();

    // Используем обратную функцию распределения для генерации значения
    let x = Math.tan(Math.PI * (u1 - 0.5));

    return x;
  }

  // Генерация значений и сохранение их в массив
  let values = [];
  for (let i = 0; i < n; i++) {
    values.push(generateCauchy());
  }

  const row1 = document.createElement("tr");
  const row2 = document.createElement("tr");

  for (let i = 0; i < values.length; i++) {
    const cell1 = document.createElement("td");
    const cell2 = document.createElement("td");
    if (i == 0) {
      cell1.textContent = "№ испытания"; // Номер испытания
      cell2.textContent = "Результат"; // Результат розыгрыша
    } else {
      cell1.textContent = i; // Номер испытания
      cell2.textContent = values[i].toFixed(2); // Результат розыгрыша
    }
    row1.appendChild(cell1);
    row2.appendChild(cell2);
  }

  document.getElementById("value-table").appendChild(row1);
  document.getElementById("value-table").appendChild(row2);

  // Нахождение минимального и максимального значения
  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);

  // Определение количества интервалов
  let N = Math.floor(Math.log(n));

  // Разделение отрезка на интервалы
  let a = minValue;
  let b = maxValue + 1;
  let intervalSize = (b - a) / N;

  // Инициализация счетчика интервалов
  let intervals = new Array(N).fill(0);

  // Подсчет значений, попадающих в каждый интервал
  for (let i = 0; i < n; i++) {
    let value = values[i];

    for (let j = 0; j < N; j++) {
      if (value >= a + j * intervalSize && value < a + (j + 1) * intervalSize) {
        intervals[j]++;
        break;
      }
    }
  }

  // Формирование данных для гистограммы
  let intervalLabels = [];
  let frequencies = [];

  for (let i = 0; i < N; i++) {
    let intervalStart = a + i * intervalSize;
    let intervalEnd = a + (i + 1) * intervalSize;
    let intervalLabel =
      "[" + intervalStart.toFixed(2) + ", " + intervalEnd.toFixed(2) + ")";
    intervalLabels.push(intervalLabel);

    let frequency = intervals[i];
    frequencies.push(frequency);
  }

  // Построение гистограммы
  let ctxHistogram = document.getElementById("histogram").getContext("2d");
  new Chart(ctxHistogram, {
    type: "bar",
    data: {
      labels: intervalLabels,
      datasets: [
        {
          label: "Частота",
          data: frequencies,
          backgroundColor: "steelblue",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Гистограмма интервального вариационного ряда",
        },
      },
    },
  });

  // Построение кривой плотности распределения Коши
  let densityData = [];
  let densityLabels = [];
  let densityStep = (b - a) / 100;

  for (let x = a; x < b; x += densityStep) {
    let density = 1 / (Math.PI * (1 + Math.pow(x, 2)));
    densityData.push(density);
    densityLabels.push(x.toFixed(2));
  }

  let ctxDensity = document.getElementById("density-plot").getContext("2d");
  new Chart(ctxDensity, {
    type: "line",
    data: {
      labels: densityLabels,
      datasets: [
        {
          label: "Кривая плотности",
          data: densityData,
          borderColor: "steelblue",
          backgroundColor: "transparent",
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Кривая плотности распределения Коши",
        },
      },
    },
  });

  // Построение функции распределения Коши
  let distributionData = [];
  let distributionLabels = [];

  for (let x = a; x < b; x += densityStep) {
    let distribution = (1 / Math.PI) * Math.atan(x) + 0.5;
    distributionData.push(distribution);
    distributionLabels.push(x.toFixed(2));
  }

  let ctxDistribution = document
    .getElementById("distribution-function")
    .getContext("2d");
  let distributionChart = new Chart(ctxDistribution, {
    type: "line",
    data: {
      labels: distributionLabels,
      datasets: [
        {
          label: "Функция распределения",
          data: distributionData,
          borderColor: "steelblue",
          backgroundColor: "transparent",
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          max: 1,
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Функция распределения Коши",
        },
      },
    },
  });

  // Формирование данных для таблицы интервального вариационного ряда
  let tableData = [];
  for (let i = 0; i < N; i++) {
    let intervalStart = a + i * intervalSize;
    let intervalEnd = a + (i + 1) * intervalSize;
    let intervalLabel =
      "[" + intervalStart.toFixed(2) + ", " + intervalEnd.toFixed(2) + ")";
    let frequency = intervals[i];

    tableData.push([intervalLabel, frequency]);
  }

  // Создание и заполнение таблицы
  let table = document.getElementById("interval-table");
  let tableHeader = table.createTHead();
  let tableBody = table.createTBody();

  let headerRow = tableHeader.insertRow();
  headerRow.innerHTML = "<th>Интервал</th><th>Частота</th>";

  for (let i = 0; i < tableData.length; i++) {
    let rowData = tableData[i];
    let row = tableBody.insertRow();

    for (let j = 0; j < rowData.length; j++) {
      let cell = row.insertCell();
      cell.textContent = rowData[j];
    }
  }
}
main();

document.querySelector(".count-button").addEventListener("click", () => {
  main();
});
