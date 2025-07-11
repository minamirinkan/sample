export const fetchJapanHolidays = async (year: number): Promise<{ name: string; date: string }[]> => {
    const calendarId = "ja.japanese%23holiday@group.v.calendar.google.com"; // %23 は「#」をエンコードしたもの
    const API_KEY = "AIzaSyBoS5pAbHsjaDGfniVqfk7eJSwwDcnEphY"; // ここに自分のAPIキーを入れてください
    const timeMin = `${year}-01-01T00:00:00Z`;
    const timeMax = `${year}-12-31T23:59:59Z`;

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&orderBy=startTime&singleEvents=true`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.items) return [];

        return data.items.map((item: any) => ({
            name: item.summary,
            date: item.start.date
        }));
    } catch (error) {
        console.error("祝日データの取得に失敗しました:", error);
        return [];
    }
};
