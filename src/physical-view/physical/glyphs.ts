export type GlyphCode = 
    'rests.0' | 'rests.1' | 'rests.0o' | 'rests.1o' | 'rests.M3' | 'rests.M2' | 'rests.M1' | 'rests.M1o' | 'rests.2' | 'rests.2classical' | 
    'rests.3' | 'rests.4' | 'rests.5' | 'rests.6' | 'rests.7' | 
    'accidentals.0' | 'accidentals.2' | 'accidentals.M2' | 'accidentals.sharp' | 'accidentals.sharp.arrowup' | 'accidentals.sharp.arrowdown' | 
    'accidentals.sharp.arrowboth' | 'accidentals.sharp.slashslash.stem' | 'accidentals.sharp.slashslashslash.stemstem' | 
    'accidentals.sharp.slashslashslash.stem' | 'accidentals.sharp.slashslash.stemstemstem' | 'accidentals.natural' | 'accidentals.natural.arrowup' | 
    'accidentals.natural.arrowdown' | 'accidentals.natural.arrowboth' | 'accidentals.flat' | 'accidentals.flat.arrowup' | 'accidentals.flat.arrowdown' | 
    'accidentals.flat.arrowboth' | 'accidentals.flat.slash' | 'accidentals.flat.slashslash' | 'accidentals.mirroredflat.flat' | 
    'accidentals.mirroredflat' | 'accidentals.mirroredflat.backslash' | 'accidentals.flatflat' | 'accidentals.flatflat.slash' | 
    'accidentals.doublesharp' | 'accidentals.rightparen' | 'accidentals.leftparen' | 
    'arrowheads.open.01' | 'arrowheads.open.0M1' | 'arrowheads.open.11' | 'arrowheads.open.1M1' | 'arrowheads.close.01' | 
    'arrowheads.close.0M1' | 'arrowheads.close.11' | 'arrowheads.close.1M1' | 
    'dots.dot' | 
    'scripts.ufermata' | 'scripts.dfermata' | 'scripts.ushortfermata' | 'scripts.dshortfermata' | 'scripts.ulongfermata' | 'scripts.dlongfermata' | 
    'scripts.uverylongfermata' | 'scripts.dverylongfermata' | 'scripts.thumb' | 'scripts.sforzato' | 'scripts.espr' | 'scripts.staccato' | 
    'scripts.ustaccatissimo' | 'scripts.dstaccatissimo' | 'scripts.tenuto' | 'scripts.uportato' | 'scripts.dportato' | 'scripts.umarcato' | 
    'scripts.dmarcato' | 'scripts.open' | 'scripts.halfopen' | 'scripts.halfopenvertical' | 'scripts.stopped' | 'scripts.upbow' | 
    'scripts.downbow' | 'scripts.reverseturn' | 'scripts.turn' | 'scripts.trill' | 'scripts.upedalheel' | 'scripts.dpedalheel' | 
    'scripts.upedaltoe' | 'scripts.dpedaltoe' | 'scripts.flageolet' | 'scripts.segno' | 'scripts.varsegno' | 'scripts.coda' | 
    'scripts.varcoda' | 'scripts.rcomma' | 'scripts.lcomma' | 'scripts.rvarcomma' | 'scripts.lvarcomma' | 'scripts.arpeggio' | 
    'scripts.trill_element' | 'scripts.arpeggio.arrow.M1' | 'scripts.arpeggio.arrow.1' | 'scripts.trilelement' | 'scripts.prall' | 
    'scripts.mordent' | 'scripts.prallprall' | 'scripts.prallmordent' | 'scripts.upprall' | 'scripts.upmordent' | 'scripts.pralldown' | 
    'scripts.downprall' | 'scripts.downmordent' | 'scripts.prallup' | 'scripts.lineprall' | 'scripts.caesura.curved' | 
    'scripts.caesura.straight' | 'scripts.tickmark' | 'scripts.snappizzicato' | 
    'clefs.C' | 'clefs.C_change' | 'clefs.F' | 'clefs.F_change' | 'clefs.G' | 'clefs.G_change' | 'clefs.percussion' | 
    'clefs.percussion_change' | 'clefs.tab' | 'clefs.tab_change' | 
    'timesig.C44' | 'timesig.C22' | 
    'pedal.*' | 'pedal.M' | 'pedal..' | 'pedal.P' | 'pedal.d' | 'pedal.e' | 'pedal.Ped' | 
    'brackettips.up' | 'brackettips.down' | 
    'accordion.discant' | 'accordion.dot' | 'accordion.freebass' | 'accordion.stdbass' | 'accordion.bayanbass' | 'accordion.oldEE' | 
    'accordion.push' | 'accordion.pull' | 
    'ties.lyric.short' | 'ties.lyric.default' | 
    'noteheads.uM2' | 'noteheads.dM2' | 'noteheads.sM1' | 'noteheads.sM1double' | 'noteheads.s0' | 'noteheads.s1' | 'noteheads.s2' | 
    'noteheads.s0diamond' | 'noteheads.s1diamond' | 'noteheads.s2diamond' | 'noteheads.s0triangle' | 'noteheads.d1triangle' | 
    'noteheads.u1triangle' | 'noteheads.u2triangle' | 'noteheads.d2triangle' | 'noteheads.s0slash' | 'noteheads.s1slash' | 
    'noteheads.s2slash' | 'noteheads.s0cross' | 'noteheads.s1cross' | 'noteheads.s2cross' | 'noteheads.s2xcircle' | 'noteheads.s0do' | 
    'noteheads.d1do' | 'noteheads.u1do' | 'noteheads.d2do' | 'noteheads.u2do' | 'noteheads.s0doThin' | 'noteheads.d1doThin' | 
    'noteheads.u1doThin' | 'noteheads.d2doThin' | 'noteheads.u2doThin' | 'noteheads.s0re' | 'noteheads.u1re' | 'noteheads.d1re' | 
    'noteheads.u2re' | 'noteheads.d2re' | 'noteheads.s0reThin' | 'noteheads.u1reThin' | 'noteheads.d1reThin' | 'noteheads.u2reThin' | 
    'noteheads.d2reThin' | 'noteheads.s0mi' | 'noteheads.s1mi' | 'noteheads.s2mi' | 'noteheads.s0miMirror' | 'noteheads.s1miMirror' | 
    'noteheads.s2miMirror' | 'noteheads.s0miThin' | 'noteheads.s1miThin' | 'noteheads.s2miThin' | 'noteheads.u0fa' | 'noteheads.d0fa' | 
    'noteheads.u1fa' | 'noteheads.d1fa' | 'noteheads.u2fa' | 'noteheads.d2fa' | 'noteheads.u0faThin' | 'noteheads.d0faThin' | 
    'noteheads.u1faThin' | 'noteheads.d1faThin' | 'noteheads.u2faThin' | 'noteheads.d2faThin' | 'noteheads.s0sol' | 'noteheads.s1sol' | 
    'noteheads.s2sol' | 'noteheads.s0la' | 'noteheads.s1la' | 'noteheads.s2la' | 'noteheads.s0laThin' | 'noteheads.s1laThin' | 
    'noteheads.s2laThin' | 'noteheads.s0ti' | 'noteheads.u1ti' | 'noteheads.d1ti' | 'noteheads.u2ti' | 'noteheads.d2ti' | 
    'noteheads.s0tiThin' | 'noteheads.u1tiThin' | 'noteheads.d1tiThin' | 'noteheads.u2tiThin' | 'noteheads.d2tiThin' | 
    'noteheads.u0doFunk' | 'noteheads.d0doFunk' | 'noteheads.u1doFunk' | 'noteheads.d1doFunk' | 'noteheads.u2doFunk' | 
    'noteheads.d2doFunk' | 'noteheads.u0reFunk' | 'noteheads.d0reFunk' | 'noteheads.u1reFunk' | 'noteheads.d1reFunk' | 
    'noteheads.u2reFunk' | 'noteheads.d2reFunk' | 'noteheads.u0miFunk' | 'noteheads.d0miFunk' | 'noteheads.u1miFunk' | 
    'noteheads.d1miFunk' | 'noteheads.s2miFunk' | 'noteheads.u0faFunk' | 'noteheads.d0faFunk' | 'noteheads.u1faFunk' | 
    'noteheads.d1faFunk' | 'noteheads.u2faFunk' | 'noteheads.d2faFunk' | 'noteheads.s0solFunk' | 'noteheads.s1solFunk' | 
    'noteheads.s2solFunk' | 'noteheads.s0laFunk' | 'noteheads.s1laFunk' | 'noteheads.s2laFunk' | 'noteheads.u0tiFunk' | 
    'noteheads.d0tiFunk' | 'noteheads.u1tiFunk' | 'noteheads.d1tiFunk' | 'noteheads.u2tiFunk' | 'noteheads.d2tiFunk' | 
    'noteheads.s0doWalker' | 'noteheads.u1doWalker' | 'noteheads.d1doWalker' | 'noteheads.u2doWalker' | 'noteheads.d2doWalker' | 
    'noteheads.s0reWalker' | 'noteheads.u1reWalker' | 'noteheads.d1reWalker' | 'noteheads.u2reWalker' | 'noteheads.d2reWalker' | 
    'noteheads.s0miWalker' | 'noteheads.s1miWalker' | 'noteheads.s2miWalker' | 'noteheads.s0faWalker' | 'noteheads.u1faWalker' | 
    'noteheads.d1faWalker' | 'noteheads.u2faWalker' | 'noteheads.d2faWalker' | 'noteheads.s0laWalker' | 'noteheads.s1laWalker' | 
    'noteheads.s2laWalker' | 'noteheads.s0tiWalker' | 'noteheads.u1tiWalker' | 'noteheads.d1tiWalker' | 'noteheads.u2tiWalker' | 
    'noteheads.d2tiWalker' | 
    'flags.u3' | 'flags.u4' | 'flags.u5' | 'flags.u6' | 'flags.u7' | 'flags.d3' | 'flags.d4' | 'flags.d5' | 'flags.d6' | 'flags.d7' | 
    'flags.ugrace' | 'flags.dgrace' | 
    'rests.M3neomensural' | 'rests.M2neomensural' | 'rests.M1neomensural' | 'rests.0neomensural' | 'rests.1neomensural' | 
    'rests.2neomensural' | 'rests.3neomensural' | 'rests.4neomensural' | 'rests.M3mensural' | 'rests.M2mensural' | 
    'rests.M1mensural' | 'rests.0mensural' | 'rests.1mensural' | 'rests.2mensural' | 'rests.3mensural' | 'rests.4mensural' | 
    'clefs.vaticana.do' | 'clefs.vaticana.do_change' | 'clefs.vaticana.fa' | 'clefs.vaticana.fa_change' | 'clefs.medicaea.do' | 
    'clefs.medicaea.do_change' | 'clefs.medicaea.fa' | 'clefs.medicaea.fa_change' | 'clefs.neomensural.c' | 
    'clefs.neomensural.c_change' | 'clefs.petrucci.c1' | 'clefs.petrucci.c1_change' | 'clefs.petrucci.c2' | 
    'clefs.petrucci.c2_change' | 'clefs.petrucci.c3' | 'clefs.petrucci.c3_change' | 'clefs.petrucci.c4' | 
    'clefs.petrucci.c4_change' | 'clefs.petrucci.c5' | 'clefs.petrucci.c5_change' | 'clefs.mensural.c' | 
    'clefs.mensural.c_change' | 'clefs.blackmensural.c' | 'clefs.blackmensural.c_change' | 'clefs.petrucci.f' | 
    'clefs.petrucci.f_change' | 'clefs.mensural.f' | 'clefs.mensural.f_change' | 'clefs.petrucci.g' | 
    'clefs.petrucci.g_change' | 'clefs.mensural.g' | 'clefs.mensural.g_change' | 'clefs.hufnagel.do' | 
    'clefs.hufnagel.do_change' | 'clefs.hufnagel.fa' | 'clefs.hufnagel.fa_change' | 'clefs.hufnagel.do.fa' | 
    'clefs.hufnagel.do.fa_change' | 'clefs.kievan.do' | 'clefs.kievan.do_change' | 
    'custodes.hufnagel.u0' | 'custodes.hufnagel.u1' | 'custodes.hufnagel.u2' | 'custodes.hufnagel.d0' | 'custodes.hufnagel.d1' | 
    'custodes.hufnagel.d2' | 'custodes.medicaea.u0' | 'custodes.medicaea.u1' | 'custodes.medicaea.u2' | 'custodes.medicaea.d0' | 
    'custodes.medicaea.d1' | 'custodes.medicaea.d2' | 'custodes.vaticana.u0' | 'custodes.vaticana.u1' | 'custodes.vaticana.u2' | 
    'custodes.vaticana.d0' | 'custodes.vaticana.d1' | 'custodes.vaticana.d2' | 'custodes.mensural.u0' | 'custodes.mensural.u1' | 
    'custodes.mensural.u2' | 'custodes.mensural.d0' | 'custodes.mensural.d1' | 'custodes.mensural.d2' | 
    'accidentals.medicaeaM1' | 'accidentals.vaticanaM1' | 'accidentals.vaticana0' | 'accidentals.mensural1' | 
    'accidentals.mensuralM1' | 'accidentals.hufnagelM1' | 'accidentals.kievan1' | 'accidentals.kievanM1' | 
    'flags.mensuralu03' | 'flags.mensuralu13' | 'flags.mensuralu23' | 'flags.mensurald03' | 'flags.mensurald13' | 
    'flags.mensurald23' | 'flags.mensuralu04' | 'flags.mensuralu14' | 'flags.mensuralu24' | 'flags.mensurald04' | 
    'flags.mensurald14' | 'flags.mensurald24' | 'flags.mensuralu05' | 'flags.mensuralu15' | 'flags.mensuralu25' | 
    'flags.mensurald05' | 'flags.mensurald15' | 'flags.mensurald25' | 'flags.mensuralu06' | 'flags.mensuralu16' | 
    'flags.mensuralu26' | 'flags.mensurald06' | 'flags.mensurald16' | 'flags.mensurald26' | 
    'timesig.mensural44' | 'timesig.mensural22' | 'timesig.mensural32' | 'timesig.mensural64' | 'timesig.mensural94' | 
    'timesig.mensural34' | 'timesig.mensural68' | 'timesig.mensural98' | 'timesig.mensural48' | 'timesig.mensural68alt' | 
    'timesig.mensural24' | 'timesig.neomensural44' | 'timesig.neomensural22' | 'timesig.neomensural32' | 'timesig.neomensural64' | 
    'timesig.neomensural94' | 'timesig.neomensural34' | 'timesig.neomensural68' | 'timesig.neomensural98' | 'timesig.neomensural48' | 
    'timesig.neomensural68alt' | 'timesig.neomensural24' | 
    'scripts.ictus' | 'scripts.uaccentus' | 'scripts.daccentus' | 'scripts.usemicirculus' | 'scripts.dsemicirculus' | 
    'scripts.circulus' | 'scripts.augmentum' | 'scripts.usignumcongruentiae' | 'scripts.dsignumcongruentiae' | 
    'scripts.barline.kievan' | 
    'dots.dotvaticana' | 'dots.dotkievan' | 
    'noteheads.uM3neomensural' | 'noteheads.dM3neomensural' | 'noteheads.uM2neomensural' | 'noteheads.dM2neomensural' | 
    'noteheads.sM1neomensural' | 'noteheads.urM3neomensural' | 'noteheads.drM3neomensural' | 'noteheads.urM2neomensural' | 
    'noteheads.drM2neomensural' | 'noteheads.srM1neomensural' | 'noteheads.s0neomensural' | 'noteheads.s1neomensural' | 
    'noteheads.s2neomensural' | 'noteheads.s0harmonic' | 'noteheads.s2harmonic' | 'noteheads.uM3mensural' | 
    'noteheads.dM3mensural' | 'noteheads.sM3ligmensural' | 'noteheads.uM2mensural' | 'noteheads.dM2mensural' | 
    'noteheads.sM2ligmensural' | 'noteheads.sM1mensural' | 'noteheads.urM3mensural' | 'noteheads.drM3mensural' | 
    'noteheads.srM3ligmensural' | 'noteheads.urM2mensural' | 'noteheads.drM2mensural' | 'noteheads.srM2ligmensural' | 
    'noteheads.srM1mensural' | 'noteheads.uM3semimensural' | 'noteheads.dM3semimensural' | 'noteheads.sM3semiligmensural' | 
    'noteheads.uM2semimensural' | 'noteheads.dM2semimensural' | 'noteheads.sM2semiligmensural' | 'noteheads.sM1semimensural' | 
    'noteheads.urM3semimensural' | 'noteheads.drM3semimensural' | 'noteheads.srM3semiligmensural' | 'noteheads.urM2semimensural' | 
    'noteheads.drM2semimensural' | 'noteheads.srM2semiligmensural' | 'noteheads.srM1semimensural' | 'noteheads.uM3blackmensural' | 
    'noteheads.dM3blackmensural' | 'noteheads.sM3blackligmensural' | 'noteheads.uM2blackmensural' | 'noteheads.dM2blackmensural' | 
    'noteheads.sM2blackligmensural' | 'noteheads.sM1blackmensural' | 'noteheads.s0mensural' | 'noteheads.s1mensural' | 
    'noteheads.s2mensural' | 'noteheads.s0blackmensural' | 'noteheads.s0petrucci' | 'noteheads.s1petrucci' | 
    'noteheads.s2petrucci' | 'noteheads.s0blackpetrucci' | 'noteheads.s1blackpetrucci' | 'noteheads.s2blackpetrucci' | 
    'noteheads.svaticana.punctum' | 'noteheads.svaticana.punctum.cavum' | 'noteheads.svaticana.linea.punctum' | 
    'noteheads.svaticana.linea.punctum.cavum' | 'noteheads.svaticana.inclinatum' | 'noteheads.svaticana.lpes' | 
    'noteheads.svaticana.vlpes' | 'noteheads.svaticana.upes' | 'noteheads.svaticana.vupes' | 'noteheads.svaticana.plica' | 
    'noteheads.svaticana.vplica' | 'noteheads.svaticana.epiphonus' | 'noteheads.svaticana.vepiphonus' | 
    'noteheads.svaticana.reverse.plica' | 'noteheads.svaticana.reverse.vplica' | 'noteheads.svaticana.inner.cephalicus' | 
    'noteheads.svaticana.cephalicus' | 'noteheads.svaticana.quilisma' | 'noteheads.ssolesmes.incl.parvum' | 
    'noteheads.ssolesmes.auct.asc' | 'noteheads.ssolesmes.auct.desc' | 'noteheads.ssolesmes.incl.auctum' | 
    'noteheads.ssolesmes.stropha' | 'noteheads.ssolesmes.stropha.aucta' | 'noteheads.ssolesmes.oriscus' | 
    'noteheads.smedicaea.inclinatum' | 'noteheads.smedicaea.punctum' | 'noteheads.smedicaea.rvirga' | 'noteheads.smedicaea.virga' | 
    'noteheads.shufnagel.punctum' | 'noteheads.shufnagel.virga' | 'noteheads.shufnagel.lpes' | 'noteheads.sM2kievan' | 
    'noteheads.sM1kievan' | 'noteheads.s0kievan' | 'noteheads.d2kievan' | 'noteheads.u2kievan' | 'noteheads.s1kievan' | 
    'noteheads.sr1kievan' | 'noteheads.d3kievan' | 'noteheads.u3kievan' | 
    'space' | 'plus' | 'comma' | 'hyphen' | 'period' | 
    'zero' | 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 
    'f' | 'm' | 'p' | 'r' | 's' | 'z';


export enum HorizVarSizeGlyphs {
    Stem = 101,
    Bar,
    RepeatStart,
    RepeatEnd,
    RepeatEndStart,
    Cursor
}

export enum VertVarSizeGlyphs {
    Line = 1,
    Ottava = 2,
    LedgerLine = 3,
    Tie = 4,
    Beam = 5,
    TupletBracket = 6,
    Crescendo,
    Decrescendo,
    SlurOver,
    SlurUnder
}



export enum OtherVarSizeGlyphs {
    Selection = 201
}
