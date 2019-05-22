export interface IArticleData {
    headline: string;
    perex: string;
    link: string;
}

export interface IParser {
    (file: string): Promise<IArticleData[]>
}
