// =====================================================
// DEPARTAMENTO
// =====================================================

export interface Department {
  id: number;

  name: string;

  company_id: number;

  created_at: string;

  updated_at: string;
}


// =====================================================
// CRIAÇÃO
// =====================================================

export interface CreateDepartmentRequest {
  name: string;
}


// =====================================================
// ATUALIZAÇÃO
// =====================================================

export interface UpdateDepartmentRequest {
  name?: string;
}