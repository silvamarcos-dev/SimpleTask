export type ApartmentStatus =
  | "ativo"
  | "inativo"
  | "manutencao";

export interface Apartment {
  id: number;
  title: string;
  description: string | null;
  building: string;
  block: string | null;
  apartment: string;
  status: ApartmentStatus;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateApartmentRequest {
  title: string;
  description?: string | null;
  building: string;
  block?: string | null;
  apartment: string;
  status?: ApartmentStatus;
}

export interface UpdateApartmentRequest {
  title?: string;
  description?: string | null;
  building?: string;
  block?: string | null;
  apartment?: string;
  status?: ApartmentStatus;
}