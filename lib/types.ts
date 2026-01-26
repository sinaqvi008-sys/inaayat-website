
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
  in_stock: boolean | null;
  tags: string[] | null;
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
