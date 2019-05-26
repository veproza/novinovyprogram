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
        const localStorage = window.localStorage.getItem('columns');
        if(localStorage) {
            const columns = localStorage.split(',')
                .filter(column => availableColumns.includes(column));
            if(columns.length) {
                return columns;
            }
        }
    }
    return ['idnes', 'lidovky', 'novinky', 'aktualne', 'irozhlas'];
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
    newValue ? newColumns.splice(index, 1, newValue) : newColumns.splice(index, 1);
    columns.set(newColumns);
    persistSetting(newColumns);
};


const getNotDisplayedColumns = function () {
    return availableColumns.filter(key => !currentColumns.includes(key));
};

export const getOtherColumnOptions = (forColumn: Column) => {
    return [forColumn, ...getNotDisplayedColumns()];
};

export const getCanAddNewColumn = (): boolean => {
    return getNotDisplayedColumns().length > 0;
};

export const addNewColumn = (): void => {
    const newColumn = getNotDisplayedColumns()[0];
    if (newColumn) {
        const newColumns = [...currentColumns, newColumn];
        columns.set(newColumns);
        persistSetting(newColumns);
    }
};

const persistSetting = (columns: Column[]) => {
    window.localStorage.setItem('columns', columns.join(','));
};
