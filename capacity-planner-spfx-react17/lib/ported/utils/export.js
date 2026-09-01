import { __read, __spreadArray } from "tslib";
export function exportCsv(filename, rows) {
    if (rows.length === 0)
        return;
    var headers = Object.keys(rows[0]);
    var lines = __spreadArray([
        headers.join(',')
    ], __read(rows.map(function (row) {
        return headers.map(function (h) {
            var _a;
            var val = String((_a = row[h]) !== null && _a !== void 0 ? _a : '');
            return val.includes(',') ? "\"".concat(val, "\"") : val;
        }).join(',');
    })), false);
    var blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    downloadBlob(blob, filename);
}
export function exportJson(filename, data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, filename);
}
function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
//# sourceMappingURL=export.js.map