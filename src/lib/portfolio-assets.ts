/**
 * Web-optimised portfolio media in standard GitHub & browser-supported formats (H.264 MP4 with faststart, optimized JPG).
 */
const BASE_URL = "/portfolio-media";

export const MEDIA = {
  intro: `${BASE_URL}/intro.jpg`,
  baRawVideo: `${BASE_URL}/ba_raw.mp4`,
  baRawPoster: `${BASE_URL}/ba_raw.jpg`,
  baEditVideo: `${BASE_URL}/ba_edit.mp4`,
  baEditPoster: `${BASE_URL}/ba_edit.jpg`,
  long1Video: `${BASE_URL}/long1.mp4`,
  long1Poster: `${BASE_URL}/long1.jpg`,
  shorts: [
    { video: `${BASE_URL}/s1.mp4`, poster: `${BASE_URL}/s1.jpg` },
    { video: `${BASE_URL}/s2.mp4`, poster: `${BASE_URL}/s2.jpg` },
    { video: `${BASE_URL}/s3.mp4`, poster: `${BASE_URL}/s3.jpg` },
    { video: `${BASE_URL}/s4.mp4`, poster: `${BASE_URL}/s4.jpg` },
    { video: `${BASE_URL}/s5.mp4`, poster: `${BASE_URL}/s5.jpg` },
    { video: `${BASE_URL}/s6.mp4`, poster: `${BASE_URL}/s6.jpg` },
    { video: `${BASE_URL}/s7.mp4`, poster: `${BASE_URL}/s7.jpg` },
  ],
} as const;
