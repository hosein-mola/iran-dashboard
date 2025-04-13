import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

const SERVER = "http://127.0.0.1:8000/";

interface Axios {
    v1: AxiosInstance,
}
const api: Axios = {
    v1: axios.create({
        baseURL: SERVER,
        timeout: 9000000,
        headers: {
            "Accept": "*/*",
            'Content-Type': 'application/json',
        },
    }),
};

const onSuccess = (response: AxiosResponse) => {
    return response;
};

const onError = (error: AxiosError) => {
    return Promise.reject(error);
};

api.v1.interceptors.response.use(onSuccess, onError);


export default api;