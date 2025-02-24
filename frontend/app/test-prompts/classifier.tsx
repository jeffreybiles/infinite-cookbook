export const classifyPrompt = async (text: string) => {
  // TODO: don't hardcode the host
  const response = await fetch('http://localhost:8000/classify-customer-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  const data = await response.json();
  return data.category;
};
