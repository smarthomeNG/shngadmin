
//
// Datatype for <shng-server>:<port>/admin/items.json
//

export interface ItemDetails {
  path: string;
  name: string;
  type: string;
  struct?: string;
  value: string;
  change_age: number;
  update_age: number;
  last_update: string;
  last_change: string;
  changed_by: string;
  updated_by: string;
  previous_value: string;
  previous_change_age: number;
  previous_update_age: number;
  previous_update: string;
  previous_change: string;
  enforce_updates: string;
  cache: string;
  eval: string;
  trigger: string;
  trigger_condition: string;
  trigger_condition_raw: string;
  on_update: string;
  on_change: string;
  log_change: string;
  cycle: string;
  crontab: string;
  autotimer: string;
  threshold: string;
  threshold_crossed: string;
  config: {};
  logics: string;
  triggers: string;
  filename: string;
}
