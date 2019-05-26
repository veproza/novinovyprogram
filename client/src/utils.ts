import {hourHeightPx} from "./Layouter";

export const toHumanTime = (date: Date): string => {
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
};

export const toHumanDate = (date: Date): string => {
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
};
