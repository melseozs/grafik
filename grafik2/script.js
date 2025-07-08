am5.ready(function () {
  let root = am5.Root.new("chartdiv");

  root.setThemes([am5themes_Animated.new(root)]);

  let chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none",
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

  series.columns.template.setAll({
    cornerRadiusTL: 10,
    cornerRadiusBL: 10,
    cornerRadiusTR: 10,
    cornerRadiusBR: 10,
    fillOpacity: 0.7,
    height: am5.percent(30)
  });

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

  // Gelen veri varsa grafik verisine de ekle
  const gelen = localStorage.getItem("yeniMarka");
  if (gelen) {
    const yeni = JSON.parse(gelen);
    markaVerileri[yeni.isim] = yeni.veriler;
    localStorage.removeItem("yeniMarka");
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const marka = entry.target.dataset.marka;
        const data = markaVerileri[marka] || [{ ozellik: "Bilinirlik", skor: 0 }];
        yAxis.data.setAll(data);
        series.data.setAll(data, 1000);
      }
    });
  }, { threshold: 0.6 });

  function guncelleObserver() {
    const veriBloklar = document.querySelectorAll(".veri-blok");
    veriBloklar.forEach(blok => observer.observe(blok));
  }

  guncelleObserver();
  setTimeout(guncelleObserver, 500);
});
