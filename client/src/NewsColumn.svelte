<script>
import {getLayout} from './Layouter.ts'
import {entityRemover} from './entityRemover'
import {toHumanTime} from './utils.ts'

export let publisherId;
export let data;


const entries = data.mainArticles.map(entry => {
    const layout = getLayout(entry);
    const style = `top: ${layout.top}px; height: ${layout.height}px`;
    const timeDiff = layout.roundedEndDate.getTime() - layout.roundedStartDate.getTime();
    const wasSeenOnlyOnce = timeDiff < 25 * 60000;
    const durationTitle = layout.wasUntilMidnight
      ? `, vydržel nejméně do půlnoci`
      : `, naposledy v ${toHumanTime(new Date(layout.roundedEndDate.getTime() - 15 * 60 * 1e3))}`;
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
    <div class="publisher-col-header"></div>
    <div class="publisher-col-content">
        {#each entries as {headline, perex, style, title, link}}
        <div class="publisher-col-item" {style} {title}>
            <div class="publisher-col-item-content">
                <a href="{link}" target="_blank" class="headline">{headline}</a>
                <div class="perex">{perex}</div>
            </div>
        </div>
        {/each}
    </div>
</div>
