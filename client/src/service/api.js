import axios from 'axios';

import { API_NOTIFICATION_MESSAGES, SERVICE_URLS } from '../constants/config';
import { getAccessToken, getRefreshToken, setAccessToken, getType } from '../utils/common-utils';

const API_URL = 'http://localhost:8000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000, 
    headers: {
        "content-type": "application/json"
    }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    function(config) {
        if (config.TYPE?.params) {
            config.params = config.TYPE.params;
        } else if (config.TYPE?.query) {
            config.url = config.url + '/' + config.TYPE.query;
        }
        return config;
    },
    function(error) {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    function(response) {
        return processResponse(response);
    },
    async function(error) {
        const originalRequest = error.config;

        if (error.response && error.response.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.post(`${API_URL}/token`, {
                    token: getRefreshToken()
                });

                if (response.status === 200) {
                    const newAccessToken = response.data.accessToken;
                    setAccessToken(newAccessToken);

                    // Update the original request with new token
                    originalRequest.headers['authorization'] = newAccessToken;

                    return axiosInstance(originalRequest);
                }
            } catch (err) {
                console.log("Refresh token failed: ", err);
                sessionStorage.clear(); // or redirect to login
                return Promise.reject(err);
            }
        }

        return Promise.reject(ProcessError(error));
    }
);

// Success Response Handler
const processResponse = (response) => {
    if (response?.status === 200) {
        return { isSuccess: true, data: response.data };
    } else {
        return {
            isFailure: true,
            status: response?.status,
            msg: response?.msg,
            code: response?.code
        };
    }
};

// Error Response Handler
const ProcessError = (error) => {
    if (error.response) {
        console.log("ERROR IN RESPONSE: ", error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.responseFailure,
            code: error.response.status
        };
    } else if (error.request) {
        console.log("ERROR IN REQUEST: ", error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.requestFailure,
            code: ""
        };
    } else {
        console.log("ERROR IN NETWORK: ", error.toJSON());
        return {
            isError: true,
            msg: API_NOTIFICATION_MESSAGES.networkError,
            code: ""
        };
    }
};

// API Construction
const API = {};

for (const [key, value] of Object.entries(SERVICE_URLS)) {
    API[key] = (body, showUploadProgress, showDownloadProgress) =>
        axiosInstance({
            method: value.method,
            url: value.url,
            data: value.method === 'DELETE' ? '' : body,
            responseType: value.responseType,
            headers: {
                authorization: getAccessToken()
            },
            TYPE: getType(value, body),
            onUploadProgress: function(progressEvent) {
                if (showUploadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showUploadProgress(percentCompleted);
                }
            },
            onDownloadProgress: function(progressEvent) {
                if (showDownloadProgress) {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    showDownloadProgress(percentCompleted);
                }
            }
        });
}

export { API };
