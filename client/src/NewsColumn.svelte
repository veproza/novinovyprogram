<script>
import NewsItem from './NewsItem.svelte'
import {downloadDayPublication} from './Downloader'
import {extractToDay} from './DayExtractor.ts'
import {afterUpdate, beforeUpdate} from 'svelte'
import {publisherMeta} from './publisherMeta'
import {toHumanDate} from './utils'

export let publisherId;
export let date;

export let displayPrint;
export let promiseCallback;
let dataPromise;
let currentDisplayedDate;

const downloadNewData = () => {
    const download = downloadDayPublication(date, publisherId);
    dataPromise = download.then((day) => day ? extractToDay(day) : null);
    currentDisplayedDate = date.toISOString();
    promiseCallback(download);
};
downloadNewData();

afterUpdate(() => {
    if(date.toISOString() !== currentDisplayedDate) {
        downloadNewData();
    }
});

const meta = publisherMeta[publisherId];
const isPrintOnly = !!meta.printName;
</script>
<style>
    .error {
        color: #721c24;
        font-size: 0.8em;
        text-align: center;
        margin-top: 1em;
    }
</style>
{#await dataPromise}
...
{:then data}
<div class="publisher-col publisher-col-{publisherId}">
    <a href="{meta.link}" class="publisher-col-header" target="_blank">
        <img src="{meta.logo}" alt="Logo {meta.name}" class="logo">
    </a>
    {#if displayPrint}
        <div class="publisher-col-print publisher-col-item-background">
            {#if data && data.print}
                <a target="_blank" href="{data.print.link}"><img src="{data.print.img}" alt="Titulní strana deníku {meta.printName} {toHumanDate(date)}" /></a>
            {:else}
                <div class="publisher-col-print-empty">
                    <div class="text">
                        {#if isPrintOnly}
                            Pouze online deník
                        {:else}
                            Není k dispozici
                        {/if}
                    </div>
                </div>
            {/if}
        </div>
    {/if}
    <div class="publisher-col-content">
        {#if data !== null && data.mainArticles.length > 0}
            {#each data.mainArticles as entry}
                <NewsItem {entry} {publisherId} />
            {/each}
        {:else}
            <div class="error">
                Web nearchivován
            </div>
        {/if}
    </div>
</div>
{/await}
