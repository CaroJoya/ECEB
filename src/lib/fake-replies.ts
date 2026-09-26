const REPLIES = [
  'Sounds great! 🔥',
  'Let me check and get back to you.',
  'Love it! When can we start?',
  'Sure, send me the stems.',
  'Haha, nice one 😄',
  'I\'ll send the mix by tomorrow.',
  'This is exactly what I was looking for!',
  'Can we hop on a quick call?',
  'Just listened — amazing work 👏',
  'Adding it to my playlist right now!',
];

export function getFakeReply(): string {
  return REPLIES[Math.floor(Math.random() * REPLIES.length)];
}

export function maybeAutoReply(fromUserId: string, currentUserId: string): string | null {
  if (fromUserId === currentUserId) return null;
  if (Math.random() < 0.5) {
    return getFakeReply();
  }
  return null;
}