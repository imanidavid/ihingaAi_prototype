import { useEffect, useRef } from 'react';

const CHANNEL = 'ihinga-demo-store';

type Message =
  | { type: 'hello'; from: string }
  | { type: 'state'; from: string; to?: string; state: Record<string, unknown> };

/**
 * Keeps the demo store the same in every open tab (e.g. officer in one tab, farmer in another).
 * - A new tab asks the open tabs for their current store and adopts the first answer.
 * - Every local change is sent to the other tabs; changes received from another tab are applied
 *   without being sent back.
 * Nothing is saved: closing every tab (or Reset demo) starts from the seed data again.
 */
export function useTabSync(snapshot: Record<string, unknown>, apply: (state: Record<string, unknown>) => void) {
  const idRef = useRef(`tab-${Math.random().toString(36).slice(2)}`);
  const snapshotRef = useRef(snapshot);
  const applyRef = useRef(apply);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const skipNextSendRef = useRef(false); // set when applying a remote change, so it is not sent back
  const lastSentRef = useRef(snapshot); // the seed data is never broadcast (also safe under StrictMode re-runs)
  const adoptedRef = useRef(false);

  snapshotRef.current = snapshot;
  applyRef.current = apply;

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(CHANNEL);
    channelRef.current = channel;
    const id = idRef.current;

    channel.onmessage = (event: MessageEvent<Message>) => {
      const msg = event.data;
      if (!msg || msg.from === id) return;
      if (msg.type === 'hello') {
        channel.postMessage({ type: 'state', from: id, to: msg.from, state: snapshotRef.current } satisfies Message);
        return;
      }
      if (msg.type === 'state') {
        // Answers to someone else's "hello" are ignored; broadcasts (no "to") and answers to us are applied
        if (msg.to && msg.to !== id) return;
        if (msg.to === id) {
          if (adoptedRef.current) return;
          adoptedRef.current = true;
        }
        skipNextSendRef.current = true;
        applyRef.current(msg.state);
      }
    };

    channel.postMessage({ type: 'hello', from: id } satisfies Message);
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (snapshot === lastSentRef.current) return;
    lastSentRef.current = snapshot;
    if (skipNextSendRef.current) {
      skipNextSendRef.current = false;
      return;
    }
    channelRef.current?.postMessage({ type: 'state', from: idRef.current, state: snapshot } satisfies Message);
  }, [snapshot]);
}
