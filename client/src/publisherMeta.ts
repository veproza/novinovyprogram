type PublisherMeta = {
    logo: string;
    name: string;
    onlineName: string;
    printName: string;
    link: string;
    fileId: string;
}
export const publisherMeta: {[index: string]: PublisherMeta} = {
    idnes: {
        logo: "https://1gr.cz/u/loga-n4/idnes.svg",
        name: "iDNES.cz + MF DNES",
        onlineName: "iDNES.cz",
        printName: "MF DNES",
        link: "https://www.idnes.cz",
        fileId: "idnes-cz"
    },
    lidovky: {
        logo: "https://1gr.cz/o/lidovky_ln5/ln-logo.svg",
        name: "Lidovky.cz + Lidové Noviny",
        onlineName: "Lidovky.cz",
        printName: "Lidové Noviny",
        link: "https://www.lidovky.cz",
        fileId: "lidovky-cz"
    },
    aktualne: {
        logo: "assets/aktualne.svg",
        name: "Aktuálně.cz",
        onlineName: "Aktuálně.cz",
        printName: null,
        link: "https://www.aktualne.cz",
        fileId: "aktualne-cz"
    },
    irozhlas: {
        logo: "https://datarozhlas.cz/cpit-prez/img/logo.jpg",
        name: "iROZHLAS.cz",
        onlineName: "iROZHLAS.cz",
        printName: null,
        link: "https://www.irozhlas.cz",
        fileId: "irozhlas-cz"
    },
    novinky: {
        logo: "https://www.novinky.cz/static/images/logo.gif",
        name: "Novinky.cz + Právo",
        onlineName: "Novinky.cz",
        printName: "Právo",
        link: "https://www.novinky.cz",
        fileId: "novinky-cz"
    },
    ihned: {
        logo: "https://ihned.cz/img/v2/logo_hn.svg",
        name: "Hospodářské noviny",
        onlineName: "Hospodářské noviny",
        printName: "Hospodářské noviny",
        link: "https://ihned.cz",
        fileId: "ihned-cz"
    },
    denikn: {
        logo: "https://denikn.cz/wp-content/themes/dn-2-cz/logo.svg",
        name: "Deník N",
        onlineName: "Deník N",
        printName: "Deník N",
        link: "https://www.denikn.cz",
        fileId: "denikn-cz"
    },
    denik: {
        logo: "https://g.denik.cz/images/dv4/logo/denik.svg",
        name: "Deník",
        onlineName: "Deník",
        printName: "Deník",
        link: "https://www.denik.cz",
        fileId: "denik-cz"
    },
    seznamzpravy: {
        logo: "https://d50-a.sdn.szn.cz/d_50/c_img_F_B/H6TiL.png?fl=cro,0,0,600,120%7Cres,160,,1",
        name: "Seznam Zprávy",
        onlineName: "Seznam Zprávy",
        printName: null,
        link: "https://www.seznamzpravy.cz/",
        fileId: "seznam-cz"
    },
    bbc: {
        logo: "https://nav.files.bbci.co.uk/orbit/2.0.0-566.f12ae5e9/img/blq-orbit-blocks_grey.svg",
        name: "BBC",
        onlineName: "BBC",
        printName: null,
        link: "https://www.bbc.com",
        fileId: "bbc-com"
    },
    ft: {
        logo: "https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo:brand-ft-masthead?source=o-header&tint=%2333302E,%2333302E&format=svg",
        name: "Financial Times",
        onlineName: "Financial Times",
        printName: null,
        link: "https://www.ft.com",
        fileId: "ft-com"
    },
    lemonde: {
        logo: "assets/lemonde.svg",
        name: "Le Monde",
        onlineName: "Le Monde",
        printName: null,
        link: "https://www.lemonde.fr",
        fileId: "lemonde-fr"
    },
    wyborcza: {
        logo: "https://static.im-g.pl/i/obrazki/wyborcza2017/winiety_themes/new_wyborcza_pl.svg",
        name: "Wyborcza.pl",
        onlineName: "Wyborcza.pl",
        printName: null,
        link: "http://wyborcza.pl/0,0.html",
        fileId: "wyborcza-pl"
    },
    spiegel: {
        logo: "assets/derspiegel.svg",
        name: "Spiegel Online",
        onlineName: "Spiegel Online",
        printName: null,
        link: "https://www.spiegel.de/",
        fileId: "spiegel-de"
    }
};

export const publisherMetaList = Object.keys(publisherMeta).map((publisherId) => {
    const meta = publisherMeta[publisherId];
    return {publisherId, meta};
});
