import { useEffect } from 'react';
import { useBackground } from './BackgroundContext';
var DEFAULT_BG = 'WWTP.png';
export function usePageBackground(imageName) {
    var setBgImage = useBackground().setBgImage;
    useEffect(function () {
        setBgImage(imageName);
        return function () { return setBgImage(DEFAULT_BG); };
    }, [imageName, setBgImage]);
}
//# sourceMappingURL=usePageBackground.js.map