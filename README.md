# jmusic-model
A library intended to supply a conceptual model of a musical score and functions to analyze and manipulate it.

The conceptual model can be converted to a view model, which is a device-independent model of all music elements in the score.

The view model can be converted to a physical model with full instructions for how to draw the score (including metrics), for example on a canvas or an svg.

This is under development. If you find it interesting and want to contribute, feel free to contact me or make a pull request.

The library is supposed to be lightweight, and I will not make complicated spacing algorithms to provide typesetting quality. There will be a function to export in Lilypond format for this purpose.

## Install
Not in npm yet.

## Test
```
npm test
```

# Structure
## Model
A conceptual model of a piece of music. Voices, notes, pitches, times according to music theory, and without dependencies to notation systems.

Functions to transpose, repeat, invert and other manipulations. Applications for music analysis or synthesis can use this module only, if no display is needed.

## Logical model
A description of the note picture without any measurements, like "first a g clef on the 4th line, then a half note with stem up and a head between the 
3rd and 4th line".

Units are time from the beginning (horizontally) and staff line from the center line (vertically).

## Physical model
A list of all visible elements with position and size.

Units are pixels.

## Conversions
* Between model and LilyPond/MusicXml. The most advanced features of LilyPond will not be implemented.
* From model to logical model
* From logical to physical model, using metrics object
* Rendering physical model on HTML canvas, svg and potentially more
* From (x,y)-position to model object (for interactivity)

# Vision
The aim of this project is to create the number one note entry and display tool for the web (including wikis, forums, and blogs).

Additionally, it is intended to be the simplest open source component as a basis for music applications on desktop or mobile platforms (using Electron/Ionic). Possible uses could be:
* user-friendly entry of music for processing by LilyPond
* tools for composing or music analysis

# Todos
## Important
Model and draw:
* simple repeats
* tuplets
* lyrics
* note expressions (staccato, fermata, breath, arpeggio...)
* staff expressions (textual, including M.M.)
* long expressions (hairpins, trill extensions, ottavas)
* manual override note direction, accidentals

Functionality:
* Point and click to set cursor
* Show selected notes, and select using mouse
* Show excerpt of score (remembering key, clef etc)

Import/export:
* Lilypond (don't expect a full implementation, though)
* MusicXml
* ABC notation

Model operations:
* Add note
* Add/remove/alter pitch to note
* Change note value
* Delete note
* Clear area
* Change meter/key/clef
* Copy/paste selection
* Define and use variables

Transformations on sequences:
* transpose chromatically/diatonically
* invert chromatically/diatonically
* retrograde
* split chords to voices
* join voices to form chords
* keep notes on strong beats only

Controls in Angular/React (probably in a sub-project):
* Score display
* Meter entry
* Key entry
* Clef entry
* Note value entry

## Nice to have
* staff groups and accolades/brackets
* time-based horizontal spacing
* music playback
* midi-assisted entry
* Finale/Sibelius emulation
