import { LovelaceCardConfig } from "custom-card-helpers";
import { assign, union, literal, refine, number, object, optional, string, boolean } from "superstruct";
import { lovelaceCardConfigStruct } from "../type/ha";

export type FlexSliderCardFormat = "std" | "compact";
export function assertFlexSliderCardFormat(value: any): asserts value is FlexSliderCardFormat {
  if (!["std", "compact"].includes(value)) {
    throw new Error(`Invalid FlexSliderCardFormat: ${value}`);
  }
}
export const flexSliderCardFormatStruct = union([
  literal("std"),
  literal("compact"),
]);

export type FlexSliderCardDigits = "auto" | "manual";
export function assertFlexSliderCardDigits(value: any): asserts value is FlexSliderCardDigits {
  if (!["auto", "manual"].includes(value)) {
    throw new Error(`Invalid FlexSliderCardDigits: ${value}`);
  }
}
export const flexSliderCardDigitsStruct = union([
  literal("auto"),
  literal("manual"),
]);

export type FlexSliderCardValuesBarConfig = {
  mintext?: string;
  maxtext?: string;
  digits?: FlexSliderCardDigits;
  nbdigits?: number;
  unit?: string;
};
export const flexSliderCardValuesBarConfigStruct = object({
  mintext: optional(string()),
  maxtext: optional(string()),
  digits: optional(flexSliderCardDigitsStruct),
  nbdigits: optional(number()),
  unit: optional(string()),
});

export type FlexSliderCardConfig = LovelaceCardConfig &
{
  /* display options */
  name?: string;
  format?: FlexSliderCardFormat;
  valuesbaractive?: boolean;
  valuesbar?: FlexSliderCardValuesBarConfig;

 /* bahavioral */
  entity_min: string;
  entity_max: string;
  min?: number;
  max?: number;
  step?: number;
};
export const flexSliderCardConfigStruct = assign(
  lovelaceCardConfigStruct,
  object({
    /* display options */
    name: optional(string()),
    format: optional(flexSliderCardFormatStruct),
    valuesbaractive: optional(boolean()), 
    valuesbar: optional(flexSliderCardValuesBarConfigStruct),

    /* behavioral */
    entity_min: string(),
    entity_max: string(),
    min: optional(number()),
    max: optional(number()),
    step: optional(number()),
  })
);