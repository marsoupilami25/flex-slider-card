In this folder are views to test the custom card.

You need to create the following entities:
- `input_number.inputnumbertest1`
- `input_number.inputnumbertest2`
- `input_number.inputnumbertest3`
- `input_number.inputnumbertest4`
- `input_number.inputnumbertestref`
- `input_datetime.inputheuretestmin`
- `input_datetime.inputheuretestmax`
- `cover.volettest`

The `input_datetime` test entities must be configured as time-only:
- `has_date: false`
- `has_time: true`

Create the views copy/pasting the yaml in the yaml editor

Test files are prefixed to keep a stable directory order:
- horizontal tests first, then vertical tests
- `sections` before `masonry`
- base tests, then `bubbles`, then `ticks`, then `bubbles + ticks`

Short labels are used in card titles to keep them readable in narrow layouts.

Abbreviation legend:
- `Std`: standard format
- `Cmp`: compact format
- `no tit.`: without title
- `VB`: values bar enabled
- no `VB` or `VB2` label: values bar disabled
- `VB2`: values bar with `digits: manual` and `nbdigits: 2`
- `Ref`: reference entity enabled
- `RefVB`: reference entity displayed in the values bar
- `RefVB2`: reference entity displayed in a large values bar with `valuesbartextlarge: true`
- `CEnd`: `connectend` enabled
- `Bul`: bubbles enabled
- `Bul+Tk`: bubbles and ticks enabled
- `Bul vis.`: bubble visibility test
- `Ref tip`: reference entity bubble tooltip enabled
- `Tk`: ticks enabled
- `4/1`, `5/2`, `6/3`, etc.: `majorticks` / `minorticks`
- `inum`: `input_number` case
- `num`: `number` domain case
- `time`: `input_datetime` case
- `g off`: no explicit grid sizing
- `rA`: rows auto
- `r1`, `r2`, `r3`: grid rows `1`, `2`, `3`
- `hA`: automatic height
- `h1`, `h2`, `h3`: forced vertical height `1`, `2`, `3`
- `d0`, `d1`, `d2`: manual digits `0`, `1`, `2`
- `unit`: custom unit display test
- `W40`, `W50`, `W90`, `W100`: horizontal width percentage
- `RTL`: right-to-left direction
- `HB`: handles behavior test
- `AS`: adaptive state enabled
- `AS ctx`: adaptive state condition without an explicit `entity`; it is evaluated against the first configured slider entity
- `disabled`: adaptive state condition is false and the slider is not editable
- `editable`: adaptive state condition is false but `editablewhenlinkedinactive` allows slider edits
- `vlay`: vertical layout
- `std`: standard vertical layout
- `mir`: mirrored vertical layout
- `on`: enabled / always visible
- `drag`: visible during drag only
- `mod`: `card_mod` styling test
- `slider`: slider styling target
- `tip`: bubble tooltip styling target

Focused views are also available for specific options:
- `06_horizontal_masonry_horizontalwidth.yml`
- `07_horizontal_masonry_card_mod.yml`
- `09_horizontal_masonry_bubbles_dragonly.yml`
- `12_horizontal_masonry_handlesbehavior.yml`
- `18_vertical_masonry_verticallayout.yml`
- `22_vertical_masonry_handlesbehavior.yml`
- `23_adaptive_state.yml`
- `30_shutter`

`07_horizontal_masonry_card_mod.yml` requires `card-mod` to be installed in the test environment.

`30_shutter` requires `enhanced-shutter-card` to be installed in the test environment and uses `cover.volettest`.

Warning: two entities from `number` domain are used: `number.bureaucontrole_chauffagetempcftmin` and `number.bureaucontrole_chauffagetempcftmax`. They are used to test the `number` domain is working well but should be replaced by existing entities from `number` domain in the test environment.
