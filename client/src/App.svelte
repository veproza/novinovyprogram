<script>
import {downloadDay} from './Downloader.ts'
import {extractToDay} from './DayExtractor.ts';
import NewsColumn from './NewsColumn.svelte';
import TimeColumn from './TimeColumn.svelte';

export let name;
export let name2 = 'bar';
const firstReferenceTime = Date.now() - 86400 * 1e3 * 7;
const date = new Date();
date.setTime(firstReferenceTime);
let dayPromise = downloadDay(date);

</script>

<style>
	h1 {
		color: purple;
	}
</style>
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
{/await}
