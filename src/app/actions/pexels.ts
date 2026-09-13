'use server';

export async function searchPexelsImages(query: string, perPage = 15) {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    return { success: false, error: 'Pexels API Key is missing.' };
  }

  if (!query) {
    return { success: true, photos: [] };
  }

  try {
    // `locale=tr-TR` helps with Turkish search queries
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&locale=tr-TR`, {
      headers: {
        Authorization: apiKey
      }
    });

    if (!res.ok) {
      return { success: false, error: 'Pexels API error: ' + res.status };
    }

    const data = await res.json();
    
    // We map the relevant fields to avoid sending unnecessary large data to the client
    const photos = data.photos.map((photo: any) => ({
      id: photo.id,
      src: photo.src.medium, // the image URL we'll use for thumbnails
      largeSrc: photo.src.large, // the image URL we'll save in the database
      alt: photo.alt
    }));

    return { success: true, photos };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Network error while fetching from Pexels.' };
  }
}
