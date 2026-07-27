import { useState, useEffect } from 'react';

export function UserAvatar({ user, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false);

  // Reset error state when user changes
  useEffect(() => {
    setImgError(false);
  }, [user?.photoURL, user?.uid]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-xs',
    lg: 'w-11 h-11 text-sm',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      if (parts[0].length >= 2) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (email && email.trim()) {
      const namePart = email.split('@')[0];
      const cleanName = namePart.replace(/[^a-zA-Z0-9]/g, ' ');
      const parts = cleanName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return namePart.substring(0, 2).toUpperCase();
    }
    return 'TC';
  };

  const photoURL = user?.photoURL;
  const showImage = Boolean(photoURL && !imgError);
  const initials = getInitials(user?.displayName, user?.email);

  if (showImage) {
    return (
      <img
        src={photoURL}
        alt={user?.displayName || 'User Profile Photo'}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${currentSizeClass} rounded-full border border-stone-700 object-cover shrink-0 shadow-xs ${className}`}
      />
    );
  }

  return (
    <div
      className={`${currentSizeClass} rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-mono font-bold text-amber-400 shrink-0 shadow-inner select-none ${className}`}
      title={user?.displayName || user?.email || 'User Avatar'}
    >
      <span>{initials}</span>
    </div>
  );
}
