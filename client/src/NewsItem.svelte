<script>
    import SeenTick from "./SeenTick.svelte"
    import {getLayout, roundTime, hourHeightPx} from './Layouter.ts'
    import {entityRemover} from './entityRemover'
    import {toHumanTime} from './utils.ts'
    export let entry;
    export let publisherId;
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
    const title = `${entry.article.headline}\n\n${seenTitle}`;
    const {headline, perex, link} = entry.article;
</script>
<style>
.seen-ticks {
    position: absolute;
    top: 0;
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
</style>
<div class="publisher-col-item publisher-col-item-background" {style}>
    <div class="publisher-col-item-content" {title}>
        <a href="{link}" target="_blank" class="headline">{headline}</a>
        <div class="perex">{perex}</div>
    </div>
    <div class="seen-ticks" style="height: {tickColHeight}px">
        {#each entry.seenAt as item}
            <SeenTick {item} {publisherId} article="{entry}" />
        {/each}
    </div>
</div>
