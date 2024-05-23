
export function ignoreIfUndefined<T, K extends string>(property: K, value: T): Record<K, T> {    
    const v = {} as Record<K,T>;
    if (value !== undefined) v[property] = value;
    return v;
}

export function ignoreIfEmpty<T, K extends string>(property: K, value: T[] | undefined): Record<K, T[]> {    
    const v = {} as Record<K,T[]>;
    if (value !== undefined && value.length) v[property] = value;
    return v;
}