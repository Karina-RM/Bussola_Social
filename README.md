# Bússola Social

A Bússola Social é um site que ajuda a achar serviço público gratuito perto de você: UBS, CRAS, clínica-escola de universidade pública, projeto de extensão. Você escolhe sua cidade e a gente mostra o que tem disponível na sua região, catalogado por categoria. Não precisa criar conta pra usar.

Começamos esse projeto achando que muita gente não sabe que esses serviços existem. A gente queria arrumar isso.

## O que você encontra

Três categorias: saúde (unidades básicas, policlínicas, hospitais, clínicas-escola), assistência social (CRAS, CREAS, centros de referência, núcleos de prática jurídica) e extensão universitária (projetos das universidades públicas abertos ao público).

Cada serviço mostra endereço, telefone, horários e a data em que a gente verificou a informação pela última vez. O site funciona offline depois que você abre, e não guarda registro de quem consultou o quê.

## Estrutura do projeto

Projeto estático: HTML, CSS e JavaScript puro, direto no navegador, sem build process.

```
├── index.html           (página inicial com filtros)
├── servico.html         (detalhe de cada serviço)
├── sobre.html           (informações sobre o projeto)
├── css/                 (tokens, base, componentes)
├── js/                  (navegação, busca, acessibilidade, QR codes)
├── dados/               (JSON com cidades e serviços por região)
├── img/                 (logo, favicon, og-card)
└── scripts/             (Python para processar CNES e validar dados)
```

## Como usar

Abra `index.html` em um navegador moderno. A primeira coisa é escolher sua cidade — daí aparece a categoria de serviço que você busca, e se quiser procura por nome. Cada resultado mostra endereço, telefone, horários, e quando a gente atualizou a informação.

Depois que carrega, funciona offline. É só JavaScript rodando no seu navegador.

## Fonte dos dados

Saúde vem do [CNES (Cadastro Nacional de Estabelecimentos de Saúde)](https://cnes.datasus.gov.br/) do Ministério da Saúde. Assistência social e extensão universitária a gente coleta manualmente a partir de fontes oficiais — SEDES-DF, catálogos das universidades. Cada registro mostra a data em que verificamos e a fonte.

A base atualiza periodicamente. Limitações reais: buscamos por cidade ou região administrativa, não por bairro. Alguns dados são coletados manualmente, então pode haver defasagem. A leitura em voz alta e VLibras dependem do navegador.

**Importante**: a Bússola Social é consulta. Não agenda consultas, não faz triagem ou encaminhamento. Em emergência, ligue SAMU 192, Bombeiros 193 ou CVV 188 (apoio emocional).

## Stack técnico

HTML5, CSS3, JavaScript ES6+. Dados em JSON estático. Dois scripts Python processam o CNES e validam a base. Suporte a navegação por teclado, leitura em voz alta, VLibras, textos alternativos e estrutura semântica. Funciona em Chrome/Edge 90+, Firefox 88+, Safari 14+, e navegadores mobile modernos.

## O projeto

A gente (estudantes do 3º semestre de ADS do IESB) desenvolveu isso como Extensão Curricularizada — faz parte do currículo da trilha de Inovação e Criatividade. O objetivo era real: aplicar tudo que aprendemos em desenvolvimento web em um problema que a gente queria resolver. Descobrimos ao longo do caminho que muita gente não sabe onde buscar esses serviços gratuitos, e a gente quis arrumar isso.

## Se encontrou algo errado

Serviço faltando? Dados desatualizados? Endereço ou horário errado? Abra uma issue no repositório ou escreva para a equipe do projeto informando a localidade e tipo de serviço.

---

IESB — Extensão Curricularizada, 3º semestre ADS
