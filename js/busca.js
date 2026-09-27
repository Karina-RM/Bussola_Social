'use strict';

(function () {
  var selectLocalidade = document.getElementById('localidade');
  var divCategorias = document.getElementById('filtros-categoria');
  var divPesquisa = document.getElementById('busca-pesquisa');
  var inputPesquisa = document.getElementById('busca-texto');
  var contador = document.querySelector('.busca-contador');
  var listaServicos = document.getElementById('lista-servicos');

  var estado = BussolaEstado.lerEstado();
  var servicosAtuais = [];

  function iniciar() {
    BussolaDados.carregarLocalidades()
      .then(function (localidades) {
        popularLocalidades(localidades);
        if (estado.local) {
          selectLocalidade.value = estado.local;
          selecionarLocalidade(estado.local);
        }
      })
      .catch(function () {
        exibirErro();
      });
  }

  function popularLocalidades(localidades) {
    localidades.forEach(function (loc) {
      var option = document.createElement('option');
      option.value = loc.slug;
      option.textContent = loc.nome;
      selectLocalidade.appendChild(option);
    });
  }

  selectLocalidade.addEventListener('change', function () {
    var valor = selectLocalidade.value;
    if (!valor) {
      resetarBusca();
      return;
    }
    selecionarLocalidade(valor);
  });

function selecionarLocalidade(slug) {
    estado.local = slug;
    BussolaEstado.salvarEstado(estado);
    exibirCarregando();
    divCategorias.hidden = false;
    divPesquisa.hidden = true;

    BussolaDados.carregarServicos(slug)
      .then(function (servicos) {
        servicosAtuais = servicos;
        divPesquisa.hidden = servicos.length <= 15;
        if (estado.cat && estado.cat !== 'todas') {
          marcarPilulaAtiva(estado.cat);
          filtrarEExibir(estado.cat);
        } else {
          marcarPilulaAtiva('todas');
          filtrarEExibir('todas');
        }
      })
      .catch(function () {
        exibirErro();
      });
  }

  function resetarBusca() {
    estado.local = '';
    estado.texto = '';
    BussolaEstado.salvarEstado(estado);
    servicosAtuais = [];
    divCategorias.hidden = true;
    divPesquisa.hidden = true;
    listaServicos.innerHTML = [
      '<div class="lista-vazia lista-vazia-inicial">',
      '<svg width="72" height="72" viewBox="0 0 32 32" fill="none" aria-hidden="true" class="lista-vazia-agulha">',
      '<circle cx="16" cy="16" r="14" stroke="#E4DFDA" stroke-width="2"/>',
      '<polygon points="16,5 19,16 16,14 13,16" fill="#E4DFDA"/>',
      '<polygon points="16,27 13,16 16,18 19,16" fill="#E4DFDA"/>',
      '</svg>',
      '<p>Escolha sua cidade acima para ver os servicos gratuitos perto de voce.</p>',
      '</div>'
    ].join('');
    contador.textContent = '';
  }

  function exibirCarregando() {
    var esqueleto = [
      '<div class="esqueleto-card">',
      '<div class="esqueleto-linha esqueleto-titulo"></div>',
      '<div class="esqueleto-linha esqueleto-badge"></div>',
      '<div class="esqueleto-linha esqueleto-texto"></div>',
      '</div>'
    ].join('');
    listaServicos.innerHTML = esqueleto + esqueleto + esqueleto;
  }

  divCategorias.addEventListener('click', function (evento) {
    var pilula = evento.target.closest('.pilula');
    if (!pilula) {
      return;
    }
    var cat = pilula.dataset.cat;
    estado.cat = cat;
    estado.texto = '';
    inputPesquisa.value = '';
    BussolaEstado.salvarEstado(estado);
    marcarPilulaAtiva(cat);
    filtrarEExibir(cat);
  });

  var timerBusca = null;

  inputPesquisa.addEventListener('input', function () {
    try {
      estado.texto = inputPesquisa.value;
      BussolaEstado.salvarEstado(estado);

      clearTimeout(timerBusca);
      timerBusca = setTimeout(function () {
        filtrarEExibir(estado.cat || 'todas');
      }, 600);
    } catch (e) {
      console.error('Erro na busca:', e);
    }
  });

  function marcarPilulaAtiva(cat) {
    document.querySelectorAll('.pilula').forEach(function (p) {
      p.classList.toggle('pilula-ativa', p.dataset.cat === cat);
    });
  }

  function normalizar(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function filtrarEExibir(categoria) {
    var filtrados = servicosAtuais;

    if (categoria && categoria !== 'todas') {
      filtrados = filtrados.filter(function (s) {
        return s.categoria === categoria;
      });
    }

    if (estado.texto) {
      var termo = normalizar(estado.texto);
      filtrados = filtrados.filter(function (s) {
        var nomeNorm = normalizar(s.nome);
        var descNorm = normalizar(s.descricao || '');
        return nomeNorm.includes(termo) || descNorm.includes(termo);
      });
    }

    if (categoria && categoria !== 'todas') {
      filtrados.sort(function (a, b) {
        return a.nome.localeCompare(b.nome, 'pt-BR');
      });
    } else {
      filtrados.sort(function (a, b) {
        var ordem = { saude: 1, assistencia_social: 2, extensao: 3 };
        var ordemA = ordem[a.categoria] || 99;
        var ordemB = ordem[b.categoria] || 99;
        if (ordemA !== ordemB) {
          return ordemA - ordemB;
        }
        return a.nome.localeCompare(b.nome, 'pt-BR');
      });
    }

    var localidadeInfo = '';
    if (estado.local && selectLocalidade.selectedOptions[0]) {
      localidadeInfo = ' em ' + selectLocalidade.selectedOptions[0].textContent;
    }

    if (filtrados.length === 0) {
      contador.textContent = '';
      if (estado.texto) {
        listaServicos.innerHTML = [
          '<div class="lista-vazia">',
          '<p>Nenhum resultado encontrado para <strong>"' + estado.texto + '"</strong>' + localidadeInfo + '.</p>',
          '<p class="lista-vazia-dica">Tente outro termo ou veja todos os servicos desta localidade.</p>',
          '<button class="lista-vazia-link lista-vazia-link-destaque" id="btn-limpar-busca">Limpar busca e ver todos</button>',
          '</div>'
        ].join('');
        document.getElementById('btn-limpar-busca').addEventListener('click', function () {
          inputPesquisa.value = '';
          estado.texto = '';
          BussolaEstado.salvarEstado(estado);
          filtrarEExibir(estado.cat || 'todas');
        });
      } else if (categoria && categoria !== 'todas') {
        var rotulo = BussolaDados.obterRotuloCategoria(categoria);
        listaServicos.innerHTML = [
          '<div class="lista-vazia">',
          '<p>Nenhum servico de ' + rotulo.toLowerCase() + ' cadastrado' + localidadeInfo + '.</p>',
          '<button class="lista-vazia-link" id="btn-ver-todas">Ver todas as categorias</button>',
          '</div>'
        ].join('');
        document.getElementById('btn-ver-todas').addEventListener('click', function () {
          document.querySelector('.pilula[data-cat="todas"]').click();
        });
      } else {
        listaServicos.innerHTML = [
          '<div class="lista-vazia">',
          '<p>Ainda nao temos servicos cadastrados' + localidadeInfo + '.</p>',
          '<a href="sobre.html" class="lista-vazia-link">Saiba por que</a>',
          '</div>'
        ].join('');
      }
      if (!estado.texto) {
        divPesquisa.hidden = true;
      }
    } else {
      var plural = filtrados.length === 1 ? '' : 's';
      contador.textContent = filtrados.length + ' servico' + plural + localidadeInfo;

      listaServicos.innerHTML = filtrados.map(renderizarCard).join('');
    }
  }

  function renderizarCard(servico) {
    var badgeCat = BussolaDados.obterRotuloCategoria(servico.categoria);
    var badgeClasse = 'badge-categoria--' + servico.categoria;

    var seloClinica = '';
    if (servico.clinica_escola) {
      seloClinica = [
        '<span class="selo-clinica-escola">',
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
        '<path d="M8 2L3 7V13H6V9H10V13H13V7L8 2Z" fill="currentColor"/>',
        '</svg>',
        'Clinica-escola',
        '</span>'
      ].join('');
    }

    var horario = '';
    if (servico.horario) {
      horario = '<p class="card-servico-horario">' + servico.horario + '</p>';
    }

    var href = 'servico.html?id=' + encodeURIComponent(servico.id) + '&local=' + encodeURIComponent(servico.localidade);

    return [
      '<a href="' + href + '" class="card-servico">',
      '<h2 class="card-servico-titulo">' + servico.nome + '</h2>',
      '<div class="card-servico-meta">',
      '<span class="badge-categoria ' + badgeClasse + '">' + badgeCat + '</span>',
      seloClinica,
      '</div>',
      '<p class="card-servico-endereco">' + servico.endereco + '</p>',
      horario,
      '</a>'
    ].join('');
  }

  function exibirErro() {
    contador.textContent = '';
    listaServicos.innerHTML = [
      '<div class="lista-erro">',
      '<p>Nao conseguimos carregar os servicos. Verifique sua conexao.</p>',
      '<button class="lista-vazia-link" id="btn-tentar-novamente">Tentar de novo</button>',
      '</div>'
    ].join('');
    document.getElementById('btn-tentar-novamente').addEventListener('click', function () {
      selecionarLocalidade(estado.local);
    });
  }

  if (selectLocalidade && listaServicos) {
    iniciar();
  }
})();