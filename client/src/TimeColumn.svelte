<script>
import {getTimeTicks, hourHeightPx} from './Layouter.ts'
import {toHumanTime} from './utils.ts'

export let data;

console.log(data);
const timeTicks = getTimeTicks(data);

</script>
<div class="publisher-col time-col">
<div class="publisher-col-header"></div>
    <div class="publisher-col-content">
        {#each timeTicks as tick}
        <div class="time-tick" style="height:{hourHeightPx}px">
            <div class="time-tick-content">
                {toHumanTime(tick)}
            </div>
        </div>
        {/each}
    </div>
</div>
