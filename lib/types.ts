export type MeshCount = "13" | "18" | "other";
export type CanvasStatus =
  | "wishlist"
  | "in stash"
  | "WIP"
  | "to finish"
  | "complete";

export interface Canvas {
  id: string;
  name: string;
  designer: string | null;
  retailer: string | null;
  mesh_count: MeshCount | null;
  status: CanvasStatus;
  notes: string | null;
  tags: string[];
  created_at: string;
}

export interface CanvasThread {
  id: string;
  canvas_id: string;
  brand: string | null;
  color_number: string | null;
  color_name: string | null;
  lot_number: string | null;
  quantity: number;
  created_at: string;
}

export interface CanvasWithThreads extends Canvas {
  threads: CanvasThread[];
}
