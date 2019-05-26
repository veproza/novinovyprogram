import {hourHeightPx} from "./Layouter";

export const toHumanTime = (date: Date): string => {
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
};

export const toHumanDate = (date: Date): string => {
    return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
};

export const getHourHash = (scrollY) => {
    const hourDecimal = scrollY / hourHeightPx;
    const hour = Math.floor(hourDecimal);
    const minute = Math.floor((hourDecimal % 1) * 60);
    return hour.toString().padStart(2, '0') + ":" + minute.toString().padStart(2, '0');
};
