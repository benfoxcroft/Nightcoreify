import {
  auth,
  getSong,
  type SpotifyCredentials,
  type AuthClients,
} from "tubeify";
import fs from "fs";
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

async function convertSpotify(url: string): Promise<string | false> {
  try {
    const credentials: SpotifyCredentials = {
      clientID: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_SECRET!,
    };
    const token: AuthClients = await auth(credentials);
    const request = url;
    const response: string | null = await getSong(request, token);
    if (response === null) {
      throw new Error("Failed to get YouTube Link");
    }

    return response;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function downloadYT(url: string): Promise<{ filename: string; buffer: Buffer } | false> {
  try {
    const stream = ytdl(url, { 
      quality: 'highestaudio',
      filter: 'audioonly'
    });
    
    const tempFile = `temp_${Date.now()}.webm`; // Whatever YouTube gives us
    const outputFile = `temp_${Date.now()}.mp3`; // What we want
    
    // Download raw audio
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(fs.createWriteStream(tempFile))
        .on('finish', () => resolve())
        .on('error', reject);
    });
    
    // Convert to MP3 using ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempFile)
        .toFormat('mp3')
        .on('end', () => {
          fs.unlinkSync(tempFile); // Clean up temp file
          resolve();
        })
        .on('error', reject)
        .save(outputFile);
    });
    
    const buffer = fs.readFileSync(outputFile);
    return { filename: outputFile, buffer };
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function processAudio(inputBuffer: Buffer): Promise<Buffer> {
  const tempInput = `temp_input_${Date.now()}.mp3`;
  const tempOutput = `temp_output_${Date.now()}.mp3`;
  
  // Write buffer to temp file for ffmpeg
  fs.writeFileSync(tempInput, inputBuffer);
  
  return new Promise<Buffer>((resolve, reject) => {
    ffmpeg(tempInput)
      .audioFilters([
        'atempo=1.3',
        'asetrate=44100*1.3,aresample=44100'
      ])
      .toFormat('mp3')
      .on('end', () => {
        const processedBuffer = fs.readFileSync(tempOutput);
        fs.unlinkSync(tempInput);
        resolve(processedBuffer);
      })
      .on('error', reject)
      .save(tempOutput);
  });
}


async function nightcoreify(url: string): Promise<any | false> {
  try {
    //wait... it's all YouTube?...
    console.log(`Current URL: ${url}`)
    if (!url.includes("youtube")) {
        console.log("Spotify link detected... Converting to YT")
      const convert = await convertSpotify(url);
      if (convert !== false) {
          url = convert;
          console.log(`Spotify Link mutated to YT: ${url}`)
      } else {
        throw new Error("Unable to convert Spotify Link")
      }
    }
    //...Always has been

    const file = await downloadYT(url)
    if (!file) {
        throw new Error("Unable to download YouTube link")
    }

    await processAudio(file.buffer)
    
    fs.unlinkSync(file.filename);

    return "kawaii";
  } catch (error) {
    console.error(error);
    return false;
  }
}

export default { nightcoreify };
