import User from "../models/User.js";
import WorkSession from "../models/WorkSession.js";
import Log from "../models/Log.js";
import LeaveRequest from "../models/LeaveRequest.js";
import { Holiday } from "../models/Holiday.js";

export async function checkDailyLogs() {
    console.log("Starte tägliche Validierung...");
    const users = await User.find({ is_active: true });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Gestern als Referenz für "Fehlende Buchung" (heute ist noch offen)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const user of users) {
        if (!user.start_date) continue;

        const startDate = new Date(user.start_date);
        startDate.setHours(0, 0, 0, 0);

        // Iteriere von Startdatum bis gestern
        let current = new Date(startDate);
        while (current <= yesterday) {
            // Lokales Datum im Format YYYY-MM-DD erzeugen
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, '0');
            const day = String(current.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const dayOfWeek = current.getDay(); // 0 = So, 6 = Sa

            // 1. Wochenende überspringen
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                current.setDate(current.getDate() + 1);
                continue;
            }

            // 2. Feiertage/Ferien prüfen
            const holidayData = await Holiday.findOne({ year: current.getFullYear() });
            const isHoliday = holidayData?.holidays.some(h => h.date === dateStr);
            const isFerien = holidayData?.ferien.some(f => dateStr >= f.start && dateStr <= f.end);

            if (isHoliday || isFerien) {
                current.setDate(current.getDate() + 1);
                continue;
            }

            // 3. Urlaub/Krankheit prüfen
            const leave = await LeaveRequest.findOne({
                user_id: user._id,
                status: "approved",
                from: { $lte: current },
                to: { $gte: current }
            });

            if (leave) {
                current.setDate(current.getDate() + 1);
                continue;
            }

            // 4. Arbeitssitzung prüfen
            const session = await WorkSession.findOne({
                user_id: user._id,
                date_today: dateStr
            });

            // Bereinige alte Logs für diesen Tag, bevor wir neu prüfen
            await Log.deleteMany({ user_id: user._id, violation_date: dateStr });

            if (!session) {
                // KEINE BUCHUNG
                await createLogIfNotExists(user._id, dateStr, "Keine Buchung", "ERROR");
            } else {
                // Kernzeit oder Max-Zeit prüfen
                if (session.start_time && session.end_time) {
                    const hours = (new Date(session.end_time) - new Date(session.start_time)) / (1000 * 60 * 60);

                    // Pause abziehen
                    let pauseHours = 0;
                    if (session.pause && session.pause.includes(":")) {
                        const [h, m] = session.pause.split(":").map(Number);
                        pauseHours = h + (m / 60);
                    }
                    const netHours = hours - pauseHours;

                    if (netHours < 5) {
                        await createLogIfNotExists(user._id, dateStr, "Kernzeit verletzt (weniger als 5 Stunden)", "WARN");
                    } else if (netHours > 10) {
                        await createLogIfNotExists(user._id, dateStr, "Arbeitszeit > 10 Stunden (Vorgesetzter gemeldet)", "WARN");
                    }
                }
            }

            current.setDate(current.getDate() + 1);
        }
    }
    console.log("Validierung abgeschlossen.");
}

async function createLogIfNotExists(userId, date, message, level) {
    const exists = await Log.findOne({ user_id: userId, violation_date: date, message });
    if (!exists) {
        await Log.create({
            user_id: userId,
            violation_date: date,
            message,
            level,
            created_at: new Date()
        });
    }
}
