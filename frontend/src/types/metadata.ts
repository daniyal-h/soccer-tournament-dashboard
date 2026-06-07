export interface ResponseMetadata {
  is_delayed: boolean;
  last_updated: string | null;
  last_successful_refresh: string | null;
  message: string | null;
}
