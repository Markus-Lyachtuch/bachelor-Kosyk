import "./homePage.styl";

import Food from "shared/assets/icons/forkKnifeFill.svg?react";
import Plane from "shared/assets/icons/airplaneFill.svg?react";
import Monitor from "shared/assets/icons/desktopFill.svg?react";
import Trendup from "shared/assets/icons/trendUpFill.svg?react";
import Weather from "shared/assets/icons/cloudSunFill.svg?react";
import Medecine from "shared/assets/icons/firstAidFill.svg?react";
import Shoping from "shared/assets/icons/shoppingCartSimple.svg?react";
import FolderIcon from "shared/assets/icons/folder.svg?react";
import Logout from "shared/assets/icons/signOut.svg?react";
import Books from "shared/assets/icons/books.svg?react";

import { Title } from "shared/ui/title";
import { Slider } from "shared/ui/slider";
import { Button } from "shared/ui/button";
import { Popover } from "shared/ui/popover";
import { ActionItem } from "shared/ui/actionItem";

import { useDropdown } from "shared/hooks/useDropdown";
import { useClickOutside } from "shared/hooks/useClickOutside";
import { useNavigate } from "react-router-dom";

import { useAtom, useSetAtom } from "jotai";
import { isCreateFolderModalOpenAtom } from "features/folder/createFolder/model/atoms";
import { isCreateSetModalOpenedAtom } from "features/sets/createSet/model/atoms";

import { CreateFolder } from "features/folder/createFolder/ui";
import { CreateSet } from "features/sets/createSet/ui";

import { RecommendedSets } from "features/sets/recommendedSets/ui";
import { MyLearningSets } from "features/sets/myLearningSets/ui";
import { CategoryCard } from "widgets/categoryCard";
import { foldersAtom } from "features/folder/commonAtom";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import { logout } from "features/auth/api/authApi";
import { resetAllAtom } from "app/store";

const categories = [
    { name: 'Sales words', icon: <Trendup /> },
    { name: 'IT words', icon: <Monitor /> },
    { name: 'Travel', icon: <Plane /> },
    { name: 'Food', icon: <Food /> },
    { name: 'Shopping', icon: <Shoping /> },
    { name: 'Medicine', icon: <Medecine /> },
    { name: 'Weather', icon: <Weather /> },
];

export const HomePage = () => {
    const { containerRef, popoverRef, isDropdownVisible, setIsDropdownVisible } = useDropdown();
    const { containerRef: userAvatarContainerRef, popoverRef: userPopoverRef, isDropdownVisible: userPopoverDropdownVisible, setIsDropdownVisible: setUserPopoverDropdownVisible } = useDropdown();
    const [, setIsShowAddFolderModal] = useAtom(isCreateFolderModalOpenAtom);
    const [, setIsShowAddSetModal] = useAtom(isCreateSetModalOpenedAtom);
    const [folders] = useAtom(foldersAtom);
    const [session] = useAtom(sessionAtom);
    const resetAll = useSetAtom(resetAllAtom);
    const nav = useNavigate();

    const hideDropdown = () => setIsDropdownVisible(false);
    const hideUserDropdown = () => setUserPopoverDropdownVisible(false);

    const handleCreateFolderClick = () => {
        setIsShowAddFolderModal(true);
        hideDropdown();
    };

    const handleCreateSetClick = () => {
        setIsShowAddSetModal(true);
        hideDropdown();
    };

    const handleLogoutClick = async () => {
        await logout();
        resetAll();
        nav("/auth");
        hideUserDropdown();
    };

    useClickOutside(containerRef, hideDropdown);
    useClickOutside(userAvatarContainerRef, hideUserDropdown);

    return (
        <div className="home rec-dashboard-wrapper flex-col">
            <div className="flex-col home-section">
                <header className="rec-section-header">
                    <Title variant="primary" className="main-left-title">Recommended sets</Title>
                    <div className="rec-header-actions">
                        <div ref={containerRef} className="home-plus-btn-wrapper">
                            <Button
                                variant="rounded"
                                className="plus-btn"
                                onClick={() => setIsDropdownVisible((prev) => !prev)}
                            >
                                <Title variant="primary">+</Title>
                            </Button>

                            <Popover ref={popoverRef} className={`home-plus-popover home-plus-menu ${isDropdownVisible ? "show" : "hide"}`}>
                                <ActionItem
                                    iconName="Create folder"
                                    title="Create folder"
                                    Icon={FolderIcon}
                                    onClick={handleCreateFolderClick}
                                />
                                {folders && folders?.length > 0 && <ActionItem
                                    iconName="Create set"
                                    title="Create set"
                                    Icon={Books}
                                    onClick={handleCreateSetClick}
                                />}
                            </Popover>
                        </div>
                        <Button variant="trial" className="rec-btn-trial">Free trial</Button>
                        <div ref={userAvatarContainerRef} className="relative flex-center self-stretch" onClick={() => setUserPopoverDropdownVisible((prev) => !prev)}>
                            {session?.user?.picture ? <img src={session?.user?.picture} alt={session?.user?.name || 'user'} className="rec-user-avatar" /> : <div className="rec-user-avatar flex-center">{session?.user?.name?.charAt(0) || 'U'}</div>}
                            <Popover ref={userPopoverRef} className={`home-plus-popover ${userPopoverDropdownVisible ? "show" : "hide"}`}>
                                <ActionItem
                                    iconName="Logout"
                                    title="Logout"
                                    Icon={Logout}
                                    onClick={handleLogoutClick}
                                />

                            </Popover>
                        </div>

                    </div>
                </header>

                <RecommendedSets />
            </div>

            <MyLearningSets />

            <div className="flex-col home-section">
                <Title className="main-left-title" variant="primary">Categories</Title>
                <Slider sliderClassName="home-categories-slider">
                    {categories.map(({ icon, name }, idx) => (
                        <CategoryCard key={idx} name={name} icon={icon} isActive={idx % 3 === 1} />
                    ))}
                </Slider>
            </div>

            <CreateFolder />
            <CreateSet />
        </div>
    );
};
