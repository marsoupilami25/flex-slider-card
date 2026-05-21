import memoizeOne from "memoize-one";
import { HaFormSchema } from "../type/ha";
import {
  FlexSliderCardEntityType,
  FLEX_SLIDER_ENTITY_DOMAINS,
  FLEX_SLIDER_NUMBER_ENTITY_DOMAINS,
} from "../utils/entity-management";

// The form only supports an inclusive minimum, while runtime validation requires step > 0.
const MIN_POSITIVE_STEP_FOR_FORM = 0.000001;

const baseSchema = memoizeOne((
  isNumber: boolean,
  isVertical: boolean,
  isCompact: boolean,
  showVerticalLayout: boolean,
  hasReferenceValuesBar: boolean,
): HaFormSchema[] => [
  {
    name: "name",
    selector: { text: {} },
    required: false,
  },
  {
    name: "format",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "std", label: "Standard" },
          { value: "compact", label: "Compact" },
        ],
      },
    },
    required: false,
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "orientation",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "horizontal", label: "Horizontal" },
              { value: "vertical", label: "Vertical" },
            ],
          },
        },
        required: false,
      },
      ...(!isVertical ? [{
        name: "horizontalwidth",
        selector: {
          number: {
            mode: "slider",
            min: 10,
            max: 100,
            step: 5,
          },
        },
        required: false,
      }] : [{
        name: "verticalheight",
        selector: {
          number: {
            mode: "slider",
            min: isCompact ? 1 : 2,
            max: 12,
            step: 1,
          },
        },
        required: false,
      }]),
    ],
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "valuesbaractive",
        selector: { boolean: {} },
        required: false,
        disabled: isVertical || hasReferenceValuesBar,
      },
      {
        name: "bubblesactive",
        selector: { boolean: {} },
        required: false,
      },
      {
        name: "ticksactive",
        selector: { boolean: {} },
        required: false,
      },
      {
        name: "referenceactive",
        selector: { boolean: {} },
        required: false,
      },
      {
        name: "adaptivestateactive",
        selector: { boolean: {} },
        required: false,
      },
      ...(showVerticalLayout ? [{
        name: "verticallayout",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "standard", label: "Standard" },
              { value: "mirrored", label: "Mirrored" },
            ],
          },
        },
        required: false,
      }] : []),
    ],
  },
  {
    type: "expandable",
    title: "Behavior",
    icon: "mdi:tune",
    flattened: true,
    schema: [
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "min",
            selector: {
              number: { mode: "box" },
            },
            disabled: !isNumber,
          },
          {
            name: "max",
            selector: {
              number: { mode: "box" },
            },
            disabled: !isNumber,
          },
          {
            name: "step",
            selector: {
              number: {
                mode: "box",
                step: "any",
                min: MIN_POSITIVE_STEP_FOR_FORM,
              },
            },
            disabled: !isNumber,
          },
          {
            name: "direction",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  {
                    value: "ltr",
                    label: isVertical ? "Top to Bottom" : "Left to Right",
                  },
                  {
                    value: "rtl",
                    label: isVertical ? "Bottom to Top" : "Right to Left",
                  },
                ],
              },
            },
            required: false,
          },
        ],
      },
    ],
  },
]);

const valuesBarSchema = memoizeOne((digitsValuesBar: string): HaFormSchema[] => [
  {
    type: "expandable",
    name: "valuesbar",
    title: "Values bar",
    icon: "mdi:format-list-bulleted",
    schema: [
      {
        type: "grid",
        schema: [
          {
            name: "unit",
            selector: { text: {} },
          },
          {
            name: "showtext",
            selector: { boolean: {} },
            required: false,
          },
          {
            name: "digits",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "auto", label: "Auto" },
                  { value: "manual", label: "Manual" },
                ],
              },
            },
          },
          {
            name: "nbdigits",
            selector: {
              number: { mode: "box", min: 0 },
            },
            disabled: digitsValuesBar !== "manual",
          },
        ],
      },
    ],
  }
]);

const bubblesSchema = memoizeOne((digitsBubbles: string): HaFormSchema[] => [
  {
    type: "expandable",
    name: "bubbles",
    title: "Bubbles",
    icon: "mdi:format-list-bulleted",
    schema: [
      {
        type: "grid",
        schema: [
          {
            name: "unit",
            selector: { text: {} },
          },
          {
            name: "showtext",
            selector: { boolean: {} },
            required: false,
          },
          {
            name: "digits",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "auto", label: "Auto" },
                  { value: "manual", label: "Manual" },
                ],
              },
            },
          },
          {
            name: "nbdigits",
            selector: {
              number: { mode: "box", min: 0 },
            },
            disabled: digitsBubbles !== "manual",
          },
          {
            name: "dragonly",
            selector: { boolean: {} },
            required: false,
          },
        ],
      },
    ],
  }
]);

const ticksSchema = memoizeOne((digitsTicks: string): HaFormSchema[] => [
  {
    type: "expandable",
    name: "ticks",
    title: "Tick Marks",
    icon: "mdi:format-list-bulleted",
    schema: [
      {
        type: "grid",
        schema: [
          {
            name: "digits",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "auto", label: "Auto" },
                  { value: "manual", label: "Manual" },
                ],
              },
            },
          },
          {
            name: "nbdigits",
            selector: {
              number: { mode: "box", min: 0 },
            },
            disabled: digitsTicks !== "manual",
          },
        ],
      },
      {
        type: "grid",
        schema: [
          {
            name: "majorticks",
            selector: {
              number: {
                mode: "box",
                step: 1,
                min: 2,
              },
            },
            required: false,
          },
          {
            name: "minorticks",
            selector: {
              number: {
                mode: "box",
                step: 1,
                min: 0,
              },
            },
            required: false,
          },
        ],
      },
    ],
  }
]);

const referenceSchema = memoizeOne((
  selectedEntityType?: FlexSliderCardEntityType,
  hasReferenceBubble = false,
  hasReferenceValuesBar = false,
  hasValuesBar = false,
  isVertical = false,
): HaFormSchema[] => {
  const domains = selectedEntityType === FlexSliderCardEntityType.TIME
    ? ["input_datetime"]
    : selectedEntityType === FlexSliderCardEntityType.COVER
      ? ["cover"]
    : selectedEntityType === FlexSliderCardEntityType.NUMBER
      ? FLEX_SLIDER_NUMBER_ENTITY_DOMAINS
      : FLEX_SLIDER_ENTITY_DOMAINS;

  return [{
    type: "expandable",
    name: "reference",
    title: "Reference Entity",
    icon: "mdi:target",
    schema: [
      {
        name: "entity",
        required: false,
        selector: {
          entity: {
            domain: domains,
          }
        },
      },
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "bubble",
            required: false,
            selector: { boolean: {} },
          },
          {
            name: "valuesbar",
            required: false,
            selector: { boolean: {} },
            disabled: isVertical || hasValuesBar,
          },
        ],
      },
      ...(hasReferenceBubble || hasReferenceValuesBar ? [{
        type: "grid",
        name: "",
        schema: [
          {
            name: "text",
            required: false,
            selector: { text: {} },
          },
          {
            name: "unit",
            required: false,
            selector: { text: {} },
          },
        ],
      }] : []),
      ...(hasReferenceValuesBar ? [{
        type: "grid",
        name: "",
        schema: [
          {
            name: "valuesbartextlarge",
            required: false,
            selector: { boolean: {} },
          },
        ],
      }] : []),
    ],
  }];
});

export const adaptiveStateOptionsSchema: HaFormSchema[] = [
  {
    type: "grid",
    schema: [
      {
        name: "editablewhenlinkedinactive",
        selector: { boolean: {} },
        required: false,
        default: false,
      },
    ],
  },
];

export const handleSchema: HaFormSchema[] = [
  {
    name: "entity",
    required: false,
    selector: {
      entity: {
        domain: FLEX_SLIDER_ENTITY_DOMAINS,
      }
    },
  },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "text",
        required: false,
        selector: { text: {} },
      },
      {
        name: "connectprevious",
        required: false,
        selector: { boolean: {} },
      },
    ],
  },
];

export const connectEndSchema: HaFormSchema[] = [
  {
    name: "connectend",
    required: false,
    selector: { boolean: {} },
    default: false,
  },
];

export const handlesBehaviorSchema: HaFormSchema[] = [
  {
    name: "handlesbehavior",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "unconstrained", label: "Unconstrained" },
          { value: "flexible", label: "Flexible" },
          { value: "fixed", label: "Fixed" },
        ],
      },
    },
    required: false,
    default: "fixed",
  },
];

export const computeSchema = memoizeOne((hasValuesBar: boolean,
  hasBubbles: boolean,
  hasTicks: boolean,
  hasReference: boolean,
  isAdaptative: boolean,
  hasReferenceBubble: boolean,
  hasReferenceValuesBar: boolean,
  digitsValuesBar: string,
  digitsBubbles: string,
  digitsTicks: string,
  isNumber: boolean,
  isVertical: boolean,
  isCompact: boolean,
  selectedEntityType?: FlexSliderCardEntityType): HaFormSchema[] => {
  const showVerticalLayout = isVertical && (hasBubbles || hasTicks);

  const schema = [...baseSchema(isNumber, isVertical, isCompact, showVerticalLayout, hasReferenceValuesBar)];
  if (hasValuesBar) schema.push(...valuesBarSchema(digitsValuesBar));
  if (hasBubbles) schema.push(...bubblesSchema(digitsBubbles));
  if (hasTicks) schema.push(...ticksSchema(digitsTicks));
  if (hasReference) schema.push(...referenceSchema(
    selectedEntityType,
    hasReferenceBubble,
    hasReferenceValuesBar,
    hasValuesBar,
    isVertical,
  ));
  return schema;
});
