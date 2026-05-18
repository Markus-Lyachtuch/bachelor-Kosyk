import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import { fetchMe } from "features/auth/api/authApi";

export const SessionProvider: FC<PropsWithChildren> = ({ children }) => {
  const [loadedSession, setLoadedSession] = useState<boolean>(false);
  const setSession = useSetAtom(sessionAtom);

  useEffect(() => {
    const init = async () => {
      const response = await fetchMe();

      if (response.ok) setSession({ user: response.data.user });
      else setSession(null);
    };

    if (loadedSession) {
      init();
    }
  }, [setSession, loadedSession]);

  useEffect(() => {
    if (loadedSession === false) {
      setLoadedSession(true);
    }
  }, [loadedSession]);

  return <>{children}</>;
};
