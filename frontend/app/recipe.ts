export type Recipe = {
  prompt: string;
  content: string;
  created_at: string;
  name: string;
  id: number;
  is_latest: boolean;
  parent_id: number;
}