import { async } from 'regenerator-runtime';
import * as config from './config.js';

/**
 * 
 * @param {number} seconds Time in seconds to wait
 * @returns Promise which will further used to reject another promise after certain seconds of time
 */
const timeout = function (seconds) {
    return new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error(`Request took too long! Timeout after ${s} second`));
        }, seconds * 1000);
    });
};

/**
 * If you want to make a POST request then give uploadData else give only one agrument to make GET request.
 * @param {string} url URL of API to make a GET/POST request
 * @param {object} uploadData - Data for making POST request
 * @returns Object of the data requested
*/

export const AJAX = async function (url, uploadData) {
    try {
        const fetchPro = uploadData ? fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uploadData),
        }) : fetch(url);
        const response = await Promise.race([fetchPro, timeout(config.TIMEOUT_SEC)]);
        const data = await response.json();

        if (!response.ok) throw new Error(`${data.message} (${data.status})`);

        return data;
    } catch (err) {
        throw err;
    }
}