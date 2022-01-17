import styles from '../styles/Home.module.css'
import React from "react";
import Head from 'next/head';
import Menu from './Menu';

interface PageProps {
  children?: JSX.Element | JSX.Element[],
  title?: string,
  menuOpen: boolean,
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
}

class Page extends React.Component<PageProps, {}> {
    render() {
      return (
        <div className={styles.container}>
          <Head>
            <title>{this.props.title}</title>
            <meta name="description" content="NoSadNile Network - Minigames, Creative, Survival, Fun." />
            <link rel="icon" href="/favicon-square.ico" />
          </Head>

          <main className={styles.main}>
            <h2>NoSadNile Network</h2>
            <Menu menuOpen={this.props.menuOpen} setMenuOpen={this.props.setMenuOpen} />
            {this.props.children}
          </main>

          <footer className={styles.footer}>
            &copy; 2021 NoSadNile Network. All Rights Reserved.
          </footer>
        </div>
      );
    }
};

export default Page;