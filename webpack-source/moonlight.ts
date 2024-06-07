import { JMusicSettings } from '../src/model';

export const moonlightScoreDef = {
    content: [
        [
            [
                {
                    function: 'Arpeggio',
                    extraArgs: [
                        { 
                            'function': 'Tuplet', 
                            extraArgs: [{ numerator: 2, denominator: 3 }], 
                            args: ['c8 d8 e8'] 
                        }
                    ], 
                    args: ['<gis cis\' e\'>1 <gis dis\' fis\'>1 <gis cis\' e\'>2'] 
                }
            ]
        ],
        [
            [
                '<gis cis\' e\'>1 <gis dis\' fis\'>1 <gis cis\' e\'>2'
            ]
        ]
    ],
    clefs: ['treble', 'bass'],
    meter: '4/4',
    key: 'cis \\minor'
  
} as JMusicSettings;

const moonlightVars = {};



  