const getAll = async () => {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": process.env.NEXT_PUBLIC_API_KEY
    },
  });
}

export default {
  getAll
}