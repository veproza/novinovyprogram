<script>
import {downloadDay} from './Downloader.ts'
import {hourHeightPx} from './Layouter'
import {extractToDay} from './DayExtractor.ts';
import NewsColumn from './NewsColumn.svelte';
import TimeColumn from './TimeColumn.svelte';
import {afterUpdate, beforeUpdate} from 'svelte';


export let name;
export let name2 = 'bar';
const defaultDomDate = "2019-05-21";
let domDate = defaultDomDate;
const currentDate = new Date();
let rememberedScrollPosition = null;
const updateFromHash = () => {
    if(window.location.hash) {
        const match = window.location.hash.match('([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})');
        if(match) {
            const [y, m, d, h, i] = match.slice(1).map(parseFloat);
            domDate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            rememberedScrollPosition = (h + i / 60) * hourHeightPx;
        }
    } else {
        domDate = defaultDomDate;
    }
};
updateFromHash();

let dayPromise;
const daysHuman = ['z neděle', 'z pondělí', 'z úterý', 'ze středy', 'z čtvrtka', 'z pátku', 'ze soboty'];
let dayHuman = "";

let promiseIsFulfilled = null;
let skipNextUpdateFromHash = false;
const handleChange = (doUpdateHash) => {
    const [year, month, day] = (domDate || defaultDomDate).split('-').map(parseFloat);
    currentDate.setFullYear(year, month - 1, day);
    currentDate.setHours(12, 0, 0, 0);
    promiseIsFulfilled = false;
    dayPromise = downloadDay(currentDate);
    dayPromise.then(value => promiseIsFulfilled = true);
    dayHuman = daysHuman[currentDate.getDay()];
    if(doUpdateHash !== false) {
        skipNextUpdateFromHash = true;
        updateHash();
    }
};

beforeUpdate(() => {
    if(promiseIsFulfilled === false && rememberedScrollPosition === null) {
        rememberedScrollPosition = window.scrollY;
    }
});
afterUpdate(() => {
    if(promiseIsFulfilled && rememberedScrollPosition !== null) {
        window.scrollTo(0, rememberedScrollPosition);
        rememberedScrollPosition = null;
    }
});

const getHourHash = () => {
    const hourDecimal = window.scrollY / hourHeightPx;
    const hour = Math.floor(hourDecimal);
    const minute = Math.floor((hourDecimal % 1) * 60);
    console.log('hh', window.scrollY);
    return hour.toString().padStart(2, '0') + ":" + minute.toString().padStart(2, '0');
};

const updateHash = () => {
    window.location.hash = currentDate.toISOString().substr(0, 10) + "T" + getHourHash();
};

document.addEventListener('mouseout', (evt) => {
    if(evt.relatedTarget === null) {
        skipNextUpdateFromHash = true;
        updateHash();
    }
});

window.addEventListener('hashchange', (evt) => {
    if(skipNextUpdateFromHash === false) {
        console.log('g');
        updateFromHash();
        handleChange(false);
    }
    skipNextUpdateFromHash = false;
});
handleChange(false);

</script>

<style>
	.center {
		text-align: center;
	}
	.maxwidth {
	    display: inline-block;
	    max-width: 1600px;
	    width: 100%;
	    text-align: left;
	}
</style>
<div class="center">
    <div class="maxwidth">
        <div class="header">
            📰 Novinový program {dayHuman} <input type="date" bind:value="{domDate}" on:change="{handleChange}" min="2017-04-22" max="2019-05-21">
        </div>
        {#await dayPromise}
        loading.
        {:then value}
        <div class="publisher-columns">
            <TimeColumn data="{value.data.publications.idnes}" />
            <NewsColumn publisherId="idnes" data="{extractToDay(value.data.publications.idnes)}" />
            <NewsColumn publisherId="lidovky" data="{extractToDay(value.data.publications.lidovky)}" />
            <NewsColumn publisherId="irozhlas" data="{extractToDay(value.data.publications.irozhlas)}" />
            <NewsColumn publisherId="aktualne" data="{extractToDay(value.data.publications.aktualne)}" />
            <NewsColumn publisherId="novinky" data="{extractToDay(value.data.publications.novinky)}" />
            <NewsColumn publisherId="ihned" data="{extractToDay(value.data.publications.ihned)}" />
        </div>
        {:catch err}
        <div class="error-box-container">
            <div class="error-box">
                Pro vybraný den nejsou k dispozici data. Data jsou dostupná pro období od 22.4.2017 do 21.5.2019.
            </div>
        </div>
        {/await}
    </div>
</div>
