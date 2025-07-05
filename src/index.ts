import fs from "fs";
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { timeStamp } from "console";


async function downloadYT(url: string): Promise<{ filename: string; buffer: Buffer } | false> {
  try {
    const stream = ytdl(url, { 
      quality: 'highestaudio',
      filter: 'audioonly'
    });
    const tempFile = `temp_${Date.now()}.webm`; 
    const outputFile = `temp_${Date.now()}.mp3`;
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
        fs.unlinkSync(tempOutput)
        resolve(processedBuffer);
      })
      .on('error', reject)
      .save(tempOutput);
  });
}


export default async function nightcoreify(url: string): Promise<Buffer | false> {
  try {
    const file = await downloadYT(url)
    if (!file) throw new Error("Unable to download YouTube link")
    const audioBuffer = await processAudio(file.buffer)
    fs.unlinkSync(file.filename);
    return audioBuffer
  } catch (error) {
    console.error(error);
    return false;
  }
}
