// src/pages/TapTutor.tsx
import React, { useEffect, useState } from 'react';

interface Video {
  title: string;
  url: string;
}

interface TapTutorData {
  [category: string]: Video[];
}

const TapTutor: React.FC = () => {
  const [videos, setVideos] = useState<TapTutorData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('http://localhost:5001/taptutor-videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();
        setVideos(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load TapTutor videos', err);
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4 display-5">📖 TapTutor – Learn with Videos</h1>

      {loading ? (
        <p className="text-center fs-3">⏳ Loading helpful videos...</p>
      ) : (
        Object.keys(videos).map((category) => (
          <div key={category} className="mb-5">
            <h2 className="mb-3">{category}</h2>
            <div className="row">
              {videos[category].map((video, index) => (
                <div className="col-md-4 mb-4" key={index}>
                  <div className="card h-100 shadow">
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeID(video.url)}/0.jpg`}
                      alt={video.title}
                      className="card-img-top"
                      style={{ objectFit: 'cover', height: '180px' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title fs-5">{video.title}</h5>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary mt-auto"
                      >
                        ▶️ Watch Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const getYouTubeID = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('v') || parsed.pathname.split('/').pop() || '';
  } catch (e) {
    return '';
  }
};

export default TapTutor;
