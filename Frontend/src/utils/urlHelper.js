import { toBackendUrl } from '../config/runtime.js';

export const getImageUrl = (url) => {
    return toBackendUrl(url);
};

export const getResumeUrl = (url) => {
    return toBackendUrl(url);
}
