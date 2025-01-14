import React, { useEffect, useState } from "react";

type Props = {};

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);

    return () => media.removeEventListener(listener);
  }, [matches, query]);

  return matches;
};

export default useMediaQuery;
