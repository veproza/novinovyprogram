import {getCurrentDisplayedColumns} from "./ColumnManager";

const getHashTimePart = function (date: Date) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return hour.toString().padStart(2, '0') + ":" + minute.toString().padStart(2, '0');
};

const getHashDatePart = function (date: Date) {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = (date.getDate()).toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // not ISO because we want local time
};

const getColumnPart = () => {
    return getCurrentDisplayedColumns().join(',');
};

export const getHashLink = (date: Date) => {
    const timePart = getHashTimePart(date);
    const datePart = getHashDatePart(date);
    const columnPart = getColumnPart();
    return datePart + "T" + timePart + "|" + columnPart;
};
