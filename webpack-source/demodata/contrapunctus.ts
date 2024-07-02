import { JMusicSettings, SeqFunction } from '../../src/model';

export const contrapunctusVars = {
    soprano:  [{
        function: 'Relative',
        args: [`r1
    a2 d,4. e8
    f4. g8 a2
    bes2 a4. g8
    f2~ f8 e8 f8 g8
    a4~ a16 g16 f16 e16 d4~ d16 d16 e16 f16
    e16 d16 c16 b16 a8 r8 r16 e'16 a16 g16 f16 e16 d16 c16
    b4 r4 r16 d16 e16 f16 g4~
    g16 g16 f16 e16 f4~ f16 g16 f16 e16 d4~
    d16 f16 e16 d16 cis4~ cis16 cis16 d16 e16 f4~`.replace(/\s+/g, ' ')],
        extraArgs: ['c\'\'\'']
    } as SeqFunction],
    bass: [{
        function: 'Relative',
        args: [`r1 r1 r1 r1 d1 a2. b4
      c2. d4
      e1
      f1
      e2. d4
      c1~
      c4 a4 bes4 c4
      d2 r2
      r16 g,16`.replace(/\s+/g, ' ')],
        extraArgs: ['c']
    } as SeqFunction],
    alto: [{
        function: 'Relative',
        args: [`r1 r1
	d4 a8. b16 c8. d16 e4
	f4 e8. d16 cis4~ cis16 a16 b16 cis16
	d16 bes16 a16 g16 f4~ f16 a16 b16 cis16 d4~
	d16 d16 c16 b16 c4~ c16 c16 b16 a16 gis4
	a4 e'8. d16 c8. b16 a4
	gis4 a8. b16 c4~ c16 d16 c16 bes16
	a4~ a16 a16 b16 cis16 d4~ d16 c16 bes16 a16`.replace(/\s+/g, ' ')],
        extraArgs: ['c\'\'']
    } as SeqFunction],
    tenor: [{
        function: 'Relative',
        args: [`d4 a'8. g16 f8. e16 d4
      cis4 d8. e16 f4~ f16 g16 f16 e16
      d16 cis16 d8~ d16 d16 c16 b16 a16 gis16 a8~ a16 a16 b16 cis16
      \\clef bass d16 c16 bes16 a16 g16 fis16 g8~ g16 bes16 a16 g16 f8. e16
      d4~ d16 a'16 b16 cis16 d4~ d16 a16 g16 f16
      e4 a8. g16 f8. e16 d4
      c16 d16 e8~ e16 e16 fis16 gis16 a4 r4
      r16 b16 e16 d16 c16 b16 a16 gis16 a8 r8 r4
      a4 d,8. e16 f8. g16 a4
      bes4 a8. g16 f4~ f16 e16 f16 g16`.replace(/\s+/g, ' ')],
        extraArgs: ['c\'']
    } as SeqFunction]
};

export const contrapunctus = {
    content: [
        [
            [
                {variable: 'soprano'}
            ],

            [
                {variable: 'alto'}
            ]
        ],
        [
            [{variable: 'tenor'}],
            [{variable: 'bass'}]
        ]
    ],
    clefs: ['treble', 'treble'],
    meter: '4/4',
    key: 'd \\minor'

} as JMusicSettings;
