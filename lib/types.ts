export type Category = {
  id: number;
  name: string;
  slug: string | null;
  display_order: number | null;
  is_featured: boolean | null;
};

export type Product = {
  id: number;
  title: string;
  description: string | null;
  category_id: number | null;
  price: number;
  mrp: number | null;
  image_url: string | null;
  image_urls?: string[] | null;   // optional array of image URLs (admin uses image_urls)
  in_stock?: boolean | null;      // optional: whether product is available
  quantity?: number | null;       // optional: current stock quantity
  tags: string[] | null;
  created_at?: string | null;
  [key: string]: any;             // allow extra fields without breaking TS
};

export type VisitPayload = {
  customer_name: string;
  phone: string;
  address_line?: string;
  flat?: string;
  landmark?: string;
  google_maps_link?: string;
  preferred_date?: string; // yyyy-mm-dd
  preferred_time_slot?: string;
  note?: string;
};
