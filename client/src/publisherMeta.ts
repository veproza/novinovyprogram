type PublisherMeta = {
    logo: string;
    name: string;
    onlineName: string;
    printName: string;
    link: string;
}
export const publisherMeta: {[index: string]: PublisherMeta} = {
    idnes: {
        logo: "https://1gr.cz/u/loga-n4/idnes.svg",
        name: "iDNES.cz + MF DNES",
        onlineName: "iDNES.cz",
        printName: "MF DNES",
        link: "https://www.idnes.cz"
    },
    lidovky: {
        logo: "https://1gr.cz/o/lidovky_ln5/ln-logo.svg",
        name: "Lidovky.cz + Lidové Noviny",
        onlineName: "Lidovky.cz",
        printName: "Lidové Noviny",
        link: "https://www.lidovky.cz"
    },
    aktualne: {
        logo: "assets/aktualne.svg",
        name: "Aktuálně.cz",
        onlineName: "Aktuálně.cz",
        printName: null,
        link: "https://www.aktualne.cz"
    },
    irozhlas: {
        logo: "https://datarozhlas.cz/cpit-prez/img/logo.jpg",
        name: "iROZHLAS.cz",
        onlineName: "iROZHLAS.cz",
        printName: null,
        link: "https://www.irozhlas.cz"
    },
    novinky: {
        logo: "https://www.novinky.cz/static/images/logo.gif",
        name: "Novinky.cz + Právo",
        onlineName: "Novinky.cz",
        printName: "Právo",
        link: "https://www.novinky.cz"
    },
    ihned: {
        logo: "https://ihned.cz/img/v2/logo_hn.svg",
        name: "Hospodářské noviny",
        onlineName: "Hospodářské noviny",
        printName: "Hospodářské noviny",
        link: "https://ihned.cz"
    },
    denikn: {
        logo: "https://denikn.cz/wp-content/themes/dn-2-cz/logo.svg",
        name: "Deník N",
        onlineName: "Deník N",
        printName: "Deník N",
        link: "https://www.denikn.cz"
    },
    denik: {
        logo: "https://g.denik.cz/images/dv4/logo/denik.svg",
        name: "Deník",
        onlineName: "Deník",
        printName: "Deník",
        link: "https://www.denik.cz"
    }
};

export const publisherMetaList = Object.keys(publisherMeta).map((publisherId) => {
    const meta = publisherMeta[publisherId];
    return {publisherId, meta};
});
