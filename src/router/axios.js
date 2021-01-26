import axios from 'axios';

let instance = axios.create({
	baseURL: window.baseUrl,
	timeout: window.timeout,
	
});
instance.spread = axios.spread;

export default instance;
