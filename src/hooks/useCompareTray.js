import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

/**
 * useCompareTray — cross-page comparison selection (max 4), persisted in
 * localStorage ('vm_compare_tray') and synced across components via a
 * custom event. Feeds /compare-universities?ids=… so the compare page can
 * prefill the bench (Airbnb-style sticky tray, Doc 2 §11.6).
 */
const KEY = 'vm_compare_tray';
const EVENT = 'vm-compare-tray-change';
const MAX = 4;

const read = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.slice(0, MAX) : [];
  } catch {
    return [];
  }
};

const write = (items) => {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  window.dispatchEvent(new Event(EVENT));
};

export default function useCompareTray() {
  const [items, setItems] = useState(read);

  useEffect(() => {
    const sync = () => setItems(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggle = useCallback((u) => {
    const current = read();
    const exists = current.some((i) => i._id === u._id);
    if (exists) {
      write(current.filter((i) => i._id !== u._id));
      return;
    }
    if (current.length >= MAX) {
      toast.error(`You can compare up to ${MAX} universities`);
      return;
    }
    write([...current, { _id: u._id, name: u.name, slug: u.slug, logoUrl: u.logoUrl, city: u.city, state: u.state }]);
  }, []);

  const remove = useCallback((id) => write(read().filter((i) => i._id !== id)), []);
  const clear = useCallback(() => write([]), []);
  const has = useCallback((id) => items.some((i) => i._id === id), [items]);

  return { items, toggle, remove, clear, has, max: MAX };
}
