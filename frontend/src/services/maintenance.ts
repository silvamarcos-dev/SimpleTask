import { api } from "./api";

import type {
  CreateMaintenanceRequest,
  Maintenance,
  UpdateMaintenanceRequest,
} from "../types/maintenance";


export async function getMaintenances(): Promise<
  Maintenance[]
> {
  const response = await api.get<Maintenance[]>(
    "/maintenance",
  );

  return response.data;
}


export async function getMaintenance(
  maintenanceId: number,
): Promise<Maintenance> {
  const response = await api.get<Maintenance>(
    `/maintenance/${maintenanceId}`,
  );

  return response.data;
}


export async function createMaintenance(
  data: CreateMaintenanceRequest,
): Promise<Maintenance> {
  const response = await api.post<Maintenance>(
    "/maintenance",
    data,
  );

  return response.data;
}


export async function updateMaintenance(
  maintenanceId: number,
  data: UpdateMaintenanceRequest,
): Promise<Maintenance> {
  const response = await api.put<Maintenance>(
    `/maintenance/${maintenanceId}`,
    data,
  );

  return response.data;
}


export async function deleteMaintenance(
  maintenanceId: number,
): Promise<void> {
  await api.delete(
    `/maintenance/${maintenanceId}`,
  );
}