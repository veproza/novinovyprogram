<script>
    import {getLayout, roundTime} from './Layouter.ts'
    import {entityRemover} from './entityRemover'
    import {toHumanTime} from './utils.ts'
    export let entry;
    const layout = getLayout(entry);
    const style = `top: ${layout.top}px; height: ${layout.height}px`;
    const timeDiff = layout.roundedEndDate.getTime() - layout.roundedStartDate.getTime();
    const lastSeen = entry.seenAt[entry.seenAt.length - 1];
    const lastSeenRounded = roundTime(lastSeen.date);
    const durationTitle = layout.wasUntilMidnight && lastSeenRounded.getHours() === 23 && lastSeenRounded.getMinutes() === 45
      ? `, vydržel do dalšího dne`
      : `, naposledy v ${toHumanTime(lastSeenRounded)}`;
    const seenTitle = entry.seenAt.length === 1
        ? `Zaznamenán jen jednou v ${toHumanTime(layout.roundedStartDate)}`
        : `Zaznamenán poprvé v ${toHumanTime(layout.roundedStartDate)}` + durationTitle;
    const title = `${entry.article.headline}\n\n${seenTitle}`;
    const headline = entityRemover(entry.article.headline);
    const perex = entityRemover(entry.article.perex);
    const link = entry.article.link;
</script>
<div class="publisher-col-item publisher-col-item-background" {style} {title}>
    <div class="publisher-col-item-content">
        <a href="{link}" target="_blank" class="headline">{headline}</a>
        <div class="perex">{perex}</div>
    </div>
</div>
