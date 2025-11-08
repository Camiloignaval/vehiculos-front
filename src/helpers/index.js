// Fecha local de hoy en formato YYYY-MM-DD (sin problemas de zona horaria)
export function todayLocalYMD() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// Formatea "YYYY-MM-DD" a es-CL
export function formatYMD_esCL(ymd) {
    if (!ymd) return '';
    const [y, m, d] = ymd.split('-').map(Number);
    const local = new Date(y, m - 1, d); // crea con hora local
    return local.toLocaleDateString('es-CL');
}

// Formatea cualquier fecha (ISO, Date, o YYYY-MM-DD) a es-CL
export function formatAny_esCL(dateLike) {
    if (!dateLike) return '';
    // Caso "YYYY-MM-DD"
    if (typeof dateLike === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)) {
        return formatYMD_esCL(dateLike);
    }
    // Caso ISO u objeto Date → fijamos timeZone UTC para evitar “correr” el día
    try {
        return new Date(dateLike).toLocaleDateString('es-CL', { timeZone: 'UTC' });
    } catch {
        return String(dateLike);
    }
}
