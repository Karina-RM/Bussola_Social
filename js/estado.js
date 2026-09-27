(function () {
  'use strict';

  function lerEstado() {
    var params = new URLSearchParams(window.location.search);
    return {
      local: params.get('local') || '',
      cat: params.get('cat') || 'todas',
      id: params.get('id') || '',
      texto: params.get('q') || ''
    };
  }

  function salvarEstado(estado) {
    var params = new URLSearchParams();

    if (estado.local) {
      params.set('local', estado.local);
    }
    if (estado.cat && estado.cat !== 'todas') {
      params.set('cat', estado.cat);
    }
    if (estado.id) {
      params.set('id', estado.id);
    }
    if (estado.texto) {
      params.set('q', estado.texto);
    }

    var novaUrl = window.location.pathname;
    var query = params.toString();
    if (query) {
      novaUrl += '?' + query;
    }

    history.replaceState(null, '', novaUrl);
  }

  function limparEstado() {
    history.replaceState(null, '', window.location.pathname);
  }

  window.BussolaEstado = {
    lerEstado: lerEstado,
    salvarEstado: salvarEstado,
    limparEstado: limparEstado
  };
})();
