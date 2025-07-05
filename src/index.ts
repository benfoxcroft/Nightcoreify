import { auth, getSong, type SpotifyCredentials, type AuthClients } from 'tubeify';

async function convertSpotify(url: string): Promise<string | false> {
  try {
    const credentials: SpotifyCredentials = {
      clientID: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_SECRET!,
    };
    const token: AuthClients = await auth(credentials);
    const request = url
    const response: string | null = await getSong(request, token);
    if (response === null) {
      throw new Error("Failed to get YouTube Link");
    }
    
    return response
  } catch (error) {
    console.error(error);
    return false
  }
}

async function nightcoreify(url: string): Promise<any | false> {
    try {
        if (!url.includes("youtube")) {
            const convert = await convertSpotify(url)
            if (convert !== false) {
                url = convert
            }
            else {
                throw new Error("Unable to convert Spotify Link")
                
            }
        }
        return "kawaii"
    }
    catch (error) {
        console.error(error)
        return false
    }
}

export default {nightcoreify}
