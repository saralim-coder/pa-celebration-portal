export function getGlowStyle(votes) {
  const v = votes || 0;
  if (v === 0) return {};
  const blur = Math.min(12 + v * 4, 80);
  const spread = Math.min(v * 1.5, 24);
  const opacity = Math.min(0.15 + v * 0.035, 0.7);
  return { boxShadow: `0 0 ${blur}px ${spread}px rgba(212, 175, 55, ${opacity})` };
}