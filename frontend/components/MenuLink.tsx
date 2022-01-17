import Link from "next/link";
import React from "react";

interface MenuLinkProps {
  href?: string,
  text?: string,
  menuOpen?: boolean,
  setMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>,
  children?: JSX.Element
}

class MenuLink extends React.Component<MenuLinkProps, {}> {
    render() {
      return (
        <>
          <Link href={this.props.href || "/unknown"} passHref><li onClick={() => {
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
            }
          }}>{this.props.text || "Unknown Page"}</li></Link>
        </>
      );
    }
};

export default MenuLink;