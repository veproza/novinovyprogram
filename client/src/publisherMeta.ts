type PublisherMeta = {
    logo: string;
    name: string;
    printName: string;
    link: string;
}
export const publisherMeta: {[index: string]: PublisherMeta} = {
    idnes: {
        logo: "https://1gr.cz/u/loga-n4/idnes.svg",
        name: "iDNES.cz",
        printName: "MF DNES",
        link: "https://www.idnes.cz"
    },
    lidovky: {
        logo: "https://1gr.cz/o/lidovky_ln5/ln-logo.svg",
        name: "Lidovky.cz",
        printName: "Lidové Noviny",
        link: "https://www.lidovky.cz"
    },
    aktualne: {
        logo: "assets/aktualne.svg",
        name: "Aktuálně.cz",
        printName: null,
        link: "https://www.aktualne.cz"
    },
    irozhlas: {
        logo: "https://datarozhlas.cz/cpit-prez/img/logo.jpg",
        name: "iROZHLAS.cz",
        printName: null,
        link: "https://www.irozhlas.cz"
    },
    novinky: {
        logo: "https://www.novinky.cz/static/images/logo.gif",
        name: "Novinky.cz",
        printName: "Právo",
        link: "https://www.novinky.cz"
    },
    ihned: {
        logo: "https://ihned.cz/img/v2/logo_hn.svg",
        name: "Hospodářské noviny",
        printName: "Hospodářské noviny",
        link: "https://ihned.cz"
    },
    denikn: {
        logo: "https://denikn.cz/wp-content/themes/dn-2-cz/logo.svg",
        name: "Deník N",
        printName: "Deník N",
        link: "https://www.denikn.cz"
    },
    denik: {
        logo: "https://g.denik.cz/images/dv4/logo/denik.svg",
        name: "Deník",
        printName: "Deník",
        link: "https://www.denik.cz"
    }
};
