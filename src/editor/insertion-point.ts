import { AbsoluteTime, getDuration } from '../model';
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
            if (Time.equals(t, time) && getDuration(elements[i]).numerator) {
                return(i);
            }
            t = Time.addTime(t, getDuration(elements[i]));
            i++;
        }
        
        return -1;
    }

    moveRight(): void {
        const index = this.findIndex(this.time);
        const currentVoice = this.score.staves[this.staffNo].voices[this.voiceNo];
        if (index >= 0 && currentVoice.content.elements.length > index) {
            //index++;
            this.time = Time.addTime(this.time, getDuration(currentVoice.content.elements[index]));
        }
    }

    moveLeft(): void {
        let index = this.findIndex(this.time);
        const currentVoice = this.score.staves[this.staffNo].voices[this.voiceNo];
        if (this.isAtEnd()) {
            index = currentVoice.content.elements.length;
        }
        if (index >= 0) {
            this.time = Time.subtractTime(this.time, getDuration(currentVoice.content.elements[index-1]));
        }
    }

    isAtEnd(): boolean {
        const currentVoice = this.score.staves[this.staffNo].voices[this.voiceNo];
        return Time.equals(this.time, Time.fromStart(currentVoice.content.duration));
    }
}