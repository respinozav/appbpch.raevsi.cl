// API Client for Bioplast Chile Platform

const API_BASE_URL = '/api';

export interface Role {
  uid: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  modulos?: string[];
}

export interface LoginAuditItem {
  uid: string;
  correo: string;
  usuario_nombre?: string;
  exitoso: boolean;
  ip_origen: string;
  user_agent?: string;
  motivo_fallo?: string;
  fecha_hora: string;
}

export interface User {
  uid: string;
  nombre_completo: string;
  correo: string;
  rol_uid: string;
  rol?: Role;
  activo: boolean;
  created_at?: string;
}

export interface SessionConfig {
  timeout_minutes: number;
  clave: string;
  updated_at?: string;
  usuario_actualizador?: string;
}

export interface Estado {
  uid: string;
  nombre: 'Producción' | 'Almacenaje' | 'Despacho' | 'Liberado' | 'Retenido';
  descripcion?: string;
  color: string;
}

export interface SapCodigoInternoItem {
  uid: string;
  codigosap: string;
  codigointerno: string;
  articulo: string;
  materia?: string;
  color?: string;
  colorasa?: string;
  cantidad?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OperadorItem {
  uid: string;
  nombre: string;
  rut?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductionTicket {
  uid: string;
  codigo_interno: number;
  codigosap?: string;
  fecha: string;
  numero_maquina: number;
  turno: number;
  operador: number;
  operador_nombre?: string;
  cantidad: number;
  lote: number;
  unidad_embalaje: string;
  peso: string;
  articulo: string;
  material: string;
  color_bidon: string;
  color_asa: string;
  uid_estado: string;
  estado?: Estado;
  created_at?: string;
  qr_url?: string;
}

export interface ProductionBatchSummary {
  codigo_interno: number;
  codigosap?: string;
  fecha: string;
  articulo: string;
  material: string;
  color_bidon: string;
  color_asa: string;
  numero_maquina: number;
  turno: number;
  operador: number;
  operador_nombre?: string;
  cantidad_unitaria: number;
  total_lotes: number;
  lote_inicio: number;
  lote_fin: number;
  peso: string;
  uid_estado: string;
  estado?: Estado;
  lotes: ProductionTicket[];
}

export interface HistorialEstado {
  uid: string;
  production_uid: string;
  estado_anterior?: Estado;
  estado_nuevo: Estado;
  usuario_nombre?: string;
  fecha_hora: string;
  observaciones?: string;
}

export interface CertificateData {
  header: {
    codigo_documento: string;
    version: string;
    fecha_documento: string;
    pagina: string;
    titulo: string;
    numero_certificado: string;
  };
  declaraciones: {
    conformidad: string;
    inocuidad: string;
  };
  item: {
    numero: number;
    articulo: string;
    codigo_interno?: string;
    lote: string;
    unidad_embalaje: string;
    material: string;
    color_bidon: string;
    color_asa: string;
    cantidad_unidad: number;
    resultado: string;
  };
  condiciones_almacenamiento: {
    descripcion: string;
    duracion: string;
  };
  metadatos_despacho: {
    cliente: string;
    despacho: string;
    factura: string;
    fecha: string;
  };
  responsable: {
    nombre: string;
    cargo: string;
  };
  production_uid: string;
}

export interface PublicTrazabilidadData {
  uid: string;
  verificado: boolean;
  codigo_interno: number;
  codigosap?: string;
  lote: number;
  unidad_embalaje: string;
  articulo: string;
  material: string;
  color_bidon: string;
  color_asa: string;
  cantidad: number;
  peso: string;
  numero_maquina: number;
  turno: number;
  operador: number;
  operador_nombre?: string;
  fecha_fabricacion: string;
  estado_actual: string;
  estado_color: string;
  certificado_numero?: string;
  aprobado_calidad: boolean;
  historial: HistorialEstado[];
}

export interface DashboardMetricsData {
  resumen: {
    total_unidades: number;
    total_lotes: number;
    distinct_batches: number;
    tasa_liberacion: number;
    tasa_rpet: number;
    tco2_avoided: number;
    kilos_reciclados?: number;
  };
  estados: {
    uid: string;
    nombre: string;
    color: string;
    count: number;
    percentage: number;
  }[];
  materiales: {
    material: string;
    lotes: number;
    unidades: number;
    percentage: number;
  }[];
  maquinas: {
    maquina: string;
    numero: number;
    lotes: number;
    unidades: number;
    tiradas: number;
  }[];
  turnos: {
    turno: string;
    numero: number;
    lotes: number;
    unidades: number;
  }[];
  tendencia_diaria?: {
    fecha: string;
    unidades: number;
    lotes: number;
    meta: number;
    cumplimiento_pct: number;
  }[];
  actividad_reciente: {
    uid: string;
    fecha_hora: string;
    production_uid: string;
    codigo_interno: number;
    lote: number;
    articulo: string;
    estado_nuevo: string;
    estado_color: string;
    responsable: string;
    observaciones?: string;
  }[];
  ley_rep: {
    categoria: string;
    normativa: string;
    meta_actual_pct: number;
    cumplimiento_actual_pct: number;
    certificados_emitidos: number;
    kilos_rpet_estimados?: number;
  };
}

export const getToken = (): string | null => localStorage.getItem('bpch_token');
export const setToken = (token: string) => localStorage.setItem('bpch_token', token);
export const clearToken = () => localStorage.removeItem('bpch_token');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/public/')) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
  }

  if (!response.ok) {
    let errorDetail = 'Error en la solicitud';
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || errorData.message || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (correo: string, password: string) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    }),

  getMe: () => request<User>('/auth/me'),

  updateProfile: (data: { nombre_completo: string; password?: string; current_password?: string }) =>
    request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Dashboard Metrics
  getDashboardMetrics: (
    periodOrParams?: string | { period?: string; material?: string; fecha_desde?: string; fecha_hasta?: string },
    material?: string,
    fecha_desde?: string,
    fecha_hasta?: string
  ) => {
    const q = new URLSearchParams();
    if (typeof periodOrParams === 'object' && periodOrParams !== null) {
      if (periodOrParams.period) q.append('period', periodOrParams.period);
      if (periodOrParams.material) q.append('material_filter', periodOrParams.material);
      if (periodOrParams.fecha_desde) q.append('fecha_desde', periodOrParams.fecha_desde);
      if (periodOrParams.fecha_hasta) q.append('fecha_hasta', periodOrParams.fecha_hasta);
    } else {
      if (periodOrParams) q.append('period', periodOrParams);
      if (material) q.append('material_filter', material);
      if (fecha_desde) q.append('fecha_desde', fecha_desde);
      if (fecha_hasta) q.append('fecha_hasta', fecha_hasta);
    }
    return request<DashboardMetricsData>(`/dashboard/metrics?${q.toString()}`);
  },

  // Users (Admin)
  getRoles: () => request<Role[]>('/users/roles'),
  listUsers: () => request<User[]>('/users'),
  createUser: (data: { nombre_completo: string; correo: string; password: string; rol_uid: string; activo: boolean }) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (uid: string, data: { nombre_completo?: string; password?: string; rol_uid?: string; activo?: boolean }) =>
    request<User>(`/users/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (uid: string) =>
    request<{ message: string }>(`/users/${uid}`, {
      method: 'DELETE',
    }),

  // Production
  getEstados: () => request<Estado[]>('/production/estados'),
  getStats: () => request<any>('/production/stats'),
  createBatch: (data: {
    numero_maquina: number;
    turno: number;
    operador: number;
    operador_nombre?: string;
    cantidad: number;
    cantidad_lotes: number;
    peso: string;
    articulo: string;
    material: string;
    color_bidon: string;
    color_asa: string;
    codigosap?: string;
  }) =>
    request<ProductionBatchSummary>('/production/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listBatches: (params: { 
    estado_uid?: string; 
    search?: string; 
    fecha_desde?: string; 
    fecha_hasta?: string; 
    page?: number; 
    limit?: number 
  }) => {
    const q = new URLSearchParams();
    if (params.estado_uid) q.append('estado_uid', params.estado_uid);
    if (params.search) q.append('search', params.search);
    if (params.fecha_desde) q.append('fecha_desde', params.fecha_desde);
    if (params.fecha_hasta) q.append('fecha_hasta', params.fecha_hasta);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));
    return request<{ items: any[]; total: number; page: number; limit: number; pages: number }>(`/production/batches?${q.toString()}`);
  },

  getBatchDetails: (codigo_interno: number) =>
    request<ProductionBatchSummary>(`/production/batches/${codigo_interno}`),

  updateBatchState: (codigo_interno: number, data: { nuevo_estado_uid: string; observaciones?: string }) =>
    request<{ message: string }>(`/production/batch/${codigo_interno}/state`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateSingleLotState: (production_uid: string, data: { nuevo_estado_uid: string; observaciones?: string }) =>
    request<{ message: string }>(`/production/${production_uid}/state`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getLotHistorial: (production_uid: string) =>
    request<HistorialEstado[]>(`/production/${production_uid}/historial`),

  downloadProductionCsv: async (params: {
    fecha_desde?: string;
    fecha_hasta?: string;
    material_filter?: string;
  }): Promise<void> => {
    const q = new URLSearchParams();
    if (params.fecha_desde) q.append('fecha_desde', params.fecha_desde);
    if (params.fecha_hasta) q.append('fecha_hasta', params.fecha_hasta);
    if (params.material_filter) q.append('material_filter', params.material_filter);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/production/export/csv?${q.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMsg = 'Error al descargar archivo CSV';
      try {
        const errJson = await response.json();
        errorMsg = errJson.detail || errorMsg;
      } catch {
        errorMsg = response.statusText;
      }
      throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition');
    let filename = `reporte_produccion_bioplast_${new Date().toISOString().split('T')[0]}.csv`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Certificates
  listLiberados: (params: { search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));
    return request<{ items: any[]; total: number; page: number; limit: number; pages: number }>(`/certificates/liberados?${q.toString()}`);
  },

  emitCertificate: (data: {
    production_uid: string;
    cliente: string;
    despacho: string;
    factura?: string;
    fecha?: string;
    aprobado_por: string;
    cargo: string;
  }) =>
    request<any>('/certificates/emit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCertificateData: (production_uid: string) =>
    request<CertificateData>(`/certificates/${production_uid}`),

  // Public Consultation (QR Code Scan)
  getPublicTrazabilidad: (uid: string) =>
    request<PublicTrazabilidadData>(`/public/trazabilidad/${uid}`),

  // System Configuration (Session timeout, RBAC, Login Audit)
  getSessionConfig: () => request<SessionConfig>('/config/session'),
  updateSessionConfig: (timeout_minutes: number) =>
    request<SessionConfig>('/config/session', {
      method: 'PUT',
      body: JSON.stringify({ timeout_minutes }),
    }),

  listRolesConfig: () => request<Role[]>('/config/roles'),
  createRole: (data: { nombre: string; descripcion?: string; modulos: string[] }) =>
    request<Role>('/config/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRole: (uid: string, data: { nombre?: string; descripcion?: string; activo?: boolean; modulos?: string[] }) =>
    request<Role>(`/config/roles/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  listLoginAudits: (params: { search?: string; exitoso?: boolean; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.exitoso !== undefined) q.append('exitoso', String(params.exitoso));
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));
    return request<{ items: LoginAuditItem[]; total: number; page: number; limit: number; pages: number }>(`/config/audit/logins?${q.toString()}`);
  },

  // Códigos Internos SAP
  listCodigosInternos: (params?: { search?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    return request<{ items: SapCodigoInternoItem[]; total: number; page: number; limit: number; pages: number }>(`/codigos-internos?${q.toString()}`);
  },
  getAllCodigosInternos: () =>
    request<SapCodigoInternoItem[]>('/codigos-internos/all'),
  getCodigoInterno: (uid: string) =>
    request<SapCodigoInternoItem>(`/codigos-internos/${uid}`),
  createCodigoInterno: (data: Omit<SapCodigoInternoItem, 'uid' | 'created_at' | 'updated_at'>) =>
    request<SapCodigoInternoItem>('/codigos-internos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCodigoInterno: (uid: string, data: Partial<Omit<SapCodigoInternoItem, 'uid' | 'created_at' | 'updated_at'>>) =>
    request<SapCodigoInternoItem>(`/codigos-internos/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCodigoInterno: (uid: string) =>
    request<{ success: boolean; message: string }>(`/codigos-internos/${uid}`, {
      method: 'DELETE',
    }),

  // Operadores
  listOperadores: (params?: { search?: string; solo_activos?: boolean; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.solo_activos !== undefined) q.append('solo_activos', String(params.solo_activos));
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));
    return request<{ items: OperadorItem[]; total: number; page: number; limit: number; pages: number }>(`/operadores?${q.toString()}`);
  },
  getOperadoresActivos: () =>
    request<OperadorItem[]>('/operadores/activos'),
  getOperador: (uid: string) =>
    request<OperadorItem>(`/operadores/${uid}`),
  createOperador: (data: { nombre: string; rut?: string; activo?: boolean }) =>
    request<OperadorItem>('/operadores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateOperador: (uid: string, data: { nombre?: string; rut?: string; activo?: boolean }) =>
    request<OperadorItem>(`/operadores/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleActiveOperador: (uid: string) =>
    request<OperadorItem>(`/operadores/${uid}/toggle-active`, {
      method: 'PATCH',
    }),
  deleteOperador: (uid: string) =>
    request<void>(`/operadores/${uid}`, {
      method: 'DELETE',
    }),
};
