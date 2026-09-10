export type MaintenancePriority =
  | "baixa"
  | "media"
  | "alta";

export type MaintenanceStatus =
  | "pendente"
  | "em_andamento"
  | "agendada"
  | "concluida";

export type ProviderType =
  | "pessoa"
  | "empresa";


export interface Maintenance {
  id: number;

  title: string;

  description: string | null;

  // Localização
  building: string | null;
  block: string | null;
  apartment: string | null;

  category: string | null;

  priority: MaintenancePriority;

  status: MaintenanceStatus;

  // Prestador
  provider_type: ProviderType | null;
  provider_name: string | null;
  provider_phone: string | null;

  scheduled_date: string | null;

  notes: string | null;

  user_id: number;

  created_at: string;
  updated_at: string;
}


export interface CreateMaintenanceRequest {
  title: string;

  description?: string | null;

  // Localização
  building?: string | null;
  block?: string | null;
  apartment?: string | null;

  category?: string | null;

  priority: MaintenancePriority;

  status?: MaintenanceStatus;

  // Prestador
  provider_type?: ProviderType | null;
  provider_name?: string | null;
  provider_phone?: string | null;

  scheduled_date?: string | null;

  notes?: string | null;
}


export interface UpdateMaintenanceRequest {
  title?: string;

  description?: string | null;

  // Localização
  building?: string | null;
  block?: string | null;
  apartment?: string | null;

  category?: string | null;

  priority?: MaintenancePriority;

  status?: MaintenanceStatus;

  // Prestador
  provider_type?: ProviderType | null;
  provider_name?: string | null;
  provider_phone?: string | null;

  scheduled_date?: string | null;

  notes?: string | null;
}