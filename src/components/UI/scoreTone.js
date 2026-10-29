// How a 0-100 part of a score did, for the dot on its tile
export const toneFor = (score) => {
    if (score >= 85) {
        return 'good';
    }
    return score >= 60 ? 'close' : 'work';
}
