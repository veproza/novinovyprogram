# Novinový program

Zdrojové kódy projektu [Novinový program](https://www.novinovyprogram.cz/).

Aplikace je komplet v JavaScriptu/TypeScriptu (kde je to možné). Skládá se z klientské aplikace ve [Svelte](https://svelte.dev/) a pár Lambda funkcí, které stahují, procesují a výsledky ukládají na S3. Odtud si je pak bere klientský frontend.

Frontend se nachází ve složce `/client`.

Jednotlivé lambdy jsou v `/lambda`. Zejména v `/lambda/parser` jsou parsery HTML stránek, ze které vytváří datové JSONy. 

Složka `/srv` jsou různé manipulační one-time skripty, spouštěné při hromadné změně formátu JSONů a podobně. Neslouží k běžnému dennímu provozu.

Jednotlivé složky obsahují vlastní `README` s bližším popisem.

## API & Data
Všechna zpracovaná data jsou veřejně přístupná, můžete si nad nimi postavit libovolný jiný/lepší produkt. Jen prosím počítejte, že výdaje za AWS S3 requesty a data transfery jdou z mojí kreditky, tak se to snažte vymyslet úsporně, případně si data zkopírujte k sobě.

Pozor, všechny soubory jsou uložený gzipované. Pokud váš HTTP klient nebude respektovat hlavičku `Content-Encoding`, budete muset přijatá data ručně prohnat přes `gunzip` (S3 nebude respektovat vaši hlavičku `Accept-Encoding`).

Všechny soubory mají otevřený CORS přístup `Access-Control-Allow-Origin: *`.

### Denní per-publication JSONy

Každá pulibkace má na každý den svůj souhrnný JSON s top 3-4 články v každý 15minutový "slot". JSON má vždy konstantní název `daypub-YYYYMMDD-publikace.json`, např. [daypub-20190603-lidovky.json](https://s3-eu-west-1.amazonaws.com/lidovky-headlines/daypub-20190603-lidovky.json). Publikace odpovídá **klíči** v [publisherMeta.ts](https://github.com/veproza/novinovyprogram/blob/master/client/src/publisherMeta.ts) (pozor, není to pole `fileId`, s jeho pomocí se konstruuje adresa HTML souboru, viz dále). Dny jsou ohraničené lokálním časem v TZ `Europe/Prague`, respektují letní čas (v přechodné dny tak bude o hodinu záznamů víc/míň).

JSON odpovídá interface [PublicationDay](https://github.com/veproza/novinovyprogram/blob/c4ef8560632a61e76309240fe5b7e1f148da0ef1/lambda/parser/utils.ts#L31), v poli `articles` je array [IArticleData](https://github.com/veproza/novinovyprogram/blob/c4ef8560632a61e76309240fe5b7e1f148da0ef1/lambda/parser/parsers/interfaces.ts#L1), tedy titulek, perex a odkaz.

V poli `hours` je array jednotlivých archivních snímků, pro každé stažené HTML tu bude jeden záznam. Typicky tedy bude jeden záznam každých 15 minut, při neúspěšném stažení ale může záznam chybět, při ručním vynuceném stažení zase může přebývat. Každý záznam odpovídá interface [HourData](https://github.com/veproza/novinovyprogram/blob/c4ef8560632a61e76309240fe5b7e1f148da0ef1/lambda/parser/utils.ts#L37), klíč `time` je JS timestamp (ms od 1.1.1970) záznamu, klíč `articles` obsahuje pole 3-4 nejvyšších článků. Články jsou reprezentovány jako indexy pole `PublicationDay.articles`, tedy hodnota `articles: [0, 3, 4]` znamená, že v danou hodinu byly na top 3 pozicích články `publicationDay.articles[0]`, `publicationDay.articles[3]` a `publicationDay.articles[4]`.

Pokud se jeden článek (unikátní URL) vyskytuje ve více `hours` záznamech (viz příští odstavec) s různými titulky a perexy, v `articles` bude pouze první titulek a perex.

### HTML snapshoty
Pokud chcete více než 4 top články, sledovat vývoj titulků nebo jakékoliv pokročilejší data z homepage, můžete to získat z HTML snapshotu stránky. Ten najdete vždy na spočítatelné URL ve buď ve formátu `YY-mm-ddThhiiss_publication.html`, např. [20190602T221627_lidovky-cz.html](https://s3-eu-west-1.amazonaws.com/lidovky-headlines/20190602T221627_lidovky-cz.html) pro záznamy od 17.5.2019 12:00 UTC, nebo ve formátu `publication_timestamp.html`, např. [lidovky-cz_1496441787013.html](https://s3-eu-west-1.amazonaws.com/lidovky-headlines/lidovky-cz_1496441787013.html) pro dřívější záznamy.

Hodnota času je vždy identická se záznamem v `publicationDay.hours[].time`. Pozor, hodnoty času se ukládají po úspěšném dokončení requestu. Mohou tedy být o pár sekund rozdílné zaprvé napříč publikacemi ve stejný časový "slot" a zadruhé mezi dvěma návaznými sloty (nebudou od sebe 15 minut, ale 15 minut a 4 vteřiny). Hodnotu data tedy vždy získávejte z `publicationDay.hours[].time`.

Algoritimicky
```javascript
    const prefix = "https://s3-eu-west-1.amazonaws.com/lidovky-headlines";
    const fileId = publisherMeta[publisherId].fileId;
    const date = new Date(hour.time);
    if(date.getTime() < 1558094783000) {
        return `${prefix}/${fileId}_${date.getTime()}.html`;
    } else {
        const datestamp = date.toISOString().replace(/[-:]/g, '').substr(0,15);
        return `${prefix}/${datestamp}_${fileId}.html`;
    }
``` 

Pro zpracování lze použít parsery v [lambda](https://github.com/veproza/novinovyprogram/tree/master/lambda/parser) (zpracovávají současnou strukturu webu), případně v [srv](https://github.com/veproza/novinovyprogram/tree/master/srv/ts/parsers) (kde jsou parsery i na dřívejší struktury, třeba redesign u iHNED.cz).

Seznam všech HTML souborů cca do 17.5.2019 12:00 UTC (ve starém formátu názvu souboru) je také v souboru [srv/data/keys.txt](https://github.com/veproza/novinovyprogram/blob/master/srv/data/keys.txt) (pozor, má 25 MB). Novější názvy si budete muset vytahat z JSONů.
