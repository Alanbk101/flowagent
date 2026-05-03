const conversations = new Map();

export function saveMessage(userId, role, content) {
  if (!conversations.has(userId)) conversations.set(userId, []);
  const history = conversations.get(userId);
  history.push({ role, content });
  if (history.length > 20) history.shift();
}

export function getHistory(userId) {
  return conversations.get(userId) || [];
}

export function formatForAgent(userId) {
  return getHistory(userId).map(msg => ({ role: msg.role, content: msg.content }));
}
