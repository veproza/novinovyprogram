import {IParser} from "./interfaces";
import idnesParser from "./idnes";
import lidovkyParser from "./lidovky";
import aktualneParser from "./aktualne";
import irozhlasParser from "./irozhlas";
import novinkyParser from "./novinky";
import ihnedParser from "./ihned";
import {Publication} from "../index";
import deniknParser from "./denikn";
import denikParser from "./denik";

export const getPublicationId = (file: string): Publication | null => {
    if (file.includes('idnes')) {
        return 'idnes';
    } else if (file.includes('lidovky')) {
        return 'lidovky';
    } else if (file.includes('aktualne')) {
        return 'aktualne';
    } else if (file.includes('irozhlas')) {
        return 'irozhlas';
    } else if (file.includes('novinky')) {
        return 'novinky';
    } else if (file.includes('ihned')) {
        return 'ihned';
    } else if (file.includes('denikn-cz')) {
        return 'denikn';
    } else if (file.includes('denik-cz')) {
        return 'denik';
    } else {
        return null;
    }
};

export const getParser = (publicationId: Publication): IParser|null => {
    if (publicationId === 'idnes') {
        return idnesParser;
    } else if (publicationId === 'lidovky') {
        return lidovkyParser;
    } else if (publicationId === 'aktualne') {
        return aktualneParser;
    } else if (publicationId === 'irozhlas') {
        return irozhlasParser;
    } else if (publicationId === 'novinky') {
        return novinkyParser;
    } else if (publicationId === 'ihned') {
        return ihnedParser;
    } else if (publicationId === 'denikn') {
        return deniknParser;
    } else if (publicationId === 'denik') {
        return denikParser;
    } else {
        return null;
    }
};
