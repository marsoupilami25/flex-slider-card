
[![GitHub release](https://img.shields.io/github/v/release/marsoupilami25/flex-slider-card?display_name=tag)](https://github.com/marsoupilami25/flex-slider-card/releases)

# UI Card for Flex Slider

A custom card for Home Assistant that allows adjusting two `entities` values with a single slider, enabling the selection of a custom value range.  

Accepted domains are `input_number`, `number` and `input_datetime`.
For `input_datetime` the manageable range is a day (from 0 to 23h59).

Two formats are available.

The standard format with title and bottom values bar:

![Image of a standard flex slider card](/assets/standard.png) 

The compact format with title and bottom values bar:

![Image of a standard flex slider card](/assets/compact.png) 

## Features  

- [X] Adjust two `entities` with a single slider.  
- [X] Define your own minimum and maximum value limits
- [X] Select compact or standard display
- [X] Optional title
- [X] Option bar with entity values

## Installation  

### HACS

1.  Ensure you have [HACS (Home Assistant Community Store)](https://hacs.xyz/) installed.
2.  Go to HACS -> Frontend -> Explore & Add Repositories.
3.  Click on the top right triple dots and go to "Custom repositories".
4.  Add https://github.com/marsoupilami25/flex-slider-card as custom repository

![](/assets/custom_repo.png)
5.  Search for "Flex Slider Card".
6.  Click "Install".
7.  Restart Home Assistant (if prompted).

### Manual Installation  
- Download `range-slider-card.js` in the `dist` folder
- Place it in your `www` folder in Home Assistant  
- Installation instructions: go to Settings > Dashboards > (top right, the three dots) > Resources > Add resource > paste the following URL: `/local/range-slider-card.js` or `/local/range-small-slider-card.js` or `range-time-slider-card.js`
- Restart Home Assistant

## Options  

### Display Options
|Option       |Type           |Domain         |Mandatory|Default       | Description |
|-------------|---------------|---------------|---------|--------------|-|
| `name`      | string        |All            |No       |`Range Slider`| Title for the slider. If not configured or `''`, the title is not displayed. |
| `format`    | string        |All            |No       |`std`         | Format type. Is `std` or `compact`|
| `unit`      | string        |All            |No       |Empty         | Display unit (e.g., `%`, `°C`, etc.) |
| `valuesbar` | boolean       |All            |No       |false         | Display a bottom bar with entity values |

### Display Options for values bar
|Option       |Type           |Domain         |Mandatory|Default       | Description |
|-------------|---------------|---------------|---------|--------------|-|
| `mintext`   | string        |All            |No       |Empty         | Text to display before the minimum value. |
| `maxtext`   | string        |All            |No       |Empty         | Text to display before the maximum value. |
| `digits`    | string/number |Number only (*)|No       |`auto`        | Number of digits displayed in the bottom value bar. Is a number or `auto`. When `auto` the number of digits is automatically calculated from the step. |

### Behavioral Options
| Option       | Type   |Domain         |Mandatory|Default       | Description |
|--------------|--------|-----------    |---------|--------------|-------------|
| `entity_min` | string |All            |Yes      |/             | The `entity` for the minimum value |
| `entity_max` | string |All            |Yes      |/             | The `entity` entity for the maximum value |
| `min`        | number |Number only (*)|No       |0             | The minimum selectable value. Always 00:00 for `input_date`|
| `max`        | number |Number only (*)|No       |100           | The maximum selectable value. Always 23:59 for `input_date`|
| `step`       | number |All            |No       |1             | Increment step for the slider. Rounded for `input_date`|

(*) Number means `input_number` and `number`

### Configuration example

Example configuration for **Lovelace UI**:  

```yaml
type: custom:flex-slider-card
entity_min: input_number.min_value
entity_max: input_number.max_value
min: 0
max: 100
step: 1
unit: '%'
```
Compact version
```yaml
type: custom:flex-slider-card
entity_min: input_number.min_value
entity_max: input_number.max_value
min: 0
max: 100
step: 1
unit: '%'
```
Time version
```yaml
type: custom:flex-slider-card
entity_time_min: input_datetime.time1
entity_time_max: input_datetime.time2
```

### Bugs

If the card is not displaying in Home Assistant, please try the following troubleshooting steps:
Clear your browser cache or the Home Assistant app cache to ensure that the latest resources are loaded.

Otherwise got to the [issues](https://github.com/marsoupilami25/flex-slider-card/issues) page, check the issue exist or open a new one.

## Contributing  
Feel free to submit issues or pull requests to improve this component!  

⭐ **If you find this useful, don't forget to star this repository!**  
