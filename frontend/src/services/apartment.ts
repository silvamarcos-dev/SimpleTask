import { api } from "./api";
import type {
  Apartment,
  CreateApartmentRequest,
  UpdateApartmentRequest,
} from "../types/apartment";

export async function getApartments(): Promise<Apartment[]> {
  const response = await api.get<Apartment[]>("/apartments");
  return response.data;
}

export async function getApartment(
  apartmentId: number,
): Promise<Apartment> {
  const response = await api.get<Apartment>(
    `/apartments/${apartmentId}`,
  );

  return response.data;
}

export async function createApartment(
  data: CreateApartmentRequest,
): Promise<Apartment> {
  const response = await api.post<Apartment>("/apartments", data);

  return response.data;
}

export async function updateApartment(
  apartmentId: number,
  data: UpdateApartmentRequest,
): Promise<Apartment> {
  const response = await api.patch<Apartment>(
    `/apartments/${apartmentId}`,
    data,
  );

  return response.data;
}

export async function deleteApartment(
  apartmentId: number,
): Promise<void> {
  await api.delete(`/apartments/${apartmentId}`);
}