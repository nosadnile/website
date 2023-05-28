export async function setLanguage(lang: string) {
    const { setLocale } = useI18n();

    try {
        await setLocale(lang);

        document.querySelector("html")!.setAttribute("lang", lang);
    } catch (e) {
        console.error(`Failed to load language '${lang}'!`, e);
    }

    return nextTick();
}
