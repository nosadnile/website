import type { NextPage } from "next"
import styles from "../styles/Home.module.css"
import React from "react";
import Page from "../components/Page";

const Home: NextPage<{}, {}> = ({}) => {
    const [ menuOpen, setMenuOpen ] = React.useState(false);
    return (
        <Page title="NoSadNile Network | Home" menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
            <br />
            <br />
            <select id="server" defaultValue="_sel" className={styles.server_sel} onChange={() => {
                const sel = document.getElementById("server") as HTMLSelectElement;
                const frame = document.getElementById("map-frame") as HTMLIFrameElement;
                frame.src = "https://proxy.nosadnile.net/?host=vm2&port=" + sel.value;
            }}>
                <option value="_sel" disabled>Select a Server</option>
                <option value="2004">NoSadNile Lobby</option>
                <option value="2003">NoSadNile SMP</option>
            </select>
            <br />
            <iframe id="map-frame" src="about:blank" className={styles.mapFrame} />
        </Page>
    );
};

export default Home;