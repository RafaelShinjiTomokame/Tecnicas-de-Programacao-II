import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { Meteo } from "./models/Meteo";

// Função para converter vírgula decimal em ponto
function parseNumber(value: string): number {
  if (!value) return NaN;
  return parseFloat(value.replace(",", "."));
}

const meteoData: Meteo[] = [];

fs.createReadStream(
  path.resolve(__dirname, "../data/Desafio_Dados_Meteorologicos.csv")
)
  .pipe(
    csv({
      separator: ";",
      mapHeaders: ({ header }) =>
        header.trim().replace(/^\uFEFF/, "") // remove BOM e espaços
    })
  )
  .on("data", (row) => {
    meteoData.push(
      new Meteo(
        row["Date"],               
        row["Time"],                 
        parseNumber(row["Temp_C"]),  
        parseNumber(row["Hum"]),
        parseNumber(row["Press_Bar"]),
        parseNumber(row["TempCabine_C"]),
        parseNumber(row["Charge"]),
        parseNumber(row["SR_Wm2"]),
        parseNumber(row["WindPeak_ms"]),
        parseNumber(row["WindSpeed_Inst"]),
        parseNumber(row["WindSpeed_Avg"]),
        parseNumber(row["WindDir_Inst"]),
        parseNumber(row["WindDir_Avg"])
      )
    );
  })
  .on("end", () => {
    console.log(`Dados carregados: ${meteoData.length}`);

    // 5 dias mais quentes
    const topTemp = [...meteoData]
      .sort((a, b) => b.tempC - a.tempC)
      .slice(0, 5);
    console.log(
      "5 dias mais quentes:",
      topTemp.map((d) => `${d.date} - ${d.tempC.toFixed(2)}°C`)
    );

    // Média de todas as temperaturas
    const mediaTemp =
      meteoData.reduce((acc, d) => acc + d.tempC, 0) / meteoData.length;
    console.log("Média de Temperatura:", mediaTemp.toFixed(2), "°C");

    // Média geral das médias de vento
    const mediaVento =
      meteoData.reduce((acc, d) => acc + d.windSpeedAvg, 0) / meteoData.length;
    console.log("Média Geral do Vento:", mediaVento.toFixed(2), "m/s");

    // 3 maiores pressões atmosféricas
    const topPress = [...meteoData]
      .sort((a, b) => b.pressBar - a.pressBar)
      .slice(0, 3);
    console.log(
      "3 maiores pressões:",
      topPress.map((d) => `${d.date} - ${d.pressBar.toFixed(2)} Bar`)
    );

    // Média geral de umidade
    const mediaUmidade =
      meteoData.reduce((acc, d) => acc + d.humPct, 0) / meteoData.length;
    console.log("Média Umidade:", mediaUmidade.toFixed(2), "%");
  });
