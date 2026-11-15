import os
import sys
import random
import uuid
from datetime import datetime, timedelta, timezone

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.models import Production, Estado, HistorialEstado, User

def seed_november_data():
    db = SessionLocal()
    try:
        # 1. Fetch available estados
        estados = db.query(Estado).all()
        estado_map = {e.nombre: e.uid for e in estados}
        print(f"Estados encontrados: {list(estado_map.keys())}")

        if not estado_map:
            print("ERROR: No se encontraron estados en la base de datos.")
            return

        # 2. Get an existing user for auditoria / creador
        first_user = db.query(User).first()
        user_uid = first_user.uid if first_user else None
        print(f"Usuario asignado: {first_user.nombre_completo if first_user else 'None'}")

        # 3. Check current max lote and codigo_interno
        max_lote = db.query(Production.lote).order_by(Production.lote.desc()).first()
        current_lote = max_lote[0] if max_lote and max_lote[0] else 1000

        max_batch = db.query(Production.codigo_interno).order_by(Production.codigo_interno.desc()).first()
        current_batch = max_batch[0] if max_batch and max_batch[0] else 500

        print(f"Comenzando desde lote #{current_lote + 1}, batch #{current_batch + 1}")

        # 4. Target production per day (curva sube y baja realista, meta planta = 30.000)
        # 01/11 (Dom): 9.200 (baja actividad dominical)
        # 02/11 (Lun): 22.500 (arranque semana)
        # 03/11 (Mar): 34.200 (pico alto, sobre meta)
        # 04/11 (Mié): 36.800 (pico máximo)
        # 05/11 (Jue): 31.500 (sobre meta)
        # 06/11 (Vie): 24.600 (cierre semana)
        # 07/11 (Sáb): 12.400 (medio turno)
        # 08/11 (Dom): 0 (parada técnica y mantención preventiva)
        # 09/11 (Lun): 27.800 (retorno a producción)
        # 10/11 (Mar): 35.400 (pico sobre meta)
        # 11/11 (Mié): 33.100 (sobre meta)
        # 12/11 (Jue): 28.900 (alta producción)
        # 13/11 (Vie): 21.300 (desaceleración)
        # 14/11 (Sáb): 14.200 (medio turno)
        # 15/11 (Dom): 32.500 (turno extraordinario, sobre meta)
        daily_targets = {
            1: 9200,
            2: 22500,
            3: 34200,
            4: 36800,
            5: 31500,
            6: 24600,
            7: 12400,
            8: 0,
            9: 27800,
            10: 35400,
            11: 33100,
            12: 28900,
            13: 21300,
            14: 14200,
            15: 32500,
        }

        articulos = [
            ("Bidón 5L Industrial", "rPET Reciclado", "Azul", "Blanco", 500),
            ("Bidón 10L Agroquímico", "PET Virgen", "Natural", "Rojo", 400),
            ("Bidón 20L Premium", "rPET Reciclado", "Verde", "Negro", 250),
            ("Envase 1L Multiuso", "HDPE Polietileno", "Blanco", "Azul", 1000),
        ]

        estados_liberado = estado_map.get("Liberado")
        estados_almacen = estado_map.get("Almacenaje")
        estados_produccion = estado_map.get("Producción")
        estados_despacho = estado_map.get("Despacho")
        estados_retenido = estado_map.get("Retenido")

        total_inserted = 0

        for day in range(1, 16):
            target_units = daily_targets[day]
            if target_units == 0:
                print(f"Día 08/11/2026: 0 unidades (Parada programada)")
                continue

            current_day_units = 0
            batch_in_day = 0
            while current_day_units < target_units:
                batch_in_day += 1
                current_batch += 1
                art_info = random.choice(articulos)
                articulo_nombre = art_info[0]
                material_tipo = art_info[1]
                color_bidon = art_info[2]
                color_asa = art_info[3]
                unidades_por_lote = art_info[4]

                # Cantidad de lotes para esta tirada
                remaining = target_units - current_day_units
                needed_lots = max(1, round(remaining / unidades_por_lote))
                lots_count = min(needed_lots, random.randint(10, 20))
                
                machine = random.choice([1, 2, 3, 4])
                turno = random.choice([1, 2, 3])
                operador = random.randint(101, 108)

                batch_hour = min(22, 7 + (batch_in_day * 3))
                batch_time = datetime(2026, 11, day, batch_hour, random.randint(0, 59), 0, tzinfo=timezone.utc)

                for _ in range(lots_count):
                    current_lote += 1
                    
                    # Distribución de estados según día y azar
                    rand_val = random.random()
                    if rand_val < 0.03 and estados_retenido: # 3% retenidos
                        chosen_estado = estados_retenido
                    elif day == 15 and rand_val < 0.40 and estados_produccion:
                        chosen_estado = estados_produccion
                    elif day in (14, 15) and rand_val < 0.35 and estados_almacen:
                        chosen_estado = estados_almacen
                    elif day < 11 and rand_val < 0.30 and estados_despacho:
                        chosen_estado = estados_despacho
                    else:
                        chosen_estado = estados_liberado or list(estado_map.values())[0]

                    prod_uid = uuid.uuid4()
                    prod = Production(
                        uid=prod_uid,
                        codigo_interno=current_batch,
                        fecha=batch_time,
                        numero_maquina=machine,
                        turno=turno,
                        operador=operador,
                        cantidad=unidades_por_lote,
                        lote=current_lote,
                        unidad_embalaje="Pallet Termocontraíble",
                        peso=f"{random.randint(48, 55)} kg",
                        articulo=articulo_nombre,
                        material=material_tipo,
                        color_bidon=color_bidon,
                        color_asa=color_asa,
                        uid_estado=chosen_estado,
                        usuario_creador_uid=user_uid,
                        created_at=batch_time,
                        updated_at=batch_time
                    )
                    db.add(prod)
                    total_inserted += 1
                    current_day_units += unidades_por_lote

                    hist = HistorialEstado(
                        uid=uuid.uuid4(),
                        production_uid=prod_uid,
                        estado_anterior_uid=None,
                        estado_nuevo_uid=chosen_estado,
                        usuario_uid=user_uid,
                        fecha_hora=batch_time,
                        observaciones=f"Registro operativo lote #{current_lote} en Tirada #{current_batch}"
                    )
                    db.add(hist)

            print(f"Día {day:02d}/11/2026: {current_day_units} unidades en {batch_in_day} tiradas")

        db.commit()
        print(f"ÉXITO: Se insertaron {total_inserted} lotes en total entre 01/11/2026 y 15/11/2026.")
    except Exception as e:
        db.rollback()
        print(f"ERROR durante la inserción: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_november_data()
