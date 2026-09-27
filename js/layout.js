(function () {
  'use strict';

  function criarCabecalho() {
    return '\n      <div class="conteiner cabecalho-interno" role="banner">\n        <a href="index.html" class="cabecalho-marca" aria-label="B\u00fassola Social \u2014 P\u00e1gina inicial">\n          <svg class="cabecalho-agulha" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">\n            <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2"/>\n            <polygon points="16,5 19,16 16,14 13,16" fill="currentColor"/>\n            <polygon points="16,27 13,16 16,18 19,16" fill="var(--cor-destaque)"/>\n          </svg>\n          <span class="cabecalho-nome">B\u00fassola Social</span>\n        </a>\n        <p class="cabecalho-descricao">Servi\u00e7os gratuitos perto de voc\u00ea</p>\n      </div>\n    ';
  }

  function criarRodape() {
    return '\n      <div class="conteiner rodape-interno" role="contentinfo">\n        <nav class="rodape-emergencias" aria-label="Telefones de emerg\u00eancia">\n          <h2 class="rodape-emergencias-titulo">Precisa de ajuda agora?</h2>\n          <p class="rodape-emergencias-texto">Este site n\u00e3o faz atendimento. Em emerg\u00eancia, ligue.</p>\n          <ul class="rodape-emergencias-lista" role="list">\n            <li><a href="tel:192" class="rodape-emergencias-link">SAMU <strong>192</strong></a></li>\n            <li><a href="tel:193" class="rodape-emergencias-link">Bombeiros <strong>193</strong></a></li>\n            <li><a href="tel:188" class="rodape-emergencias-link">CVV <strong>188</strong> <span class="rodape-emergencias-apoio">apoio emocional</span></a></li>\n          </ul>\n        </nav>\n        <div class="rodape-info">\n          <a href="sobre.html">Sobre o projeto</a>\n        </div>\n      </div>\n    ';
  }

  function criarBarraAcessibilidade() {
    return '\n      <div class="barra-acessibilidade">\n        <button id="btn-libras" class="barra-acessibilidade-botao" aria-label="Ativar tradução em Libras">\n          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">\n            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>\n            <path d="M6 7C7 5 9 7 10 7C11 7 13 5 14 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>\n            <path d="M5 10H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>\n            <path d="M7 13L10 10L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n          </svg>\n          <span>Libras</span>\n        </button>\n        <button id="btn-ouvir" class="barra-acessibilidade-botao" aria-label="Ouvir conteúdo da página">\n          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">\            <path d="M10 2V6L13 9H17V11H13L10 14V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n          </svg>\n          <span>Ouvir</span>\n        </button>\n      </div>\n    ';
  }

  function injetarLayout() {
    var cabecalho = document.getElementById('cabecalho');
    var rodape = document.getElementById('rodape');

    if (cabecalho) {
      cabecalho.innerHTML = criarCabecalho();
    }
    if (rodape) {
      rodape.innerHTML = criarRodape() + criarBarraAcessibilidade();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injetarLayout);
  } else {
    injetarLayout();
  }
})();