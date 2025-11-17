export interface User {
  username: string;
  nome_completo?: string;
  email?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  nome_completo?: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nome_completo?: string;
  email?: string;
}

export interface Leitura {
  id: number;
  zona: number;
  tipo_animal: string;
  uid: string;
  count: number;
  arduino?: string;
  timestamp: string;
}

export interface DashboardStats {
  total_leituras: number;
  leituras_hoje: number;
  por_zona: {
    [key: string]: number;
  };
  por_tipo: {
    [key: string]: number;
  };
  ultimas_leituras: Leitura[];
}