/**
 * Supabase-hosted portfolio media (uploaded from the owner's Drive folder).
 * Videos are web-optimised H.264.
 */
const BASE_URL = "https://eofsfitnbipibfapavbn.supabase.co/storage/v1/object/public/site-media/portfolio-media";

export const MEDIA = {
  intro: `${BASE_URL}/intro.jpg`,
  baRawVideo: `${BASE_URL}/ba_raw.mp4`,
  baRawPoster: "",
  baEditVideo: `${BASE_URL}/ba_edit.mp4`,
  baEditPoster: "",
  long1Video: `${BASE_URL}/long1.mp4`,
  long1Poster: "",
  shorts: [
    { video: `${BASE_URL}/s1.mp4`, poster: "" },
    { video: `${BASE_URL}/s2.mp4`, poster: "" },
    { video: `${BASE_URL}/s3.mp4`, poster: "" },
    { video: `${BASE_URL}/s4.mp4`, poster: "" },
    { video: `${BASE_URL}/s5.mp4`, poster: "" },
    { video: `${BASE_URL}/s6.mp4`, poster: "" },
    { video: `${BASE_URL}/s7.mp4`, poster: "" },
  ],
} as const;
