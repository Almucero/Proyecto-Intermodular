import pandas as pd
import os
import json
from pathlib import Path

def clean_and_process_database():
    # Rutas
    base_dir = Path(__file__).resolve().parents[3]
    json_dir = base_dir / "backend-data" / "json"
    output_dir = base_dir / "backend-data" / "exports"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "processed_database.xlsx"
    
    print(f"Leyendo datos desde: {json_dir}")
    
    # Diccionario para almacenar los dataframes procesados
    processed_dfs = {}
    
    # Obtener todos los archivos JSON
    json_files = list(json_dir.glob("*.json"))
    
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        for file_path in json_files:
            table_name = file_path.stem
            print(f"Procesando tabla: {table_name}...")
            
            # 1. Leer archivo
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                # Manejar casos donde el JSON es una lista simple de strings (como developers o genres)
                if data and isinstance(data, list) and not isinstance(data[0], dict):
                    df = pd.DataFrame(data, columns=['value'])
                else:
                    df = pd.DataFrame(data)
                
                if df.empty:
                    continue

                # 2. LIMPIEZA: Eliminar espacios al inicio/final de todas las celdas de texto
                # Demostración de applymap/apply con funciones lambda
                df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
                
                # 3. SUSTITUCIÓN: Reemplazar caracteres especiales o nulos
                # Por ejemplo, en Usuarios corregimos nulos en addressLine2
                if table_name == "users":
                    df['addressLine2'] = df['addressLine2'].fillna("N/A")
                    
                    # CREACIÓN DE NUEVAS COLUMNAS: Nombre completo
                    df['full_name'] = df['name'] + " " + df['surname']
                    
                    # MASCARADO: Sustituir password por asteriscos para demostrar manipulación
                    df['password'] = df['password'].apply(lambda x: "*" * 8)
                
                # 4. MANIPULACIÓN INTENSIVA: Cálculos en juegos
                if table_name == "games":
                    # Reemplazar caracteres en títulos (ej: 'ó' por 'o' para demostrar sustitución)
                    df['title_unaccented'] = df['title'].str.replace('ó', 'o').str.replace('á', 'a')
                    
                    # Calcular STOCK TOTAL (suma de todas las columnas que empiezan por 'stock')
                    stock_cols = [c for c in df.columns if c.startswith('stock')]
                    df['total_stock'] = df[stock_cols].sum(axis=1)
                    
                    # Calcular PRECIO FINAL (si está en oferta usa salePrice, si no price)
                    df['effective_price'] = df.apply(lambda row: row['salePrice'] if row['isOnSale'] else row['price'], axis=1)
                    
                    # BÚSQUEDA: Filtrar juegos con valoración mayor a 4.5
                    top_games = df[df['rating'] > 4.5].copy()
                    print(f"  - Encontrados {len(top_games)} juegos TOP (rating > 4.5)")
                    
                    # Guardamos el resultado de la búsqueda en una pestaña específica para demostrarlo
                    if not top_games.empty:
                        top_games.to_excel(writer, sheet_name="busqueda_top_games", index=False)

                # 5. Exportar a una pestaña del Excel
                df.to_excel(writer, sheet_name=table_name, index=False)
                processed_dfs[table_name] = df
                
            except Exception as e:
                print(f"Error procesando {table_name}: {e}")

    print(f"\nPROCESO COMPLETADO.")
    print(f"Archivo generado en: {output_path}")

if __name__ == "__main__":
    clean_and_process_database()
