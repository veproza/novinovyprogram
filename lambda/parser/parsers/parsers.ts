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
import bbcParser from "./bbc";
import lemondeParser from "./lemonde";
import ftParser from "./ft";
import spiegelParser from "./spiegel";
import wyborczaParser from "./wyborcza";
import seznamzpravyParser from "./seznamzpravy";
import bleskParser from "./blesk";
import e15Parser from "./e15";

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
    } else if (file.includes('bbc')) {
        return 'bbc';
    } else if (file.includes('wyborcza')) {
        return 'wyborcza';
    } else if (file.includes('lemonde')) {
        return 'lemonde';
    } else if (file.includes('ft-com')) {
        return 'ft';
    } else if (file.includes('spiegel')) {
        return 'spiegel';
    } else if (file.includes('seznam')) {
        return 'seznamzpravy';
    } else if (file.includes('blesk')) {
        return 'blesk';
    } else if (file.includes('e15')) {
        return 'e15';
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
    } else if (publicationId === 'bbc') {
        return bbcParser;
    } else if (publicationId === 'lemonde') {
        return lemondeParser;
    } else if (publicationId === 'ft') {
        return ftParser;
    } else if (publicationId === 'spiegel') {
        return spiegelParser;
    } else if (publicationId === 'wyborcza') {
        return wyborczaParser;
    } else if (publicationId === 'seznamzpravy') {
        return seznamzpravyParser;
    } else if (publicationId === 'blesk') {
        return bleskParser;
    } else if (publicationId === 'e15') {
        return e15Parser;
    } else {
        return null;
    }
};
