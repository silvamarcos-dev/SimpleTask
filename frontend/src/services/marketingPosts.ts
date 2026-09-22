import { api } from "./api";

import type {
  CreateMarketingPostRequest,
  MarketingPost,
  UpdateMarketingPostRequest,
} from "../types/marketingPost";


export async function getMarketingPosts(
  startDate?: string,
  endDate?: string,
): Promise<MarketingPost[]> {
  const response = await api.get<MarketingPost[]>(
    "/marketing/posts",
    {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    },
  );

  return response.data;
}


export async function getMarketingPost(
  postId: number,
): Promise<MarketingPost> {
  const response = await api.get<MarketingPost>(
    `/marketing/posts/${postId}`,
  );

  return response.data;
}


export async function createMarketingPost(
  data: CreateMarketingPostRequest,
): Promise<MarketingPost> {
  const response = await api.post<MarketingPost>(
    "/marketing/posts",
    data,
  );

  return response.data;
}


export async function updateMarketingPost(
  postId: number,
  data: UpdateMarketingPostRequest,
): Promise<MarketingPost> {
  const response = await api.patch<MarketingPost>(
    `/marketing/posts/${postId}`,
    data,
  );

  return response.data;
}


export async function deleteMarketingPost(
  postId: number,
): Promise<void> {
  await api.delete(
    `/marketing/posts/${postId}`,
  );
}