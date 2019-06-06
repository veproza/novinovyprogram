<script>
    import SeenTick from "./SeenTick.svelte"
    import PositionTick from "./PositionTick.svelte"
    import {getLayout, roundTime, hourHeightPx} from './Layouter.ts'
    import {entityRemover} from './entityRemover'
    import {toHumanTime} from './utils.ts'
    export let entry;
    export let publisherId;
    export let displayPosition;

    const getEmptyArticle = () => ({
        headline: "",
        perex: "",
        link: ""
    });
    const layout = getLayout(entry);
    const style = `top: ${layout.top}px; height: ${layout.height}px`;
    const timeDiff = layout.roundedEndDate.getTime() - layout.roundedStartDate.getTime();
    const firstSeen = entry.seenAt[0];
    const lastSeen = entry.seenAt[entry.seenAt.length - 1];
    const actualTimeDiff = lastSeen.date.getTime() - firstSeen.date.getTime();
    const tickColHeight = (actualTimeDiff / (3600 * 1e3) + 0.25) * hourHeightPx;
    const lastSeenRounded = roundTime(lastSeen.date);
    const durationTitle = layout.wasUntilMidnight && lastSeenRounded.getHours() === 23 && lastSeenRounded.getMinutes() === 45
      ? `, vydržel do dalšího dne`
      : `, naposledy v ${toHumanTime(lastSeenRounded)}`;
    const seenTitle = entry.seenAt.length === 1
        ? `Zaznamenán jen jednou v ${toHumanTime(layout.roundedStartDate)}`
        : `Zaznamenán poprvé v ${toHumanTime(layout.roundedStartDate)}` + durationTitle;
    const article = entry.article || getEmptyArticle();
    const title = `${article.headline}\n\n${seenTitle}`;
    const {headline, perex, link} = article;
</script>
<style>
.entry-ticks {
    position: absolute;
    top: 0;
}
.seen-ticks {
    right: 0;
    width: 10px;
    border-left: 1px dotted var(--full-color);
    background: var(--bg-color);
    opacity: 0.12;
    transition: opacity 0.2s, width 0.2s;
}
.seen-ticks:hover {
    opacity: 0.25;
    width: 25px;
}
.position-ticks {
    pointer-events: none;
    width: 100%;
    background: white;
}
</style>
<div class="publisher-col-item publisher-col-item-background" {style}>
    {#if displayPosition}
    <div class="entry-ticks position-ticks" style="height: {tickColHeight}px">
        {#each entry.seenAt as item}
            <PositionTick {item} article="{entry}" />
        {/each}
    </div>
    {/if}
    <div class="publisher-col-item-content" {title}>
        <a href="{link}" target="_blank" class="headline">{headline}</a>
        <div class="perex">{perex}</div>
    </div>
    <div class="entry-ticks seen-ticks" style="height: {tickColHeight}px">
        {#each entry.seenAt as item}
            <SeenTick {item} {publisherId} article="{entry}" />
        {/each}
    </div>
</div>
