<script>
import {downloadDay} from './Downloader'
import {hourHeightPx} from './Layouter'
import {extractToDay} from './DayExtractor.ts'
import NewsColumn from './NewsColumn.svelte'
import TimeColumn from './TimeColumn.svelte'
import Sharer from './Sharer.svelte'
import {afterUpdate, beforeUpdate} from 'svelte'
import {getHashLink} from './hashLinks';
import {columns} from './ColumnManager';


export let name;
export let name2 = 'bar';
const defaultDomDate = new Date(Date.now()).toISOString().substr(0, 10);
let domDate = defaultDomDate;
let currentDate = new Date();
let nextDate = null;
let prevDate = null;
let displayPrint = false;
let rememberedScrollPosition = null;

const updateFromHash = () => {
    if(window.location.hash) {
        const match = window.location.hash.match('([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})');
        if(match) {
            const [y, m, d, h, i] = match.slice(1).map(parseFloat);
            domDate = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            rememberedScrollPosition = (h + i / 60) * hourHeightPx;
        }
    } else {
        domDate = defaultDomDate;
    }
};
updateFromHash();

const daysHuman = ['z neděle', 'z pondělí', 'z úterý', 'ze středy', 'z čtvrtka', 'z pátku', 'ze soboty'];
let dayHuman = "";

let promiseIsFulfilled = null;
let skipNextUpdateFromHash = false;
let referencePublication = null;
const handleChange = (doUpdateHash) => {
    const [year, month, day] = (domDate || defaultDomDate).split('-').map(parseFloat);
    currentDate.setFullYear(year, month - 1, day);
    currentDate.setHours(12, 0, 0, 0);
    currentDate = new Date(currentDate); // TODO check trigger update
    const currentDateMidnight = new Date(currentDate);
    currentDateMidnight.setHours(0,0,0);
    const nextDateObj = new Date(currentDateMidnight.getTime() + 86400 * 1e3);
    nextDate = nextDateObj.getTime() <= Date.now()
        ?  getHashLink(new Date(getCurrentDateTime().getTime() - 86400 * 1e3))
        : null;
    prevDate = getHashLink(new Date(getCurrentDateTime().getTime() - 86400 * 1e3));
    promiseIsFulfilled = false;
    promises.length = 0;
    columnData.length = 0;
    dayHuman = daysHuman[currentDate.getDay()];
    if(doUpdateHash !== false) {
        skipNextUpdateFromHash = true;
        updateHash();
    }
};
const promises = [];
const columnData = [];
const onColumnPromise = (promise) => {
    promises.push(promise);
    promise.then(data => {
        columnData.push(data);
        if(columnData.length === promises.length) {
            promiseIsFulfilled = true;
            setTimeout(() => {
                displayPrint = columnData.some(publication => publication && publication.print);
                referencePublication = columnData
                    .filter(p => p !== null && p.hours)
                    .sort((a, b) => b.hours.length - a.hours.length)[0];
            }, 1)

        }
    })
};

beforeUpdate(() => {
    if(promiseIsFulfilled === false && rememberedScrollPosition === null) {
        rememberedScrollPosition = window.scrollY;
    }
});
afterUpdate(() => {
    if(promiseIsFulfilled && rememberedScrollPosition !== null) {
        window.scrollTo(0, rememberedScrollPosition);
        rememberedScrollPosition = null;
    }
});

const getCurrentDateTime = () => {
    const date = new Date(currentDate);
    const hourDecimal = scrollY / hourHeightPx;
    const hour = Math.floor(hourDecimal);
    const minute = Math.floor((hourDecimal % 1) * 60);
    date.setHours(hour);
    date.setMinutes(minute);
    return date;
};

const getCurrentHash = () => {
    return getHashLink(getCurrentDateTime());
};

const updateHash = () => {
    window.location.hash = getCurrentHash();
};

document.addEventListener('mouseout', (evt) => {
    if(evt.relatedTarget === null) {
        skipNextUpdateFromHash = true;
        updateHash();
    }
});

window.addEventListener('hashchange', () => {
    if(skipNextUpdateFromHash === false) {
        updateFromHash();
        handleChange(false);
    }
    skipNextUpdateFromHash = false;
});
handleChange(false);
const handlePrevClick = () => {
    const prevDay = new Date(currentDate.getTime() - 86400 * 1e3);
    domDate = prevDay.toISOString().substr(0, 10);
    handleChange();
};
const handleNextClick = () => {
    const nextDay = new Date(currentDate.getTime() + 86400 * 1e3);
    domDate = nextDay.toISOString().substr(0, 10);
    handleChange();
}

</script>

<style>
	.center {
		text-align: center;
		min-height: 80vh;
	}
	.maxwidth {
	    display: inline-block;
	    max-width: 1600px;
	    width: 100%;
	    text-align: left;
	}
	.sameWidthDay {
	    display: inline-block;
	    width: 4.6em;
	    white-space: nowrap;
	}
	.prev, .next {
	    color: #333;
	    text-decoration: none;
	}
	.prev:hover, .next:hover {
	    color: #aaa;
	    text-decoration: none;
	}
</style>
<div class="center">
    <div class="maxwidth">
        <div class="header">
            📰 Novinový program
            <span class="sameWidthDay">
                {dayHuman}
            </span>
            <a href="#{prevDate}" on:click|preventDefault="{handlePrevClick}" class="prev" >&laquo;</a>
            <input type="date" bind:value="{domDate}" on:change="{handleChange}" min="2017-04-22" max="{defaultDomDate}">
            {#if nextDate !== null}
                <a href="#{nextDate}" on:click|preventDefault="{handleNextClick}" class="next" >&raquo;</a>
            {/if}
            <Sharer {getCurrentHash} />
        </div>
        <div class="publisher-columns">
            {#if referencePublication}
                <TimeColumn displayPrint="{displayPrint}" data="{referencePublication}" />
            {/if}
            {#each $columns as publisherId (publisherId)}
                <NewsColumn {displayPrint} {publisherId} date="{currentDate}" promiseCallback="{onColumnPromise}" />
            {/each}
        </div>
    </div>
</div>
