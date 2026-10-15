import type { Category, Product } from "../types";

export const categories: Category[] = [
  { id: 1, name: "Freios" },
  { id: 2, name: "Motor" },
  { id: 3, name: "Suspensão" },
  { id: 4, name: "Elétrica" },
  { id: 5, name: "Filtros e Óleos" },
];

const img = (text: string) =>
  `https://placehold.co/600x400/e2e8f0/334155?text=${encodeURIComponent(text)}`;

export const products: Product[] = [
  { id: 1, name: "Pastilha de Freio Dianteira", description: "Pastilha cerâmica de alta durabilidade, baixo ruído.", price: 129.9, stock: 25, image_url: img("Pastilha"), category_id: 1, brand: "Bosch" },
  { id: 2, name: "Disco de Freio Ventilado", description: "Par de discos ventilados para melhor dissipação de calor.", price: 289.9, stock: 12, image_url: img("Disco"), category_id: 1, brand: "Fremax" },
  { id: 3, name: "Vela de Ignição Iridium", description: "Vela de longa vida útil, melhor eficiência de combustível.", price: 49.9, stock: 60, image_url: img("Vela"), category_id: 2, brand: "NGK" },
  { id: 4, name: "Correia Dentada", description: "Correia reforçada para motores 1.0 e 1.6.", price: 89.9, stock: 18, image_url: img("Correia"), category_id: 2, brand: "Gates" },
  { id: 5, name: "Amortecedor Dianteiro", description: "Amortecedor pressurizado a gás, conforto e estabilidade.", price: 349.9, stock: 8, image_url: img("Amortecedor"), category_id: 3, brand: "Cofap" },
  { id: 6, name: "Kit Batente e Coifa", description: "Kit completo para suspensão dianteira.", price: 119.9, stock: 0, image_url: img("Kit Batente"), category_id: 3, brand: "Monroe" },
  { id: 7, name: "Bateria 60Ah", description: "Bateria livre de manutenção, 18 meses de garantia.", price: 459.9, stock: 10, image_url: img("Bateria"), category_id: 4, brand: "Moura" },
  { id: 8, name: "Lâmpada Farol H4 (par)", description: "Lâmpadas de maior luminosidade e alcance.", price: 79.9, stock: 40, image_url: img("Lampada H4"), category_id: 4, brand: "Philips" },
  { id: 9, name: "Filtro de Óleo", description: "Filtro com alta capacidade de retenção de impurezas.", price: 29.9, stock: 100, image_url: img("Filtro Oleo"), category_id: 5, brand: "Mann" },
  { id: 10, name: "Óleo 5W30 Sintético 1L", description: "Óleo sintético para motores flex modernos.", price: 54.9, stock: 70, image_url: img("Oleo 5W30"), category_id: 5, brand: "Mobil" },
  { id: 11, name: "Filtro de Ar", description: "Filtro de ar do motor, encaixe perfeito.", price: 39.9, stock: 45, image_url: img("Filtro Ar"), category_id: 5, brand: "Tecfil" },
  { id: 12, name: "Bomba de Combustível", description: "Bomba elétrica com alta vazão e baixo ruído.", price: 219.9, stock: 6, image_url: img("Bomba"), category_id: 2, brand: "Bosch" },
];