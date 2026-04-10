#!/usr/bin/env python3
"""
Exporta todas las tablas de una base de datos PostgreSQL a un unico archivo Excel.

Uso basico:
  python src/backend/scripts/exportToExcel.py

Tambien puede leer la URL desde variables de entorno:
  - POSTGRES_PRISMA_URL
"""

from __future__ import annotations

import argparse
import importlib
import importlib.util
import os
import re
import subprocess
import sys
from decimal import Decimal
from pathlib import Path
from typing import Any, Dict, List, Tuple


MAX_EXCEL_ROWS = 1_048_576
MAX_SHEET_NAME = 31
INVALID_SHEET_CHARS = re.compile(r"[:\\/*?\[\]]")
DEFAULT_FILE_NAME = "postgres_export.xlsx"
MIN_PYTHON = (3, 9)


def ensure_python_version() -> None:
    # Garantiza una version minima para evitar errores de dependencias modernas.
    if sys.version_info < MIN_PYTHON:
        version = ".".join(str(x) for x in MIN_PYTHON)
        raise ValueError(f"Este script requiere Python {version} o superior.")


def ensure_runtime_dependencies() -> None:
    # Verifica dependencias clave y, si faltan, intenta instalarlas de forma automatica.
    required_modules = {
        "pandas": "pandas",
        "sqlalchemy": "sqlalchemy",
        "openpyxl": "openpyxl",
        "psycopg": "psycopg[binary]",
    }
    missing = [pkg for mod, pkg in required_modules.items() if importlib.util.find_spec(mod) is None]
    if not missing:
        return

    print("Faltan dependencias Python. Intentando instalarlas automaticamente...")
    cmd = [sys.executable, "-m", "pip", "install", "--upgrade", *missing]
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        stderr = (result.stderr or "").strip()
        raise ValueError(
            "No se pudieron instalar dependencias automaticamente. "
            f"Ejecuta manualmente: {' '.join(cmd)}\n{stderr}"
        )


def load_runtime_modules() -> tuple[Any, Any, Any]:
    # Carga diferida para que el script pueda autoinstalar paquetes antes de importar.
    pd = importlib.import_module("pandas")
    sqlalchemy = importlib.import_module("sqlalchemy")
    return pd, sqlalchemy.text, sqlalchemy.create_engine


def parse_args() -> argparse.Namespace:
    # Define opciones de ejecucion sin exigir parametros obligatorios al usuario.
    parser = argparse.ArgumentParser(
        description="Exporta tablas PostgreSQL a un unico .xlsx para Power BI."
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help=(
            "Ruta del archivo Excel de salida. Si no se indica, se usa backend-data "
            "con el modo definido en --write-mode."
        ),
    )
    parser.add_argument(
        "--schema",
        type=str,
        default="public",
        help="Schema de PostgreSQL a exportar (por defecto: public).",
    )
    parser.add_argument(
        "--write-mode",
        type=str,
        choices=["incremental", "replace"],
        default="incremental",
        help=(
            "Controla como se guarda en backend-data si no pasas --output: "
            "incremental crea un archivo con sufijo _1, _2, etc., y replace "
            "sobrescribe siempre el mismo archivo."
        ),
    )
    return parser.parse_args()


def normalize_sqlalchemy_db_url(db_url: str) -> str:
    # Adapta el esquema postgresql:// al driver psycopg moderno de SQLAlchemy.
    if db_url.startswith("postgresql://"):
        return db_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return db_url


def load_dotenv_if_present() -> None:
    # Carga .env de forma local sin sobreescribir variables ya definidas en entorno.
    project_root = Path(__file__).resolve().parents[3]
    env_path = project_root / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def resolve_db_url() -> str:
    # Toma la conexion de POSTGRES_PRISMA_URL para alinear con el backend del proyecto.
    load_dotenv_if_present()
    db_url = os.getenv("POSTGRES_PRISMA_URL")
    if db_url:
        return normalize_sqlalchemy_db_url(db_url)

    raise ValueError(
        "No se encontro la conexion a la base de datos. "
        "Define POSTGRES_PRISMA_URL en .env."
    )


def build_engine(db_url: str, create_engine_fn: Any) -> Any:
    # pool_pre_ping reduce fallos por conexiones inactivas en proveedores serverless.
    return create_engine_fn(db_url, pool_pre_ping=True)


def next_incremental_output_path(exports_dir: Path) -> Path:
    # Busca el siguiente sufijo disponible: _1, _2, _3...
    base_name = Path(DEFAULT_FILE_NAME).stem
    ext = Path(DEFAULT_FILE_NAME).suffix
    index = 1
    while True:
        candidate = exports_dir / f"{base_name}_{index}{ext}"
        if not candidate.exists():
            return candidate
        index += 1


def resolve_output_path(cli_output: str | None, write_mode: str) -> Path:
    # Decide destino final segun parametros: ruta manual, replace o incremental.
    if cli_output:
        return Path(cli_output).resolve()

    project_root = Path(__file__).resolve().parents[3]
    backend_data_dir = project_root / "backend-data"
    exports_dir = backend_data_dir / "exports"
    exports_dir.mkdir(parents=True, exist_ok=True)

    if write_mode == "replace":
        return (backend_data_dir / DEFAULT_FILE_NAME).resolve()

    return next_incremental_output_path(exports_dir).resolve()


def list_tables(engine: Any, schema: str, sql_text: Any) -> List[str]:
    # Extrae todas las tablas fisicas del esquema para exportarlas dinamicamente.
    query = sql_text(
        """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = :schema
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
        """
    )
    with engine.connect() as conn:
        rows = conn.execute(query, {"schema": schema}).fetchall()
    return [row[0] for row in rows]


def quote_ident(identifier: str) -> str:
    # Escapa identificadores SQL para evitar errores con nombres especiales.
    escaped = identifier.replace('"', '""')
    return f'"{escaped}"'


def validate_excel_sheet_names(table_names: List[str]) -> None:
    # Fuerza correspondencia 1:1 tabla->hoja; si Excel no lo permite, se detiene.
    invalid: List[str] = []
    too_long: List[str] = []
    seen: Dict[str, str] = {}
    duplicates_case_insensitive: List[str] = []

    for table in table_names:
        if INVALID_SHEET_CHARS.search(table):
            invalid.append(table)
        if len(table) > MAX_SHEET_NAME:
            too_long.append(table)

        lowered = table.lower()
        if lowered in seen and seen[lowered] != table:
            duplicates_case_insensitive.append(f"{seen[lowered]} / {table}")
        else:
            seen[lowered] = table

    errors: List[str] = []
    if invalid:
        errors.append(
            "Nombres de tabla con caracteres no validos para Excel: "
            + ", ".join(invalid)
        )
    if too_long:
        errors.append(
            f"Nombres de tabla mayores de {MAX_SHEET_NAME} caracteres: "
            + ", ".join(too_long)
        )
    if duplicates_case_insensitive:
        errors.append(
            "Colision de nombres por mayusculas/minusculas en Excel: "
            + ", ".join(duplicates_case_insensitive)
        )

    if errors:
        raise ValueError(
            "No se puede garantizar correspondencia 1:1 entre tabla y hoja de Excel. "
            + " | ".join(errors)
        )


def normalize_for_excel(df: Any, pd_module: Any) -> Any:
    # Convierte Decimals en numericos para que openpyxl los escriba sin problemas.
    if df.empty:
        return df

    for col in df.columns:
        series = df[col]
        if pd_module.api.types.is_datetime64_any_dtype(series):
            continue

        if series.dtype == "object":
            if series.map(lambda x: isinstance(x, Decimal) or pd_module.isna(x)).all():
                df[col] = pd_module.to_numeric(series, errors="coerce")

    return df


def read_table(engine: Any, schema: str, table: str, pd_module: Any, sql_text: Any) -> Any:
    # Lee tabla completa respetando el nombre real en BBDD.
    table_ref = f"{quote_ident(schema)}.{quote_ident(table)}"
    query = f"SELECT * FROM {table_ref}"
    return pd_module.read_sql_query(sql_text(query), con=engine)


def export_tables_to_excel(
    engine: Any, schema: str, tables: List[str], output_path: Path, pd_module: Any, sql_text: Any
) -> Tuple[Any, int]:
    # Recorre tablas, exporta hojas y construye un reporte de control.
    report_rows = []
    exported_tables = 0

    output_path.parent.mkdir(parents=True, exist_ok=True)
    validate_excel_sheet_names(tables)

    with pd_module.ExcelWriter(output_path, engine="openpyxl") as writer:
        for table in tables:
            df = read_table(engine, schema, table, pd_module, sql_text)
            total_rows = len(df)
            truncated = total_rows > MAX_EXCEL_ROWS

            if truncated:
                df = df.head(MAX_EXCEL_ROWS)

            df = normalize_for_excel(df, pd_module)
            df.to_excel(writer, sheet_name=table, index=False)

            report_rows.append(
                {
                    "table_name": table,
                    "sheet_name": table,
                    "rows_in_db": total_rows,
                    "rows_exported": len(df),
                    "truncated_by_excel_limit": truncated,
                    "columns": len(df.columns),
                }
            )
            exported_tables += 1

        report_df = pd_module.DataFrame(report_rows)
        if not report_df.empty:
            report_df.sort_values(["table_name"], inplace=True)
            report_df.to_excel(writer, sheet_name="_export_report", index=False)

    return pd_module.DataFrame(report_rows), exported_tables


def main() -> int:
    # Flujo principal: validaciones, conexion, lectura y exportacion final.
    args = parse_args()

    try:
        ensure_python_version()
        ensure_runtime_dependencies()
        pd_module, sql_text, create_engine_fn = load_runtime_modules()
        db_url = resolve_db_url()
        output_path = resolve_output_path(args.output, args.write_mode)
        engine = build_engine(db_url, create_engine_fn)
        tables = list_tables(engine, args.schema, sql_text)

        if not tables:
            print(f"No se encontraron tablas en el schema '{args.schema}'.")
            return 1

        report_df, exported_count = export_tables_to_excel(
            engine=engine,
            schema=args.schema,
            tables=tables,
            output_path=output_path,
            pd_module=pd_module,
            sql_text=sql_text,
        )

        total_rows = int(report_df["rows_exported"].sum()) if not report_df.empty else 0
        print(f"Archivo generado: {output_path}")
        print(f"Tablas exportadas: {exported_count}")
        print(f"Filas exportadas totales: {total_rows}")

        truncated_count = int(report_df["truncated_by_excel_limit"].sum()) if not report_df.empty else 0
        if truncated_count > 0:
            print(
                "Aviso: Algunas tablas superaban el limite de filas de Excel "
                f"({MAX_EXCEL_ROWS}) y fueron recortadas."
            )

        return 0
    except ValueError as exc:
        print(f"Configuracion invalida: {exc}")
        return 1
    except Exception as exc:
        print(f"No se pudo completar la exportacion: {exc}")
        return 2


if __name__ == "__main__":
    sys.exit(main())
