# Bússola Social

**Serviços públicos gratuitos perto de você.**

A Bússola Social é um site gratuito que reúne informações sobre serviços públicos gratuitos disponíveis no Distrito Federal e Entorno goiano. Qualquer pessoa pode descobrir o que existe de gratuito perto de onde mora — sem cadastro, sem login e sem custo.

Projeto de Extensão Curricularizada do [Centro Universitário IESB](https://www.iesb.br), desenvolvido por estudantes de Análise e Desenvolvimento de Sistemas (3º semestre), Trilha de Inovação e Criatividade.

---

## Categorias de serviços

| Categoria | Exemplos |
|---|---|
| **Saúde** | UBS, CAPS, policlínicas, hospitais, clínicas-escola de psicologia, odontologia, fisioterapia e nutrição |
| **Assistência social** | CRAS, CREAS, Centros POP, Núcleos de Prática Jurídica |
| **Extensão universitária** | Projetos de extensão de universidades públicas abertos à comunidade |

---

## Estrutura do projeto

```
.
├── index.html              # Página principal — busca por localidade
├── servico.html            # Detalhe de um serviço individual
├── sobre.html              # Página "Sobre o projeto"
├── css/
│   ├── tokens.css          # Design tokens (cores, tipografia, espaçamento)
│   ├── base.css            # Reset, layout, utilitários
│   └── componentes.css     # Componentes reutilizáveis
├── js/
│   ├── estado.js           # Gerenciamento de estado via URL (query params)
│   ├── dados.js            # Carregamento de JSON com cache em memória
│   ├── busca.js            # Busca, filtros e renderização da lista de serviços
│   ├── servico.js          # Renderização do detalhe de um serviço
│   ├── layout.js           # Cabeçalho, rodapé e navegação compartilhados
│   ├── acessibilidade.js   # VLibras, foco e navegação por teclado
│   └── qrcode-vendor.js    # Biblioteca de QR code para compartilhamento
├── dados/
│   ├── localidades.json    # Índice de cidades/regiões cobertas
│   └── servicos/           # Dados particionados por localidade-categoria
│       ├── plano-piloto-saude.json
│       ├── ceilandia-assistencia.json
│       └── ...
├── scripts/
│   ├── processa_cnes.py    # Importa dados do CNES/DATASUS → JSON
│   └── valida_base.py      # Validação de schema dos arquivos de dados
├── img/
│   ├── logo.svg
│   ├── favicon.svg
│   └── og-card.svg
└── docs/                   # Documentação adicional
```

---

## Fontes de dados

| Fonte | Categoria | Atualização |
|---|---|---|
| [CNES / DATASUS](https://datasus.saude.gov.br) | Saúde | Via script (`processa_cnes.py`) |
| SEDES-DF e catálogos universitários | Assistência social / Extensão | Coleta manual da equipe |

---

## Scripts

### Atualizar dados de saúde

```bash
# Via API pública (limitado a ~500 registros)
python3 scripts/processa_cnes.py

# Via dump CSV completo do DATASUS (recomendado para carga inicial)
python3 scripts/processa_cnes.py --csv dados/cnes.csv
```

### Validar base de dados

```bash
python3 scripts/valida_base.py
```

---

## Desenvolvimento

O site é estático — abra `index.html` diretamente no navegador ou sirva com qualquer servidor HTTP local:

```bash
python3 -m http.server 8000
```

Não há etapa de build, framework ou dependências JavaScript. Tudo funciona nativamente no navegador.

### Acessibilidade

- Navegação completa por teclado com gerenciamento de foco
- Suporte a leitores de tela (atributos `aria-*`, regiões `role`, live regions)
- VLibras integrado para tradução automática para Libras
- Link "Pular para o conteúdo" no início de cada página
- Contraste e tipografia dimensionados para legibilidade

---

## Limitações

- A busca é por cidade/Região Administrativa, não por bairro.
- Alguns dados são atualizados manualmente — cada registro exibe sua data de atualização.
- O site depende de JavaScript habilitado.
- O VLibras utiliza tradução automática e não substitui intérprete humano.
- A Bússola Social não agenda consultas, não faz triagem e não substitui atendimento profissional.
