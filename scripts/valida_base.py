#!/usr/bin/env python3
"""Schema validation for Bussola Social JSON data files."""
import json
import sys
from pathlib import Path
from collections import Counter


def validar():
    base = Path(__file__).parent.parent / "dados"
    erros = 0
    warnings = 0

    loc_path = base / "localidades.json"
    if not loc_path.exists():
        print(f"ERRO: {loc_path} not found")
        return 1

    with open(loc_path, encoding="utf-8") as f:
        locs = json.load(f)

    slugs = {loc["slug"] for loc in locs}
    print(f"OK: {len(locs)} localidades")

    for loc in locs:
        for field in ["slug", "nome", "uf", "tem-saude", "tem-assistencia", "tem-extensao"]:
            if field not in loc:
                print(f"ERRO: localidade missing field '{field}'")
                erros += 1

    servicos_dir = base / "servicos"
    servicos_paths = sorted(servicos_dir.glob("*.json"))
    print(f"Encontrados {len(servicos_paths)} arquivos de servicos")

    todos_ids = set()
    total_por_loc = {}

    for path in servicos_paths:
        size_kb = path.stat().st_size / 1024
        if size_kb > 150:
            print(f"ERRO: {path.name} exceeds 150 KB ({size_kb:.0f} KB)")
            erros += 1

        try:
            with open(path, encoding="utf-8") as f:
                servicos = json.load(f)
        except json.JSONDecodeError as e:
            print(f"ERRO: {path.name} - JSON invalido: {e}")
            erros += 1
            continue

        stem = path.stem
        loc_suffix = ""
        cat_match = ""

        if stem.endswith("-saude"):
            loc_suffix = stem[:-6]
            cat_match = "saude"
        elif stem.endswith("-assistencia"):
            loc_suffix = stem[:-12]
            cat_match = "assistencia_social"
        elif stem.endswith("-extensao"):
            loc_suffix = stem[:-9]
            cat_match = "extensao"
        else:
            print(f"ERRO: {path.name} - nome de arquivo nao contem categoria valida")
            erros += 1
            continue

        if loc_suffix and loc_suffix not in slugs:
            print(f"ERRO: {path.name} - localidade '{loc_suffix}' not in localidades.json")
            erros += 1

        for s in servicos:
            sid = s.get("id", "???")

            for field in ["id", "nome", "categoria", "clinica_escola", "localidade",
                          "endereco", "descricao", "fonte", "fonte_url", "atualizado_em"]:
                if field not in s:
                    print(f"ERRO: {sid} - missing field '{field}'")
                    erros += 1

            if s.get("id"):
                if s["id"] in todos_ids:
                    print(f"ERRO: duplicate ID '{s['id']}'")
                    erros += 1
                todos_ids.add(s["id"])

            if s.get("localidade") and loc_suffix and s["localidade"] != loc_suffix:
                print(f"WARNING: {sid} - localidade '{s['localidade']}' != arquivo '{loc_suffix}'")
                warnings += 1

            cats_validos = {"saude", "assistencia_social", "extensao"}
            if s.get("categoria") and s["categoria"] not in cats_validos:
                print(f"ERRO: {sid} - categoria invalida '{s['categoria']}'")
                erros += 1

            if cat_match and s.get("categoria") and s["categoria"] != cat_match:
                print(f"WARNING: {sid} - categoria '{s['categoria']}' no arquivo '{path.name}'")
                warnings += 1

        if loc_suffix:
            if loc_suffix not in total_por_loc:
                total_por_loc[loc_suffix] = 0
            total_por_loc[loc_suffix] += len(servicos)

        print(f"  OK: {path.name} ({len(servicos)} servicos)")

    print()
    print("--- Resumo ---")
    print(f"Total: {len(todos_ids)} servicos unicos, {len(servicos_paths)} arquivos")
    print(f"Erros: {erros}, Warnings: {warnings}")
    for loc in sorted(total_por_loc):
        print(f"  {loc}: {total_por_loc[loc]} servicos")

    return 1 if erros > 0 else 0


if __name__ == "__main__":
    sys.exit(validar())
