import React from 'react'
import type { AppProps } from 'next/app'
import TitleBar from '../components/TitleBar';

import '../styles/globals.css'


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden">
        <TitleBar />
        <div className="flex-1 overflow-y-auto">
          <Component {...pageProps} />
        </div>
      </div>
    </>
  );
}

export default MyApp;
