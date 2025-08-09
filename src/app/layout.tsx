

import ThemeRegistry from '@/components/theme-registry/theme.registry';
import NextAuthWrapper from '@/lib/next.auth.wrapper';
import NProgressWrapper from '@/lib/nprogress.wrapper';
import { ReduxProvider } from '@/store/provider';
import { ToastProvider } from '@/utils/toast';
import MusicPlayerBar from '@/components/footer/music-player-bar';
import '@/styles/nextauth-custom.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <NProgressWrapper>
            <NextAuthWrapper>
              <ToastProvider>
                <ReduxProvider>
                  {children}
                  <MusicPlayerBar />
                </ReduxProvider>
              </ToastProvider>
            </NextAuthWrapper>
          </NProgressWrapper>
        </ThemeRegistry>
      </body>
    </html>
  );
}
