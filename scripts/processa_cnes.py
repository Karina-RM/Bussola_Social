#!/usr/bin/env python3
"""
Processa dados do CNES (Cadastro Nacional de Estabelecimentos de Saude).
Filtra por DF e municipios do Entorno goiano, particiona por localidade.

Modos de uso:
  1. API (limitado): python3 scripts/processa_cnes.py
     Usa a API de Dados Abertos. A paginacao da API e limitada (~5-20 por pagina,
     maximo ~500 registros). Util para atualizacoes rapidas.

  2. CSV (completo): python3 scripts/processa_cnes.py --csv cnes.csv
     Processa o dump completo do CNES baixado do DATASUS.
     Download: https://datasus.saude.gov.br/transferencia-de-arquivos/
     Selecionar: CNES > ST > DF > mes/ano mais recente

Fonte: Ministerio da Saude / DATASUS
"""

import json
import time
import sys
import csv
import urllib.request
import urllib.parse
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent
SERVICOS_DIR = BASE_DIR / "dados" / "servicos"

API_BASE = "https://apidadosabertos.saude.gov.br/cnes/estabelecimentos"
PAGE_SIZE = 100
DELAY = 0.3

UF_DF = 53
UF_GO = 52

BAIRRO_PARA_SLUG = {
    "ASA SUL": "plano-piloto", "ASA NORTE": "plano-piloto",
    "BRASILIA": "plano-piloto", "PLANO PILOTO": "plano-piloto",
    "LAGO SUL": "plano-piloto", "LAGO NORTE": "plano-piloto",
    "SUDOESTE": "plano-piloto", "NOROESTE": "plano-piloto",
    "CEILANDIA": "ceilandia", "CEILANDIA NORTE": "ceilandia",
    "CEILANDIA SUL": "ceilandia",
    "GUARA": "guara", "GUARA I": "guara", "GUARA II": "guara",
    "TAGUATINGA": "taguatinga", "TAGUATINGA NORTE": "taguatinga",
    "TAGUATINGA SUL": "taguatinga",
    "SAMAMBAIA": "samambaia", "SAMAMBAIA NORTE": "samambaia",
    "SAMAMBAIA SUL": "samambaia",
    "GAMA": "gama", "GAMA LESTE": "gama", "GAMA OESTE": "gama",
    "SANTA MARIA": "santa-maria",
    "PLANALTINA": "planaltina",
    "SOBRADINHO": "sobradinho", "SOBRADINHO I": "sobradinho",
    "SOBRADINHO II": "sobradinho",
    "SAO SEBASTIAO": "sao-sebastiao",
    "PARANOA": "paranoa",
    "RECANTO DAS EMAS": "recanto-das-emas",
    "RIACHO FUNDO": "riacho-fundo", "RIACHO FUNDO I": "riacho-fundo",
    "RIACHO FUNDO II": "riacho-fundo",
    "NUCLEO BANDEIRANTE": "nucleo-bandeirante",
    "CANDANGOLANDIA": "candangolandia",
    "BRAZLANDIA": "brazlandia",
    "CRUZEIRO": "cruzeiro", "CRUZEIRO VELHO": "cruzeiro",
    "CRUZEIRO NOVO": "cruzeir",
    "AGUAS CLARAS": "aguas-claras", "NORTE AGUAS CLARAS": "aguas-claras",
    "VICENTE PIRES": "vicente-pires",
    "ITAPOA": "itapoa",
    "JARDIM BOTANICO": "jardim-botanico",
    "AGUAS LINDAS": "aguas-lindas",
    "AGUAS LINDAS DE GOIAS": "aguas-lindas",
    "VALPARAISO": "valparaiso",
    "VALPARAISO E GOIAS": "valparaiso",
    "LUZIANIA": "luzania",
}

TIPOS_UNIDADE = {
    2: "UBS / Centro de Saude",
    4: "Policlinica",
    5: "Hospital Geral",
    7: "Hospital Especializado",
    15: "Unidade Mista",
    20: "Pronto Socorro Geral",
    21: "Pronto Socorro Especializado",
    36: "Clinica / Centro de Especialidade",
    70: "CAPS",
}

CODIGOS_ENSINO = {"01", "02", "03"}

MUNICIPIOS = {
    530010: "plano-piloto",
    530020: "gama",
    530030: "taguatinga",
    530040: "brazlandia",
    530050: "sobradinho",
    530060: "planaltina",
    530070: "paranoa",
    530080: "nucleo-bandeirante",
    530090: "ceilandia",
    530100: "guara",
    530110: "cruzeiro",
    530120: "samambaia",
    530130: "santa-maria",
    530140: "sao-sebastiao",
    530150: "recanto-das-emas",
    530160: "riacho-fundo",
    530170: "candangolandia",
    530180: "aguas-claras",
    530190: "itapoa",
    530200: "vicente-pires",
    530210: "jardim-botanico",
    520025: "aguas-lindas",
    520250: "valparaiso",
    521250: "luziania",
}


def buscar(uf):
    todos = []
    offset = 0
    while True:
        params = {"codigo_uf": uf, "size": PAGE_SIZE, "offset": offset}
        url = f"{API_BASE}?{urllib.parse.urlencode(params)}"
        try:
            req = urllib.request.urlopen(url, timeout=30)
            dados = json.loads(req.read().decode("utf-8"))
            lista = dados.get("estabelecimentos", [])
            if not lista:
                break
            todos.extend(lista)
            print(f"  {len(todos)} registros (UF={uf})")
            time.sleep(DELAY)
            offset += PAGE_SIZE
        except Exception as e:
            print(f"  Erro: {e}")
            break
    return todos


def mapear(estb):
    tipo = estb.get("codigo_tipo_unidade")
    if tipo not in TIPOS_UNIDADE:
        return None

    cod_mun = estb.get("codigo_municipio")
    if cod_mun is None:
        return None

    bairro = estb.get("bairro_estabelecimento", "")
    if bairro:
        bairro = bairro.upper().strip()

    slug = None
    if bairro and bairro in BAIRRO_PARA_SLUG:
        slug = BAIRRO_PARA_SLUG[bairro]
    elif cod_mun in MUNICIPIOS:
        slug = MUNICIPIOS[cod_mun]

    if not slug:
        return None

    nome = estb.get("nome_fantasia") or estb.get("nome_razao_social", "")
    if not nome:
        return None

    ensino = estb.get("codigo_atividade_ensino_unidade", "04")
    clinica_escola = ensino in CODIGOS_ENSINO

    endereco = estb.get("endereco_estabelecimento", "")
    numero = estb.get("numero_estabelecimento", "")
    bairro = estb.get("bairro_estabelecimento", "")
    partes = [p for p in [endereco, numero, bairro] if p]
    endereco_full = ", ".join(partes)

    telefone_raw = estb.get("numero_telefone_estabelecimento")
    telefone = str(telefone_raw).strip() if telefone_raw else None
    if telefone:
        telefone = normalizar_telefone(telefone)

    cnes_code = str(estb.get("codigo_cnes", ""))

    servico = {
        "id": f"cnes-{cnes_code}-{slug}",
        "nome": nome.strip(),
        "categoria": "saude",
        "clinica_escola": clinica_escola,
        "localidade": slug,
        "endereco": endereco_full,
        "descricao": TIPOS_UNIDADE.get(tipo, "Estabelecimento de saude"),
        "fonte": "CNES / Ministerio da Saude",
        "fonte_url": "https://dados.saude.gov.br/dataset/cnes",
        "atualizado_em": time.strftime("%Y-%m")
    }

    if telefone:
        servico["telefone"] = telefone

    return servico


def main():
    print("Processando CNES...")
    print()

    print("UF=53 (DF):")
    estb_df = buscar(UF_DF)
    print(f"  Total bruto: {len(estb_df)}")

    print()
    print("UF=52 (GO):")
    estb_go = buscar(UF_GO)
    print(f"  Total bruto: {len(estb_go)}")

    todos = estb_df + estb_go
    print(f"\nTotal bruto: {len(todos)}")

    servicos = [s for e in todos if (s := mapear(e))]
    print(f"Filtrados: {len(servicos)}")

    salvar_resultados(servicos)
    print("\nConcluido.")


def processar_csv(caminho_csv):
    print(f"Processando CSV: {caminho_csv}")
    servicos = []
    with open(caminho_csv, encoding="utf-8") as f:
        leitor = csv.DictReader(f, delimiter=";")
        for i, linha in enumerate(leitor):
            if i % 5000 == 0:
                print(f"  Lidas {i} linhas...")
            s = mapear_csv(linha)
            if s:
                servicos.append(s)
    print(f"  Total bruto: {i + 1} linhas")
    return servicos


def mapear_csv(linha):
    uf = int(linha.get("CODUFMUN", "0")[:2]) if linha.get("CODUFMUN") else 0
    if uf not in (53, 52):
        return None

    cod_mun = linha.get("CODUFMUN", "")
    try:
        cod_mun = int(cod_mun)
    except (ValueError, TypeError):
        return None
    if cod_mun not in MUNICIPIOS:
        return None

    tipo = linha.get("TP_UNID", "")
    try:
        tipo = int(tipo)
    except (ValueError, TypeError):
        return None
    if tipo not in TIPOS_UNIDADE:
        return None

    nome = linha.get("NOME_FAN", "") or linha.get("NOM_RAZSOC", "")
    if not nome:
        return None

    ensino = linha.get("VINC_ENSINO", "04")
    clinica_escola = ensino in CODIGOS_ENSINO

    logr = linha.get("ENDER", "")
    num = linha.get("NUMERO", "")
    bairro = linha.get("BAIRRO", "")
    partes = [p for p in [logr, num, bairro] if p]
    endereco_full = ", ".join(partes)

    telefone = linha.get("TELEFONE", "").strip()
    if not telefone:
        telefone = None
    else:
        telefone = normalizar_telefone(telefone)

    slug = MUNICIPIOS[cod_mun]
    cnes_code = linha.get("CNES", "")

    servico = {
        "id": f"cnes-{cnes_code}-{slug}",
        "nome": nome.strip(),
        "categoria": "saude",
        "clinica_escola": clinica_escola,
        "localidade": slug,
        "endereco": endereco_full,
        "descricao": TIPOS_UNIDADE.get(tipo, "Estabelecimento de saude"),
        "fonte": "CNES / Ministerio da Saude",
        "fonte_url": "https://dados.saude.gov.br/dataset/cnes",
        "atualizado_em": time.strftime("%Y-%m")
    }

    if telefone:
        servico["telefone"] = telefone

    return servico


def normalizar_telefone(numero):
    limpo = ''.join(c for c in numero if c.isdigit())
    if 10 <= len(limpo) <= 11 and not limpo.startswith('0'):
        limpo = '0' + limpo
    return limpo


def salvar_resultados(servicos):
    por_loc = defaultdict(list)
    for s in servicos:
        por_loc[s["localidade"]].append(s)

    print(f"Localidades: {len(por_loc)}")
    SERVICOS_DIR.mkdir(parents=True, exist_ok=True)

    for slug in sorted(por_loc):
        lista = por_loc[slug]
        arquivo = SERVICOS_DIR / f"{slug}-saude.json"
        with open(arquivo, "w", encoding="utf-8") as f:
            json.dump(lista, f, ensure_ascii=False, indent=2)
        print(f"  {slug}: {len(lista)} servicos")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--csv":
        csv_path = sys.argv[2] if len(sys.argv) > 2 else None
        if not csv_path:
            print("Uso: python3 scripts/processa_cnes.py --csv <arquivo.csv>")
            sys.exit(1)
        servicos = processar_csv(csv_path)
        print(f"Filtrados: {len(servicos)} servicos")
        salvar_resultados(servicos)
    else:
        main()
