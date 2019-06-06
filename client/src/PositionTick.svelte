<script>
import {calculateTickDimensions} from "./Layouter";
export let item;
export let article;
const {height, top} = calculateTickDimensions(article, item);
const style = `height: ${height}px; top: ${top}px`;
const itemIndex = item.articles.indexOf(article.article);
</script>
<style>
    .position-tick {
        position: absolute;
        width: 100%;
        background: white;
        opacity: 0.4;
    }
    .position-tick-0 {
        background: #67000d;
    }
    .position-tick-1 {
        background: #cb181d;
    }
    .position-tick-2 {
        background: #fb6a4a;
    }
    .position-tick-3 {
        background: #fcbba1;
    }
</style>
<div class="position-tick position-tick-{itemIndex}" {style}></div>
