"""
@file: src/backend/scripts/jsonToExcel.py
@project: GameSage - Plataforma de Videojuegos
@authors: Rosario González y Álvaro Jiménez
@description: Script para procesar archivos JSON del backend-data, aplicando limpieza, sustituciones y manipulación de datos, y exportando el resultado a un archivo Excel unificado.
"""

import pandas as pd 
import json 
from pathlib import Path

def clean_and_process_database():
    # Busca el directorio base (subiendo 3 niveles desde donde está este script)
    base_dir = Path(__file__).resolve().parents[3]
    # Define la carpeta de entrada (json) y salida (exports)
    json_dir = base_dir / "backend-data" / "json"
    output_dir = base_dir / "backend-data" / "exports"
    # Crea la carpeta de exports si no existe
    output_dir.mkdir(parents=True, exist_ok=True)
    # Define la ruta final del archivo Excel
    output_path = output_dir / "processed_database.xlsx"
    
    print(f"Leyendo datos desde: {json_dir}")
    

    
    # Obtener una lista con todos los archivos que terminen en .json
    json_files = list(json_dir.glob("*.json"))
    
    # Abrir el archivo Excel en modo escritura usando openpyxl
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        # Iterar sobre cada archivo JSON encontrado
        for file_path in json_files:
            # Obtener el nombre del archivo sin extensión (ej: 'users' de 'users.json')
            table_name = file_path.stem
            print(f"Procesando tabla: {table_name}...")
            
            try:
                # Abrir el archivo JSON leyendo caracteres especiales (utf-8)
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Manejar casos donde el JSON es una lista simple de strings (como developers o genres)
                if data and isinstance(data, list) and not isinstance(data[0], dict):
                    df = pd.DataFrame(data, columns=['value'])
                else:
                    df = pd.DataFrame(data)
                
                # Si el archivo estaba vacío, saltar al siguiente
                if df.empty:
                    continue

                # Eliminar espacios en blanco al inicio/final de todas las celdas de texto (.strip)
                df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
                
                if table_name == "users":
                    # Sustitución: Rellenar nulos en addressLine2 con "N/A"
                    df['addressLine2'] = df['addressLine2'].fillna("N/A")
                    
                    # Creación de columna: Generar nombre completo juntando nombre y apellido
                    df['full_name'] = df['name'] + " " + df['surname']
                    
                    # Sustitución: Sustituir password por 8 asteriscos por seguridad
                    df['password'] = df['password'].apply(lambda x: "*" * 8)
                
                if table_name == "games":
                    # Sustitución: Reemplazar caracteres con tilde en títulos por sin tilde
                    df['title_unaccented'] = df['title'].str.replace('ó', 'o').str.replace('á', 'a')
                    
                    # Creación de columna: Encontrar todas las columnas de stock y sumarlas para el total_stock
                    stock_cols = [c for c in df.columns if c.startswith('stock')]
                    df['total_stock'] = df[stock_cols].sum(axis=1)
                    
                    # Creación de columna: Calcular PRECIO FINAL evaluando si está en oferta (isOnSale)
                    df['effective_price'] = df.apply(lambda row: row['salePrice'] if row['isOnSale'] else row['price'], axis=1)
                    
                    # Búsqueda: Filtrar juegos con valoración mayor a 4.5
                    top_games = df[df['rating'] > 4.5].copy()
                    print(f"  - Encontrados {len(top_games)} juegos TOP (rating > 4.5)")
                    
                    # Si hay juegos top, guardarlos en una pestaña específica del Excel
                    if not top_games.empty:
                        top_games.to_excel(writer, sheet_name="busqueda_top_games", index=False)

                # Exportar la tabla procesada a una pestaña con su propio nombre (sin guardar el índice)
                df.to_excel(writer, sheet_name=table_name, index=False)

                
            except Exception as e:
                # Capturar y mostrar errores para que el script no se detenga por un archivo defectuoso
                print(f"Error procesando {table_name}: {e}")

    # Mensajes finales
    print(f"\nPROCESO COMPLETADO.")
    print(f"Archivo generado en: {output_path}")

# Punto de entrada del script (solo se ejecuta si se corre directamente)
if __name__ == "__main__":
    clean_and_process_database()
