export interface ZebraConfig {
  presetId: '100x200' | '100x150' | '100x100' | '102x152' | 'custom';
  anchoMm: number;
  altoMm: number;
  mandrilPulgadas: number; // 1 (25.4mm) o 3 (76.2mm)
  diametroExteriorMaxMm: number; // 127mm (5") o 203mm (8")
  dpi: 203 | 300;
  sensorTipo: 'gap' | 'black_mark' | 'continuous';
  darkness: number; // 1 a 30 (recomendado 15)
  velocidadIps: number; // 2 a 6 (recomendado 4 ips)
}

export interface ZebraPreset {
  id: ZebraConfig['presetId'];
  label: string;
  ancho: number;
  alto: number;
  pulgadas: string;
  descripcion: string;
  isPopular?: boolean;
}

export const ZEBRA_PRESETS: ZebraPreset[] = [
  {
    id: '100x200',
    label: '100 x 200 mm',
    ancho: 100,
    alto: 200,
    pulgadas: '4.0" x 7.87"',
    descripcion: 'Pallet industrial y embalaje extendido (Estándar Bioplast Chile)',
    isPopular: true,
  },
  {
    id: '100x150',
    label: '100 x 150 mm',
    ancho: 100,
    alto: 150,
    pulgadas: '4.0" x 6.0"',
    descripcion: 'Estándar logístico industrial y etiquetas de despacho',
  },
  {
    id: '100x100',
    label: '100 x 100 mm',
    ancho: 100,
    alto: 100,
    pulgadas: '4.0" x 4.0"',
    descripcion: 'Formato compacto para cajas, bidones pequeños o bultos',
  },
  {
    id: '102x152',
    label: '102 x 152 mm',
    ancho: 102,
    alto: 152,
    pulgadas: '4.0" x 6.0" US',
    descripcion: 'Formato oficial de alta compatibilidad Zebra ZP450 / ZT411',
  },
  {
    id: 'custom',
    label: 'Personalizado',
    ancho: 100,
    alto: 200,
    pulgadas: 'A medida',
    descripcion: 'Medidas manuales configuradas por el supervisor de planta',
  },
];

export const DEFAULT_ZEBRA_CONFIG: ZebraConfig = {
  presetId: '100x200',
  anchoMm: 100,
  altoMm: 200,
  mandrilPulgadas: 3,
  diametroExteriorMaxMm: 203,
  dpi: 203,
  sensorTipo: 'gap',
  darkness: 15,
  velocidadIps: 4,
};

const ZEBRA_CONFIG_STORAGE_KEY = 'bpch_zebra_config';

export const getStoredZebraConfig = (): ZebraConfig => {
  try {
    const raw = localStorage.getItem(ZEBRA_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ZEBRA_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading Zebra config from localStorage:', e);
  }
  return DEFAULT_ZEBRA_CONFIG;
};

export const setStoredZebraConfig = (config: ZebraConfig): void => {
  try {
    localStorage.setItem(ZEBRA_CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('bpch_zebra_config_updated', { detail: config }));
  } catch (e) {
    console.warn('Error saving Zebra config to localStorage:', e);
  }
};
