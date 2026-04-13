// Netlify serverless function — proxies Etho·0 assessment submissions to Airtable
// Environment variable required: AIRTABLE_PAT (Personal Access Token)

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
  if (!AIRTABLE_PAT) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const BASE_ID = 'app8j35I3Aw3HHwGt';
  const TABLE_ID = 'tblyXDwmFLhbdmeQ7';

  try {
    const data = JSON.parse(event.body);

    const record = {
      fields: {
        'Email': data.email,
        'Consent Score': data.consent,
        'Representation Score': data.representation,
        'Dignity Score': data.dignity,
        'Sovereignty Score': data.sovereignty,
        'Accountability Score': data.accountability,
        'EthoScore': data.ethoScore,
        'Submitted At': new Date().toISOString(),
      },
    };

    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Airtable error:', err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to save assessment' }) };
    }

    const result = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, id: result.id }) };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};
