export const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    // Remove leading slash if present to avoid double slashes if needed, 
    // but usually backend returns /uploads/... so just appending is fine.
    // However, ensures robustness.
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:5000${cleanPath}`;
};

export const getResumeUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:5000${cleanPath}`;
}
