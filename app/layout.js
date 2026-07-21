import './globals.css';

export const metadata = {
  title: '오답 분석 & 복습 노트',
  description: 'AI 기반 오답 분석 및 복습 플랫폼',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
