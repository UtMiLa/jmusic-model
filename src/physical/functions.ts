import { Metrics } from './metrics';

export function staffLineToY(staffLine: number, settings: Metrics): number {
    return settings.staffLineWidth - (-1 - staffLine) * settings.staffLineWidth;
}
