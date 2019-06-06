<script>
import NewsItem from './NewsItem.svelte'
import {downloadDayPublication} from './Downloader'
import {extractToDay} from './DayExtractor.ts'
import {afterUpdate, beforeUpdate} from 'svelte'
import {publisherMeta, publisherMetaList} from './publisherMeta'
import {toHumanDate} from './utils'
import {changeColumn, getOtherColumnOptions} from './ColumnManager';
import {extractEligibleArticlesToDay} from './keywordTransformer';

export let publisherId;
export let date;
export let query;
export let displayPrint;
export let promiseCallback;
let dataPromise;
let currentDisplayedDate;
let currentDisplayedPublisher = publisherId;
let currentQuery;
let displayPosition = false;
let filledHoursTitle = "";
const downloadNewData = () => {
    const download = downloadDayPublication(date, publisherId);
    dataPromise = download.then((day) =>{
        displayPosition = !!query;
        if (!day) {
            return null;
        }
        if(query) {
            return extractEligibleArticlesToDay(day, query);
        } else {
            return extractToDay(day);
        }
    });
    if(query) {
        dataPromise.then((dayData => {
            const seenAtValidSum = dayData.mainArticles.reduce((previousValue, currentValue) => {
                return previousValue + (currentValue.article ? currentValue.seenAt.length : 0);
            }, 0);
            const seenAtAllSum = dayData.mainArticles.reduce((previousValue, currentValue) => {
                return previousValue + currentValue.seenAt.length;
            }, 0);
            const filledValidHours = 15 / 60 * seenAtValidSum;
            const filledAllHours = 15 / 60 * seenAtAllSum;
            filledHoursTitle = `${filledValidHours} hodin byly na titulních pozicích filtrované články, z ${filledAllHours} možných hodin ten den`;
        }));
    } else {
        filledHoursTitle = "";
    }
    currentDisplayedDate = date.toISOString();
    currentDisplayedPublisher = publisherId;
    currentQuery = query;
    promiseCallback(download);
};
downloadNewData();

afterUpdate(() => {
    if(date.toISOString() !== currentDisplayedDate || publisherId !== currentDisplayedPublisher || query !== currentQuery) {
        downloadNewData();
    }
});

const meta = publisherMeta[publisherId];
const isPrintOnly = !meta.printName;
const onColumnChange = (evt) => {
    changeColumn(publisherId, selectedColumn);
};
let selectedColumn = publisherId;
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
<div class="publisher-col publisher-col-{publisherId} publisher-col-publisher">
    <div class="publisher-col-header" title="{filledHoursTitle}" >
        <img src="{meta.logo}" alt="Logo {meta.onlineName}" class="logo">
        <select name="" id="" on:change="{onColumnChange}" bind:value="{selectedColumn}">
            {#each getOtherColumnOptions(publisherId) as possiblePublisherId}
                <option value="{possiblePublisherId}">{publisherMeta[possiblePublisherId].name}</option>
            {/each}
            <option value="">(zrušit sloupec)</option>
        </select>
    </div>
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
                <NewsItem {entry} {publisherId} {displayPosition} />
            {/each}
        {:else}
            <div class="error">
                Web nearchivován
            </div>
        {/if}
    </div>
</div>
{/await}
