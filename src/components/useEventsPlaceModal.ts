import { useCallback, useState } from "react";

export function useEventsPlaceModal() {
  const [visible, setVisible] = useState(false);
  const [place, setPlace] = useState<any>(null);

  const open = useCallback((placeData: any) => {
    setPlace(placeData);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setPlace(null);
  }, []);

  return { visible, place, open, close };
}
