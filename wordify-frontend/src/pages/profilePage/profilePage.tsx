import "./profilePage.styl";
import { useEffect, useState } from "react";

import { Input } from "shared/ui/input";
import { Title } from "shared/ui/title";
import { Button } from "shared/ui/button";
import { StatisticPiece } from "shared/ui/statisticPiece";

import Check from "shared/assets/icons/check.svg?react";
import Trophy from "shared/assets/icons/trophyFill.svg?react";
import HourGlass from "shared/assets/icons/hourglass.svg?react";

import { ProfileAvatar } from "widgets/profileAvatar";
import { ProfileProgress } from "widgets/profileProgress";
import { ProfileAchievement } from "widgets/profileAchievement";
import { ProfileFriends } from "widgets/profileFriends";
import { useAtom } from "jotai";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileFormData, updateProfileSchema } from "features/auth/updateProfile/model/updateProfileSchema";
import { fetchMe, updateProfile } from "features/auth/api/authApi";
import { showPositiveToast } from "shared/lib/toastify";
import { FileInput } from "shared/ui/fileInput";
import { IMAGE_ALLOWED_FILE_TYPES } from "shared/const/file";
import { Loader } from "shared/ui/loader";

const statisticInfo = [
  { statisticTitle: 100, subTitle: "All my sets" },
  { statisticTitle: 60, subTitle: "Completed" },
  { statisticTitle: 40, subTitle: "Studied" },
];

const progressInfo = [
  { Icon: Check, title: "Friends invited", count: 100 },
  { Icon: HourGlass, title: "Hours studied", count: 56 },
  { Icon: Trophy, title: "Achievements", count: 7 },
];

const achievements = [
  {
    Icon: Trophy,
    title: "Commited learner",
    description: "Study 100 sets",
    currentProgress: 70,
    expectedProgress: 100,
  },
  {
    Icon: HourGlass,
    title: "Dedicated student",
    description: "Study your sets 100+ hours",
    currentProgress: 56,
    expectedProgress: 100,
  },
];

const friends = [
  { userId: crypto.randomUUID(), name: "Jessica Devis", image: "", profileLink: "" },
  { userId: crypto.randomUUID(), name: "Jessica Devis", image: "", profileLink: "" },
]

export const ProfilePage = () => {
  const [session, setSession] = useAtom(sessionAtom);
  const isGoogle = session?.user.provider === "google";
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user.name || "",
      email: session?.user.email || "",
      password: "",
      currentPassword: "",
    }
  });

  useEffect(() => {
    if (session) {
      reset({
        name: session.user.name || "",
        email: session.user.email || "",
        password: "",
        currentPassword: "",
      });
    }
  }, [session, reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    const formData = new FormData();
    if (data.name && data.name !== session?.user.name) formData.append("name", data.name);
    if (!isGoogle && data.email && data.email !== session?.user.email) formData.append("email", data.email);
    if (!isGoogle && data.password) formData.append("password", data.password);
    if (!isGoogle && data.currentPassword) formData.append("currentPassword", data.currentPassword);
    if (data.avatar && data.avatar.length > 0) formData.append("avatar", data.avatar[0]);

    setIsLoading(true);
    await updateProfile({
      payload: formData,
      loaderFNPositive: () => {
        showPositiveToast("Profile updated successfully!");
        fetchMe().then((res) => {
          if (res.ok) setSession(res.data);
        });
        reset({
          name: data.name || session?.user.name || "",
          email: data.email || session?.user.email || "",
          password: "",
          currentPassword: "",
        });
      },
      loaderFinally: () => setIsLoading(false)
    });
  };

  const avatarFiles = watch("avatar");
  const avatarPreview = avatarFiles && avatarFiles.length > 0 ? URL.createObjectURL(avatarFiles[0]) : session?.user.picture;

  return (
    <div className="profile">
      <div className="flex-col flex-x-center profile-avatar-and-statistic">
        <div className="flex-y-center">
          <FileInput resetDefaultStyles type="file" id="avatar" accept={IMAGE_ALLOWED_FILE_TYPES.join(",")} {...register("avatar")} error={errors.avatar?.message as string}>
            <ProfileAvatar image={avatarPreview} name={session?.user.name || 'user'} />
          </FileInput>
          <div className="flex-col profile-statistic-and-name flex-x-center">
            <Title variant="primary" className="text-center">
              {session?.user.name}
            </Title>
            <div className="profile-statistic-container">
              {statisticInfo.map((statistic) => (
                <StatisticPiece key={statistic.subTitle} {...statistic} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-col profile-progress-container">
          <Title variant="primary">Progress</Title>
          <div className="profile-progress-pieces-container flex-between-center">
            {progressInfo.map((progressInfoPiece) => (
              <ProfileProgress
                key={progressInfoPiece.title}
                {...progressInfoPiece}
              />
            ))}
          </div>
        </div>
      </div>

      <form className="flex-col profile-personal-info-form" onSubmit={handleSubmit(onSubmit)}>
        <Title variant="primary">Personal info</Title>

        <div className="profile-personal-info-form-container">
          <div className="profile-personal-info-form-input flex-col">
            <label htmlFor="name">Name</label>
            <Input id="name" variant="default" placeholder="Name" {...register("name")} error={errors.name?.message} />
          </div>
        </div>

        {!isGoogle && (
          <>
            <div className="profile-personal-info-form-container">
              <div className="profile-personal-info-form-input flex-col">
                <label htmlFor="email">Email</label>
                <Input disabled id="email" variant="default" placeholder="mail@gmail.com" {...register("email")} error={errors.email?.message} />
              </div>
            </div>

            <div className="profile-personal-info-form-container">
              <div className="profile-personal-info-form-input flex-col">
                <label htmlFor="currentPassword">Current Password</label>
                <Input id="currentPassword" type="password" variant="default" placeholder="Enter your current password" {...register("currentPassword")} error={errors.currentPassword?.message} />
              </div>
            </div>

            <div className="profile-personal-info-form-container">
              <div className="profile-personal-info-form-input flex-col">
                <label htmlFor="password">New Password</label>
                <Input id="password" type="password" variant="default" placeholder="Enter your new password" {...register("password")} error={errors.password?.message} />
              </div>
            </div>
          </>
        )}

        {isLoading ? <Loader /> : <Button type="submit" variant="primary" disabled={isLoading}>
          Save info
        </Button>}
      </form>

      <div className="flex-col profile-achievements-container">
        <Title variant="primary">Achievements</Title>
        <div className="profile-achievements flex-col">
          {achievements.map((achievement) => (
            <ProfileAchievement key={achievement.title} {...achievement} />
          ))}
        </div>
        <Button variant="primary">View all</Button>
      </div>

      <div className="flex-col profile-friends-container">
        <Title variant="primary">Friends</Title>
        <ProfileFriends friends={friends} />
        <Button variant="primary">Invite Friends</Button>
      </div>
    </div>
  );
};
