# Novinový program

Zdrojové kódy projektu [Novinový program](https://www.novinovyprogram.cz/).

Aplikace je komplet v JavaScriptu/TypeScriptu (kde je to možné). Skládá se z klientské aplikace ve [Svelte](https://svelte.dev/) a pár Lambda funkcí, které stahují, procesují a výsledky ukládají na S3. Odtud si je pak bere klientský frontend.

Frontend se nachází ve složce `/client`.

Jednotlivé lambdy jsou v `/lambda`. Zejména v `/lambda/parser` jsou parsery HTML stránek, ze které vytváří datové JSONy. 

Složka `/srv` jsou různé manipulační one-time skripty, spouštěné při hromadné změně formátu JSONů a podobně. Neslouží k běžnému dennímu provozu.

Jednotlivé složky obsahují vlastní `README` s bližším popisem. 
