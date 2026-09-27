'use strict';

(function () {
  var carregadoLibras = false;
  var lendo = false;
  var utterance = null;

  var btnLibras = document.getElementById('btn-libras');
  var btnOuvir = document.getElementById('btn-ouvir');

  if (btnLibras) {
    btnLibras.addEventListener('click', function () {
      if (carregadoLibras) {
        toggleLibras();
        return;
      }
      carregarVLibras();
    });
  }

  if (btnOuvir) {
    verificarSuporteVoz();
    btnOuvir.addEventListener('click', function () {
      if (lendo) {
        pararLeitura();
      } else {
        iniciarLeitura();
      }
    });
  }

  function carregarVLibras() {
    var script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.onload = function () {
      var container = document.createElement('div');
      container.setAttribute('vw', '');
      container.className = 'enabled';

      var botao = document.createElement('div');
      botao.setAttribute('vw-access-button', '');

      var plugin = document.createElement('div');
      plugin.setAttribute('vw-plugin-wrapper', '');

      container.appendChild(botao);
      container.appendChild(plugin);
      document.body.appendChild(container);

      new window.VLibras.Widget('https://vlibras.gov.br/app');
      carregadoLibras = true;
      if (btnLibras) {
        btnLibras.querySelector('span').textContent = 'Libras (ativo)';
      }
    };
    script.onerror = function () {
      alert('Nao foi possivel carregar o VLibras agora.');
    };
    document.head.appendChild(script);
  }

  function toggleLibras() {
    var botao = document.querySelector('[vw-access-button]');
    if (botao) {
      botao.click();
    }
  }

  function verificarSuporteVoz() {
    if (!('speechSynthesis' in window)) {
      btnOuvir.hidden = true;
      return;
    }

    speechSynthesis.getVoices();

    window.speechSynthesis.onvoiceschanged = function () {
      var voices = window.speechSynthesis.getVoices();
      var temPtBr = voices.find(function (v) {
        return v.lang.startsWith('pt');
      });
      btnOuvir.hidden = !temPtBr;
    };
  }

  function iniciarLeitura() {
    var main = document.querySelector('main');
    if (!main) {
      return;
    }

    var texto = main.textContent.trim();
    if (!texto) {
      return;
    }

    utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    lendo = true;

    if (btnOuvir) {
      btnOuvir.querySelector('span').textContent = 'Parar';
    }

    utterance.onend = pararLeitura;
    utterance.onerror = pararLeitura;

    window.speechSynthesis.speak(utterance);
  }

  function pararLeitura() {
    window.speechSynthesis.cancel();
    lendo = false;
    if (btnOuvir) {
      btnOuvir.querySelector('span').textContent = 'Ouvir';
    }
  }
})();