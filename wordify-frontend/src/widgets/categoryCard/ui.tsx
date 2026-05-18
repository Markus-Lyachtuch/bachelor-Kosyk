import { ReactNode } from "react";
import "./categoryCard.styl";

interface CategoryCardProps {
    name: string;
    icon: ReactNode;
    isActive?: boolean;
}

export const CategoryCard = ({ name, icon, isActive }: CategoryCardProps) => {
    return (
        <div className={`flex-col flex-y-center rec-category-item ${isActive ? 'active' : ''}`}>
            <span className="rec-cat-icon">{icon}</span>
            <span className="rec-cat-name">{name}</span>
        </div>
    );
};
