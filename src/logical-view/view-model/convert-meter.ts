import { Meter } from './../../model';


export interface MeterViewModel {
    meterText: string[];
}


export function meterToView(meter: Meter): MeterViewModel {
    //console.log(meter);
    const meterText = meter.text;
    
    return {
        meterText
    };
}
