export const postRequest = async (url: string, body: any) => {
  const fullUrl = `http://localhost:8000/${url}`
  const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
  });
  return response;
}