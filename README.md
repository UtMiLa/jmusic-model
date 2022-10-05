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

