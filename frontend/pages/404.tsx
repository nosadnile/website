import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import React from 'react';

const Error404: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>NoSadNile Network | 404</title>
        <meta name="description" content="NoSadNile Network - Minigames, Creative, Survival, Fun." />
        <link rel="icon" href="/favicon-square.ico" />
      </Head>

      <main className={styles.main}>
        404 | Page not found.
        <br />
        <br />
        <Link href="/" passHref><p className={styles.errorHomeButton}>Back to Home</p></Link>
      </main>
    </div>
  )
}

export default Error404;
