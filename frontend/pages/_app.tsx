import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import '../app/globals.css'; // Adjust path as needed

// This function represents the entry point of all pages
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider> {/* Wrap the entire application with ClerkProvider */}
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
