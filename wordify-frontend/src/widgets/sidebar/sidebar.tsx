import "./sidebar.styl";

import { FunctionComponent, SVGProps, useEffect } from "react";
import SidebarIcon from "shared/ui/sidebarIcon";
import Home from "shared/assets/icons/house.svg?react";
import Books from "shared/assets/icons/books.svg?react";
import Search from "shared/assets/icons/search.svg?react";
import Bookmark from "shared/assets/icons/bookmark.svg?react";
import Person from "shared/assets/icons/person.svg?react";
import { useLocation } from "react-router-dom";

interface ISidebarItem {
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  to: string;
  title: string;
}

const sidebarItems: ISidebarItem[] = [
  { Icon: Home, to: "/home", title: "Home" },
  { Icon: Search, to: "search", title: "Search" },
  { Icon: Books, to: "folders", title: "Sets" },
  { Icon: Bookmark, to: "saved", title: "Saved" },
  { Icon: Person, to: "profile", title: "Profile" },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  const setActiveTab = (index: number) => {
    const foundSidebarItems = [
      ...document.getElementsByClassName("sidebar-icon"),
    ];
    foundSidebarItems.forEach((item) => item.classList.remove("active"));
    foundSidebarItems[index].classList.add("active");
  };

  useEffect(() => {
    const middlePath = pathname.split("/")[2];
    const foundIndex = sidebarItems.findIndex(
      ({ to, title }) => pathname.endsWith(to) || middlePath.endsWith(to) || middlePath.endsWith(title.toLocaleLowerCase()),
    );

    if (foundIndex >= 0) {
      setActiveTab(foundIndex);
    }
  }, [pathname]);

  return (
    <div className="sidebar no-scrollbar">
      {sidebarItems.map((sidebarItem, index) => (
        <SidebarIcon
          onClick={setActiveTab}
          index={index}
          key={sidebarItem.title}
          {...sidebarItem}
        />
      ))}
    </div>
  );
}
