require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const carrosFake = [
  {
    titulo: "Volkswagen Nivus Highline",
    descricao: "SUV urbano com visual esportivo, motor 1.0 turbo e conectividade de ponta.",
    marca: "Volkswagen",
    modelo: "Nivus",
    ano: 2023,
    preco_estimado: 128900,
    nota_geral: 9,
    video_url: "https://www.youtube.com/embed/5MjZ4z9oykA",
    imagem_url: "https://cdn.motor1.com/images/mgl/Y9GJG/s1/vw-nivus-highline.jpg"
  },
  {
    titulo: "Fiat Pulse Audace",
    descricao: "Compacto aventureiro com boa altura do solo, central multimídia e motor turbo.",
    marca: "Fiat",
    modelo: "Pulse",
    ano: 2023,
    preco_estimado: 114990,
    nota_geral: 8,
    video_url: "https://www.youtube.com/embed/j4jh2LTu6pQ",
    imagem_url: "https://quatrorodas.abril.com.br/wp-content/uploads/2021/10/Fiat-Pulse-Drive-e1633097694477.jpg"
  },
  {
    titulo: "Honda Civic Touring",
    descricao: "Sedã híbrido de luxo com excelente dirigibilidade e consumo reduzido.",
    marca: "Honda",
    modelo: "Civic",
    ano: 2024,
    preco_estimado: 198700,
    nota_geral: 10,
    video_url: "https://www.youtube.com/embed/FGZZ7TKnkRM",
    imagem_url: "https://cdn.motor1.com/images/mgl/XbJ2r/s1/honda-civic-touring-2022.jpg"
  },
  {
    titulo: "Jeep Renegade Trailhawk",
    descricao: "SUV com tração 4x4, motor turbo e design robusto para aventuras reais.",
    marca: "Jeep",
    modelo: "Renegade",
    ano: 2022,
    preco_estimado: 159990,
    nota_geral: 8,
    video_url: "https://www.youtube.com/embed/d6qXDBDOsq0",
    imagem_url: "https://cdn.motor1.com/images/mgl/wvKNp/s1/jeep-renegade-2022.jpg"
  },
  {
    titulo: "Chevrolet Tracker Premier",
    descricao: "SUV compacto com motor turbo, excelente consumo urbano e itens de série modernos.",
    marca: "Chevrolet",
    modelo: "Tracker",
    ano: 2023,
    preco_estimado: 139990,
    nota_geral: 9,
    video_url: "https://www.youtube.com/embed/1fqIcsKhODI",
    imagem_url: "https://cdn.motor1.com/images/mgl/6rzRG/s1/chevrolet-tracker-2022.jpg"
  }
];

(async () => {
  for (const carro of carrosFake) {
    const { error } = await supabase
      .from('carros_avaliados')
      .insert([{ ...carro, autor_email: 'admin@premiumcar.com' }]);
    
    if (error) {
      console.error("Erro ao inserir:", carro.titulo, error.message);
    } else {
      console.log("✅ Inserido:", carro.titulo);
    }
  }

  console.log("Finalizado!");
})();