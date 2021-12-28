export const randomIntFromInterval = (min: number, max: number) => {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export function delay(delay: number) {
    return new Promise((r) => {
        setTimeout(r, delay);
    });
}

export function objToQueryString(obj: any) {
    const keyValuePairs = [];
    for (const key in obj) {
        keyValuePairs.push(
            encodeURIComponent(key) + "=" + encodeURIComponent(obj[key])
        );
    }
    return keyValuePairs.join("&");
}