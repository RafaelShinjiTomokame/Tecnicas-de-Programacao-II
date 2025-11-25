import fs from "fs";
import path from "path";
import csv from "csv-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface Contato {
  nome: string;
  email: string;
  idade: string;
  mesaniversario: string;
}


function getMesSeguinte(mes: number): string {
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];
  return meses[(mes % 12)];
}


async function carregarTemplate(): Promise<string> {
  const caminhoTemplate = path.join(__dirname, "imagens", "Mensagem.html");
  return fs.readFileSync(caminhoTemplate, "utf-8");
}


async function carregarCSV(): Promise<Contato[]> {
  return new Promise((resolve, reject) => {
    const resultados: Contato[] = [];

    const caminhoCSV = path.join(__dirname, "imagens", "emails.csv");

    fs.createReadStream(caminhoCSV)
      .pipe(csv())
      .on("data", (data) => {
        console.log("Linha lida:", data); 
        resultados.push(data);
      })
      .on("end", () => resolve(resultados))
      .on("error", reject);
  });
}


async function enviarEmail(destinatario: Contato, template: string, transporter: nodemailer.Transporter) {
  const nome = destinatario.nome;
  const idade = Number(destinatario.idade);
  const mesNiver = Number(destinatario.mesaniversario);
  const desconto = idade;
  const mesQueVem = getMesSeguinte(mesNiver);

  const htmlFinal = template
    .replace(/{{nome}}/g, nome)
    .replace(/{{percdesc}}/g, desconto.toString())
    .replace(/{{mesquevem}}/g, mesQueVem);

  await transporter.sendMail({
    from: `"Ótica Exemplo" <${process.env.EMAIL_USER}>`,
    to: destinatario.email,
    subject: "Parabéns! Aproveite seu desconto 🎉",
    html: htmlFinal,
    attachments: [
      {
        filename: "logo.jpg",
        path: path.join(__dirname, "..", "imagens", "logo.jpg"),
        cid: "logo"
      },
      {
        filename: "assinatura.png",
        path: path.join(__dirname, "..", "imagens", "assinatura.png"),
        cid: "assinatura"
      }
    ]
  });

  console.log(`✔ Email enviado para: ${destinatario.email}`);
}

// Main
async function main() {
  const template = await carregarTemplate();
  const contatos = await carregarCSV();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  for (const contato of contatos) {
    await enviarEmail(contato, template, transporter);
  }

  console.log("🎉 Todos os e-mails foram enviados!");
}

main().catch(console.error);
