<script>

export let getCurrentHash;
const escapedUrl = encodeURIComponent(window.location.toString());
const handleFbClick = () => {
    const url = "https://www.facebook.com/sharer/sharer.php?u=";
    window.open(url + encodeURIComponent(getCurrentHashUrl()));
};
const handleTwClick = () => {
    const url = "https://twitter.com/home?status=";
    window.open(url + encodeURIComponent(getCurrentHashUrl()));
};
const getCurrentHashUrl = () => {
    const url = window.location.toString().split('#')[0];
    return url + '#' + getCurrentHash();
}
</script>
<style>
.sharer {
    display: inline-block;
    margin-left: 0.5em;
    position: relative;
    top: 5px;
}
.sharer a {
    display: block;
    float: left;
    width: 22px;
    height: 22px;
    position: relative;
    transition: background .4s;
    margin: 0 4px;
    z-index: 50;
}
.sharer a svg {
    -webkit-transform-origin: 0 0;
    position: absolute;
    top: 50%;
    left: 50%;
    opacity: 0.4;
    transition: opacity 0.2s;
}
.sharer a:hover svg {
    opacity: 1;
}
.sharer a svg path {
    fill: #222d55;
}
.sharer a.tw svg {
    transform: scale(0.101) translate(-50%,-50%);
}
.sharer a.fb svg {
    transform: scale(.063) translate(-50%,-50%)
}
</style>
<div class="sharer">
    <a on:click|preventDefault="{handleFbClick}" class="share fb" title="Sdílet na Facebooku" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u={escapedUrl}"><svg width="113.62199" height="218.795"><path d="m 73.750992,218.795 v -99.803 h 33.498998 l 5.016,-38.895 H 73.750992 V 55.265 c 0,-11.261 3.127,-18.935 19.275,-18.935 L 113.62199,36.321 V 1.533 C 110.05999,1.059 97.833992,0 83.609992,0 c -29.695,0 -50.025,18.126 -50.025,51.413 V 80.097 H -8.1786701e-6 v 38.895 H 33.584992 v 99.803 h 40.166 z"></path></svg></a>
    <a on:click|preventDefault="{handleTwClick}" class="share tw" title="Sdílet na Twitteru" target="_blank" href="https://twitter.com/home?status={escapedUrl}"><svg width="171.5054" height="139.37839"><g transform="translate(-282.32053,-396.30734)"><path d="m 453.82593,412.80619 c -6.3097,2.79897 -13.09189,4.68982 -20.20852,5.54049 7.26413,-4.35454 12.84406,-11.24992 15.47067,-19.46675 -6.79934,4.03295 -14.3293,6.96055 -22.34461,8.53841 -6.41775,-6.83879 -15.56243,-11.111 -25.68298,-11.111 -19.43159,0 -35.18696,15.75365 -35.18696,35.18525 0,2.75781 0.31128,5.44359 0.91155,8.01875 -29.24344,-1.46723 -55.16995,-15.47582 -72.52461,-36.76396 -3.02879,5.19662 -4.76443,11.24048 -4.76443,17.6891 0,12.20777 6.21194,22.97747 15.65332,29.28716 -5.76773,-0.18265 -11.19331,-1.76565 -15.93716,-4.40083 -0.004,0.14663 -0.004,0.29412 -0.004,0.44248 0,17.04767 12.12889,31.26806 28.22555,34.50266 -2.95247,0.80436 -6.06101,1.23398 -9.26989,1.23398 -2.2673,0 -4.47114,-0.22124 -6.62011,-0.63114 4.47801,13.97857 17.47214,24.15143 32.86992,24.43441 -12.04227,9.43796 -27.21366,15.06335 -43.69965,15.06335 -2.84014,0 -5.64082,-0.16722 -8.39349,-0.49223 15.57186,9.98421 34.06703,15.8094 53.93768,15.8094 64.72024,0 100.11301,-53.61524 100.11301,-100.11387 0,-1.52554 -0.0343,-3.04251 -0.10204,-4.55261 6.87394,-4.95995 12.83891,-11.15646 17.55618,-18.21305 z"></path></g></svg></a>
</div>
