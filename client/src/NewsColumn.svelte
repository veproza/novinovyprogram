<script>
import NewsItem from './NewsItem.svelte'

export let publisherId;
export let data;
export let displayPrint;

const isPrintOnly = ['aktualne', 'irozhlas'].includes(publisherId);
</script>
<div class="publisher-col publisher-col-{publisherId}">
    <a href="https://www.{publisherId}.cz" class="publisher-col-header" target="_blank"></a>
    {#if displayPrint}
        <div class="publisher-col-print publisher-col-item-background">
            {#if data.print}
                <a target="_blank" href="{data.print.link}"><img src="{data.print.img}" /></a>
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
        {#each data.mainArticles as entry}
            <NewsItem {entry} {publisherId} />
        {/each}
    </div>
</div>
