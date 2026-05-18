import "./profileAvatar.styl";

import Pencil from "shared/assets/icons/pencil.svg?react";

interface IProfileAvatar {
  name: string;
  image?: string;
}

export const ProfileAvatar = ({ name, image }: IProfileAvatar) => {
  return (
    <div className="flex-center profile-avatar">
      {image ? (
        <img className="profile-avatar" src={image} alt={`${name}'s avatar`} />
      ) : (
        <span className="absolute-center">{name[0]}</span>
      )}

      <div className="profile-avatar-btn">
        <Pencil className="absolute-center" width={24} height={24} />
      </div>
    </div>
  );
};
