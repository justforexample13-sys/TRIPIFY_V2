// Redirect /api/flights to /api/flights/offers
export default async function handler(req, res) {
  const query = new URLSearchParams(req.query).toString();
  res.redirect(307, `/api/flights/offers?${query}`);
}
