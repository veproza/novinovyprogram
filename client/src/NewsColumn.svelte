<script>
import {getLayout, roundTime} from './Layouter.ts'
import {entityRemover} from './entityRemover'
import {toHumanTime} from './utils.ts'

export let publisherId;
export let data;
export let displayPrint;

const isPrintOnly = ['aktualne', 'irozhlas'].includes(publisherId);
const entries = data.mainArticles.map(entry => {
    const layout = getLayout(entry);
    const style = `top: ${layout.top}px; height: ${layout.height}px`;
    const timeDiff = layout.roundedEndDate.getTime() - layout.roundedStartDate.getTime();
    const wasSeenOnlyOnce = timeDiff < 25 * 60000;
    const lastSeen = entry.seenAt[entry.seenAt.length - 1];
    const lastSeenRounded = roundTime(lastSeen);
    const durationTitle = layout.wasUntilMidnight && lastSeenRounded.getHours() === 23 && lastSeenRounded.getMinutes() === 45
      ? `, vydržel do dalšího dne`
      : `, naposledy v ${toHumanTime(lastSeenRounded)}`;
    const seenTitle = wasSeenOnlyOnce
        ? `Zaznamenán jen jednou v ${toHumanTime(layout.roundedStartDate)}`
        : `Zaznamenán poprvé v ${toHumanTime(layout.roundedStartDate)}` + durationTitle;
    const title = `${entry.article.headline}\n\n${seenTitle}`;
    const headline = entityRemover(entry.article.headline);
    const perex = entityRemover(entry.article.perex);
    const link = entry.article.link;
    return {...entry, style, title, headline, perex, link};
})
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
        {#each entries as {headline, perex, style, title, link}}
        <div class="publisher-col-item publisher-col-item-background" {style} {title}>
            <div class="publisher-col-item-content">
                <a href="{link}" target="_blank" class="headline">{headline}</a>
                <div class="perex">{perex}</div>
            </div>
        </div>
        {/each}
    </div>
</div>
