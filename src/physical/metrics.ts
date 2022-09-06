export interface Metrics {
    staffLineWidth: number; 
    staffLengthOffset: number
}

export class StandardMetrics implements Metrics {
    constructor() {}

    staffLineWidth: number = 10; 
    staffLengthOffset: number = 10;

}