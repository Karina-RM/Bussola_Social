(function () {
  'use strict';

  var cacheLocalidades = null;
  var cacheServicos = {};

  function carregarLocalidades() {
    if (cacheLocalidades) {
      return Promise.resolve(cacheLocalidades);
    }
    return fetch('dados/localidades.json')
      .then(function (resposta) {
        if (!resposta.ok) {
          throw new Error('Erro ao carregar localidades');
        }
        return resposta.json();
      })
      .then(function (dados) {
        cacheLocalidades = dados;
        return dados;
      });
  }

  function carregarServicos(localidade) {
    if (cacheServicos[localidade]) {
      return Promise.resolve(cacheServicos[localidade]);
    }

    var categorias = ['saude', 'assistencia', 'extensao'];
    var promessas = categorias.map(function (cat) {
      return fetch('dados/servicos/' + localidade + '-' + cat + '.json')
        .then(function (resposta) {
          if (!resposta.ok) {
            return [];
          }
          return resposta.json();
        })
        .catch(function () {
          return [];
        });
    });

    return Promise.all(promessas).then(function (resultados) {
      var todos = resultados.flat();
      cacheServicos[localidade] = todos;
      return todos;
    });
  }

  function obterRotuloCategoria(categoria) {
    var rotulos = {
      saude: 'Saude',
      assistencia_social: 'Assistencia social',
      extensao: 'Extensao'
    };
    return rotulos[categoria] || categoria;
  }

  function formatarData(mesAno) {
    if (!mesAno) {
      return '';
    }
    var partes = mesAno.split('-');
    if (partes.length !== 2) {
      return mesAno;
    }
    var meses = [
      'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    var mes = parseInt(partes[1], 10) - 1;
    if (mes < 0 || mes > 11) {
      return mesAno;
    }
    return meses[mes] + ' de ' + partes[0];
  }

  window.BussolaDados = {
    carregarLocalidades: carregarLocalidades,
    carregarServicos: carregarServicos,
    obterRotuloCategoria: obterRotuloCategoria,
    formatarData: formatarData
  };
})();
