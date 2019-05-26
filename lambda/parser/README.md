# Parser
Lambda spouštěná vždy po doběhnutí Headlines downloaderu. Vezme seznam nezpracovaných stránek a prožene je parsery ve složce `./parsers`. Pokud bylo nezpracovaných souborů víc než je limit, uloží nezpracovaný zbytek zase do souboru a sama sebe zavolá. Tím se udržují nízké nároky na paměť, protože nejdou nastavit dynamicky per-run. Běžně by toto samozavolání se nemělo nikdy nastat.
