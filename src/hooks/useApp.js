import { useState } from 'react';

export const useApp = () => {
  const [loading, setLoading] = useState(false);
  return { loading, setLoading };
};
