/**
 * Client-side video dimension reading.
 *
 * With no ffmpeg on the server, a video file's true pixel width and height
 * cannot be computed there (see the upload route). The browser does expose it,
 * though, once a `<video>` element has loaded its metadata (videoWidth /
 * videoHeight) — this module wraps that read in a promise.
 *
 * Only callable in the browser, from a client component.
 */
export function readVideoDimensions(
  url: string,
  timeoutMs = 8000
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    let done = false;
    const timeout = setTimeout(() => complete(null), timeoutMs);

    function clear() {
      clearTimeout(timeout);
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute('src');
      video.load();
    }

    function complete(result: { width: number; height: number } | null) {
      if (done) return;
      done = true;
      clear();
      resolve(result);
    }

    video.onloadedmetadata = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        complete({ width: video.videoWidth, height: video.videoHeight });
      } else {
        complete(null);
      }
    };
    video.onerror = () => complete(null);

    video.src = url;
  });
}
