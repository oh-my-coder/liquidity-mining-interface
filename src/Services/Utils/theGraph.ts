import axios from 'axios'

export const fetchTheGraph = async (subgraphUrl: string, query: string) => {
  const response = await axios({
    url: subgraphUrl,
    headers: {
      'Bypass-Tunnel-Reminder': 'true'
    },
    method: 'POST',
    data: {
      query
    },
  })
  return response.data.data
}