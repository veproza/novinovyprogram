import {writable} from 'svelte/store';
import {publisherMeta} from "./publisherMeta";

type Column = string;
const availableColumns = Object.keys(publisherMeta);

const getCurrentHashColumns = (): string[] => {
    const [date, cols] = window.location.hash.split('|');
    if(cols) {
        return cols.split(',');
    } else {
        return [];
    }
};

const getDefaultColumns = (): Column[] => {
    const receivedColumns = getCurrentHashColumns()
        .filter(column => availableColumns.includes(column));
    if(receivedColumns.length) {
        return receivedColumns;
    } else {
        return ['idnes', 'lidovky', 'novinky', 'aktualne', 'irozhlas'];
    }
};

let currentColumns = getDefaultColumns();

export const getCurrentDisplayedColumns = (): Column[] => {
    return currentColumns.slice();
};

export const columns = writable<Column[]>(currentColumns);
columns.subscribe(value => {
    currentColumns = value;
});

export const changeColumn = (previousValue: Column, newValue: Column) => {
    const index = currentColumns.indexOf(previousValue);
    if(index === -1) {
        return;
    }
    const newColumns = currentColumns.slice();
    newColumns.splice(index, 1, newValue);
    columns.set(newColumns);
};


export const getOtherColumnOptions = (forColumn: Column) => {
    return [forColumn, ...availableColumns.filter(key => !currentColumns.includes(key))];
};
