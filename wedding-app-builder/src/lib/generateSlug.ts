// utils/generateSlug.ts

export function generateSlug(
    brideFullName: string,
    groomFullName: string,
    weddingDate: string
): string {
    const normalize = (str: string) =>
        str.trim().toLowerCase().replace(/\s+/g, '-');

    const [year, month] = weddingDate.split('-');

    return `${normalize(brideFullName)}-${normalize(groomFullName)}-${year}-${month}`;
}
