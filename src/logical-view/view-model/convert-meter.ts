import { Meter, MeterTextPart } from './../../model';


export interface MeterViewModel {
    meterText: MeterTextPart[];
}


export function meterToView(meter: Meter): MeterViewModel {
    //console.log(meter);
    const meterText = meter.text;
    
    return {
        meterText
    };
}
