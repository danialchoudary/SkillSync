import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUnreadCount } from './unreadSlice';

export default function useGlobalUnread(pollInterval = 5000) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, pollInterval);
    return () => clearInterval(interval);
  }, [dispatch, pollInterval]);
}
