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

  // Eğer karşılaştırılanlar varsa, onları tekrar çiz
  const oncekiSecimler = JSON.parse(localStorage.getItem("karsilastirilanlar"));
  if (oncekiSecimler && oncekiSecimler.length >= 2) {
    cizKarsilastirmaGrafik(oncekiSecimler);  // aşağıda tanımlayacağız
  } else {
    guncelleGrafik(aktifMarka);
  }
});


  function guncelleGrafik(marka) {
    aktifMarka = marka;
    const data = markaVerileri[marka];
    root.container.children.clear();

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      layout: root.verticalLayout
    }));

    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50
    }));

    let yAxis, xAxis;

    if (currentChartType === "bar") {
      yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "ozellik",
        renderer: am5xy.AxisRendererY.new(root, { inversed: true })
      }));

      xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, {})
      }));

      let series = chart.series.push(am5xy.ColumnSeries.new(root, {
        name: marka,
        xAxis,
        yAxis,
        valueXField: "skor",
        categoryYField: "ozellik",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryY}: {valueX}%"
        })
      }));

      series.columns.template.setAll({
        cornerRadiusTL: 10,
        cornerRadiusBL: 10,
        fillOpacity: 0.8,
        height: am5.percent(40)
      });

      yAxis.data.setAll(data);
      series.data.setAll(data);
      legend.data.setAll(chart.series.values);

    } else {
      xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "ozellik",
        renderer: am5xy.AxisRendererX.new(root, {})
      }));

      yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererY.new(root, {})
      }));

      let series = chart.series.push(am5xy.LineSeries.new(root, {
        name: marka,
        xAxis,
        yAxis,
        valueYField: "skor",
        categoryXField: "ozellik",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryX}: {valueY}%"
        })
      }));

      series.strokes.template.setAll({ strokeWidth: 3 });

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
      legend.data.setAll(chart.series.values);
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

  document.querySelectorAll(".veri-blok").forEach(blok => {
    blok.setAttribute("draggable", true);
    blok.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", blok.dataset.marka);
    });
  });

  const karsilastirilan = new Set();
  const hedefAlan = document.getElementById("karsilastirilanMarkalar");

  document.getElementById("karsilastirmaAlan").addEventListener("dragover", e => {
    e.preventDefault();
  });

  document.getElementById("karsilastirmaAlan").addEventListener("drop", e => {
  e.preventDefault();
  const marka = e.dataTransfer.getData("text/plain");
  if (!karsilastirilan.has(marka)) {
    karsilastirilan.add(marka);
    const kart = document.createElement("div");
    kart.className = "karsilastirilan-kart";
    kart.innerText = marka;
    hedefAlan.appendChild(kart);
  }
});


  document.getElementById("karsilastirBtn").addEventListener("click", () => {
    const secilenler = Array.from(karsilastirilan);
    if (secilenler.length < 2) {
      alert("Lütfen en az iki marka seçin!");
      return;
    }

    root.container.children.clear();

    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      layout: root.verticalLayout
    }));

    let legend = chart.children.push(am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50
    }));

    let xAxis, yAxis;
    const renkler = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6];

    if (currentChartType === "bar") {
      yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "ozellik",
        renderer: am5xy.AxisRendererY.new(root, { inversed: true })
      }));

      xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, {})
      }));

      secilenler.forEach((marka, index) => {
        const data = markaVerileri[marka];
        let series = chart.series.push(am5xy.ColumnSeries.new(root, {
          name: marka,
          xAxis,
          yAxis,
          valueXField: "skor",
          categoryYField: "ozellik",
          tooltip: am5.Tooltip.new(root, {
            labelText: `{name} - {categoryY}: {valueX}%`
          })
        }));

        series.columns.template.setAll({
          fill: am5.color(renkler[index % renkler.length]),
          stroke: am5.color(renkler[index % renkler.length]),
          cornerRadiusTL: 10,
          cornerRadiusBL: 10,
          height: am5.percent(40),
          fillOpacity: 0.8
        });

        yAxis.data.setAll(data);
        series.data.setAll(data);
      });

    } else {
      xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: "ozellik",
        renderer: am5xy.AxisRendererX.new(root, {})
      }));

      yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererY.new(root, {})
      }));

      xAxis.data.setAll([
        { ozellik: "Bilinirlik" },
        { ozellik: "Fiyat/Performans" },
        { ozellik: "Moda Takibi" }
      ]);

      secilenler.forEach((marka, index) => {
        const data = markaVerileri[marka];
        let series = chart.series.push(am5xy.LineSeries.new(root, {
          name: marka,
          xAxis,
          yAxis,
          valueYField: "skor",
          categoryXField: "ozellik",
          tooltip: am5.Tooltip.new(root, {
            labelText: `{name} - {categoryX}: {valueY}%`
          }),
          stroke: am5.color(renkler[index % renkler.length]),
          fill: am5.color(renkler[index % renkler.length])
        }));

        series.strokes.template.setAll({ strokeWidth: 3 });

        series.bullets.push(function () {
          return am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: 6,
              fill: am5.color(renkler[index % renkler.length])
            })
          });
        });

        series.data.setAll(data);
      });
    }

    legend.data.setAll(chart.series.values);
  });

  function cizKarsilastirmaGrafik(secilenler) {
  root.container.children.clear();

  let chart = root.container.children.push(am5xy.XYChart.new(root, {
    layout: root.verticalLayout
  }));

  let xAxis, yAxis;

  if (currentChartType === "bar") {
    yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "ozellik",
        renderer: am5xy.AxisRendererY.new(root, { inversed: true })
      })
    );

    xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, {})
      })
    );
  } else {
    xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "ozellik",
        renderer: am5xy.AxisRendererX.new(root, {})
      })
    );

    yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );
  }

  const renkler = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6];

  secilenler.forEach((marka, index) => {
    const data = markaVerileri[marka];

    if (currentChartType === "bar") {
      let series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: marka,
          xAxis,
          yAxis,
          valueXField: "skor",
          categoryYField: "ozellik",
          tooltip: am5.Tooltip.new(root, {
            labelText: `{name} - {categoryY}: {valueX}%`
          })
        })
      );

      series.columns.template.setAll({
        fill: am5.color(renkler[index % renkler.length]),
        stroke: am5.color(renkler[index % renkler.length]),
        cornerRadiusTL: 10,
        cornerRadiusBL: 10,
        height: am5.percent(40),
        fillOpacity: 0.8
      });

      yAxis.data.setAll(data);
      series.data.setAll(data);
    } else {
      let series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: marka,
          xAxis,
          yAxis,
          valueYField: "skor",
          categoryXField: "ozellik",
          tooltip: am5.Tooltip.new(root, {
            labelText: `{name} - {categoryX}: {valueY}%`
          }),
          stroke: am5.color(renkler[index % renkler.length]),
          fill: am5.color(renkler[index % renkler.length])
        })
      );

      series.strokes.template.setAll({ strokeWidth: 3 });

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 6,
            fill: am5.color(renkler[index % renkler.length])
          })
        });
      });

      xAxis.data.setAll([
        { ozellik: "Bilinirlik" },
        { ozellik: "Fiyat/Performans" },
        { ozellik: "Moda Takibi" }
      ]);

      series.data.setAll(data);
    }
  });
}

});
