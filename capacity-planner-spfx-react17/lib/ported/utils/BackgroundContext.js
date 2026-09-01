import { __read } from "tslib";
import * as React from 'react';
import { createContext, useContext, useState } from 'react';
var Ctx = createContext({ bgImage: 'WWTP.png', setBgImage: function () { } });
export function BackgroundProvider(_a) {
    var children = _a.children;
    var _b = __read(useState('WWTP.png'), 2), bgImage = _b[0], setBgImage = _b[1];
    return React.createElement(Ctx.Provider, { value: { bgImage: bgImage, setBgImage: setBgImage } }, children);
}
export var useBackground = function () { return useContext(Ctx); };
//# sourceMappingURL=BackgroundContext.js.map