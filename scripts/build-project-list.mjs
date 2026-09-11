import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("docs/research/gutorequena-com-7a05656a/root-8a5edab2/global-extraction.json", "utf-8"));
const imgs = data.images.filter(i => i.displayW > 150 && i.displayH > 150 && !i.src.endsWith(".gif"));

function shapeOf(i) {
  const r = i.displayW / i.displayH;
  if (i.displayH > 550 && i.displayW < 500) return "tall";
  if (r > 1.8) return "wide";
  return "square";
}

const buckets = { wide: [], tall: [], square: [] };
imgs.forEach(i => buckets[shapeOf(i)].push(i));

// title, category, desired shape
const PROJECTS = [
  ["Apartamento Varanda", "Arquitetura", "wide"],
  ["Luminária Life", "Produto", "square"],
  ["Edifício Terra", "Arquitetura", "tall"],
  ["Casa Conectada", "Arquitetura", "wide"],
  ["Dolce Gusto Neo", "Comercial", "square"],
  ["Terminal 7", "Arquitetura", "wide"],
  ["Pavilhão Dançante", "Comercial", "wide"],
  ["Zissou Flagship", "Comercial", "square"],
  ["Hermès Pop-Up", "Comercial", "wide"],
  ["The Year", "Comercial", "square"],
  ["Eu Estou", "Juntxs Lab", "wide"],
  ["Era Uma Vez", "Produto", "tall"],
  ["#JuntosComOrgulho", "Juntxs Lab", "wide"],
  ["Criatura de Luz", "Arquitetura", "wide"],
  ["Estrela Sensível", "Cenografia", "wide"],
  ["Aura", "Produto", "square"],
  ["Heartbits", "Juntxs Lab", "square"],
  ["Youse", "Corporativo", "wide"],
  ["Walmart.com", "Corporativo", "wide"],
  ["Disco Club", "Comercial", "wide"],
  ["Memorial Covid-19", "Juntxs Lab", "square"],
  ["Luminária Alma", "Produto", "square"],
  ["Empatias Mapeadas", "Juntxs Lab", "wide"],
  ["Poltrona Delírios", "Produto", "square"],
  ["Meu Coração Bate Como o Seu", "Juntxs Lab", "wide"],
  ["Cadeira Nóize", "Produto", "square"],
  ["Estímulos Emocionais", "Juntxs Lab", "tall"],
  ["Colheita Dourada", "Produto", "square"],
  ["Utopia - SPFW", "Cenografia", "wide"],
  ["Pavilhão Brasil Dubai", "Arquitetura", "wide"],
  ["Love Project", "Produto", "square"],
  ["Studio Sol", "Corporativo", "wide"],
];

const used = new Set();
const result = [];
for (const [title, category, shape] of PROJECTS) {
  let bucket = buckets[shape];
  let pick = bucket.find(i => !used.has(i.src));
  if (!pick) {
    // fall back to any unused image
    pick = imgs.find(i => !used.has(i.src));
  }
  if (!pick) continue;
  used.add(pick.src);
  result.push({ title, category, shape, src: pick.src, w: pick.displayW, h: pick.displayH });
}

fs.writeFileSync("docs/research/gutorequena-com-7a05656a/root-8a5edab2/curated-projects.json", JSON.stringify(result, null, 2));
console.log("curated:", result.length);
result.forEach(r => console.log(r.title, "|", r.shape, "|", r.src.split("/").pop().slice(0,50)));
