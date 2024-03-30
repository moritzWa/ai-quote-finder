import EPub from 'epub';
import fs from 'fs';
import https from 'https';
import path from 'path';

export function parseFileSize(fileSizeString: string): number {
    const [value, unit] = fileSizeString.match(/^(\d+)(\w+)$/)!.slice(1, 3)
    const valueNum = parseInt(value, 10)
    switch (unit.toUpperCase()) {
      case 'B':
        return valueNum
      case 'KB':
        return valueNum * 1024
      case 'MB':
        return valueNum * 1024 * 1024
      case 'GB':
        return valueNum * 1024 * 1024 * 1024
      default:
        throw new Error(`Invalid file size unit: ${unit}`)
    }
  }

export async function downloadFileToString(url: string, destination: string): Promise<string> {
    const file = fs.createWriteStream(destination);
    const request = https.get(url, function(response) {
        response.pipe(file);
    });

    return new Promise((resolve, reject) => {
        file.on('finish', () => resolve(destination));
        file.on('error', reject);
    });
}   

export async function downloadFile(url: string, destination: string) {
  const file = fs.createWriteStream(destination);
  const request = https.get(url, function(response) {
    response.pipe(file);
  });

  return new Promise((resolve, reject) => {
    file.on('finish', resolve);
    file.on('error', reject);
  });
}

export async function loadEpubFromUrl(url: string) {
  const filePath = path.join(__dirname, 'temp.epub');
  await downloadFile(url, filePath);
  return loadEpub(filePath);
}
interface Chapter {
  pageContent: string;
  metadata: {
    chapter?: string;
  };
}

export async function loadEpub(filePath: string): Promise<Chapter[]> {
  const epub = new EPub(filePath);
  
  return new Promise((resolve, reject) => {
    epub.on('end', async function() {
      const chapters = await Promise.all<Chapter>(
        epub.flow.map((chapter) => {
          return new Promise<Chapter>((resolve, reject) => {
            epub.getChapter(chapter.id, (err, text) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  pageContent: text,
                  metadata: {
                    ...(chapter.title && { chapter: chapter.title, }),
                  },
                });
              }
            });
          });
        })
      );
      resolve(chapters);
    });
    epub.parse();
  });
}