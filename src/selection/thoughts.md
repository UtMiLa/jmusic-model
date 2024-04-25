## Some thoughts about selections

A selection exists outside the model, but refers to the model. Potentially more than one selection can exist refering to the same model, but this is far future nice-to-have.

A selection is a subset of the music in the model. It can include
* notes
* rests
* note expressions
* long expressions
* lyrics
* variable refs (?)

Not sure whether it can contain
* clef/meter/key changes
* tempo markings
* single pitches in a chord

A selection is some entity with a method to test whether an arbitrary music element is selected. It might also have a method to enumerate all selected elements.

A selection can be empty or consist of one or more voices. The selected music elements need not to be adjacent.

### Queries

Some combination of these criteria:
* Select music from these voices/staves
* Select music between time1 and time2
* Add to existing selection or start a new
* Select music after some pattern, e.g. notes with certain pitch or duration
* Select/deselect single notes or bars
* Select music with same duration as given variable/other selection (to enable replacing/swapping)
* Select music displayed in a rectangle (to enable selecting using mouse)

### Commands

* Select according to query
* Reset selection to nothing
* Remove music from selection (or replace with rests/spacers)
* Set variable to value of selection
* Replace selection with variable
* Replace selection with a function of the selection
* Swap selection1 and selection2 (?)

### Fixed selections

Wherever a command accept `selection` as parameter, it should also accept one of several short queries. It could e.g. be 
`clear staff to end`

The same expressions can also be used in select commands:
`select staff to end`
`select also staff this measure`
`select exclude from start`

The current insertion point is used as a reference for time and voice.

On staff axis:
* score
* staff
* voice
* voice 2:1
* voice this, 2:1, 3:2

On time axis:
* from start
* to end
* this measure
* `n` measures
* from/to measure `n`
* from/to time `p/q`
* for `timespan`

### Display

* Logical view should be created with knowledge of selection
* Items in logical view are marked as selected
* Items in physical view are marked as selected
* Some stylesheet-like definition defines how to display selected elements
* It might be possible to display several selections in contrasting colors (some logic to decide what to do if they overlap)

### Issues

* What happens to selections when elements are added/removed/changed in model?
* * in other programs, selections disappear when editing
* How should music elements be uniquely identified?
* What if one tries to select only a part of a variable/funcion? Or only a part of a long note?

