import { initWasm, Resvg, ResvgRenderOptions } from "@resvg/resvg-wasm";

export const getWeekStartDate = (date: Date) => {
  const weekStartDate = new Date();
  weekStartDate.setDate(new Date(date).getDate() - date.getDay());
  return weekStartDate;
};

export const getWeekEndDate = (date: Date) => {
  const weekStartDate = new Date();
  weekStartDate.setDate(new Date(date).getDate() + 7 - date.getDay() - 1);
  return weekStartDate;
};

export const getDateAfterWeeks = (date: Date, weekDiff: number) => {
  const dateAfterWeeks = new Date(date);
  dateAfterWeeks.setDate(date.getDate() + 7 * weekDiff);
  return dateAfterWeeks;
};

export const converToPng = async (content: string) => {
  const font = await fetch("/GeistVF.woff2");
  if (!font.ok) return;

  const fontData = await font.arrayBuffer();
  const buffer = new Uint8Array(fontData);

  const opts: ResvgRenderOptions = {
    fitTo: {
      mode: "width",
      value: 1600,
    },
    font: {
      fontBuffers: [buffer],
    },
  };

  const resvgJS = new Resvg(content, opts);
  const pngData = resvgJS.render();
  const pngBuffer = pngData.asPng();
  return pngBuffer;
};

export const copyPngToClipboard = async (html: string) => {
  if (!(window as any).wasmInited) {
    (window as any).wasmInited = true;
    await initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm/index_bg.wasm"));
  }

  const pngBuffer = await converToPng(html);
  if (pngBuffer) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": new Blob([pngBuffer], { type: "image/png" }),
      }),
    ]);
  }
};
export const copySvgToClipboard = async (html: string) => {
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": new Blob([html], {
        type: "text/plain",
      }),
    }),
  ]);
};
