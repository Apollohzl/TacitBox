import { Metadata } from 'next';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
};

export default function Head() {
  return (
    <head>
      <link rel="icon" type="image/x-icon" href="https://tb.vicral.cn//favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="https://tb.vicral.cn//favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="https://tb.vicral.cn//favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="https://tb.vicral.cn//apple-icon.png" />
    </head>
  );
}