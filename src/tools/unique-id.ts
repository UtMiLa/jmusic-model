let id = 1;

export function generateUniqueId(): string {
    return '' + (id++);
}