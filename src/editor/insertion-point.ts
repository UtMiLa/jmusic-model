import { AbsoluteTime } from '../model';
import { Time } from '../model';
import { ScoreDef } from '../model';
export class InsertionPoint {
    constructor(public score: ScoreDef) {}

    time = Time.StartTime;
    public voiceNo = 0;
    public staffNo = 0;
    public position = 0;

    moveToTime(time: AbsoluteTime): void {
        this.time = time;
    }
    moveToVoice(staffNo: number, voiceNo: number): void {
        this.staffNo = staffNo;
        this.voiceNo = voiceNo;
    }

    findIndex(time: AbsoluteTime): number {
        const currentVoice = this.score.staves[this.staffNo].voices[this.voiceNo];
        let t = Time.StartTime;
        let i = 0;
        const elements = currentVoice.content.elements;
        while(i < elements.length) {
            if (Time.equals(t, time) && elements[i].duration.numerator) {
                return(i);
            }
            t = Time.addTime(t, elements[i].duration);
            i++;
        }
        
        return -1;
    }

    moveRight(): void {
        const index = this.findIndex(this.time);
        const currentVoice = this.score.staves[this.staffNo].voices[this.voiceNo];
        if (index >= 0 && currentVoice.content.elements.length > index + 1) {
            //index++;
            this.time = Time.addTime(this.time, currentVoice.content.elements[index].duration);
        }
    }

    moveLeft(): void {
        const index = this.findIndex(this.time);
        const currentVoice = this.score.staves[this.staffNo].voices[this.voiceNo];
        if (index >= 0) {
            this.time = Time.subtractTime(this.time, currentVoice.content.elements[index-1].duration);
        }
    }
}