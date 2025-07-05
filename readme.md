# Nightcoreify

A TypeScript library for converting YouTube audio to nightcore. Pass a YouTube URL and get back processed audio with higher pitch and faster tempo.

## Installation

```bash
npm install nightcoreify
```

## Prerequisites

**FFmpeg is required** for audio processing:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian  
sudo apt install ffmpeg

# Windows
# Download from https://ffmpeg.org and add to PATH
```

Verify installation:
```bash
ffmpeg -version
```

## Usage

### Basic Usage

```typescript
import nightcoreify from 'nightcoreify';

async function example() {
  const youtubeUrl = 'https://youtube.com/watch?v=dQw4w9WgXcQ';
  const result = await nightcoreify(youtubeUrl);
  
  if (result) {
    // result is a Buffer containing MP3 audio data
    fs.writeFileSync('nightcore.mp3', result);
    console.log('Nightcore generated successfully');
  } else {
    console.log('Failed to process video');
  }
}
```

### API Integration

```typescript
import nightcoreify from 'nightcoreify';

app.post('/nightcore', async (req, reply) => {
  try {
    const { youtubeUrl } = req.body;
    const audioBuffer = await nightcoreify(youtubeUrl);
    
    if (!audioBuffer) {
      return reply.code(400).send({ error: 'Failed to process video' });
    }
    
    reply
      .type('audio/mpeg')
      .header('Content-Disposition', 'attachment; filename="nightcore.mp3"')
      .send(audioBuffer);
      
  } catch (error) {
    reply.code(500).send({ error: 'Processing failed' });
  }
});
```

## API Reference

### `nightcoreify(youtubeUrl: string): Promise<Buffer | false>`

**Parameters:**
- `youtubeUrl` - Valid YouTube URL

**Returns:**
- `Buffer` - MP3 audio data with nightcore processing applied
- `false` - If processing fails

**Supported URL formats:**
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://www.youtube.com/watch?v=VIDEO_ID`  
- `https://youtu.be/VIDEO_ID`

## How It Works

1. **Download** - Extracts highest quality audio from YouTube
2. **Convert** - Converts to MP3 using ffmpeg  
3. **Process** - Applies speed and pitch adjustments
4. **Return** - Provides processed audio as Buffer

Temporary files are created during processing and cleaned up automatically.

## Error Handling

```typescript
try {
  const result = await nightcoreify(url);
  if (result === false) {
    // Handle processing failure
  }
} catch (error) {
  // Handle network errors, invalid URLs, etc.
}
```

## Troubleshooting

**"ffmpeg not found"** - Install ffmpeg and ensure it's in your PATH

**Processing fails** - Video may be private, restricted, or unavailable

**"Could not extract functions"** - YouTube player updates can break downloading; try updating the package

## License

ISC

---

**Note:** This library is for educational and personal use. Please respect YouTube's Terms of Service and copyright laws when using this tool.