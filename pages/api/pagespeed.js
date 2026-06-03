export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { url, strategy = 'mobile', apiKey } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });
  if (!apiKey) return res.status(400).json({ error: 'API key is required' });

  const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
  const catParams = categories.map(c => `category=${c}`).join('&');
  const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&${catParams}&key=${apiKey}&locale=pt`;

  try {
    const response = await fetch(psiUrl);
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'PageSpeed API error' });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch', details: error.message });
  }
}
