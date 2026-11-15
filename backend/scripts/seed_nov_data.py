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

        # 4. Generate records for Nov 1 to Nov 15, 2026
        start_date = datetime(2026, 11, 1, 8, 0, 0, tzinfo=timezone.utc)
        today = datetime(2026, 11, 15, 18, 0, 0, tzinfo=timezone.utc)
        
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
        curr_dt = start_date

        while curr_dt <= today:
            # 2 to 4 batches per day
            num_batches = random.randint(2, 4)
            # Daily target: ~25.000 - 33.000 units
            for b in range(num_batches):
                current_batch += 1
                art_info = random.choice(articulos)
                articulo_nombre = art_info[0]
                material_tipo = art_info[1]
                color_bidon = art_info[2]
                color_asa = art_info[3]
                unidades_por_lote = art_info[4]

                # Random batch total units (approx 7.000 to 12.000 units)
                lots_count = random.randint(12, 22)
                machine = random.choice([1, 2, 3, 4])
                turno = random.choice([1, 2, 3])
                operador = random.randint(101, 108)

                # Batch timestamp slightly shifted throughout the day
                batch_time = curr_dt + timedelta(hours=b * 4 + random.randint(0, 2), minutes=random.randint(0, 59))

                for l_idx in range(lots_count):
                    current_lote += 1
                    
                    # Estado selection:
                    # Older days mostly Liberado / Despacho
                    # Today/yesterday has Producción / Almacenaje
                    # Inject a few Retenido across the period
                    rand_val = random.random()
                    if rand_val < 0.04 and estados_retenido: # ~4% retenidos
                        chosen_estado = estados_retenido
                    elif curr_dt.day >= 14 and rand_val < 0.40 and estados_produccion:
                        chosen_estado = estados_produccion
                    elif curr_dt.day >= 13 and rand_val < 0.35 and estados_almacen:
                        chosen_estado = estados_almacen
                    elif curr_dt.day < 10 and rand_val < 0.30 and estados_despacho:
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

                    # Add audit history record
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

            curr_dt += timedelta(days=1)

        db.commit()
        print(f"ÉXITO: Se insertaron {total_inserted} lotes en {current_batch} tiradas entre 2026-11-01 y 2026-11-15.")
    except Exception as e:
        db.rollback()
        print(f"ERROR durante la inserción: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_november_data()
