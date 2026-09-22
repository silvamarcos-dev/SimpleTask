import { api } from "./api";

import type {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest,
} from "../types/department";


// =====================================================
// LISTAR DEPARTAMENTOS
// =====================================================

export async function getDepartments(): Promise<Department[]> {
  const response = await api.get<Department[]>(
    "/departments",
  );

  return response.data;
}


// =====================================================
// CRIAR DEPARTAMENTO
// =====================================================

export async function createDepartment(
  data: CreateDepartmentRequest,
): Promise<Department> {
  const response = await api.post<Department>(
    "/departments",
    data,
  );

  return response.data;
}


// =====================================================
// ATUALIZAR DEPARTAMENTO
// =====================================================

export async function updateDepartment(
  departmentId: number,
  data: UpdateDepartmentRequest,
): Promise<Department> {
  const response = await api.patch<Department>(
    `/departments/${departmentId}`,
    data,
  );

  return response.data;
}


// =====================================================
// EXCLUIR DEPARTAMENTO
// =====================================================

export async function deleteDepartment(
  departmentId: number,
): Promise<void> {
  await api.delete(
    `/departments/${departmentId}`,
  );
}