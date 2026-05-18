import "./profileFriends.styl";
import { Button } from "shared/ui/button";

type FriendBase =
  | { image?: string; name: string }
  | { image: string; name?: string };

type Friend = FriendBase & {
  userId: string;
  profileLink?: string;
};

interface IProfileFriends {
  friends: Friend[];
}

export const ProfileFriends = ({ friends }: IProfileFriends) => {
  return (
    <div className="profile-friends">
      {friends.map(({ name, profileLink, userId, image }, index) => (
        <div className="profile-friends-piece flex-between-center" key={userId}>
          <div className="flex-y-center profile-friends-piece-name-and-avatar">
            {image ? (
              <img
                className="profile-friends-piece-avatar"
                src={image}
                alt={`${name}'s avatar`}
              />
            ) : (
              <div className="profile-friends-piece-avatar">
                <span className="absolute-center">{name?.[0]}</span>
              </div>
            )}

            <span className="profile-friends-piece-name">{name}</span>
          </div>
          <Button
            variant="primary"
            onClick={() => profileLink && window.open(profileLink, "_blank")}
            disabled={!profileLink}
          >
            Profile
          </Button>
        </div>
      ))}
    </div>
  );
};
