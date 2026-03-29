import { object, optional, number, string, any } from "superstruct";

export type HaFormSchema = Record<string, any>;

export const lovelaceCardConfigStruct = object({
  index: optional(number()),
  view_index: optional(number()),
  view_layout: any(),
  type: string(),
  layout_options: any(),
  grid_options: any(),
  visibility: any(),
});


