'use strict';

(function () {
  var estado = BussolaEstado.lerEstado();
  var btnVoltar = document.getElementById('servico-voltar');

  if (!estado.local || !estado.id) {
    exibirNaoEncontrado();
    return;
  }

  carregarServico(estado.local, estado.id)
    .then(function (servico) {
      if (!servico) {
        exibirNaoEncontrado();
        return;
      }
      exibirDetalhe(servico);
    })
    .catch(function () {
      exibirNaoEncontrado();
    });

  btnVoltar.addEventListener('click', function () {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      var url = 'index.html?local=' + encodeURIComponent(estado.local);
      if (estado.cat && estado.cat !== 'todas') {
        url += '&cat=' + encodeURIComponent(estado.cat);
      }
      window.location.href = url;
    }
  });

  function carregarServico(local, id) {
    return BussolaDados.carregarServicos(local)
      .then(function (servicos) {
        return servicos.find(function (s) {
          return s.id === id;
        }) || null;
      });
  }

  function exibirDetalhe(servico) {
    document.getElementById('servico-carregando').hidden = true;
    document.getElementById('servico-conteudo').hidden = false;

    mostrarCabecalho(servico);
    mostrarQRCode();
    configurarVCard(servico);
    mostrarInfo(servico);
    mostrarProcedencia(servico);
  }

  function mostrarCabecalho(servico) {
    var cabecalho = document.getElementById('servico-cabecalho');
    var badgeCat = BussolaDados.obterRotuloCategoria(servico.categoria);
    var badgeClasse = 'badge-categoria--' + servico.categoria;
    var selo = '';
    if (servico.clinica_escola) {
      selo = '<span class="selo-clinica-escola">Clinica-escola</span>';
    }
    cabecalho.innerHTML = [
      '<span class="badge-categoria ' + badgeClasse + '">' + badgeCat + '</span>',
      selo,
      '<h1 class="servico-nome">' + servico.nome + '</h1>'
    ].join('');

    if (servico.clinica_escola) {
      var explicacao = document.createElement('div');
      explicacao.className = 'clinica-escola-explicacao';
      explicacao.id = 'clinica-escola-explicacao';
      explicacao.innerHTML = '<strong>Atendimento de clinica-escola.</strong> O atendimento e feito por estudantes com supervisao de professores. E gratuito e costuma exigir agendamento.';
      var info = document.getElementById('servico-info');
      info.parentNode.insertBefore(explicacao, info);
    }
  }

  function mostrarInfo(servico) {
    var info = document.getElementById('servico-info');
    var campos = [];

    campos.push(criarCampo('Endereco', servico.endereco));

    if (servico.horario) {
      campos.push(criarCampo('Horario', servico.horario));
    } else {
      campos.push(criarCampo('Horario', 'Horario nao informado'));
    }

    campos.push(criarCampo('Telefone', servico.telefone, true));

    campos.push([
      '<div class="servico-info-item">',
      '<span class="servico-info-rotulo">O que oferece</span>',
      '<p class="servico-descricao">' + servico.descricao + '</p>',
      '</div>'
    ].join(''));

    info.innerHTML = campos.filter(Boolean).join('');
  }

  function formatarTelefone(numero) {
    if (!numero) return '';
    var limpo = numero.replace(/\D/g, '');
    if (limpo.length >= 10 && limpo.length <= 11 && !limpo.startsWith('0')) {
      limpo = '0' + limpo;
    }
    return limpo;
  }

  function criarCampo(rotulo, valor, ehTelefone) {
    if (!valor) {
      return '';
    }
    var valorHtml;
    if (ehTelefone) {
      var numeroLimpo = formatarTelefone(valor);
      valorHtml = '<a href="tel:' + numeroLimpo + '">' + valor + '</a>';
    } else {
      valorHtml = valor;
    }
    return [
      '<div class="servico-info-item">',
      '<span class="servico-info-rotulo">' + rotulo + '</span>',
      '<span class="servico-info-valor">' + valorHtml + '</span>',
      '</div>'
    ].join('');
  }

  function mostrarProcedencia(servico) {
    var procedencia = document.getElementById('servico-procedencia');
    var dataFormatada = BussolaDados.formatarData(servico.atualizado_em);
    procedencia.innerHTML = [
      '<p class="servico-procedencia-titulo">Informacao obtida em ',
      '<a href="' + servico.fonte_url + '" target="_blank" rel="noopener">' + servico.fonte + '</a>',
      ', atualizada em ' + dataFormatada + '.</p>'
    ].join('');

    mostrarQRCode();
  }

  function mostrarQRCode() {
    var qrContainer = document.getElementById('servico-qr');
    var qrCodigo = document.getElementById('servico-qr-codigo');
    if (!qrContainer || !qrCodigo || !window.BussolaQR) {
      return;
    }
    qrContainer.hidden = false;
    window.BussolaQR.gerar('servico-qr-codigo', window.location.href, 180);
  }

  function configurarVCard(servico) {
    var link = document.getElementById('servico-vcard');
    if (!link) return;
    var vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:' + servico.nome,
      'N:;;;;',
      'TEL;TYPE=WORK:' + formatarTelefone(servico.telefone || ''),
      'ADR;TYPE=WORK:;;' + (servico.endereco || '') + ';;;',
      'NOTE:' + servico.descricao + ' | Fonte: ' + servico.fonte,
      'URL:' + window.location.href,
      'END:VCARD'
    ].join('\n');
    var blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', servico.nome.replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, '') + '.vcf');
  }

  function exibirNaoEncontrado() {
    document.getElementById('servico-carregando').hidden = true;
    document.getElementById('servico-nao-encontrado').hidden = false;
  }
})();
