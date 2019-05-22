<script>
import {downloadDay} from './Downloader.ts'
import {extractToDay} from './DayExtractor.ts';
import NewsColumn from './NewsColumn.svelte';
import TimeColumn from './TimeColumn.svelte';
import { beforeUpdate, afterUpdate } from 'svelte';


export let name;
export let name2 = 'bar';
const defaultDomDate = "2019-05-21";
let domDate = defaultDomDate;
if(window.location.hash) {
    let [y, m, d] = window.location.hash.substr(1).split('-').map(parseFloat);
    if(y && m && d) {
        domDate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    }
}
let dayPromise;
const daysHuman = ['z neděle', 'z pondělí', 'z úterý', 'ze středy', 'z čtvrtka', 'z pátku', 'ze soboty'];
let dayHuman = "";
let rememberedScrollPosition = null;
let promiseIsFulfilled = null;
const handleChange = () => {
    const [year, month, day] = (domDate || defaultDomDate).split('-').map(parseFloat);
    const date = new Date();
    date.setFullYear(year, month - 1, day);
    date.setHours(12, 0, 0, 0);
    promiseIsFulfilled = false;
    dayPromise = downloadDay(date);
    dayPromise.then(value => promiseIsFulfilled = true);
    dayHuman = daysHuman[date.getDay()];
    window.location.hash = domDate;
};

beforeUpdate(() => {
    if(promiseIsFulfilled === false) {
        rememberedScrollPosition = window.scrollY;
    }
});
afterUpdate(() => {
    if(promiseIsFulfilled && rememberedScrollPosition !== null) {
        window.scrollTo(0, rememberedScrollPosition);
        rememberedScrollPosition = null;
    }
});
handleChange();

</script>

<style>
	h1 {
		color: purple;
	}
</style>
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
