import type { NextPage } from "next"
import styles from "../styles/Home.module.css"
import React from "react";
import Page from "../components/Page";
import io from "socket.io-client";

const Home: NextPage<{}, {}> = ({}) => {
  const [ menuOpen, setMenuOpen ] = React.useState(false);
  const [ isConnected, setIsConnected ] = React.useState(false);
  const socket = io();
  socket.on("connect", () => {
    setIsConnected(false);
  });
  socket.on("disconnect", () => {
    setIsConnected(false);
  });
  return (
    <Page title="NoSadNile Network | Home" menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
      {isConnected ? (
          <div className={styles.home_content}>
            <h3><p className={styles.color_blue}>@Owner</p> Please help me with this!</h3>
          </div>
        ) : (
          <div className={styles.main_error}>
            <h2>There was an error connecting to the server. Please try again soon.</h2>
          </div>
        )}
    </Page>
  );
};

export default Home;