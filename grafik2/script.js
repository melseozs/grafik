am5.ready(function () {
  let root = am5.Root.new("chartdiv");
  root.setThemes([am5themes_Animated.new(root)]);

  let currentChartType = "bar";
  let aktifMarka = "ZARA";
  const grafikSecici = document.getElementById("grafikSecici");

  const markaVerileri = {
    "ZARA": [
      { ozellik: "Bilinirlik", skor: 90 },
      { ozellik: "Fiyat/Performans", skor: 75 },
      { ozellik: "Moda Takibi", skor: 85 }
    ],
    "H&M": [
      { ozellik: "Bilinirlik", skor: 85 },
      { ozellik: "Fiyat/Performans", skor: 80 },
      { ozellik: "Moda Takibi", skor: 70 }
    ],
    "Uniqlo": [
      { ozellik: "Bilinirlik", skor: 80 },
      { ozellik: "Fiyat/Performans", skor: 82 },
      { ozellik: "Moda Takibi", skor: 76 }
    ],
    "Gucci": [
      { ozellik: "Bilinirlik", skor: 78 },
      { ozellik: "Fiyat/Performans", skor: 60 },
      { ozellik: "Moda Takibi", skor: 90 }
    ],
    "Nike": [
      { ozellik: "Bilinirlik", skor: 94 },
      { ozellik: "Fiyat/Performans", skor: 88 },
      { ozellik: "Moda Takibi", skor: 85 }
    ]
  };

  const gelen = localStorage.getItem("yeniMarka");
  if (gelen) {
    const yeni = JSON.parse(gelen);
    markaVerileri[yeni.isim] = yeni.veriler;

    const container = document.getElementById("veriContainer");
    const yeniDiv = document.createElement("section");
    yeniDiv.className = "veri-blok";
    yeniDiv.setAttribute("data-marka", yeni.isim);
    yeniDiv.innerHTML = `
      <h2>${yeni.isim}</h2>
      <p>${yeni.aciklama}</p>
    `;
    container.appendChild(yeniDiv);

    aktifMarka = yeni.isim;
    localStorage.removeItem("yeniMarka");
  }

  grafikSecici.addEventListener("change", function () {
    currentChartType = this.value;
    guncelleGrafik(aktifMarka);
  });

  function guncelleGrafik(marka) {
    aktifMarka = marka;
    const data = markaVerileri[marka];
    root.container.children.clear();

    if (currentChartType === "bar") {
      let chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          layout: root.verticalLayout
        })
      );

      let yAxis = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "ozellik",
          renderer: am5xy.AxisRendererY.new(root, { inversed: true })
        })
      );

      let xAxis = chart.xAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          max: 100,
          strictMinMax: true,
          renderer: am5xy.AxisRendererX.new(root, {})
        })
      );

      let series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Skor",
          xAxis,
          yAxis,
          valueXField: "skor",
          categoryYField: "ozellik",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{categoryY}: {valueX}%"
          })
        })
      );

      series.columns.template.adapters.add("tooltipText", function () {
        return "{categoryY}: {valueX}%";
      });

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: am5.Label.new(root, {
            text: "{valueX}%",
            fill: am5.color(0x000000),
            centerY: am5.p50,
            centerX: am5.p100,
            populateText: true,
            fontSize: 16
          })
        });
      });

      series.columns.template.setAll({
        cornerRadiusTL: 10,
        cornerRadiusBL: 10,
        fillOpacity: 0.8,
        height: am5.percent(40)
      });

      yAxis.data.setAll(data);
      series.data.setAll(data);
    }

    else if (currentChartType === "line") {
      let chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          layout: root.verticalLayout
        })
      );

      let xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "ozellik",
          renderer: am5xy.AxisRendererX.new(root, {})
        })
      );

      let yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          max: 100,
          strictMinMax: true,
          renderer: am5xy.AxisRendererY.new(root, {})
        })
      );

      let series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: "Skor",
          xAxis,
          yAxis,
          valueYField: "skor",
          categoryXField: "ozellik",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{categoryX}: {valueY}%"
          }),
          stroke: am5.color(0x4e7ccc),
          fill: am5.color(0x4e7ccc)
        })
      );

      series.strokes.template.setAll({
        strokeWidth: 3
      });

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 6,
            fill: am5.color(0x4e7ccc)
          })
        });
      });

      xAxis.data.setAll(data);
      series.data.setAll(data);
    }
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const marka = entry.target.dataset.marka;
        const data = markaVerileri[marka];
        if (data) {
          guncelleGrafik(marka);
        }
      }
    });
  }, { threshold: 0.6 });

  function guncelleObserver() {
    const bloklar = document.querySelectorAll(".veri-blok");
    bloklar.forEach(blok => observer.observe(blok));
  }

  setTimeout(() => {
    guncelleGrafik(aktifMarka);
    guncelleObserver();
  }, 300);
});
