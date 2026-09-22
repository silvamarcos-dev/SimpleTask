export type MarketingPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok";

export type MarketingContentType =
  | "feed"
  | "story"
  | "reels"
  | "carousel";

export type MarketingPostStatus =
  | "planejado"
  | "em_producao"
  | "publicado"
  | "cancelado";

export interface MarketingPost {
  id: number;

  title: string;

  description: string | null;

  scheduled_date: string;

  scheduled_time: string | null;

  platform: MarketingPlatform;

  content_type: MarketingContentType;

  status: MarketingPostStatus;

  company_id: number;

  created_by_id: number;

  created_at: string;

  updated_at: string;
}

export interface CreateMarketingPostRequest {
  title: string;

  description?: string | null;

  scheduled_date: string;

  scheduled_time?: string | null;

  platform: MarketingPlatform;

  content_type: MarketingContentType;

  status?: MarketingPostStatus;
}

export interface UpdateMarketingPostRequest {
  title?: string;

  description?: string | null;

  scheduled_date?: string;

  scheduled_time?: string | null;

  platform?: MarketingPlatform;

  content_type?: MarketingContentType;

  status?: MarketingPostStatus;
}