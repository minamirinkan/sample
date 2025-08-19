// src/common/utils/registerFonts.ts
import { Font } from '@react-pdf/renderer';
import NotoSansJp from '../fonts/NotoSansJP-Regular.ttf';

export const registerFonts = () => {
  Font.register({
    family: 'NotoSansJP',
    src: NotoSansJp,
  });
};
