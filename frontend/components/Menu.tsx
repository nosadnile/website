import styles from '../styles/Home.module.css'
import React from "react";
import MenuLink from './MenuLink';
import { AiOutlineMenu } from 'react-icons/ai';

interface MenuProps {
  menuOpen?: boolean,
  setMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>,
  children?: JSX.Element
}

class Menu extends React.Component<MenuProps, {}> {
    render() {
      return (
        <>
          <button className={styles.oheader} onClick={() => {
            const menu = document.getElementById("menu");
            if(this.props.menuOpen === true) {
              if(!menu) return;
              menu.style.display = "none";
              menu.style.opacity = "1";
              let i = 1;
              const int = setInterval(() => {
                if(i <= 0) {
                  clearInterval(int);
                  return;
                }
                menu.style.opacity = "" + i;
                i -= 0.1;
              }, 5);
              if(!this.props.setMenuOpen) return;
              this.props.setMenuOpen(false);
            } else {
              if(!menu) return;
              menu.style.display = "flex";
              menu.style.opacity = "0";
              let i = 0;
              const int = setInterval(() => {
                if(i >= 1) {
                  clearInterval(int);
                  return;
                }
                menu.style.opacity = "" + i;
                i += 0.1;
              }, 5);
              if(!this.props.setMenuOpen) return;
              this.props.setMenuOpen(true);
            }
          }}>
            <AiOutlineMenu size="20px" />
          </button>
          <ul className={styles.header} id="menu">
            <MenuLink text="Home" href="/" menuOpen={this.props.menuOpen} setMenuOpen={this.props.setMenuOpen} />
            <MenuLink text="About" href="/about" menuOpen={this.props.menuOpen} setMenuOpen={this.props.setMenuOpen} />
            <MenuLink text="Map" href="/map" menuOpen={this.props.menuOpen} setMenuOpen={this.props.setMenuOpen} />
            <MenuLink text="Contact" href="/contact" menuOpen={this.props.menuOpen} setMenuOpen={this.props.setMenuOpen} />
            <MenuLink text="Forums" href="/forums" menuOpen={this.props.menuOpen} setMenuOpen={this.props.setMenuOpen} />
            <MenuLink text="Sign In" href="/login" menuOpen={this.props.menuOpen} setMenuOpen={this.props.setMenuOpen} />
          </ul>
        </>
      );
    }
};

export default Menu;